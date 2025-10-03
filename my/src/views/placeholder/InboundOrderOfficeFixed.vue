<template>
  <div class="page">
    <h2>车辆入库（修正·Handsontable）</h2>
    <div class="toolbar">
      <button class="ghost" @click="load">刷新</button>
    <button class="ghost" @click="mock10">生成10条MOCK</button>
      <button class="ghost" @click="appendMock10">追加10条</button>
      <button class="ghost" @click="clearMock">清空MOCK</button>
      <button class="ghost" @click="resetColWidths">重置列宽</button>
      <button class="ghost" @click="exportExcel">导出Excel</button>
      <button class="ghost" @click="showColsPanel = !showColsPanel">列显隐</button>
      <select class="ghost-select" v-model="filterStatus" @change="applyFilters">
        <option value="">状态: 全部</option>
        <option value="已创建">已创建</option>
        <option value="收货中">收货中</option>
        <option value="已完成">已完成</option>
        <option value="已取消">已取消</option>
      </select>
      <select class="ghost-select" v-model="filterMode" @change="applyFilters">
        <option value="">入库方式: 全部</option>
        <option value="按磅重">按磅重</option>
        <option value="按规格">按规格</option>
      </select>
    </div>
    <div v-if="showColsPanel" class="cols-panel">
      <label v-for="c in columnMeta" :key="c.idx" class="col-item">
        <input type="checkbox" v-model="c.visible" @change="applyHidden" /> {{ c.label }}
      </label>
    </div>
    <div class="grid-wrap">
      <hot-table
        ref="hotRef"
        class="grid"
        :data="rows"
        :colHeaders="colHeaders"
        :columns="hotColumns"
        :fixedColumnsLeft="2"
        :fixedColumnsEnd="1"
        :stretchH="'none'"
        :manualColumnResize="true"
        :manualColumnMove="true"
        :rowHeaders="true"
        :filters="true"
        :dropdownMenu="true"
        :columnSorting="true"
        :currentRowClassName="'current-row'"
        :currentColClassName="'current-col'"
        :hiddenColumns="hiddenColumns"
        :colWidths="140"
        :licenseKey="'non-commercial-and-evaluation'"
        :rowHeights="40"
        :height="'70vh'"
      />
    </div>

    <!-- 基础版 Handsontable（仅4列，纯Mock，无固定与美化） -->
    <h3 style="margin-top:16px;">基础表格（简洁）</h3>
    <div class="basic-wrap">
      <hot-table
        :data="basicRows"
        :colHeaders="basicHeaders"
        :columns="basicColumns"
        :rowHeights="36"
        :height="320"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { HotTable } from '@handsontable/vue3';
import 'handsontable/dist/handsontable.full.min.css';
import { listInboundOrders } from '@/api/depositor';
import * as XLSX from 'xlsx';
const rows = ref<any[]>([]);
const allRecords = ref<any[]>([]);
const hotRef = ref<any>(null);
const showColsPanel = ref(false);
const filterStatus = ref('');
const filterMode = ref('');

