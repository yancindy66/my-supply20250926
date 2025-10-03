<template>
  <div class="page">
    <h2 class="title-bar"><span>车辆入库（修正·Handsontable）</span></h2>
    <div class="toolbar">
      <button class="ghost" @click="toggleColsPanel">列显隐</button>
      <label class="ghost upload-btn">
        批量导入
        <input type="file" accept=".csv,.xlsx,.xls" @change="onImportFile" />
      </label>
      <button class="ghost" @click="syncGate">同步门岗</button>
      <button class="ghost" @click="exportExcel">导出</button>
      <button class="ghost" :disabled="saving" @click="saveCurrent">{{ saving? '保存中…' : '保存' }}</button>
      <button class="ghost" @click="showOpenPanel=true">打开</button>
      <button class="ghost" @click="openInsertDialog">插入测试抓拍</button>
      <label class="ghost upload-btn">
        上传磅单(多张)
        <input type="file" accept="image/*" multiple @change="onUploadTickets" />
      </label>
      <button class="ghost" @click="previewCaptures">预览抓拍</button>
      <button class="ghost" @click="printSheet">打印</button>
      <button class="ghost" title="关闭页面" @click="triggerClose">❎ 关闭</button>
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
    <div v-if="closed" class="closed-hint">表格已关闭。可点击“打开”选择已保存的表恢复。</div>
    <div v-if="toast.show" class="toast" role="status" aria-live="polite">{{ toast.msg }}</div>
    <div v-if="showCols" class="cols-panel">
      <label v-for="c in cols" :key="c.key" class="col-item">
        <input type="checkbox" v-model="c.visible" @change="rerender"/> {{ c.name }}
      </label>
    </div>
    <div v-show="!closed" id="luckysheet" class="ls-wrap" style="position:relative;">
      <button class="sheet-close-btn" title="关闭当前表" @click="triggerClose">❎</button>
    </div>
    <!-- 关闭确认弹框：页面级关闭入口（❎）触发 -->
    <div v-if="showCloseDialog" class="modal-mask">
      <div class="modal">
        <div class="modal-title">关闭表格</div>
        <div class="modal-body">是否保存当前表并关闭页面？</div>
        <div class="modal-actions">
          <button class="ghost" @click="closeWithoutSave">直接关闭</button>
          <button class="ghost" @click="prepareCloseWithSave">保存并关闭</button>
          <button @click="showCloseDialog=false">取消</button>
        </div>
      </div>
    </div>
    <!-- 保存命名弹框 -->
    <div v-if="showNameDialog" class="modal-mask">
      <div class="modal">
        <div class="modal-title">保存文件名</div>
        <div class="modal-body">
          <input class="ghost-input" v-model="nameInput" placeholder="请输入文件名" />
        </div>
        <div class="modal-actions">
          <button class="ghost" @click="confirmSaveAndClose">保存并关闭</button>
          <button @click="showNameDialog=false">取消</button>
        </div>
      </div>
    </div>
    <!-- 打开面板（搜索+列表） -->
    <div v-if="showOpenPanel" class="modal-mask">
      <div class="modal large">
        <div class="modal-title">打开保存的表</div>
        <div class="modal-body">
          <input class="ghost-input" placeholder="搜索文件名..." v-model="openSearch" />
          <div class="file-list">
            <div class="file-item" v-for="f in filteredSaved" :key="f.id" @click="openSaved(f.id)">
              <div class="fname">{{ f.name }}</div>
              <div class="ftime">{{ formatTime(f.ts) }}</div>
            </div>
            <div v-if="!filteredSaved.length" class="empty">无匹配结果</div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="ghost" @click="showOpenPanel=false">关闭</button>
        </div>
      </div>
    </div>
    <div v-if="importPreview.length || importErrors.length" class="import-panel">
      <div class="import-head">
        <b>导入结果</b>
        <span>共 {{ importPreview.length + importErrors.length }} 条</span>
        <span>｜通过 {{ passCount }} 条｜错误 {{ failCount }} 条</span>
        <div class="spacer"></div>
        <button class="ghost" @click="clearImport">清空</button>
        <button class="ghost" @click="exportErrorCsv" :disabled="!importErrors.length">导出错误明细</button>
        <button @click="mergeImport" :disabled="!passCount">仅导入通过项</button>
      </div>
      <div class="import-body">
        <div v-if="importErrors.length" class="err-list">
          <div class="err-item" v-for="(e,i) in importErrors" :key="i">
            <div class="err-title">第 {{ e._rowIndex+1 }} 行</div>
            <ul>
              <li v-for="(m,mi) in e.messages" :key="mi">{{ m }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <!-- 抓拍预览弹窗 -->
    <div v-if="showCapture" class="modal-mask">
      <div class="modal large">
        <div class="modal-title">抓拍预览（{{ currentRow?.reservation_number || '-' }}）</div>
        <div class="modal-body">
          <div class="gallery">
            <figure v-for="(u,i) in (currentRow?.entry_photos||[])" :key="'en'+i" class="thumb">
              <img :src="u" @click="openUrl(u)" />
              <figcaption>入场 {{ i+1 }}</figcaption>
            </figure>
            <figure v-for="(u,i) in (currentRow?.exit_photos||[])" :key="'ex'+i" class="thumb">
              <img :src="u" @click="openUrl(u)" />
              <figcaption>出场 {{ i+1 }}</figcaption>
            </figure>
          </div>
        </div>
        <div class="modal-actions">
          <button class="ghost" @click="showCapture=false">关闭</button>
        </div>
      </div>
    </div>
    <!-- 插入抓拍信息弹框 -->
    <div v-if="showInsertDialog" class="modal-mask">
      <div class="modal">
        <div class="modal-title">插入抓拍与运输信息</div>
        <div class="modal-body">
          <div style="display:flex; gap:8px; align-items:center; margin-bottom:8px;">
            <label style="min-width:86px;">运输单号</label>
            <input class="ghost-input" v-model="formTransportNo" placeholder="请输入运输单号" />
          </div>
          <div style="display:flex; gap:8px; align-items:center;">
            <label style="min-width:86px;">运单号</label>
            <input class="ghost-input" v-model="formWaybillNo" placeholder="请输入运单号" />
          </div>
          <div style="margin-top:8px; color:#64748b; font-size:12px;">已选择磅单图片 {{ pendingTickets.length }} 张</div>
        </div>
        <div class="modal-actions">
          <button class="ghost" @click="confirmInsertCapture">确定</button>
          <button @click="showInsertDialog=false">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue';
// 使用 CDN 动态加载 Luckysheet，避免本地打包兼容问题
import { listInboundOrders } from '@/api/depositor';
import * as XLSX from 'xlsx';
import http from '@/api/http';

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
  // 先加载插件脚本，再加载主库
  const loadScript = (src:string)=> new Promise((resolve, reject)=>{
    const exists = Array.from(document.scripts).some(sc=>sc.src===src);
    if(exists) return resolve(null);
    const s = document.createElement('script'); s.src = src; s.async = true;
    s.onload = ()=> resolve(null); s.onerror = reject; document.body.appendChild(s);
  });
  await loadScript('https://cdn.jsdelivr.net/npm/luckysheet@2.1.13/dist/plugins/js/plugin.js');
  await loadScript('https://cdn.jsdelivr.net/npm/luckysheet@2.1.13/dist/luckysheet.umd.js');
  // 等待全局对象就绪
  const ls:any = (window as any).luckysheet || (window as any).Luckysheet;
  return ls;
}
const allRecords = ref<any[]>([]);
const viewRecords = ref<any[]>([]);
const STORAGE_KEY = 'inbound_saved_sheets.v1';
const savedList = ref<{id:string; name:string; data:any[]}[]>(loadSaved());
const openId = ref<string>('');
const openSearch = ref('');
const showCloseDialog = ref(false);
const showOpenPanel = ref(false);
const closed = ref(false);
const saving = ref(false);
const toast = ref<{show:boolean; msg:string}>({ show:false, msg:'' });
const showNameDialog = ref(false);
const nameInput = ref('');
const filteredSaved = computed(()=>{
  const k = openSearch.value.trim().toLowerCase();
  if(!k) return savedList.value;
  return savedList.value.filter(x=> x.name.toLowerCase().includes(k));
});
function formatTime(ts?: number){ if(!ts) return ''; const d=new Date(ts); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; }
const showCols = ref(false);
// 取消顶部筛选，保留分页
const page = ref(1);
const pageSize = ref(50);
const totalPages = computed(()=> Math.max(1, Math.ceil(allRecords.value.length / pageSize.value)));
const colHeaders = ['预约单号','运输单号','入库单号','入库状态','入库凭证+','客户','商品','车牌号','预约量','已经入库量','磅重（入库方式）','毛重','皮重','净重','扣重','入场抓拍','入场抓拍时间','出场抓拍','出场抓拍时间','质检URL','司机姓名','司机手机','司机身份证','司机驾驶证','操作'];
// Handsontable 配置已移除，改用 Luckysheet 渲染

