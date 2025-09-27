<template>
  <div class="lab-wrap">
    <header class="lab-topbar">
      <button class="back" @click="goBack">返回</button>
      <div class="title">AI × Excel 实验</div>
      <div class="actions">
        <button class="ghost" title="导入 XLSX" @click="triggerFile">导入 XLSX</button>
        <button class="ghost" title="新增一行" @click="addRow">新增一行</button>
        <button class="ghost" title="导出当前表" @click="exportSheet">导出 XLSX</button>
        <button class="ghost" title="AI 智能映射" @click="aiMap">智能映射</button>
        <button class="ghost" title="AI 清洗数据" @click="aiClean">清洗数据</button>
        <button class="ghost" title="同步到后端" @click="syncToBackend" :disabled="syncWorking">同步到后端</button>
        <input ref="fileRef" type="file" accept=".xlsx,.xls" class="hidden" @change="onFile" />
      </div>
    </header>

    <section class="stage" @dragover.prevent @drop.prevent="onDrop">
      <div class="halo"></div>
      <div class="hint" v-if="!fileName">
        <div class="icon">📄</div>
        <div>拖拽 XLSX 到此处，或点击右上角“导入 XLSX”</div>
        <div class="sub">后续将接入 SheetJS 解析与渲染</div>
      </div>
      <div class="file-info" v-else>
        <div class="name">已选择：{{ fileName }}</div>
        <div class="desc" v-if="!rows.length">解析预留：将使用 SheetJS 读取并展示工作表</div>
        <div class="desc" v-if="rows.length && Object.keys(mapping).length">映射：{{ Object.entries(mapping).map(([k,v])=>k+'=>'+v).join('，') }}</div>
        <div class="desc" v-if="syncMsg">{{ syncMsg }}</div>
        <div class="sheets" v-if="sheetNames.length">
          <button
            v-for="(sn, idx) in sheetNames"
            :key="sn+idx"
            :class="['tab', { active: idx===activeSheetIndex }]"
            @click="switchSheet(idx)"
          >{{ sn }}</button>
        </div>
        <div class="grid-wrap" v-if="rows.length">
          <table class="grid">
            <thead>
              <tr>
                <th v-for="(h, i) in rows[0]" :key="'h'+i" :style="colStyle(i)">
                  <div class="th-inner">{{ typeof h==='string' ? h : ('C'+(i+1)) }}</div>
                  <span class="col-resizer" @mousedown.prevent="onResizeStart(i, $event)"></span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, ri) in rows.slice(1)" :key="'r'+ri">
                <td v-for="(c, ci) in r" :key="'c'+ri+'-'+ci" :style="colStyle(ci)">
                  <input class="cell" :value="display(c)" @change="e=>onEdit(ri+1, ci, (e.target as HTMLInputElement).value)" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import * as XLSX from 'xlsx';

const router = useRouter();
function goBack(){ router.push('/login'); }

const fileRef = ref<HTMLInputElement|null>(null);
const fileName = ref('');
const sheetNames = ref<string[]>([]);
const activeSheetIndex = ref(0);
const rows = ref<Array<Array<string | number | null>>>([]);
const workbookRef = ref<XLSX.WorkBook|null>(null);
const lastFileName = ref('export.xlsx');
const colWidths = ref<number[]>([]);
const mapping = ref<Record<string,string>>({});
const syncWorking = ref(false);
const syncMsg = ref('');

function triggerFile(){ fileRef.value?.click(); }

function onFile(e: Event){
  const input = e.target as HTMLInputElement;
  const f = input.files && input.files[0];
  if(!f) return;
  handleFile(f);
}

function onDrop(e: DragEvent){
  const f = e.dataTransfer?.files && e.dataTransfer.files[0];
  if(!f) return;
  handleFile(f);
}

function handleFile(f: File){
  fileName.value = f.name;
  const reader = new FileReader();
  reader.onload = () => {
    try{
      const data = new Uint8Array(reader.result as ArrayBuffer);
      const wb = XLSX.read(data, { type: 'array' });
      workbookRef.value = wb;
      sheetNames.value = wb.SheetNames;
      activeSheetIndex.value = 0;
      loadActiveSheet();
    }catch(err){
      console.error(err);
    }
  };
  reader.readAsArrayBuffer(f);
}

function loadActiveSheet(){
  const wb = workbookRef.value;
  if(!wb) return;
  const sheetName = sheetNames.value[activeSheetIndex.value];
  const ws = wb.Sheets[sheetName];
  const aoa = XLSX.utils.sheet_to_json<Array<string|number|null>>(ws, { header: 1, raw: true });
  rows.value = aoa as any;
  // 初始化列宽（基于列数）
  const cols = rows.value[0]?.length || 0;
  colWidths.value = Array.from({length: cols}, ()=> 140);
  mapping.value = {};
}

