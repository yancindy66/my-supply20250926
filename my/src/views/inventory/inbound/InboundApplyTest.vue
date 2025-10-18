<template>
  <div class="page">
    <h2 class="title-bar"><span>入库申请（测试页）</span></h2>
    <div class="toolbar">
      <label class="ghost upload-btn primary">
        本地Excel
        <input type="file" accept=".csv,.xlsx,.xls" @change="onImportFile" />
      </label>
      <button class="ghost" :disabled="!rows.length" @click="exportExcel">导出</button>
      <button class="ghost primary" :disabled="pushing || !rows.length" @click="pushBatches">{{ pushing? '推送中…' : '生成预约单并推送' }}</button>
      <button class="ghost" :disabled="!rows.length" @click="printPreview">打印</button>
      <button class="ghost" @click="addRow">新增一行</button>
      <button class="ghost" :disabled="!selectedCount" @click="deleteSelected">批量删除</button>
      <button class="ghost" :disabled="!rows.length" @click="openStats">统计</button>
      <button class="ghost" @click="openColSettings">列设置</button>
      <button class="ghost" @click="openOnlyOffice">Excel表（OnlyOffice）</button>
      <div class="spacer"></div>
      <span class="hint" v-if="rows.length">已加载 {{ rows.length }} 行<span v-if="quantitySum !== null">，数量合计 {{ quantitySum }}</span></span>
    </div>

    <div v-if="msg" class="toast">{{ msg }}</div>

    

    <div v-if="rows.length" class="grid-wrap">
      <table class="grid">
        <thead>
          <tr>
            <th style="width:46px; text-align:center;">
              <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll($event)" />
            </th>
            <th style="width:70px; text-align:center;">序号</th>
            <th v-for="(h,i) in visibleHeaders" :key="'h'+i" :style="colWidths[h] ? ('width:'+colWidths[h]+'px') : ''">
              <span class="th-text">{{ h }}</span>
              <span class="col-resizer" @mousedown="onResizeStart(h, $event)"></span>
            </th>
            <th style="width:160px;">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(r,ri) in rows" :key="'r'+ri">
            <td style="text-align:center;">
              <input type="checkbox" :checked="selected.has(ri)" @change="toggleSelect(ri, $event)" />
            </td>
            <td style="text-align:center;">{{ ri + 1 }}</td>
            <td v-for="(h,ci) in visibleHeaders" :key="'c'+ri+'-'+ci" :style="colWidths[h] ? ('width:'+colWidths[h]+'px') : ''">
              <template v-if="editingIndex === ri">
                <input class="cell-input" v-model="rows[ri][h]" />
              </template>
              <template v-else>
                {{ r[h] ?? '' }}
              </template>
            </td>
            <td>
              <template v-if="editingIndex === ri">
                <button class="ghost" @click="saveEdit()">保存</button>
                <button class="ghost" @click="cancelEdit()">取消</button>
              </template>
              <template v-else>
                <button class="ghost" @click="startEdit(ri)">编辑</button>
                <button class="ghost" @click="deleteRow(ri)">删除</button>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 简易统计面板 -->
    <div v-if="showStats" class="stats-mask" @click.self="showStats=false">
      <div class="stats-panel">
        <div class="stats-header">
          <span>统计</span>
          <button class="ghost" @click="showStats=false">关闭</button>
        </div>
        <div class="stats-body">
          <div class="stats-row"><b>总行数：</b><span>{{ rows.length }}</span></div>
          <div class="stats-row" v-for="(sum,key) in numericTotals" :key="'sum-'+key">
            <b>{{ key }} 合计：</b><span>{{ sum }}</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 列设置面板 -->
    <div v-if="showCols" class="stats-mask" @click.self="showCols=false">
      <div class="cols-panel">
        <div class="cols-header">
          <span>列设置</span>
          <div class="cols-actions">
            <button class="ghost" @click="resetCols">重置</button>
            <button class="ghost" @click="saveCols">保存</button>
            <button class="ghost" @click="showCols=false">关闭</button>
          </div>
        </div>
        <div class="cols-body">
          <div class="col-add">
            <input class="name-input" v-model="newColName" placeholder="新列名" />
            <button class="ghost" @click="addColumn">新增列</button>
          </div>
          <div class="col-row" v-for="(h,idx) in headers" :key="'col-'+h">
            <label class="col-name">
              <input type="checkbox" :checked="!hiddenCols.has(h)" @change="toggleCol(h, $event)" />
              <span>{{ h }}</span>
            </label>
            <div class="col-move" style="display:flex; gap:6px; align-items:center;">
              <input class="width-input" type="number" min="40" :value="colWidths[h] || ''" placeholder="宽度(px)" @change="onColWidthInput(h, $event)" />
              <button class="ghost" @click="autoFitOne(h)">自适</button>
              <button class="ghost" :disabled="idx===0" @click="moveCol(h,-1)">上移</button>
              <button class="ghost" :disabled="idx===headers.length-1" @click="moveCol(h,1)">下移</button>
              <button class="ghost" @click="removeCol(h)">删除列</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as XLSX from 'xlsx';