function mapStatus(s: string){ const m:Record<string,string>={ created:'已创建', receiving:'收货中', completed:'已完成', cancelled:'已取消' }; return m[s]||s||'-'; }

async function load(){
  // 先读本地 mock，再尝试请求接口；接口异常不影响展示
  let mock:any[] = [];
  try{ mock = JSON.parse(localStorage.getItem('mockInboundOrders')||'[]')||[]; }catch{}
  let api:any[] = [];
  try{
    const resp:any = await listInboundOrders({ page:1, pageSize:100 });
    api = resp?.data?.list || [];
  }catch(e){ /* ignore */ }
  // 若两端都无数据，自动生成10条本地Mock并落盘，避免空白
  if((mock?.length||0)===0 && (api?.length||0)===0){
    mock = genFullMock(10);
    try{ localStorage.setItem('mockInboundOrders', JSON.stringify(mock)); }catch{}
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
      reservation_number: 'YY'+(now+i),
      transport_no: 'T'+(now+i).toString().slice(-6),
      order_no: 'RK'+(now+i),
      status: ['created','receiving','completed'][i%3],
      owner_name: '某客户'+(i+1),
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
      name:'入库列表',
      celldata,
      config: {}
    }]
  });
  // 注册保存所需的快捷操作：读取当前可见区域值
  (window as any).__getCurrentGridValues = function(){
    const sheets:any[] = ls.getAllSheets?.() || [];
    let idx:any = 0;
    try{ idx = typeof ls.getSheetIndex==='function' ? ls.getSheetIndex() : (ls.getSheet?.()?.index ?? 0); }catch{}
    const sheet:any = sheets[idx] || sheets[0] || {};
    const name = sheet?.name || '入库列表';
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
// 冻结交由 Luckysheet 工具栏控制

function exportExcel(){
  const headers = cols.value.filter(c=>c.visible).map(c=>c.name);
  const keys = cols.value.filter(c=>c.visible).map(c=>c.key);
  const data = viewRecords.value.map(r=> keys.map(k=> r[k] ?? ''));
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '入库列表');
  XLSX.writeFile(wb, '入库列表.xlsx');
}

