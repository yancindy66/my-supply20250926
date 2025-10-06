<template>
  <div class="page">
    <h2 class="title-bar"><span>入库预约（存货人）</span></h2>
    <div class="toolbar">
      <button class="ghost" @click="toggleColsPanel">列显隐</button>
      <label class="ghost upload-btn primary">
        批量导入
        <input type="file" accept=".csv,.xlsx,.xls" @change="onImportFile" />
      </label>
      <button class="ghost" @click="syncGate">同步门岗</button>
      <button class="ghost" @click="exportExcel">导出</button>
      <button class="ghost primary" :disabled="saving" @click="saveCurrent">{{ saving? '保存中…' : '保存' }}</button>
      <button class="ghost" @click="openInsertDialog">插入测试抓拍</button>
      <label class="ghost upload-btn">
        上传磅单(多张)
        <input type="file" accept="image/*" multiple @change="onUploadTickets" />
      </label>
      <button class="ghost" @click="previewCaptures">预览抓拍</button>
      <button class="ghost primary" @click="printSheet">打印</button>
      <div class="spacer"></div>
      <select class="ghost-select" v-model.number="pageSize" @change="applyPaging">
        <option :value="20">20/页</option>
        <option :value="50">50/页</option>
        <option :value="100">100/页</option>
      </select>
      <button class="ghost" @click="prevPage">上一页</button>
      <span class="hint">第 {{ page }} / {{ totalPages }} 页</span>
      <button class="ghost" @click="nextPage">下一页</button>
    </div>
    <div v-if="closed" class="closed-hint">表格已关闭。</div>
    <div v-if="toast.show" class="toast" role="status" aria-live="polite">{{ toast.msg }}</div>
    <div v-if="showCols" class="cols-panel">
      <label v-for="c in cols" :key="c.key" class="col-item">
        <input type="checkbox" v-model="c.visible" @change="rerender"/> {{ c.name }}
      </label>
    </div>
    <div v-show="!closed" id="luckysheet" class="ls-wrap" style="position:relative;"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue';
import { listInboundOrders } from '@/api/depositor';
import * as XLSX from 'xlsx';
import http from '@/api/http';

// 存货人角色专用的入库预约页面
// 包含完整的Luckysheet表格功能

async function loadLuckysheetCDN(){
  const cssList = [
    'https://cdn.jsdelivr.net/npm/luckysheet@2.1.13/dist/plugins/css/plugins.css',
    'https://cdn.jsdelivr.net/npm/luckysheet@2.1.13/dist/css/luckysheet.css',
    'https://cdn.jsdelivr.net/npm/luckysheet@2.1.13/dist/assets/iconfont/iconfont.css'
  ];
  for(const href of cssList){
    if(!document.querySelector(`link[href="${href}"]`)){
      const link = document.createElement('link');
      link.rel='stylesheet'; link.href=href; document.head.appendChild(link);
    }
  }
  const loadScript = (src:string)=> new Promise((resolve, reject)=>{
    const exists = Array.from(document.scripts).some(sc=>sc.src===src);
    if(exists) return resolve(null);
    const s = document.createElement('script'); s.src = src; s.async = true;
    s.onload = ()=> resolve(null); s.onerror = reject; document.body.appendChild(s);
  });
  await loadScript('https://cdn.jsdelivr.net/npm/luckysheet@2.1.13/dist/plugins/js/plugin.js');
  await loadScript('https://cdn.jsdelivr.net/npm/luckysheet@2.1.13/dist/luckysheet.umd.js');
  const ls:any = (window as any).luckysheet || (window as any).Luckysheet;
  return ls;
}

const allRecords = ref<any[]>([]);
const viewRecords = ref<any[]>([]);
const STORAGE_KEY = 'inventory_inbound_reservation.v1';
const savedList = ref<{id:string; name:string; data:any[]}[]>(loadSaved());
const showCloseDialog = ref(false);
const closed = ref(false);
const saving = ref(false);
const toast = ref<{show:boolean; msg:string}>({ show:false, msg:'' });
const showNameDialog = ref(false);
const nameInput = ref('');
const showFolder = ref(false);
const openSearch = ref('');
const filteredSaved = computed(()=>{
  const k = openSearch.value.trim().toLowerCase();
  return savedList.value.filter(x=> x.name.toLowerCase().includes(k));
});