import { ref, computed, onMounted, watch } from 'vue';

const rows = ref<any[]>([]);
const headers = ref<string[]>([]);
const pushing = ref(false);
const msg = ref('');
const editingIndex = ref<number|null>(null);
const originalRowSnapshot = ref<any|null>(null);
const showStats = ref(false);
const selected = ref<Set<number>>(new Set());
// 所有本地存储键改为“按数据集隔离”
const hasDraft = ref(false);
const showCols = ref(false);
const hiddenCols = ref<Set<string>>(new Set());
// 列设置与列宽键将基于 datasetId 动态生成
const colWidths = ref<Record<string, number>>({});
let resizing: { col: string; startX: number; startW: number } | null = null;
const visibleHeaders = computed(()=> headers.value.filter(h => !hiddenCols.value.has(h)));
const newColName = ref('');
// 数据集ID（按“用户+日期”，并在导入时派生唯一ID，避免覆盖旧数据）
const datasetId = ref<string>('inbound-anon');
const datasetBaseId = ref<string>('inbound-anon');
function formatDateYYYYMMDD(d: Date){
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `${y}${m}${day}`;
}
async function initDatasetId(){
  try{
    const r = await fetch('/v1/auth/me');
    const j = await r.json();
    const uid = j?.user?.id || j?.user_id || 'demo';
    datasetBaseId.value = `inbound-${uid}-${formatDateYYYYMMDD(new Date())}`;
    if (!datasetId.value || datasetId.value.startsWith('inbound-anon')) {
      datasetId.value = datasetBaseId.value;
    }
  }catch{
    datasetBaseId.value = `inbound-anon-${formatDateYYYYMMDD(new Date())}`;
    if (!datasetId.value || datasetId.value.startsWith('inbound-anon')) {
      datasetId.value = datasetBaseId.value;
    }
  }
}

// 基于 datasetId 生成本地存储键
const keyDraft = computed(()=> `inbound_apply_test_draft_v1:${datasetId.value}`);
const keyCols = computed(()=> `inbound_apply_test_cols_v1:${datasetId.value}`);
const keyColW = computed(()=> `inbound_apply_test_colw_v1:${datasetId.value}`);
// 预留锁定键（如需在“推送后锁定列设置”，可写入 '1'）
// const keyLock = computed(()=> `inbound_apply_test_lock_v1:${datasetId.value}`);

function showMsg(m:string){ msg.value = m; setTimeout(()=> msg.value='', 1800); }
function startEdit(idx:number){
  if (editingIndex.value !== null) return;
  editingIndex.value = idx;
  originalRowSnapshot.value = { ...(rows.value[idx] || {}) };
}
function saveEdit(){
  const idx = editingIndex.value;
  editingIndex.value = null;
  originalRowSnapshot.value = null;
  // 行编辑实时落库（demo）
  try{ if(idx!=null){ fetch(`/v1/imports/inbound/${encodeURIComponent(datasetId.value)}/row/${idx}`, { method:'PUT', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(rows.value[idx]||{}) }); } }catch{}
}
function cancelEdit(){
  if (editingIndex.value === null) return;
  const i = editingIndex.value;
  if (originalRowSnapshot.value){ rows.value[i] = { ...originalRowSnapshot.value }; }
  editingIndex.value = null;
  originalRowSnapshot.value = null;
}
function deleteRow(idx:number){
  if (editingIndex.value === idx) { editingIndex.value = null; originalRowSnapshot.value = null; }
  rows.value.splice(idx, 1);
  selected.value.delete(idx);
  // 重新整理已选索引（删除后索引左移）
  const next = new Set<number>();
  selected.value.forEach(i => { if(i > idx) next.add(i-1); else if(i < idx) next.add(i); });
  selected.value = next;
  // 行删除实时落库（demo）
  try{ fetch(`/v1/imports/inbound/${encodeURIComponent(datasetId.value)}/row/${idx}`, { method:'DELETE' }); }catch{}
}