// 批量导入（CSV/XLSX）
function parseCsv(text:string){
  const lines = text.split(/\r?\n/).filter(Boolean);
  if(!lines.length) return [] as any[];
  const header = lines[0].split(',');
  const idx:Record<string,number> = {}; header.forEach((h,i)=> idx[h]=i);
  const keyMap:Record<string,string> = {
    '预约单号':'reservation_number','运输单号':'transport_no','入库单号':'order_no','入库状态':'status','客户':'owner_name','车牌号':'vehicle_plate','商品':'commodity','预约量':'planned_quantity','已经入库量':'actual_in_weight','磅重（入库方式）':'weigh_mode_text','毛重':'gross','皮重':'tare','净重':'net','扣重':'deductions'
  };
  const arr:any[] = [];
  for(let i=1;i<lines.length;i++){
    const colsArr = lines[i].split(',');
    const row:any = {};
    for(const [cn,en] of Object.entries(keyMap)){
      const p = idx[cn]; if(p!=null) row[en] = colsArr[p]||'';
    }
    arr.push(row);
  }
  return arr;
}
async function onImportFile(e: Event){
  const input = e.target as HTMLInputElement; const file = input.files?.[0]; if(!file) return;
  const name = (file.name||'').toLowerCase();
  try{
    let rows:any[] = [];
    if(name.endsWith('.csv')){
      const text = await file.text();
      rows = parseCsv(text);
    }else{
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type:'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json:any[] = XLSX.utils.sheet_to_json(ws, { defval:'' });
      // 尝试按中文标题映射
      const map:Record<string,string> = { '预约单号':'reservation_number','运输单号':'transport_no','入库单号':'order_no','入库状态':'status','客户':'owner_name','车牌号':'vehicle_plate','商品':'commodity','预约量':'planned_quantity','已经入库量':'actual_in_weight','磅重（入库方式）':'weigh_mode_text','毛重':'gross','皮重':'tare','净重':'net','扣重':'deductions' };
      rows = json.map(r=>{ const o:any={}; for(const [cn,en] of Object.entries(map)) o[en]=r[cn]??''; return o; });
    }
    doValidate(rows);
  }catch(err){ alert('导入失败：'+(err as any)?.message || err); }
  input.value = '';
}