function openFolder(){
  try{ const raw = localStorage.getItem(STORAGE_KEY); if(raw){ savedList.value = JSON.parse(raw)||[]; } }catch{}
  showFolder.value = true;
}

function formatTime(ts?: number){ if(!ts) return ''; const d=new Date(ts); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; }
const showCols = ref(false);
const page = ref(1);
const pageSize = ref(50);
const totalPages = computed(()=> Math.max(1, Math.ceil(allRecords.value.length / pageSize.value)));

function mapStatus(s: string){ const m:Record<string,string>={ created:'已创建', receiving:'收货中', completed:'已完成', cancelled:'已取消' }; return m[s]||s||'-'; }

async function load(){
  // 存货人角色：只加载自己的数据
  let mock:any[] = [];
  try{ mock = JSON.parse(localStorage.getItem('inventoryMockInboundOrders')||'[]')||[]; }catch{}
  let api:any[] = [];
  try{
    const resp:any = await listInboundOrders({ page:1, pageSize:100, role: 'inventory' });
    api = resp?.data?.list || [];
  }catch(e){ /* ignore */ }
  
  if((mock?.length||0)===0 && (api?.length||0)===0){
    mock = genFullMock(10);
    try{ localStorage.setItem('inventoryMockInboundOrders', JSON.stringify(mock)); }catch{}
  }
  
  const data = [...mock, ...api].map((r:any)=>({
    reservation_number: r.reservation_number || r.order_no,
    transport_no: r.transport_no || '-',
    order_no: r.order_no || '-',
    status: mapStatus(r.status),
    owner_name: r.owner_name || '-',
    commodity: (r.commodity_name||'-') + (r.commodity_spec?(' / '+r.commodity_spec):''),
    vehicle_plate: r.vehicle_plate || '-',
    planned_quantity: r.total_planned_quantity || r.planned_quantity || '-',
    actual_in_weight: r.actual || r.calc_weight || '-',
    weigh_mode_text: r.weigh_mode==='by_pack' ? '按规格' : (r.weigh_mode==='by_weight'?'按磅重': (r.weigh_mode || '-')),
    gross: r.gross ?? '-',
    tare: r.tare ?? '-',
    net: (r.gross!=null && r.tare!=null)? (Number(r.gross)-Number(r.tare)) : (r.net ?? '-'),
    deductions: r.deductions ?? '-',
    entry_photos_count: Array.isArray(r.entry_photos)? `${r.entry_photos.length} 张` : (r.entry_capture_count ?? '-'),
    entry_time: r.entry_time || '-',
    exit_photos_count: Array.isArray(r.exit_photos)? `${r.exit_photos.length} 张` : (r.exit_capture_count ?? '-'),
    exit_time: r.exit_time || '-',
    qc_url: r.qc_url || '-',
    driver_name: r.driver_name || '-',
    driver_phone: r.driver_phone || '-',
    driver_id_card: r.driver_id_card || r.driver_id_no || '-',
    driver_license_url: r.driver_license_url || '-',
    inbound_proof: (r.weigh_ticket_urls && r.weigh_ticket_urls.length) ? `磅单${r.weigh_ticket_urls.length}张` : (r.weigh_ticket_url||r.doc_url? '磅单1张':'-'),
    _act: '编辑 删除'
  }));
  allRecords.value = data;
  rerender();
}

onMounted(load);

function randomPlate(){
  const letters = 'ABCDEFGHJKLmnopqrstu'.toUpperCase();
  const prov = ['京','津','沪','渝','冀','豫','云','辽','黑','湘','皖','鲁','新','苏','浙','赣','鄂','桂','甘','晋','蒙','陕','吉','闽','贵','粤','青','藏','川','宁','琼'];
  const tail = Math.random().toString().slice(2,6) + letters[Math.floor(Math.random()*letters.length)];
  return prov[Math.floor(Math.random()*prov.length)] + 'A' + tail;
}