const preferredQtyHeaders = ['预约入库量','数量','预约数量','入库量','计划入库量','planned_quantity','quantity','qty'];
function toHalfWidth(str:string){
  return (str||'').replace(/[\uFF10-\uFF19]/g, (d)=> String(d.charCodeAt(0)-0xFF10))
                  .replace(/\uFF0E|\u3002|．/g, '.')
                  .replace(/\uFF0C|，/g, ',')
                  .replace(/\s+/g,' ');
}
function parseNumberLike(val:any): number{
  if(val===null||val===undefined) return NaN;
  if(typeof val==='number') return val;
  let s = String(val);
  s = toHalfWidth(s).trim();
  if(!s) return NaN;
  // 去千分位逗号
  s = s.replace(/,/g,'');
  // 百分号
  const isPct = /%$/.test(s); if(isPct) s = s.replace(/%$/,'');
  let n = Number(s);
  if(isNaN(n)) return NaN;
  if(isPct) n = n/100;
  return n;
}
function isNumeric(val:any){ const n = parseNumberLike(val); return !isNaN(n) && isFinite(n as any); }
const numericTotals = computed<Record<string, number>>(()=>{
  const totals: Record<string, number> = {};
  for(const h of headers.value){
    let sum = 0; let has = false;
    for(const r of rows.value){ if(isNumeric(r[h])){ sum += Number(r[h]); has = true; } }
    if(has) totals[h] = Number(sum.toFixed(6));
  }
  return totals;
});
const quantitySum = computed<number|null>(()=>{
  for(const name of preferredQtyHeaders){ if(numericTotals.value[name] != null) return numericTotals.value[name]; }
  return null;
});
function openStats(){ showStats.value = true; }
function openColSettings(){ showCols.value = true; }

function addRow(){
  const row:any = {};
  for(const h of headers.value){ row[h] = ''; }
  rows.value.push(row);
  showMsg('已新增一行');
}
function toggleSelect(idx:number, ev: Event){
  const checked = (ev.target as HTMLInputElement).checked;
  if(checked) selected.value.add(idx); else selected.value.delete(idx);
}
const isAllSelected = computed(()=> rows.value.length>0 && selected.value.size === rows.value.length);
const selectedCount = computed(()=> selected.value.size);
function toggleSelectAll(ev: Event){
  const checked = (ev.target as HTMLInputElement).checked;
  if(checked){
    const s = new Set<number>(); for(let i=0;i<rows.value.length;i++) s.add(i); selected.value = s;
  }else{
    selected.value.clear();
  }
}
function deleteSelected(){
  if(selected.value.size === 0) return;
  const keep: any[] = [];
  for(let i=0;i<rows.value.length;i++){ if(!selected.value.has(i)) keep.push(rows.value[i]); }
  rows.value = keep as any[];
  selected.value.clear();
  showMsg('已删除选中行');
}

function saveDraft(){
  try{
    const data = { headers: headers.value, rows: rows.value };
    localStorage.setItem(keyDraft.value, JSON.stringify(data));
    hasDraft.value = true;
    showMsg('草稿已保存');
  }catch(e:any){ showMsg('保存草稿失败'); }
}
 
 

onMounted(async ()=>{
  // 先确定 datasetId，再按 dataset 读取本地设置与远端集
  await initDatasetId();
  try{
    const raw = localStorage.getItem(keyDraft.value);
    if(raw){
      const data = JSON.parse(raw||'{}');
      if(Array.isArray(data?.headers) && Array.isArray(data?.rows)){
        headers.value = data.headers;
        rows.value = data.rows;
        hasDraft.value = true;
        showMsg('已恢复草稿');
      }
    }
  }catch{}
  applySavedCols();
  loadColWidths();
  try{
    const r = await fetch(`/v1/imports/inbound/${encodeURIComponent(datasetId.value)}`);
    const j = await r.json();
    if(j && j.code===0 && j.data && Array.isArray(j.data.headers) && Array.isArray(j.data.rows)){
      headers.value = j.data.headers; rows.value = j.data.rows; showMsg('已从后端恢复数据集');
    }
  }catch{}
});