const importPreview = ref<any[]>([]);
const importErrors = ref<any[]>([]);
const passCount = computed(()=> importPreview.value.length);
const failCount = computed(()=> importErrors.value.length);

function doValidate(rows:any[]){
  const ok:any[] = []; const errs:any[] = [];
  const existed = new Set(allRecords.value.map((r:any)=> String(r.reservation_number||'').trim()));
  const seen = new Set<string>();
  const statusSet = new Set(['已创建','收货中','已完成','已取消']);
  rows.forEach((r, i)=>{
    const messages:string[] = [];
    const id = String(r.reservation_number||'').trim();
    if(!id) messages.push('预约单号必填');
    if(id){
      if(existed.has(id)) messages.push('预约单号已存在');
      if(seen.has(id)) messages.push('文件内预约单号重复');
    }
    const numericKeys = ['planned_quantity','actual_in_weight','gross','tare','net','deductions'];
    for(const k of numericKeys){ if(r[k]!=='' && r[k]!=null && isNaN(Number(r[k]))) messages.push(`${k} 必须为数字`); }
    if(r.gross!=='' && r.tare!=='' && !isNaN(Number(r.gross)) && !isNaN(Number(r.tare))){ r.net = (Number(r.gross)-Number(r.tare)).toFixed(2); }
    if(r.status && !statusSet.has(String(r.status))) messages.push('状态值不合法，应为：已创建/收货中/已完成/已取消');
    if(messages.length){ errs.push({ _rowIndex:i, messages }); } else { ok.push(r); if(id) seen.add(id); }
  });
  importPreview.value = ok; importErrors.value = errs;
}

function clearImport(){ importPreview.value = []; importErrors.value = []; }
function mergeImport(){ if(!importPreview.value.length) return; allRecords.value = [...importPreview.value, ...allRecords.value]; clearImport(); rerender(); }
function exportErrorCsv(){ if(!importErrors.value.length) return; const lines = importErrors.value.map((e:any)=>`第${e._rowIndex+1}行,${e.messages.join('；')}`); const csv = ['行,错误', ...lines].join('\n'); const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download='导入错误.csv'; a.click(); URL.revokeObjectURL(a.href); }

// 保存/打开（持久化到localStorage）与新建空白表
async function getLS(){ const any = await loadLuckysheetCDN(); return (any && typeof any.create==='function')? any : (window as any).luckysheet; }
function loadSaved(){
  try{ const raw = localStorage.getItem(STORAGE_KEY); return raw? JSON.parse(raw) : []; }catch{ return []; }
}
function persist(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(savedList.value)); }
async function saveCurrent(customName?: string){
  saving.value = true;
  const id = String(Date.now());
  // 优先从 Luckysheet 当前网格读取（包含用户直接在表内改动的内容）
  let data:any[] = [];
  let nameHint = '入库列表';
  try{
    const grid:any = (window as any).__getCurrentGridValues?.();
    if(grid){ data = grid.values || []; nameHint = grid.name || nameHint; }
  }catch{}
  if(!data || !data.length){ data = JSON.parse(JSON.stringify(viewRecords.value)); }
  const ts = new Date();
  const time = `${String(ts.getHours()).padStart(2,'0')}:${String(ts.getMinutes()).padStart(2,'0')}:${String(ts.getSeconds()).padStart(2,'0')}`;
  const name = customName ? customName : `保存-${nameHint}-${time}`;
  savedList.value = [{ id, name, data }, ...savedList.value];
  persist();
  openId.value = id;
  saving.value = false;
  showToast('已保存：'+name);
}
function openSaved(){
  const id = typeof arguments[0]==='string' ? arguments[0] : openId.value;
  const it = savedList.value.find(x=>x.id===id); if(!it) return;
  allRecords.value = [...it.data];
  page.value = 1;
  rerender();
  showOpenPanel.value = false; closed.value = false;
}
function closeWithoutSave(){ showCloseDialog.value=false; hideCurrentSheet(); }
function prepareCloseWithSave(){
  showCloseDialog.value=false;
  // 判断当前sheet名称，未命名（如 Sheet2/sheet2）则要求命名保存
  const ls:any = (window as any).luckysheet;
  let sheetName = 'Sheet';
  try{
    const idx = typeof ls?.getSheetIndex==='function' ? ls.getSheetIndex() : 0;
    const cur = ls?.getAllSheets?.()[idx];
    sheetName = cur?.name || 'Sheet';
  }catch{}
  if(/^sheet\d+$/i.test(sheetName)){
    nameInput.value = '';
    showNameDialog.value = true;
  }else{
    // 已命名：按之前逻辑直接关闭当前sheet
    hideCurrentSheet();
  }
}
function confirmSaveAndClose(){
  const raw = nameInput.value.trim() || '未命名';
  const ts = new Date();
  const time = `${String(ts.getHours()).padStart(2,'0')}:${String(ts.getMinutes()).padStart(2,'0')}:${String(ts.getSeconds()).padStart(2,'0')}`;
  const custom = `保存-${raw}-${time}`;
  saveCurrent(custom);
  showNameDialog.value=false;
  hideCurrentSheet();
  // 页面级“关闭”需真正跳转离开本页
  doClosePage();
}

