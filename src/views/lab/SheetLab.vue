<template>
  <div class="sheet-wrap">
    <header class="sheet-topbar">
      <button class="back" @click="goBack">返回</button>
      <div class="title">真·Excel 实验 <span class="code">页面编号：XL-002</span></div>
      <div class="actions">
        <div class="batch">
          <label for="batch2">表编号</label>
          <input id="batch2" v-model="batchCode" placeholder="例如：IMP-20251001-A" />
        </div>
        <div class="btn-group">
          <button class="btn" @click="triggerFile">📥 导入</button>
          <button class="btn" @click="exportXlsx">📤 导出</button>
          <button class="btn primary" :disabled="saving" @click="saveToBackend">🔄 保存到后端</button>
          <button class="btn outline" @click="showFlow=true">📘 使用流程</button>
        </div>
        <input ref="fileRef" type="file" accept=".xlsx,.xls" class="hidden" @change="onFile" />
      </div>
    </header>

    <section class="stage">
      <div class="halo"></div>
      <div v-show="!ready" class="loading">
        <div>正在加载编辑器…（若较慢，点击尝试备用源）</div>
        <button class="btn outline small" @click="reloadEditor">切换备用源</button>
      </div>
      <div id="luckysheet" class="luckysheet" v-show="ready"></div>
      <div v-if="msg" class="toast">{{ msg }}</div>
    </section>

    <div v-if="showFlow" class="flow-mask" @click.self="showFlow=false">
      <div class="flow-card">
        <div class="flow-title">使用流程</div>
        <ol>
          <li>导入 XLSX：表头为第一行。</li>
          <li>在上方工具栏中编辑单元格，支持格式、合并等。</li>
          <li>填写“表编号”。</li>
          <li>点击“保存到后端”，按表头智能映射到产品字段。</li>
          <li>去“产品（API）/产品列表（后端）”查看结果。</li>
        </ol>
        <div class="flow-actions"><button class="btn primary" @click="showFlow=false">知道了</button></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import * as XLSX from 'xlsx';

const router = useRouter();
const fileRef = ref<HTMLInputElement|null>(null);
const batchCode = ref<string>(localStorage.getItem('lastBatchCode')||'');
const ready = ref(false);
const saving = ref(false);
const showFlow = ref(false);
const msg = ref('');
let hasLuckysheet = false;
let cdnIdx = 0;

function goBack(){ router.push('/login'); }
function triggerFile(){ fileRef.value?.click(); }

function ensureLuckysheet(): Promise<void>{
  return new Promise((resolve,reject)=>{
    if(hasLuckysheet || (window as any).luckysheet){ hasLuckysheet=true; return resolve(); }
    const sources = [
      'https://cdn.jsdelivr.net/npm/luckysheet@2.1.13',
      'https://unpkg.com/luckysheet@2.1.13',
      'https://fastly.jsdelivr.net/npm/luckysheet@2.1.13'
    ];
    const base = sources[cdnIdx % sources.length];
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = base + '/dist/plugins/css/pluginsCss.css';
    document.head.appendChild(css);
    const css2 = document.createElement('link');
    css2.rel = 'stylesheet';
    css2.href = base + '/dist/plugins/plugins.css';
    document.head.appendChild(css2);
    const css3 = document.createElement('link');
    css3.rel = 'stylesheet';
    css3.href = base + '/dist/css/luckysheet.css';
    document.head.appendChild(css3);
    const sc = document.createElement('script');
    sc.src = base + '/dist/plugins/js/plugin.js';
    const sc2 = document.createElement('script');
    sc2.src = base + '/dist/luckysheet.umd.js';
    sc.onload = ()=> document.body.appendChild(sc2);
    sc2.onload = ()=>{ hasLuckysheet=true; resolve(); };
    sc.onerror = sc2.onerror = (e)=> reject(e);
    document.body.appendChild(sc);
  });
}

function initLuckysheet(){
  const ls = (window as any).luckysheet;
  if(!ls) return;
  (window as any).$('#luckysheet').empty?.();
  ls.create({
    container: 'luckysheet',
    lang: 'zh',
    showinfobar: false,
    showtoolbar: true,
    showsheetbar: true,
    enableAddBackTop: true,
    data: [{ name:'Sheet1', index:0, status:1 }]
  });
  ready.value = true;
}

onMounted(async()=>{
  try{ await ensureLuckysheet(); initLuckysheet(); }catch(e){ msg.value='加载编辑器失败'; }
});

async function reloadEditor(){
  ready.value=false; hasLuckysheet=false; cdnIdx++;
  try{ await ensureLuckysheet(); initLuckysheet(); msg.value='已切换备用源'; setTimeout(()=> msg.value='', 1500);}catch(e){ msg.value='切换失败'; setTimeout(()=> msg.value='', 1500); }
}