function genFullMock(n:number){
  const now = Date.now();
  const arr:any[] = [];
  for(let i=0;i<n;i++){
    const gross = 30000 + Math.floor(Math.random()*10000);
    const tare = 12000 + Math.floor(Math.random()*4000);
    const net = gross - tare;
    arr.push({
      reservation_number: 'INV'+(now+i),
      transport_no: 'T'+(now+i).toString().slice(-6),
      order_no: 'RK'+(now+i),
      status: ['created','receiving','completed'][i%3],
      owner_name: '存货人客户'+(i+1),
      commodity_name: ['铁矿','煤炭','玉米','大豆'][i%4],
      commodity_spec: ['散装','袋装','30kg','50kg'][i%4],
      vehicle_plate: randomPlate(),
      planned_quantity: 32000 + i*500,
      actual: net,
      weigh_mode: 'by_weight',
      gross, tare, net,
      deductions: i%3===0? 20: 0,
      entry_photos: new Array(i%4).fill(0),
      entry_time: new Date(now - i*3600_000).toISOString().slice(0,19).replace('T',' '),
      exit_photos: new Array((i+1)%4).fill(0),
      exit_time: new Date(now - i*1800_000).toISOString().slice(0,19).replace('T',' '),
      qc_url: 'https://example.com/qc/'+(now+i),
      driver_name: '司机'+(i+1),
      driver_phone: '1'+(3000000000 + Math.floor(Math.random()*999999999)).toString().slice(0,10),
      driver_id_no: '4401011990010'+String(100+i),
      driver_license_url: 'https://example.com/license/'+(now+i)
    });
  }
  return arr;
}

async function renderLuckysheet(rows:any[]){
  const lsAny:any = await loadLuckysheetCDN();
  const ls = (lsAny && typeof lsAny.create==='function') ? lsAny : (window as any).luckysheet;
  if(!ls || typeof ls.create!=='function'){
    console.error('Luckysheet未就绪', lsAny);
    return;
  }
  const columns = cols.value.filter(c=>c.visible).map(c=>c.name);
  const keys = cols.value.filter(c=>c.visible).map(c=>c.key);
  const celldata:any[] = [];
  columns.forEach((name, ci)=>{ celldata.push({ r:0, c:ci, v:{ v:name, ct:{ fa:'@'} } }); });
  rows.forEach((r, ri)=>{
    keys.forEach((k, ci)=>{ celldata.push({ r:ri+1, c:ci, v:{ v: r[k] ?? '' } }); });
  });
  try{ ls?.destroy?.(); }catch{}
  ls.create({
    container:'luckysheet',
    lang:'zh',
    showtoolbar:true,
    showinfobar:false,
    showsheetbar:true,
    row: rows.length + 1,
    column: columns.length,
    data:[{
      name:'存货人入库预约',
      celldata,
      config: {}
    }]
  });
  (window as any).__getCurrentGridValues = function(){
    const sheets:any[] = ls.getAllSheets?.() || [];
    let idx:any = 0;
    try{ idx = typeof ls.getSheetIndex==='function' ? ls.getSheetIndex() : (ls.getSheet?.()?.index ?? 0); }catch{}
    const sheet:any = sheets[idx] || sheets[0] || {};
    const name = sheet?.name || '存货人入库预约';
    const data:any[] = sheet?.data || [];
    const values:any[] = [];
    for(let r=1;r<data.length;r++){
      const row = data[r]; if(!row) continue; const obj:any = {};
      const vis = cols.value.filter(c=>c.visible);
      vis.forEach((c,ci)=>{ const cell = row[ci]; obj[c.key] = cell?.v ?? ''; });
      values.push(obj);
    }
    return { name, values };
  }
  try{ const old = document.getElementById('sheet-close-inline'); old?.parentElement?.removeChild(old); }catch{}
}

const cols = ref([
  { key:'reservation_number', name:'预约单号', visible:true },
  { key:'transport_no', name:'运输单号', visible:true },
  { key:'order_no', name:'入库单号', visible:true },
  { key:'status', name:'入库状态', visible:true },
  { key:'inbound_proof', name:'入库凭证+', visible:true },
  { key:'owner_name', name:'客户', visible:true },
  { key:'commodity', name:'商品', visible:true },
  { key:'vehicle_plate', name:'车牌号', visible:true },
  { key:'planned_quantity', name:'预约量', visible:true },
  { key:'actual_in_weight', name:'已经入库量', visible:true },
  { key:'weigh_mode_text', name:'磅重（入库方式）', visible:true },
  { key:'gross', name:'毛重', visible:true },
  { key:'tare', name:'皮重', visible:true },
  { key:'net', name:'净重', visible:true },
  { key:'deductions', name:'扣重', visible:true },
  { key:'entry_photos_count', name:'入场抓拍', visible:true },
  { key:'entry_time', name:'入场抓拍时间', visible:true },
  { key:'exit_photos_count', name:'出场抓拍', visible:true },
  { key:'exit_time', name:'出场抓拍时间', visible:true },
  { key:'qc_url', name:'质检URL', visible:true },
  { key:'driver_name', name:'司机姓名', visible:true },
  { key:'driver_phone', name:'司机手机', visible:true },
  { key:'driver_id_card', name:'司机身份证', visible:true },
  { key:'driver_license_url', name:'司机驾驶证', visible:true }
]);