function switchSheet(idx: number){
  activeSheetIndex.value = idx;
  loadActiveSheet();
}

function display(v: any){ return v==null? '': String(v); }

function onEdit(r: number, c: number, v: string){
  if(!rows.value.length) return;
  const next = rows.value.map(row => row.slice());
  next[r][c] = v;
  rows.value = next;
}

function addRow(){
  if(!rows.value.length){ rows.value = [["A","B","C"],["", "", ""]]; return; }
  const cols = rows.value[0]?.length || 1;
  rows.value = [...rows.value, Array.from({length: cols}, ()=>"")];
}

function exportSheet(){
  const wb = workbookRef.value || XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows.value as any);
  const name = sheetNames.value[activeSheetIndex.value] || 'Sheet1';
  if(wb.Sheets && wb.Sheets[name]){
    // 覆盖当前活动表
    wb.Sheets[name] = ws;
  }else{
    XLSX.utils.book_append_sheet(wb, ws, name);
  }
  const outName = (fileName.value ? fileName.value.replace(/\.(xlsx|xls)$/i,'') : 'export') + '.xlsx';
  lastFileName.value = outName;
  XLSX.writeFile(wb, outName);
}

// 列宽样式 & 拖拽
function colStyle(i: number){
  const w = colWidths.value[i] || 140;
  return { width: w + 'px', minWidth: w + 'px' } as any;
}

let resizing = false; let resizeCol = -1; let startX = 0; let startW = 0;
function onResizeStart(i: number, e: MouseEvent){
  resizing = true; resizeCol = i; startX = e.clientX; startW = colWidths.value[i] || 140;
  window.addEventListener('mousemove', onResizing);
  window.addEventListener('mouseup', onResizeEnd);
}
function onResizing(e: MouseEvent){
  if(!resizing) return;
  const dx = e.clientX - startX;
  const w = Math.max(64, startW + dx);
  colWidths.value = colWidths.value.map((v, idx)=> idx===resizeCol ? w : v);
}
function onResizeEnd(){
  resizing = false; resizeCol = -1;
  window.removeEventListener('mousemove', onResizing);
  window.removeEventListener('mouseup', onResizeEnd);
}

// AI：字段智能映射（根据表头关键字匹配到后端产品字段）
function aiMap(){
  if(!rows.value.length) return;
  const header = (rows.value[0] || []).map(v=> String(v||'').trim().toLowerCase());
  const dict: Record<string,string[]> = {
    product_id: ['product id','product_id','产品id','产品编码','编号','货号','sku','条码','商品编码'],
    name: ['name','品名','名称','商品名称','产品名称'],
    category: ['category','分类','品类','类别'],
    price: ['price','单价','售价','价格','含税单价','不含税单价'],
    premium_discount: ['discount','premium','折扣','溢价','优惠','折让'],
    production_year: ['year','生产年份','出厂年份','年份'],
    packaging_image: ['image','图片','包装图','封面','图片链接','img','image url'],
    enabled: ['enabled','启用','是否启用','状态','上架','在售']
  };
  const result: Record<string,string> = {};
  header.forEach((h, idx)=>{
    for(const [field, keys] of Object.entries(dict)){
      if(keys.some(k=> h.includes(k)) && result[idx]===undefined){ result[idx] = field; break; }
    }
  });
  mapping.value = result;
}

// AI：清洗数据（去空行、类型规范、裁剪空列）
function aiClean(){
  if(!rows.value.length) return;
  const head = rows.value[0];
  let data = rows.value.slice(1);
  data = data.filter(r=> r && r.some(c=> String(c||'').trim()!==''));
  const normBool = (v:any)=>{ const s=String(v||'').trim().toLowerCase(); return (s==='1'||s==='true'||s==='是'||s==='y'||s==='yes'||s==='上架'); };
  const normNum = (v:any)=>{ const s=String(v||'').replace(/[,\s]/g,'').replace(/元|rmb|¥/ig,''); const n=Number(s); return Number.isFinite(n)? n: null; };
  const normYear = (v:any)=>{ const n=parseInt(String(v||'').slice(0,4)); return Number.isFinite(n)? n: null; };
  const idxToField = mapping.value; // 形如 { '0':'product_id', '1':'name' }
  const cleaned = [head.slice()];
  data.forEach(row=>{
    const r = row.slice();
    r.forEach((v, i)=>{
      const f = (idxToField as any)[i];
      if(!f) return;
      if(f==='price' || f==='premium_discount') r[i] = normNum(v);
      if(f==='production_year') r[i] = normYear(v);
      if(f==='enabled') r[i] = normBool(v)? 1: 0;
    });
    cleaned.push(r);
  });
  rows.value = cleaned;
}