function aoaToLuckysheet(aoa: any[][]){
  const celldata: any[] = [];
  for(let r=0;r<aoa.length;r++){
    const row = aoa[r]||[];
    for(let c=0;c<row.length;c++){
      const v = row[c];
      if(v===undefined || v===null || v==='') continue;
      celldata.push({ r, c, v: { v, m: String(v) } });
    }
  }
  const ls = (window as any).luckysheet; if(!ls) return;
  ls.destroy?.();
  ls.create({ container:'luckysheet', lang:'zh', showinfobar:false, showtoolbar:true, showsheetbar:true, data:[{ name:'Sheet1', index:0, status:1, celldata }] });
}

function getCurrentAoa(): any[][]{
  const w:any = (window as any);
  const ls = w.luckysheet;
  try{
    if(ls && w.luckysheet.getSheetData){
      return w.luckysheet.getSheetData();
    }
    // 兼容旧API
    const files = w.luckysheet?.getluckysheetfile?.();
    if(files && files[0] && files[0].data){
      return files[0].data.map((row:any[])=> row.map((cell:any)=> cell?.v?.v ?? cell?.v ?? ''));
    }
  }catch{}
  return [];
}

function onFile(e: Event){
  const input = e.target as HTMLInputElement;
  const f = input.files && input.files[0];
  if(!f) return;
  const reader = new FileReader();
  reader.onload = ()=>{
    try{
      const data = new Uint8Array(reader.result as ArrayBuffer);
      const wb = XLSX.read(data, { type:'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const aoa = XLSX.utils.sheet_to_json<any[]> (ws, { header:1, raw:true }) as any[][];
      aoaToLuckysheet(aoa);
      msg.value='导入完成'; setTimeout(()=> msg.value='', 1500);
    }catch(err){ msg.value='解析失败'; setTimeout(()=> msg.value='', 1500); }
  };
  reader.readAsArrayBuffer(f);
}

function exportXlsx(){
  try{
    const aoa = getCurrentAoa();
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const outName = (batchCode.value? batchCode.value+'-' : '') + 'sheet.xlsx';
    XLSX.writeFile(wb, outName);
  }catch{ msg.value='导出失败'; setTimeout(()=> msg.value='', 1500); }
}

function smartMapHeader(header: string[]): Record<number,string>{
  const h = header.map(s=> String(s||'').trim().toLowerCase());
  const dict: Record<string,string[]> = {
    product_id:['product id','product_id','产品id','产品编码','编号','货号','sku','条码','商品编码'],
    name:['name','品名','名称','商品名称','产品名称'],
    category:['category','分类','品类','类别'],
    price:['price','单价','售价','价格','含税单价','不含税单价'],
    premium_discount:['discount','premium','折扣','溢价','优惠','折让'],
    production_year:['year','生产年份','出厂年份','年份'],
    packaging_image:['image','图片','包装图','封面','图片链接','img','image url'],
    batch_code:['batch','batch_code','批次','表编号','表号'],
    enabled:['enabled','启用','是否启用','状态','上架','在售']
  };
  const m: Record<number,string> = {};
  h.forEach((x,idx)=>{ for(const [field,keys] of Object.entries(dict)){ if(keys.some(k=> x.includes(k)) && m[idx]===undefined){ m[idx]=field; break; } } });
  return m;
}

async function saveToBackend(){
  const bc = batchCode.value.trim();
  if(!bc){ msg.value='请先填写表编号'; setTimeout(()=> msg.value='', 1500); return; }
  try{ localStorage.setItem('lastBatchCode', bc); }catch{}
  const aoa = getCurrentAoa();
  if(!aoa.length){ msg.value='没有可保存的数据'; setTimeout(()=> msg.value='', 1500); return; }
  const header = (aoa[0]||[]).map(v=> String(v||''));
  const mapper = smartMapHeader(header);
  const normBool = (v:any)=>{ const s=String(v||'').trim().toLowerCase(); return (s==='1'||s==='true'||s==='是'||s==='y'||s==='yes'||s==='上架'); };
  const normNum = (v:any)=>{ const s=String(v||'').replace(/[\,\s]/g,'').replace(/元|rmb|¥/ig,''); const n=Number(s); return Number.isFinite(n)? n: null; };
  const normYear = (v:any)=>{ const n=parseInt(String(v||'').slice(0,4)); return Number.isFinite(n)? n: null; };
  saving.value=true; msg.value='正在保存...';
  let ok=0, skip=0, fail=0;
  for(let i=1;i<aoa.length;i++){
    const row = aoa[i]||[]; if(row.every(c=> String(c||'').trim()==='')) continue;
    const obj:any = { batch_code: bc, enabled: 1 };
    row.forEach((v,idx)=>{ const f = (mapper as any)[idx]; if(!f) return; obj[f]=v; });
    if(obj.price!=null) obj.price = normNum(obj.price);
    if(obj.premium_discount!=null) obj.premium_discount = normNum(obj.premium_discount);
    if(obj.production_year!=null) obj.production_year = normYear(obj.production_year);
    if(obj.enabled!=null) obj.enabled = normBool(obj.enabled)?1:0;
    if(!obj.product_id || !obj.name || !obj.category){ skip++; continue; }
    try{
      const res = await fetch('/api/products', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(obj) });
      if(res.status===201) ok++; else if(res.status===409) skip++; else fail++;
    }catch{ fail++; }
  }
  msg.value = `保存完成：新增 ${ok}，跳过 ${skip}，失败 ${fail}`;
  saving.value=false; setTimeout(()=> msg.value='', 3000);
}
</script>

<style scoped>
.sheet-wrap{ min-height:100vh; display:flex; flex-direction:column; background:linear-gradient(140deg,#0b1226 0%,#0f1d3a 45%,#162a59 100%); color:#e6eeff; }
.sheet-topbar{ height:56px; display:grid; grid-template-columns:120px 1fr auto; align-items:center; padding:0 16px; border-bottom:1px solid rgba(255,255,255,.08); backdrop-filter: blur(6px); }
.sheet-topbar .back{ height:34px; border:none; border-radius:10px; padding:0 12px; background:linear-gradient(135deg,#1f2a44,#22345a); color:#e6eeff; cursor:pointer; box-shadow:0 8px 18px rgba(1,8,36,.35); }
.sheet-topbar .title{ text-align:center; font-weight:700; letter-spacing:.12em; color:#c7d2fe; }
.sheet-topbar .title .code{ font-size:12px; color:#94a3b8; margin-left:8px; background:rgba(255,255,255,.06); padding:2px 8px; border-radius:999px; border:1px solid rgba(255,255,255,.12); }
.sheet-topbar .actions{ display:flex; align-items:center; gap:10px; }
.sheet-topbar .batch{ display:flex; align-items:center; gap:6px; }
.sheet-topbar .batch input{ height:32px; width:220px; border-radius:10px; border:1px solid rgba(255,255,255,.2); padding:0 10px; background:rgba(255,255,255,.08); color:#e6eeff; }
.sheet-topbar .btn-group{ display:flex; gap:8px; }
.sheet-topbar .btn{ height:34px; border-radius:10px; padding:0 12px; cursor:pointer; display:inline-flex; align-items:center; gap:6px; font-weight:600; letter-spacing:.02em; border:1px solid rgba(255,255,255,.18); background:rgba(255,255,255,.08); color:#e6eeff; box-shadow:0 6px 14px rgba(1,8,36,.35); }
.sheet-topbar .btn:hover{ background:rgba(255,255,255,.12); }
.sheet-topbar .btn.primary{ border:1px solid rgba(37,99,235,.6); background:linear-gradient(135deg,#2563eb,#3b82f6); color:#fff; box-shadow:0 10px 22px rgba(37,99,235,.45); }
.sheet-topbar .btn.outline{ border:1px solid rgba(148,163,184,.6); background:transparent; color:#e2e8f0; }
.sheet-topbar .btn.small{ height:30px; padding:0 10px; font-weight:500; }

.stage{ position:relative; flex:1; }
.luckysheet{ position:absolute; inset:0; }
.loading{ position:absolute; inset:0; display:flex; align-items:center; justify-content:center; color:#c7d2fe; }
.toast{ position:absolute; right:16px; bottom:16px; padding:10px 12px; background: rgba(10,18,44,.5); border:1px solid rgba(255,255,255,.12); border-radius:10px; backdrop-filter: blur(6px); }

.flow-mask{ position:fixed; inset:0; background:rgba(0,10,40,.55); backdrop-filter: blur(2px); display:flex; align-items:center; justify-content:center; z-index:50; }
.flow-card{ width:min(560px,96vw); background:linear-gradient(180deg, rgba(20,28,60,.95), rgba(14,22,48,.95)); border:1px solid rgba(255,255,255,.12); border-radius:14px; box-shadow: 0 18px 60px rgba(1,8,36,.55); padding:16px; color:#e6eeff; }
.flow-title{ font-weight:700; margin-bottom:10px; }
.flow-card ol{ margin:0; padding-left:18px; }
.flow-actions{ display:flex; justify-content:flex-end; margin-top:12px; }
.hidden{ position:absolute; width:1px; height:1px; opacity:0; pointer-events:none; }
.halo{ position:absolute; width:min(62%,720px); aspect-ratio:1/1; border-radius:50%; box-shadow:0 0 140px 40px rgba(32,123,255,.25) inset, 0 0 160px 20px rgba(32,123,255,.25); background:
  radial-gradient(closest-side, rgba(30,144,255,.45) 0%, rgba(30,144,255,.15) 55%, rgba(30,144,255,0) 60%),
  radial-gradient(closest-side, transparent 64%, rgba(135,206,255,.35) 66%, transparent 68%);
  filter: blur(0.4px);
  left:50%; top:50%; transform: translate(-50%,-50%);
}
</style>


