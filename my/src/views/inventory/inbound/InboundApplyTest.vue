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
      <button class="ghost" @click="openOnlyOffice">Excel表（OnlyOffice）</button>
      <button class="ghost" @click="openSavedFiles">已保存文件</button>
      <div class="spacer"></div>
      <span class="hint" v-if="rows.length">已加载 {{ rows.length }} 行</span>
    </div>

    <div v-if="msg" class="toast">{{ msg }}</div>

    <div v-if="rows.length" class="grid-wrap">
      <table class="grid">
        <thead>
          <tr>
            <th v-for="(h,i) in headers" :key="'h'+i">{{ h }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(r,ri) in rows" :key="'r'+ri">
            <td v-for="(h,ci) in headers" :key="'c'+ri+'-'+ci">{{ r[h] ?? '' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as XLSX from 'xlsx';
import { ref } from 'vue';

const rows = ref<any[]>([]);
const headers = ref<string[]>([]);
const pushing = ref(false);
const msg = ref('');

function showMsg(m:string){ msg.value = m; setTimeout(()=> msg.value='', 1800); }

function openOnlyOffice(){ window.open('http://127.0.0.1:8094/oo/embed?file=blank.xlsx&title='+encodeURIComponent('车辆入库.xlsx'), '_blank'); }
function openSavedFiles(){ window.open('http://127.0.0.1:8094/oo/saved', '_blank'); }

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
    if(name.endsWith('.csv')){
      const text = await file.text();
      const { hdr, data } = parseCsv(text);
      headers.value = hdr; rows.value = data;
    }else{
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type:'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json:any[] = XLSX.utils.sheet_to_json(ws, { defval:'' });
      headers.value = Object.keys(json[0]||{}); rows.value = json;
    }
    showMsg('导入完成');
  }catch(err:any){ showMsg('导入失败：'+(err?.message||String(err))); }
  input.value='';
}

function exportExcel(){
  if(!rows.value.length) return;
  const aoa = [headers.value, ...rows.value.map(r=> headers.value.map(h=> r[h]??''))];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '入库申请');
  XLSX.writeFile(wb, '入库申请-测试.xlsx');
}

function buildItems(){
  const hdr = headers.value;
  const find = (obj:any, names:string[])=>{ for(const n of names){ if(obj[n]!=null && obj[n] !== '') return obj[n]; } return ''; };
  return rows.value.map((r)=>({
    warehouse_id: Number(find(r,['仓库ID','warehouse_id'])||1),
    commodity_id: Number(find(r,['商品ID','commodity_id'])||1),
    quantity: Number(find(r,['预约入库量','数量','planned_quantity'])||0),
    unit: String(find(r,['计量单位','单位','measurement_unit'])||'吨'),
    vehicle_plate: String(find(r,['车牌号','vehicle_plate'])||''),
    driver_phone: String(find(r,['司机手机','driver_phone'])||''),
    driver_id_no: String(find(r,['司机身份证','driver_id_no'])||''),
    spec: String(find(r,['商品','规格','commodity','commodity_spec'])||''),
    owner_name: String(find(r,['客户','owner_name'])||''),
    eta: String(find(r,['预约日期','eta'])||''),
    client_batch_no: String(find(r,['货物批次号','客户预约号','客户批次号','client_batch_no'])||'')
  })).filter(x=> Number(x.quantity)>0);
}

async function pushBatches(){
  const items = buildItems(); if(!items.length){ showMsg('没有有效数据'); return; }
  pushing.value = true; showMsg('推送中…');
  try{
    const res = await fetch('/v1/inbound/reservations/import', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(items) });
    const j = await res.json().catch(()=>({}));
    if(res.ok && j?.code===0){
      const created = j?.data?.created?.length || 0;
      const failed = (j?.data?.errors?.length||0);
      showMsg(`完成：创建 ${created}，失败 ${failed}`);
    }else{ showMsg('推送失败：'+(j?.message||res.statusText)); }
  }catch(e:any){ showMsg('推送异常：'+(e?.message||e)); }
  finally{ pushing.value=false; }
}

function printPreview(){
  if(!rows.value.length) return;
  const htmlRows = rows.value.map(r=> `<tr>${headers.value.map(h=>`<td>${String(r[h]??'')}</td>`).join('')}</tr>`).join('');
  const html = `<html><head><meta charset='utf-8'><title>打印</title><style>table{border-collapse:collapse;width:100%}th,td{border:1px solid #e5e7eb;padding:6px 8px;font-size:12px;text-align:left}</style></head><body><table><thead><tr>${headers.value.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${htmlRows}</tbody></table></body></html>`;
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
.primary{ background:linear-gradient(#2563eb,#1d4ed8) !important; color:#fff !important; border-color:#1e40af !important; box-shadow:0 4px 12px rgba(37,99,235,.25); }
.hint{ color:#475569; margin:10px 0; }
.spacer{ flex:1; }
.grid-wrap{ border:1px solid #e5e7eb; border-radius:12px; overflow:auto; box-shadow:0 10px 24px rgba(2,6,23,.06); height:70vh; }
.grid{ width:100%; height:100%; min-width:900px; border-collapse:collapse; }
.grid th, .grid td{ border:1px solid #e5e7eb; padding:6px 8px; font-size:12px; text-align:left; }
.toast{ position:fixed; right:16px; bottom:16px; background:#0ea5e9; color:#fff; padding:8px 12px; border-radius:8px; box-shadow:0 6px 14px rgba(2,6,23,.25); z-index:60; }
</style>