// 基础表格（仅4列）
const basicRows = ref<any[]>([]);
const basicHeaders = ['预约单号','运输单号','客户','状态'];
const basicColumns = [
  { data:'reservation_number' },
  { data:'transport_no' },
  { data:'owner_name' },
  { data:'status' }
];
const colHeaders = ['预约单号','运输单号','入库单号','入库状态','入库凭证+','客户','商品','车牌号','预约量','已经入库量','磅重（入库方式）','毛重','皮重','净重','扣重','入场抓拍','入场抓拍时间','出场抓拍','出场抓拍时间','质检URL','司机姓名','司机手机','司机身份证','司机驾驶证','操作'];
// 渲染器
function renderTag(td:HTMLTableCellElement, text:string, cls:string){ td.innerHTML = `<span class="tag ${cls}">${text}</span>`; }
function statusRenderer(_inst:any, td:any, _row:number, _col:number, _prop:any, value:any){
  const map:any = { '已创建':'blue', '收货中':'amber', '已完成':'green', '已取消':'gray' };
  renderTag(td, String(value||'-'), `tag-${map[String(value)]||'gray'}`);
}
function modeRenderer(_inst:any, td:any, _row:number, _col:number, _prop:any, value:any){
  const map:any = { '按规格':'purple', '按磅重':'cyan' };
  renderTag(td, String(value||'-'), `tag-${map[String(value)]||'gray'}`);
}
function linkRenderer(_inst:any, td:any, _row:number, _col:number, _prop:any, value:any){
  if (value && String(value) !== '-') {
    td.innerHTML = `<a class="link" href="${value}" target="_blank">查看</a>`;
  } else { td.textContent = '-'; }
}
function actionRenderer(_inst:any, td:any){
  td.innerHTML = `<button class="link">编辑</button><button class="danger">删除</button>`;
}

const hotColumns = [
  { data:'reservation_number', width:140 },
  { data:'transport_no', width:120 },
  { data:'order_no', width:140 },
  { data:'status', className:'htCenter', width:100, renderer: statusRenderer },
  { data:'inbound_proof', className:'htCenter', width:110 },
  { data:'owner_name', width:140 },
  { data:'commodity', width:180 },
  { data:'vehicle_plate', className:'htCenter', width:120 },
  { data:'planned_quantity', className:'htRight', width:120, type:'numeric' },
  { data:'actual_in_weight', className:'htRight', width:120, type:'numeric' },
  { data:'weigh_mode_text', className:'htCenter', width:110, renderer: modeRenderer },
  { data:'gross', className:'htRight', width:110, type:'numeric' },
  { data:'tare', className:'htRight', width:110, type:'numeric' },
  { data:'net', className:'htRight', width:110, type:'numeric' },
  { data:'deductions', className:'htRight', width:100, type:'numeric' },
  { data:'entry_photos_count', className:'htCenter', width:120 },
  { data:'entry_time', width:160 },
  { data:'exit_photos_count', className:'htCenter', width:120 },
  { data:'exit_time', width:160 },
  { data:'qc_url', width:120, renderer: linkRenderer },
  { data:'driver_name', className:'htCenter', width:110 },
  { data:'driver_phone', width:140 },
  { data:'driver_id_card', width:180 },
  { data:'driver_license_url', width:120, renderer: linkRenderer },
  { data:'_act', className:'htCenter', width:160, renderer: actionRenderer }
];

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
  applyFilters();
}

onMounted(load);
onMounted(()=>{ basicRows.value = genBasicMock(10); });

function randomPlate(){
  const letters = 'ABCDEFGHJKLmnopqrstu'.toUpperCase();
  const prov = ['京','津','沪','渝','冀','豫','云','辽','黑','湘','皖','鲁','新','苏','浙','赣','鄂','桂','甘','晋','蒙','陕','吉','闽','贵','粤','青','藏','川','宁','琼'];
  const tail = Math.random().toString().slice(2,6) + letters[Math.floor(Math.random()*letters.length)];
  return prov[Math.floor(Math.random()*prov.length)] + 'A' + tail;
}

function mock10(){
  const now = Date.now();
  const data = Array.from({ length:10 }).map((_,i)=>{
    const gross = 30000 + Math.floor(Math.random()*10000);
    const tare = 12000 + Math.floor(Math.random()*4000);
    const net = gross - tare;
    return {
      reservation_number: 'YY'+(now+i),
      transport_no: 'T'+(now+i).toString().slice(-6),
      order_no: 'RK'+(now+i),
      status: ['created','receiving','completed'][i%3],
      inbound_proof: i%2===0? '磅单1张' : '-',
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
    };
  });
  // 覆盖写入（若需要改为追加，可读取后 concat）
  localStorage.setItem('mockInboundOrders', JSON.stringify(data));
  load();
}