// 自动保存（防抖）
let draftTimer: any = null;
watch([rows, headers], ()=>{
  if(draftTimer) clearTimeout(draftTimer);
  draftTimer = setTimeout(()=>{ saveDraft(); }, 1200);
},{ deep:true });

// 列设置：显隐与顺序
function toggleCol(h:string, ev: Event){
  const checked = (ev.target as HTMLInputElement).checked;
  if(!checked) hiddenCols.value.add(h); else hiddenCols.value.delete(h);
}
function moveCol(h:string, delta:number){
  const i = headers.value.indexOf(h); if(i<0) return; const j = i+delta; if(j<0||j>=headers.value.length) return;
  const copy = headers.value.slice(); const tmp = copy[i]; copy[i]=copy[j]; copy[j]=tmp; headers.value = copy;
}
function saveCols(){
  try{ localStorage.setItem(keyCols.value, JSON.stringify({ order: headers.value, hidden: Array.from(hiddenCols.value) })); showMsg('列设置已保存'); }catch{}
}
function resetCols(){
  try{ localStorage.removeItem(keyCols.value); }catch{}
  hiddenCols.value.clear();
  showMsg('列设置已重置');
}
function applySavedCols(){
  try{
    const raw = localStorage.getItem(keyCols.value); if(!raw) return; const data = JSON.parse(raw||'{}');
    const order: string[] = Array.isArray(data?.order)? data.order : [];
    const hidden: string[] = Array.isArray(data?.hidden)? data.hidden : [];
    const set = new Set(order);
    const merged = order.filter(h=> headers.value.includes(h));
    for(const h of headers.value){ if(!set.has(h)) merged.push(h); }
    headers.value = merged;
    hiddenCols.value = new Set(hidden.filter(h=> headers.value.includes(h)));
  }catch{}
}

function loadColWidths(){
  try{
    const raw = localStorage.getItem(keyColW.value); if(!raw) return;
    const obj = JSON.parse(raw||'{}');
    if(obj && typeof obj==='object') colWidths.value = obj;
  }catch{}
}
function saveColWidths(){
  try{ localStorage.setItem(keyColW.value, JSON.stringify(colWidths.value||{})); }catch{}
}

let colsTimer:any = null;
watch([headers, hiddenCols], ()=>{ if(colsTimer) clearTimeout(colsTimer); colsTimer = setTimeout(()=> saveCols(), 800); }, { deep:true });

// 列宽输入与自适
function onColWidthInput(h:string, ev: Event){
  const v = Number((ev.target as HTMLInputElement).value);
  if(!isFinite(v) || v < 40) return; colWidths.value = { ...colWidths.value, [h]: Math.round(v) }; saveColWidths();
}
function measureTextWidth(text:string, font='12px/1.4 system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial'){
  const canvas = (measureTextWidth as any)._c || ((measureTextWidth as any)._c = document.createElement('canvas'));
  const ctx = canvas.getContext('2d'); if(!ctx) return text.length*12+24; ctx.font = font; return ctx.measureText(text||'').width + 24;
}
function autoFitOne(h:string){
  let max = measureTextWidth(h);
  for(const r of rows.value){ const w = measureTextWidth(String(r[h]??'')); if(w>max) max = w; }
  colWidths.value = { ...colWidths.value, [h]: Math.ceil(max) };
  saveColWidths();
}
 

function onResizeStart(h: string, e: MouseEvent){
  e.preventDefault();
  const startX = e.clientX;
  const startW = colWidths.value[h] || (e.target as HTMLElement)?.parentElement?.getBoundingClientRect().width || 120;
  resizing = { col: h, startX, startW };
  window.addEventListener('mousemove', onResizing);
  window.addEventListener('mouseup', onResizeEnd, { once: true });
}
function onResizing(e: MouseEvent){
  if(!resizing) return;
  const dx = e.clientX - resizing.startX;
  const w = Math.max(40, Math.round(resizing.startW + dx));
  colWidths.value = { ...colWidths.value, [resizing.col]: w };
}
function onResizeEnd(){
  if(resizing){ saveColWidths(); }
  resizing = null;
  window.removeEventListener('mousemove', onResizing);
}