// 同步到后端 /api/products（逐行 POST，已存在 product_id 返回 409 跳过）
async function syncToBackend(){
  if(!rows.value.length) return;
  if(!Object.keys(mapping.value).length){ aiMap(); }
  syncWorking.value = true; syncMsg.value = '正在同步...';
  try{
    const head = rows.value[0];
    const idx2field = mapping.value; // { idx: field }
    const buildObj = (row:any[])=>{
      const obj: any = {};
      row.forEach((v, i)=>{
        const f = (idx2field as any)[i]; if(!f) return; obj[f]=v;
      });
      // 默认值
      if(obj.enabled===undefined) obj.enabled = 1;
      return obj;
    };
    let ok=0, skip=0, fail=0;
    for(let i=1;i<rows.value.length;i++){
      const row = rows.value[i];
      if(!row || row.every(c=> String(c||'').trim()==='')) continue;
      const body = buildObj(row);
      if(!body.product_id || !body.name || !body.category){ skip++; continue; }
      try{
        const res = await fetch('/api/products', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(body) });
        if(res.status===201){ ok++; }
        else if(res.status===409){ skip++; }
        else { fail++; }
      }catch{ fail++; }
      if((i%20)===0) syncMsg.value = `已处理 ${i}/${rows.value.length-1} 行...`;
    }
    syncMsg.value = `同步完成：新增 ${ok}，跳过 ${skip}，失败 ${fail}`;
  } finally {
    syncWorking.value = false;
  }
}
</script>

<style scoped>
.lab-wrap{ min-height:100vh; display:flex; flex-direction:column; background:linear-gradient(140deg,#0b1226 0%,#0f1d3a 45%,#162a59 100%); color:#e6eeff; }
.lab-topbar{ height:56px; display:grid; grid-template-columns:120px 1fr 200px; align-items:center; padding:0 16px; border-bottom:1px solid rgba(255,255,255,.06); backdrop-filter: blur(6px); }
.lab-topbar .title{ text-align:center; font-weight:700; letter-spacing:.12em; color:#c7d2fe; }
.lab-topbar .back{ height:34px; border:none; border-radius:8px; padding:0 12px; background:#1f2a44; color:#e6eeff; cursor:pointer; }
.lab-topbar .actions{ display:flex; justify-content:flex-end; gap:8px; }
.lab-topbar .actions .ghost{ height:34px; border:1px solid rgba(255,255,255,.16); border-radius:8px; padding:0 12px; background:rgba(255,255,255,.08); color:#e6eeff; cursor:pointer; }
.lab-topbar .hidden{ position:absolute; width:1px; height:1px; opacity:0; pointer-events:none; }

.stage{ position:relative; flex:1; display:flex; align-items:center; justify-content:center; overflow:hidden; }
.halo{ position:absolute; width:min(62%,720px); aspect-ratio:1/1; border-radius:50%; box-shadow:0 0 140px 40px rgba(32,123,255,.25) inset, 0 0 160px 20px rgba(32,123,255,.25); background:
  radial-gradient(closest-side, rgba(30,144,255,.45) 0%, rgba(30,144,255,.15) 55%, rgba(30,144,255,0) 60%),
  radial-gradient(closest-side, transparent 64%, rgba(135,206,255,.35) 66%, transparent 68%);
  filter: blur(0.4px);
}
.hint{ position:relative; z-index:1; text-align:center; color:#dbeafe; }
.hint .icon{ font-size:44px; margin-bottom:8px; }
.hint .sub{ margin-top:6px; font-size:12px; opacity:.8 }

.file-info{ position:relative; z-index:1; display:flex; flex-direction:column; align-items:center; gap:8px; background: rgba(10,18,44,.35); border:1px solid rgba(255,255,255,.12); border-radius:14px; padding:18px 20px; backdrop-filter: blur(8px) saturate(140%); }
.file-info .name{ font-weight:600; }
.file-info .desc{ font-size:12px; color:#c7d2fe; }

/* 简易表格渲染 */
:deep(.grid-wrap){ max-height: calc(100vh - 200px); overflow:auto; backdrop-filter: blur(2px); }
:deep(table.grid){ margin-top:14px; width: max(900px, 92vw); border-collapse: separate; border-spacing:0; background: rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.14); border-radius:10px; }
:deep(table.grid th), :deep(table.grid td){
  border:1px solid rgba(255,255,255,.12); padding:8px 10px; font-size:13px; color:#e6eeff;
}
:deep(table.grid thead th){ position: sticky; top: 0; z-index: 5; background: linear-gradient(180deg, rgba(37,99,235,.35), rgba(37,99,235,.15)); font-weight:700; }
:deep(.th-inner){ position: relative; padding-right: 12px; display:block; }
:deep(.col-resizer){ position:absolute; right:0; top:0; width:6px; height:100%; cursor:col-resize; }
:deep(.cell){ width:100%; background:transparent; border:none; outline:none; color:#e6eeff; font-size:13px; }
:deep(.cell):focus{ background: rgba(255,255,255,.08); border-radius:6px; }
</style>