function hideCurrentSheet(){
  // 仅隐藏当前Luckysheet中的活动sheet，不销毁其他sheet
  const ls:any = (window as any).luckysheet;
  try{
    const idx = typeof ls?.getSheetIndex==='function' ? ls.getSheetIndex() : 0;
    const sheets:any[] = ls?.getAllSheets?.() || [];
    if(!sheets.length) return;
    // 兼容多版本：优先deleteSheet/delSheet，否则隐藏
    if(typeof ls?.deleteSheet==='function') ls.deleteSheet(idx);
    else if(typeof ls?.delSheet==='function') ls.delSheet(idx);
    else if(typeof ls?.setSheetHide==='function') ls.setSheetHide(idx, true);
    else { closed.value = true; }
  }catch{}
  // 页面上不整体关闭容器，避免误关全部
}

function doClosePage(){
  try{ history.length>1 ? history.back() : (location.href='/inbound/order/list'); }catch{ location.href='/inbound/order/list'; }
}

function triggerClose(){ showCloseDialog.value = true; }
// 新建空白表入口已移除

// 打印（兼容：将当前视图导出为HTML并触发浏览器打印）
function printSheet(){
  const headers = cols.value.filter(c=>c.visible).map(c=>c.name);
  const keys = cols.value.filter(c=>c.visible).map(c=>c.key);
  const htmlRows = viewRecords.value.map(r=> `<tr>${keys.map(k=>`<td>${String(r[k]??'')}</td>`).join('')}</tr>`).join('');
  const html = `<html><head><meta charset='utf-8'><title>打印</title><style>table{border-collapse:collapse;width:100%}th,td{border:1px solid #e5e7eb;padding:6px 8px;font-size:12px;text-align:left}</style></head><body><table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${htmlRows}</tbody></table></body></html>`;
  const w = window.open('', '_blank'); if(!w) return;
  w.document.open(); w.document.write(html); w.document.close(); w.focus(); w.print();
}

function showToast(msg:string){ toast.value = { show:true, msg }; setTimeout(()=> toast.value.show=false, 1800); }