function addColumn(){
  const name = (newColName.value||'').trim();
  if(!name){ showMsg('列名不能为空'); return; }
  if(headers.value.includes(name)){ showMsg('列名已存在'); return; }
  headers.value = [...headers.value, name];
  for(const r of rows.value){ (r as any)[name] = ''; }
  newColName.value = '';
  saveCols(); saveDraft(); showMsg('已新增列');
}
function removeCol(h:string){
  const idx = headers.value.indexOf(h); if(idx<0) return;
  headers.value = headers.value.filter(x=> x!==h);
  hiddenCols.value.delete(h);
  const w = { ...colWidths.value }; delete w[h]; colWidths.value = w; saveColWidths();
  for(const r of rows.value){ delete (r as any)[h]; }
  saveCols(); saveDraft(); showMsg('已删除列');
}

function openOnlyOffice(){ window.open('http://127.0.0.1:8094/oo/embed?file=blank.xlsx&title='+encodeURIComponent('车辆入库.xlsx'), '_blank'); }
 

function parseCsv(text:string){
  const lines = text.split(/\r?\n/).filter(Boolean);
  if(!lines.length) return { hdr:[], data:[] as any[] };
  const hdr = lines[0].split(',');
  const data:any[] = [];
  for(let i=1;i<lines.length;i++){
    const arr = lines[i].split(',');
    const obj:any = {}; hdr.forEach((h,idx)=> obj[h]=arr[idx]??'');
    data.push(obj);
  }
  return { hdr, data };
}

async function onImportFile(e: Event){
  const input = e.target as HTMLInputElement; const file = input.files?.[0]; if(!file) return;
  const name = (file.name||'').toLowerCase();
  try{
    // 读取新文件
    let newHeaders: string[] = [];
    let newRows: any[] = [];
    if(name.endsWith('.csv')){
      const text = await file.text();
      const { hdr, data } = parseCsv(text);
      newHeaders = hdr; newRows = data;
    }else{
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type:'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json:any[] = XLSX.utils.sheet_to_json(ws, { defval:'' });
      newHeaders = Object.keys(json[0]||{}); newRows = json;
    }

    // 去掉“序号/No”等序号列，避免与页面固定序号列重复
    const isSeq = (n:string)=>{
      const s = String(n||'').trim().toLowerCase();
      return s==='序号' || s==='序號' || s==='no' || s==='#' || s==='index';
    };
    newHeaders = newHeaders.filter(h=> !isSeq(h));
    // 合并表头：保留现有顺序，将新列附加在末尾；并从旧表头中清除序号列一次性消除历史重复
    const oldHeaders = headers.value.filter(h=> !isSeq(h));
    const set = new Set(oldHeaders);
    const mergedHeaders = oldHeaders.concat(newHeaders.filter(h=> !set.has(h)));

    // 将新行按 mergedHeaders 规范化并追加
    const normalizedNewRows = newRows.map(r => {
      const o:any = {}; mergedHeaders.forEach(h => { o[h] = r[h] ?? ''; }); return o;
    });
    const normalizedOldRows = rows.value.map(r => {
      const o:any = {}; mergedHeaders.forEach(h => { o[h] = r[h] ?? ''; }); return o;
    });
    headers.value = mergedHeaders;
    rows.value = normalizedOldRows.concat(normalizedNewRows);
    showMsg('导入完成');
    // 导入即落库（demo）
    try{
      const user = await (await fetch('/v1/auth/me')).json().catch(()=>({}));
      const uid = user?.user?.id || user?.user_id || null;
      await fetch('/v1/imports/inbound', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ id: datasetId.value, user_id: uid, dataset_date: formatDateYYYYMMDD(new Date()), headers: headers.value, rows: rows.value }) });
    }catch{}
  }catch(err:any){ showMsg('导入失败：'+(err?.message||String(err))); }
  input.value='';
}