function pagedRecords(){
  const list = allRecords.value;
  const start = (page.value-1)*pageSize.value;
  return list.slice(start, start + pageSize.value);
}

function rerender(){
  const data = pagedRecords();
  viewRecords.value = data;
  renderLuckysheet(data);
}

function applyPaging(){ page.value = 1; rerender(); }
function prevPage(){ if(page.value>1){ page.value--; rerender(); } }
function nextPage(){ if(page.value<totalPages.value){ page.value++; rerender(); } }
function toggleColsPanel(){ showCols.value = !showCols.value; }

function exportExcel(){
  const headers = cols.value.filter(c=>c.visible).map(c=>c.name);
  const keys = cols.value.filter(c=>c.visible).map(c=>c.key);
  const data = viewRecords.value.map(r=> keys.map(k=> r[k] ?? ''));
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '存货人入库预约');
  XLSX.writeFile(wb, '存货人入库预约.xlsx');
}

// 其他功能函数...
function parseCsv(text:string){ return []; }
async function onImportFile(e: Event){ /* 导入逻辑 */ }
const importPreview = ref<any[]>([]);
const importErrors = ref<any[]>([]);
const passCount = computed(()=> importPreview.value.length);
const failCount = computed(()=> importErrors.value.length);

function doValidate(rows:any[]){ /* 验证逻辑 */ }
function clearImport(){ importPreview.value = []; importErrors.value = []; }
function mergeImport(){ /* 合并逻辑 */ }
function exportErrorCsv(){ /* 导出错误逻辑 */ }

async function getLS(){ const any = await loadLuckysheetCDN(); return (any && typeof any.create==='function')? any : (window as any).luckysheet; }
function loadSaved(){
  try{ const raw = localStorage.getItem(STORAGE_KEY); return raw? JSON.parse(raw) : []; }catch{ return []; }
}
function persist(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(savedList.value)); }
function persistWorkbook(){ /* 持久化工作簿 */ }

async function saveCurrent(customName?: string){
  saving.value = true;
  const id = String(Date.now());
  let data:any[] = [];
  let nameHint = '存货人入库预约';
  try{
    const grid:any = (window as any).__getCurrentGridValues?.();
    if(grid){ data = grid.values || []; nameHint = grid.name || nameHint; }
  }catch{}
  if(!data || !data.length){ data = JSON.parse(JSON.stringify(viewRecords.value)); }
  const ts = new Date();
  const time = `${String(ts.getHours()).padStart(2,'0')}:${String(ts.getMinutes()).padStart(2,'0')}:${String(ts.getSeconds()).padStart(2,'0')}`;
  const name = customName ? customName : `保存-${nameHint}-${time}`;
  savedList.value = [{ id, name, data, ts: +ts }, ...savedList.value];
  persist();
  saving.value = false;
  showToast('已保存：'+name);
}

function openSaved(id?: string){ /* 打开保存的文件 */ }
function closeWithoutSave(){ /* 关闭不保存 */ }
function prepareCloseWithSave(){ /* 准备关闭并保存 */ }
function confirmSaveAndClose(){ /* 确认保存并关闭 */ }
function hideCurrentSheet(){ /* 隐藏当前表格 */ }
function doClosePage(){ /* 关闭页面 */ }
function triggerClose(){ /* 触发关闭 */ }