// 同步门岗数据到表格
async function syncGate(){
  try{
    // 假定后端提供门岗最新记录接口（示例：/v1/gate/entries/recent）
    const resp:any = await http.get('/v1/gate/entries/recent');
    const list:any[] = resp?.data?.items || [];
    // 映射到入库列（根据已有字段做融合）
    const mapped = list.map((g:any)=>({
      reservation_number: g.reservation_no || g.order_no || '-',
      transport_no: g.transport_no || '-'
    }));
    // 简单合并：按预约单号去重更新
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

// 插入测试抓拍（使用公网测试图），并显示缩略图预览入口
function addTestCapture(){
  const url1 = 'https://images.unsplash.com/photo-1529078155058-5d716f45d604?w=800&q=80&auto=format&fit=crop';
  const url2 = 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80&auto=format&fit=crop';
  const row = allRecords.value[0];
  if(!row) return showToast('暂无数据行');
  row.entry_photos = Array.isArray(row.entry_photos)? row.entry_photos : [];
  row.exit_photos = Array.isArray(row.exit_photos)? row.exit_photos : [];
  row.entry_photos.push(url1); row.exit_photos.push(url2);
  row.entry_photos_count = `${row.entry_photos.length} 张`;
  row.exit_photos_count = `${row.exit_photos.length} 张`;
  rerender();
  currentRow.value = row; showCapture.value = true;
}

// 批量上传磅单（入库凭证），此处示例为将图片转成dataURL后暂存到本地再合并
async function onUploadTickets(e: Event){
  const files = (e.target as HTMLInputElement).files; if(!files || !files.length) return;
  const row = allRecords.value[0]; if(!row) return showToast('请先确保有一条数据');
  const urls:string[] = [];
  for(const f of Array.from(files)){
    const u = await fileToDataUrl(f); urls.push(u);
  }
  row.weigh_ticket_urls = Array.isArray(row.weigh_ticket_urls)? row.weigh_ticket_urls : [];
  row.weigh_ticket_urls.push(...urls);
  row.inbound_proof = `磅单${row.weigh_ticket_urls.length}张`;
  rerender();
  showToast('已添加本地磅单(预览)');
  (e.target as HTMLInputElement).value = '';
  // 将待插入的数据暂存在内存，便于“插入测试抓拍”使用
  pendingTickets.splice(0, pendingTickets.length, ...urls);
}
function fileToDataUrl(file: File){
  return new Promise<string>((resolve,reject)=>{ const reader = new FileReader(); reader.onload=()=>resolve(String(reader.result||'')); reader.onerror=reject; reader.readAsDataURL(file); });
}

const showCapture = ref(false);
const currentRow = ref<any>(null);
function previewCaptures(){ const row = allRecords.value[0]; if(!row) return showToast('暂无数据行'); currentRow.value = row; showCapture.value = true; }
function openUrl(u:string){ window.open(u, '_blank'); }

// 插入抓拍对话框逻辑
const showInsertDialog = ref(false);
const formTransportNo = ref('');
const formWaybillNo = ref('');
const pendingTickets = reactive<string[]>([] as string[]);
function openInsertDialog(){ if(!pendingTickets.length) showToast('请先上传磅单图片'); showInsertDialog.value = true; }
function confirmInsertCapture(){
  const row = allRecords.value[0]; if(!row) return;
  if(formTransportNo.value) row.transport_no = formTransportNo.value;
  if(formWaybillNo.value) row.order_no = formWaybillNo.value;
  row.entry_photos = Array.isArray(row.entry_photos)? row.entry_photos : [];
  row.entry_photos.push(...pendingTickets);
  row.entry_photos_count = `${row.entry_photos.length} 张`;
  rerender();
  showInsertDialog.value = false;
  showToast('已插入运输/抓拍信息');
}
</script>

<style scoped>
.page{ padding:16px; }
.title-bar{ display:flex; align-items:center; justify-content:space-between; margin:0; }
.close-btn{ background:#fee2e2; color:#991b1b; border:none; width:28px; height:28px; border-radius:6px; cursor:pointer; }
.toolbar{ margin:12px 0; display:flex; gap:8px; }
.toolbar{ position:relative; z-index:10; }
.ghost{ background:#eef2f7; color:#0f172a; height:36px; padding:0 12px; border:none; border-radius:10px; cursor:pointer; }
.ghost-select{ background:#eef2f7; color:#0f172a; height:36px; padding:0 8px; border:none; border-radius:10px; }
.ghost-input{ background:#fff; border:1px solid #e5e7eb; height:34px; padding:0 8px; border-radius:8px; }
.cols-panel{ display:flex; flex-wrap:wrap; gap:12px; padding:8px 12px; background:#f8fafc; border:1px dashed #e2e8f0; border-radius:12px; margin-bottom:12px; }
.col-item{ font-size:12px; color:#0f172a; }
.grid-wrap{ border:1px solid #e5e7eb; border-radius:12px; overflow:auto; box-shadow:0 10px 24px rgba(2,6,23,.06); height:70vh; }
.grid{ width:100%; height:100%; min-width:1400px; }
.link{ color:#2563eb; }
.danger{ color:#ef4444; margin-left:8px; }
.ag-theme-alpine{ --ag-font-size:12px; --ag-row-height:40px; }

/* 显式启用底边滚动条（部分浏览器在容器高度=视窗高度时不展示滚动条） */
.grid-wrap{ scrollbar-gutter: stable both-edges; }

/* 高亮当前行列 */
.current-row{ background: #f8fafc; }
.current-col{ background: #f1f5f9; }

/* 标签色系 */
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