function appendMock10(){
  const now = Date.now();
  let list:any[] = [];
  try{ list = JSON.parse(localStorage.getItem('mockInboundOrders')||'[]')||[]; }catch{}
  const more = Array.from({ length:10 }).map((_,i)=>({ reservation_number:'YY'+(now+i), transport_no:'T'+(now+i).toString().slice(-6), order_no:'RK'+(now+i), status:['created','receiving','completed'][i%3], owner_name:'某客户'+(i+1), commodity_name:['铁矿','煤炭','玉米','大豆'][i%4], commodity_spec:['散装','袋装','30kg','50kg'][i%4], vehicle_plate: randomPlate(), planned_quantity: 32000+i*500, actual: 30000+i*123, weigh_mode:'by_weight', gross: 30000+i*100, tare: 12000+i*50, net: 18000+i*50, deductions: i%3===0? 20: 0, entry_photos: new Array(i%4).fill(0), entry_time: new Date(now - i*3600_000).toISOString().slice(0,19).replace('T',' '), exit_photos: new Array((i+1)%4).fill(0), exit_time: new Date(now - i*1800_000).toISOString().slice(0,19).replace('T',' '), qc_url:'https://example.com/qc/'+(now+i), driver_name:'司机'+(i+1), driver_phone:'1'+(3000000000 + Math.floor(Math.random()*999999999)).toString().slice(0,10), driver_id_no:'4401011990010'+String(200+i), driver_license_url:'https://example.com/license/'+(now+i) }));
  localStorage.setItem('mockInboundOrders', JSON.stringify(list.concat(more)));
  load();
}

function clearMock(){ localStorage.removeItem('mockInboundOrders'); load(); }

function resetColWidths(){
  const hot = hotRef.value?.hotInstance;
  if (hot) { hot.getPlugin('manualColumnResize')?.clearManualSize?.(); hot.render(); }
}

function applyFilters(){
  const s = filterStatus.value;
  const m = filterMode.value;
  rows.value = allRecords.value.filter(r => (!s || r.status===s) && (!m || r.weigh_mode_text===m));
}

// 列显隐（Handsontable HiddenColumns）
const columnMeta = ref(colHeaders.map((label, idx)=>({ label, idx, visible: true })));
const hiddenIndices = ref<number[]>([]);
const hiddenColumns = computed(()=>({ columns: hiddenIndices.value, indicators: true }));
function applyHidden(){
  hiddenIndices.value = columnMeta.value.filter(c=>!c.visible).map(c=>c.idx);
}

function exportExcel(){
  // 仅导出当前可见列
  const visibleIdx = columnMeta.value.filter(c=>c.visible).map(c=>c.idx);
  const headers = visibleIdx.map(i=>colHeaders[i]);
  const data = rows.value.map(r => visibleIdx.map(i => {
    const key = (hotColumns[i] as any).data;
    return r[key];
  }));
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '入库列表');
  XLSX.writeFile(wb, '入库列表.xlsx');
}

function genBasicMock(n:number){
  const now = Date.now();
  const statuses = ['已创建','收货中','已完成','已取消'];
  const arr:any[] = [];
  for(let i=0;i<n;i++){
    arr.push({
      reservation_number: 'YY'+(now+i),
      transport_no: 'T'+(now+i).toString().slice(-6),
      owner_name: '客户'+(i+1),
      status: statuses[i % statuses.length]
    });
  }
  return arr;
}
</script>

<style scoped>
.page{ padding:16px; }
.toolbar{ margin:12px 0; display:flex; gap:8px; }
.ghost{ background:#eef2f7; color:#0f172a; height:36px; padding:0 12px; border:none; border-radius:10px; }
.ghost-select{ background:#eef2f7; color:#0f172a; height:36px; padding:0 8px; border:none; border-radius:10px; }
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
</style>