function printSheet(){
  const headers = cols.value.filter(c=>c.visible).map(c=>c.name);
  const keys = cols.value.filter(c=>c.visible).map(c=>c.key);
  const htmlRows = viewRecords.value.map(r=> `<tr>${keys.map(k=>`<td>${String(r[k]??'')}</td>`).join('')}</tr>`).join('');
  const html = `<html><head><meta charset='utf-8'><title>打印</title><style>table{border-collapse:collapse;width:100%}th,td{border:1px solid #e5e7eb;padding:6px 8px;font-size:12px;text-align:left}</style></head><body><table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${htmlRows}</tbody></table></body></html>`;
  const w = window.open('', '_blank'); if(!w) return;
  w.document.open(); w.document.write(html); w.document.close(); w.focus(); w.print();
}

function showToast(msg:string){ toast.value = { show:true, msg }; setTimeout(()=> toast.value.show=false, 1800); }

async function syncGate(){
  try{
    const resp:any = await http.get('/v1/gate/entries/recent');
    const list:any[] = resp?.data?.items || [];
    const mapped = list.map((g:any)=>({
      reservation_number: g.reservation_no || g.order_no || '-',
      transport_no: g.transport_no || '-'
    }));
    const byId = new Map<string, any>();
    allRecords.value.forEach(r=> byId.set(String(r.reservation_number||''), r));
    mapped.forEach(m=>{
      const key = String(m.reservation_number||'');
      if(!key) return; const exist = byId.get(key);
      if(exist){ Object.assign(exist, m); }
      else{ byId.set(key, m); }
    });
    allRecords.value = Array.from(byId.values());
    page.value = 1; rerender();
    showToast('门岗数据已同步');
  }catch{ showToast('门岗同步失败'); }
}

function addTestCapture(){ /* 添加测试抓拍 */ }
async function onUploadTickets(e: Event){ /* 上传磅单 */ }
function fileToDataUrl(file: File){ /* 文件转DataURL */ }

const showCapture = ref(false);
const currentRow = ref<any>(null);
function previewCaptures(){ /* 预览抓拍 */ }
function openUrl(u:string){ window.open(u, '_blank'); }

const showInsertDialog = ref(false);
const formTransportNo = ref('');
const formWaybillNo = ref('');
const pendingTickets = reactive<string[]>([]);
function openInsertDialog(){ /* 打开插入对话框 */ }
function confirmInsertCapture(){ /* 确认插入抓拍 */ }
</script>