function exportExcel(){
  const wb = XLSX.utils.book_new();
  // 取“全部列顺序”——如未设置则为 headers；如设置过列设置，headers 已是最新顺序
  const allHeaders = headers.value.length ? headers.value.slice() : visibleHeaders.value.slice();
  // 模板
  const wsTpl = XLSX.utils.aoa_to_sheet([allHeaders]);
  XLSX.utils.book_append_sheet(wb, wsTpl, '模板');
  // 数据（无论列显隐，都导出全列；若无行数据也导出只有表头的空表，避免“没有数据”的情况）
  const dataRows = rows.value.length ? rows.value.map(r=> allHeaders.map(h=> r[h]??'')) : [];
  const wsData = XLSX.utils.aoa_to_sheet([allHeaders, ...dataRows]);
  XLSX.utils.book_append_sheet(wb, wsData, '数据');
  XLSX.writeFile(wb, '入库申请-模板含数据.xlsx');
}

function buildItems(){
  const find = (obj:any, names:string[])=>{ for(const n of names){ if(obj[n]!=null && obj[n] !== '') return obj[n]; } return ''; };
  const list = rows.value.map((r)=>{
    const qtyRaw = find(r, ['预约入库量','数量','预约数量','入库量','计划入库量','planned_quantity','quantity','qty']);
    const qty = parseNumberLike(qtyRaw);
    const wh = parseNumberLike(find(r,['仓库ID','warehouse_id'])) || 1;
    const comm = parseNumberLike(find(r,['商品ID','commodity_id'])) || 1;
    const unit = String(find(r,['计量单位','单位','measurement_unit'])||'吨');
    return {
      warehouse_id: Number(wh),
      commodity_id: Number(comm),
      quantity: isNaN(qty)? 0 : Number(qty),
      unit,
      vehicle_plate: String(find(r,['车牌号','vehicle_plate'])||''),
      driver_phone: String(find(r,['司机手机','driver_phone'])||''),
      driver_id_no: String(find(r,['司机身份证','driver_id_no'])||''),
      spec: String(find(r,['商品','规格','commodity','commodity_spec'])||''),
      owner_name: String(find(r,['客户','owner_name'])||''),
      eta: String(find(r,['预约日期','eta'])||''),
      client_batch_no: String(find(r,['货物批次号','客户预约号','客户批次号','client_batch_no'])||'')
    };
  }).filter(x=> Number(x.quantity)>0);
  return list;
}

async function pushBatches(){
  const items = buildItems(); if(!items.length){ showMsg('没有有效数据：请确认存在“数量/预约入库量”等列，且为正数'); return; }
  pushing.value = true; showMsg('推送中…');
  try{
    // 改为逐条真实落库：/v1/inbound/reservations（非演示模式写 MySQL）
    let created = 0; let failed = 0;
    for(const it of items){
      const payload = {
        applicant_id: null,
        reservist_id: null,
        target_warehouse_id: it.warehouse_id || null,
        commodity_id: it.commodity_id || null,
        total_planned_quantity: it.quantity || 0,
        measurement_unit: it.unit || '吨'
      };
      try{
        const r = await fetch('/v1/inbound/reservations', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(payload) });
        const jr = await r.json().catch(()=>({}));
        if(r.ok && jr?.code===0){ created++; } else { failed++; }
      }catch{ failed++; }
    }
    showMsg(`完成：创建 ${created}，失败 ${failed}`);
  }catch(e:any){ showMsg('推送异常：'+(e?.message||e)); }
  finally{ pushing.value=false; }
}

function printPreview(){
  if(!rows.value.length) return;
  const hh = visibleHeaders.value.length ? visibleHeaders.value : headers.value;
  const html = `<html><head><meta charset='utf-8'><title>打印</title><style>table{border-collapse:collapse;width:100%}th,td{border:1px solid #e5e7eb;padding:6px 8px;font-size:12px;text-align:left}</style></head><body><table><thead><tr>${hh.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.value.map(r=>`<tr>${hh.map(h=>`<td>${String(r[h]??'')}</td>`).join('')}</tr>`).join('')}</tbody></table></body></html>`;
  const w = window.open('', '_blank'); if(!w) return; w.document.open(); w.document.write(html); w.document.close(); w.focus(); w.print();
}
</script>