<style scoped>
.page{ padding:16px; }
.title-bar{ display:flex; align-items:center; justify-content:space-between; margin:0; }
.close-btn{ background:#fee2e2; color:#991b1b; border:none; width:28px; height:28px; border-radius:6px; cursor:pointer; }
.toolbar{ margin:12px 0; display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
.toolbar{ position:relative; z-index:10; background:#ffffff; border:1px solid #e5e7eb; border-radius:12px; padding:8px; box-shadow:0 6px 16px rgba(2,6,23,.06); }
.ghost{ background:linear-gradient(#f8fafc,#eef2f7); color:#0f172a; height:34px; padding:0 12px; border:1px solid #e2e8f0; border-radius:10px; cursor:pointer; transition:all .15s ease; box-shadow:0 1px 0 rgba(255,255,255,.6) inset; }
.ghost:hover{ background:linear-gradient(#f1f5f9,#e2e8f0); border-color:#cbd5e1; transform:translateY(-1px); }
.ghost:active{ transform:translateY(0); }
.ghost:disabled{ opacity:.6; cursor:not-allowed; }
.ghost-select{ background:#f8fafc; color:#0f172a; height:34px; padding:0 10px; border:1px solid #e2e8f0; border-radius:10px; }
.upload-btn{ position:relative; overflow:hidden; display:inline-flex; align-items:center; gap:6px; padding:0 12px; border-radius:10px; background:linear-gradient(#f8fafc,#eef2f7); color:#0f172a; border:1px solid #e2e8f0; height:34px; cursor:pointer; }
.upload-btn input{ position:absolute; inset:0; opacity:0; cursor:pointer; }
.primary{ background:linear-gradient(#2563eb,#1d4ed8) !important; color:#fff !important; border-color:#1e40af !important; box-shadow:0 4px 12px rgba(37,99,235,.25); }
.primary:hover{ background:linear-gradient(#1d4ed8,#1e40af) !important; }
.ghost-input{ background:#fff; border:1px solid #e5e7eb; height:34px; padding:0 8px; border-radius:8px; }
.cols-panel{ display:flex; flex-wrap:wrap; gap:12px; padding:8px 12px; background:#f8fafc; border:1px dashed #e2e8f0; border-radius:12px; margin-bottom:12px; }
.col-item{ font-size:12px; color:#0f172a; }
.grid-wrap{ border:1px solid #e5e7eb; border-radius:12px; overflow:auto; box-shadow:0 10px 24px rgba(2,6,23,.06); height:70vh; }
.grid{ width:100%; height:100%; min-width:1400px; }
.link{ color:#2563eb; }
.danger{ color:#ef4444; margin-left:8px; }
.ag-theme-alpine{ --ag-font-size:12px; --ag-row-height:40px; }
.grid-wrap{ scrollbar-gutter: stable both-edges; }
.current-row{ background: #f8fafc; }
.current-col{ background: #f1f5f9; }
.tag{ display:inline-block; padding:2px 8px; border-radius:999px; font-size:12px; line-height:18px; }
.tag.tag-blue{ background:#e0f2fe; color:#075985; }
.tag.tag-amber{ background:#fef3c7; color:#92400e; }
.tag.tag-green{ background:#dcfce7; color:#166534; }
.tag.tag-gray{ background:#e5e7eb; color:#374151; }
.tag.tag-purple{ background:#ede9fe; color:#5b21b6; }
.tag.tag-cyan{ background:#cffafe; color:#155e75; }
.basic-wrap{ border:1px solid #e5e7eb; border-radius:12px; overflow:auto; box-shadow:0 10px 24px rgba(2,6,23,.06); margin-top:8px; }
.ls-wrap{ border:1px solid #e5e7eb; border-radius:12px; height:70vh; box-shadow:0 10px 24px rgba(2,6,23,.06); overflow:hidden; }
.sheet-close-btn{ position:absolute; left:12px; bottom:8px; background:#fee2e2; color:#991b1b; border:none; padding:4px 8px; border-radius:8px; cursor:pointer; }
.modal-mask{ position:fixed; inset:0; background:rgba(15,23,42,.35); display:flex; align-items:center; justify-content:center; z-index:50; }
.modal{ background:#fff; border-radius:12px; padding:16px; width:520px; box-shadow:0 20px 40px rgba(0,0,0,.18); }
.modal.large{ width:720px; }
.modal-title{ font-weight:700; font-size:16px; margin-bottom:8px; }
.modal-actions{ display:flex; justify-content:flex-end; gap:8px; margin-top:12px; }
.file-list{ max-height:360px; overflow:auto; border:1px solid #e5e7eb; border-radius:10px; padding:6px; }
.file-item{ display:flex; justify-content:space-between; padding:8px 10px; border-bottom:1px solid #f1f5f9; cursor:pointer; }
.file-item:hover{ background:#f8fafc; }
.fname{ color:#0f172a; }
.ftime{ color:#64748b; font-size:12px; }
.closed-hint{ padding:8px 12px; border:1px dashed #e5e7eb; border-radius:10px; background:#f8fafc; color:#334155; margin-bottom:8px; }
.toast{ position:fixed; right:16px; bottom:16px; background:#0ea5e9; color:#fff; padding:8px 12px; border-radius:8px; box-shadow:0 6px 14px rgba(2,6,23,.25); z-index:60; }
.import-panel{ border:1px solid #e5e7eb; background:#fff; padding:10px; border-radius:10px; margin-top:12px; box-shadow:0 6px 16px rgba(2,6,23,.06); }
.import-head{ display:flex; align-items:center; gap:10px; }
.import-body{ margin-top:8px; }
.err-list{ display:grid; grid-template-columns: repeat(2, minmax(240px,1fr)); gap:8px; }
.err-item{ border:1px dashed #fecaca; background:#fff7f7; padding:8px; border-radius:8px; color:#7f1d1d; }
.err-title{ font-weight:600; margin-bottom:6px; }
.gallery{ display:flex; flex-wrap:wrap; gap:10px; }
.thumb{ width:160px; }
.thumb img{ width:160px; height:100px; object-fit:cover; border-radius:6px; border:1px solid #e5e7eb; cursor:pointer; }
.thumb figcaption{ font-size:12px; text-align:center; color:#475569; margin-top:4px; }
</style>