<style scoped>
.page{ padding:16px; height: calc(100vh - 70px); display:flex; flex-direction:column; }
.title-bar{ display:flex; align-items:center; justify-content:space-between; margin:0; }
.toolbar{ margin:12px 0; display:flex; gap:8px; align-items:center; flex-wrap:wrap; position:relative; z-index:10; background:#ffffff; border:1px solid #e5e7eb; border-radius:12px; padding:8px; box-shadow:0 6px 16px rgba(2,6,23,.06); }
.ghost{ background:linear-gradient(#f8fafc,#eef2f7); color:#0f172a; height:34px; padding:0 12px; border:1px solid #e2e8f0; border-radius:10px; cursor:pointer; transition:all .15s ease; box-shadow:0 1px 0 rgba(255,255,255,.6) inset; }
.ghost:hover{ background:linear-gradient(#f1f5f9,#e2e8f0); border-color:#cbd5e1; transform:translateY(-1px); }
.ghost:active{ transform:translateY(0); }
.ghost:disabled{ opacity:.6; cursor:not-allowed; }
.upload-btn{ position:relative; overflow:hidden; display:inline-flex; align-items:center; gap:6px; padding:0 12px; border-radius:10px; background:linear-gradient(#f8fafc,#eef2f7); color:#0f172a; border:1px solid #e2e8f0; height:34px; cursor:pointer; }
.upload-btn input{ position:absolute; inset:0; opacity:0; cursor:pointer; }
.primary{ background:linear-gradient(#2563eb,#1d4ed8) !important; color:#fff !important; border-color:#1e40af !important; }
.hint{ color:#475569; margin:10px 0; }
.spacer{ flex:1; }
.grid-wrap{ border:1px solid #e5e7eb; border-radius:12px; overflow:auto; box-shadow:0 10px 24px rgba(2,6,23,.06); height:70vh; }
.grid{ width:100%; height:100%; min-width:900px; border-collapse:collapse; table-layout: fixed; }
.width-input{ width: 110px; height: 28px; padding: 0 6px; border:1px solid #cbd5e1; border-radius:6px; }
.th-text{ display:inline-block; vertical-align:middle; }
.col-resizer{ position:absolute; right:0; top:0; width:6px; height:100%; cursor:col-resize; }
thead th{ position:relative; }
.grid th, .grid td{ border:1px solid #e5e7eb; padding:6px 8px; font-size:12px; text-align:left; }
.toast{ position:fixed; right:16px; bottom:16px; background:#0ea5e9; color:#fff; padding:8px 12px; border-radius:8px; box-shadow:0 6px 14px rgba(2,6,23,.25); z-index:60; }

.cell-input{ width: 100%; box-sizing: border-box; height: 28px; padding: 2px 6px; border: 1px solid #cbd5e1; border-radius: 6px; }

.stats-mask{ position: fixed; inset: 0; background: rgba(2,6,23,.35); display:flex; align-items:center; justify-content:center; z-index: 70; }
.stats-panel{ width: 420px; background: #fff; border-radius: 12px; box-shadow: 0 14px 40px rgba(2,6,23,.35); overflow: hidden; }
.stats-header{ display:flex; align-items:center; justify-content:space-between; padding:10px 12px; border-bottom:1px solid #e5e7eb; }
.stats-body{ padding: 12px; }
.stats-row{ display:flex; align-items:center; justify-content:space-between; padding:6px 0; }

/* 列设置面板样式复用遮罩 */
.cols-panel{ width: 520px; background: #fff; border-radius: 12px; box-shadow: 0 14px 40px rgba(2,6,23,.35); overflow:hidden; }
.cols-header{ display:flex; align-items:center; justify-content:space-between; padding:10px 12px; border-bottom:1px solid #e5e7eb; }
.cols-actions{ display:flex; gap:8px; }
.cols-body{ max-height: 60vh; overflow:auto; padding: 10px 12px; }
.col-row{ display:flex; align-items:center; justify-content:space-between; padding:6px 0; border-bottom:1px dashed #e5e7eb; }
.col-name{ display:flex; align-items:center; gap:8px; }
.col-move button{ height:28px; }
.col-add{ display:flex; align-items:center; gap:8px; padding:6px 0 12px; border-bottom:1px solid #e5e7eb; margin-bottom:8px; }
.name-input{ width: 180px; height:28px; padding: 0 8px; border:1px solid #cbd5e1; border-radius:6px; }
</style>