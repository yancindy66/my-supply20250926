<template>
  <div class="page">
    <div class="head">
      <h2>入库单详情</h2>
      <div class="spacer"></div>
      <div class="btns">
        <button class="ghost" @click="exportXlsx" :disabled="exporting">{{ exporting? '导出中...' : '导出XLSX' }}</button>
        <button class="ghost" @click="printSheet">打印</button>
      </div>
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else>
      <section class="card">
        <div class="row"><label>入库单号</label><div>{{ order?.order_no || '-' }}</div></div>
        <div class="row"><label>预约单号</label><div>{{ order?.reservation_number || '-' }}</div></div>
        <div class="row"><label>货主</label><div>{{ order?.owner_name || '-' }}</div></div>
        <div class="row"><label>商品/规格</label><div>{{ (order?.commodity_name||'-') + (order?.commodity_spec?(' / '+order?.commodity_spec):'') }}</div></div>
        <div class="row"><label>状态</label><div><span class="tag gray">{{ order?.status || '-' }}</span></div></div>
      </section>

      <section class="card">
        <h3>证据表（只读）</h3>
        <div id="luckysheet-detail" class="sheet"></div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import http from '@/api/http';

const route = useRoute();
const id = computed(()=> String(route.params.id||''));
const loading = ref(false);
const order = ref<any>(null);
const exporting = ref(false);

const net = computed(()=> (order.value && order.value.gross!=null && order.value.tare!=null) ? (Number(order.value.gross)-Number(order.value.tare)) : null);
// 实际重量（未显示，保留计算）
const actual = computed(()=> order.value?.actual ?? (net.value!=null ? (net.value - Number(order.value?.deductions||0)) : order.value?.calc_weight) ); void(actual);

async function load(){
  loading.value = true;
  try{
    const resp:any = await http.get(`/v1/inbound/orders/${encodeURIComponent(id.value)}`);
    order.value = resp?.data || null;
  }catch{ order.value=null; }
  loading.value = false;
  try{ await nextTick(); }catch{}
  // 无论是否拿到数据，都尝试渲染（表头可显示占位）
  renderSheet();
}
onMounted(load);

// Luckysheet 只读渲染
function buildEvidence2D(){
  const o:any = order.value || {};
  const items:any[] = Array.isArray(o.vehicleOrders) && o.vehicleOrders.length ? o.vehicleOrders : [o];
  const rows:any[] = [];
  const header = [
    '预约单号','运输单号','入库车单号','预计入库时间','入库状态','入库凭证',
    '客户','商品','车牌号','预约量','已入库量（规格重量）','件数','已入库量（磅重）',
    '毛重','皮重','净重','扣重','入场抓拍','入场抓拍时间','出场抓拍','出场抓拍时间','质检URL',
    '司机姓名','司机手机','司机身份证','司机驾驶证'
  ];
  rows.push(['入库单证据表']);
  rows.push([]);
  rows.push(header);
  for(const it of items){
    const row = [
      it.reservation_number || o.reservation_number || '-',
      it.transport_no || o.transport_no || '-',
      it.vehicleOrderNumber || it.vehicle_order_no || '-',
      it.eta || o.eta || '-',
      it.status || o.status || '-',
      (Array.isArray(it.voucher_urls)? it.voucher_urls[0]: it.voucher_url) || o.voucher_url || '-',
      it.owner_name || o.owner_name || '-',
      `${it.commodity_name || o.commodity_name || ''}${(it.commodity_spec||o.commodity_spec)?(' / '+(it.commodity_spec||o.commodity_spec)):''}`,
      it.vehicle_plate || o.vehicle_plate || '-',
      it.planned_quantity || o.planned_quantity || o.total_planned_quantity || '',
      it.calc_weight || o.calc_weight || '',
      it.pack_count || o.pack_count || it.pieces || o.pieces || '',
      it.actual || o.actual || '',
      it.gross || o.gross || '',
      it.tare || o.tare || '',
      (it.net!=null? it.net : (it.gross!=null&&it.tare!=null? (Number(it.gross)-Number(it.tare)) : (o.net!=null?o.net:(o.gross!=null&&o.tare!=null?Number(o.gross)-Number(o.tare):'')))),
      it.deductions || o.deductions || '',
      (Array.isArray(it.entry_photos)? it.entry_photos[0] : (it.entry_photo || o.entry_photo)) || '-',
      it.entry_time || o.entry_time || '-',
      (Array.isArray(it.exit_photos)? it.exit_photos[0] : (it.exit_photo || o.exit_photo)) || '-',
      it.exit_time || o.exit_time || '-',
      it.qc_url || o.qualityCheckUrl || '-',
      it.driver_name || o.driver_name || '-',
      it.driver_phone || o.driver_phone || '-',
      it.driver_id || it.driver_id_no || o.driver_id || o.driver_id_no || '-',
      it.driver_license || o.driver_license_url || o.driver_license || '-'
    ];
    rows.push(row);
  }
  return rows;
}

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
  const cand:any[] = [
    (window as any).luckysheet,
    (window as any).Luckysheet,
    (window as any).Luckysheet?.default
  ];
  for(const c of cand){ if(c && typeof c.create==='function') return c; }
  return null as any;
}

async function renderSheet(){
  try{
    const ls:any = await loadLuckysheetCDN();
    if(!ls || typeof ls.create!=='function'){
      // fallback: simple HTML table
      const data2D = buildEvidence2D();
      const el = document.getElementById('luckysheet-detail');
      if(el){ el.innerHTML = `<table class=\"fallback\">${data2D.map((r:any)=>'<tr>'+r.map((c:any)=>`<td>${String(c??'')}</td>`).join('')+'</tr>').join('')}</table>`; }
      return;
    }
    const mountEl = document.getElementById('luckysheet-detail');
    if(!mountEl){ return; }
    const data2D = buildEvidence2D();
    const celldata:any[] = [];
    for(let r=0;r<data2D.length;r++){
      for(let c=0;c<data2D[r].length;c++){
        celldata.push({ r, c, v:{ v: data2D[r][c] } });
      }
    }
    try{ ls?.destroy?.(); }catch{}
    ls.create({
      container: 'luckysheet-detail',
      lang:'zh',
      allowEdit: false,
      showinfobar:false,
      showtoolbar:false,
      showsheetbar:false,
      sheetFormulaBar:false,
      enableAddRow:false,
      enableAddCol:false,
      row: Math.max(20, data2D.length),
      column: Math.max(10, data2D[0]?.length||10),
      data:[{ name:'证据表', celldata, config:{} }]
    });
    ;(window as any).__detailData2D = data2D;
    // 尝试插入缩略图（首张）
    try{
      const header = data2D[2] as any[];
      const colIndex:Record<string,number> = {};
      header.forEach((h,idx)=> colIndex[h]=idx);
      const imageCols = [
        { key:'入库凭证', w:90, h:70 },
        { key:'入场抓拍', w:90, h:70 },
        { key:'出场抓拍', w:90, h:70 },
        { key:'司机驾驶证', w:90, h:70 }
      ];
      const startRow = 3; // 数据起始行
      const cellW = 100, cellH = 28; // 估算
      const imgs:any[] = [];
      for(let r=startRow; r<data2D.length; r++){
        for(const ic of imageCols){
          const ci = colIndex[ic.key]; if(ci==null) continue;
          const src = data2D[r][ci];
          if(src && /^https?:/.test(String(src))){
            imgs.push({
              src: String(src),
              originWidth: ic.w, originHeight: ic.h,
              default: { left: ci*cellW + 10, top: (r-0)*cellH + 80, width: ic.w, height: ic.h }
            });
          }
        }
      }
      if(imgs.length && typeof ls.insertImage==='function') ls.insertImage(imgs);
    }catch{}
  }catch(e){ console.error(e); }
}

watch(order, (v)=>{ if(v) renderSheet(); });

// 导出与打印
async function exportXlsx(){
  try{
    exporting.value = true;
    const data2D:any[] = (window as any).__detailData2D || buildEvidence2D();
    let ok = false;
    try{
      const XLSX:any = await import(/* @vite-ignore */ 'xlsx');
      const ws = XLSX.utils.aoa_to_sheet(data2D as any);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '证据表');
      XLSX.writeFile(wb, `证据表-${order.value?.order_no||order.value?.reservation_number||'导出'}.xlsx`);
      ok = true;
    }catch{ ok = false; }
    if(!ok){
      // 退化为CSV
  const csv = (data2D as any[]).map((r:any[])=> r.map((x:any)=> String(x??'')).join(',')).join('\n');
      const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `证据表-${order.value?.order_no||order.value?.reservation_number||'导出'}.csv`;
      a.click(); URL.revokeObjectURL(a.href);
    }
  }finally{ exporting.value = false; }
}

function printSheet(){
  const data2D:any[] = (window as any).__detailData2D || buildEvidence2D();
  const html = `<!doctype html><html><head><meta charset='utf-8'><title>打印</title>
  <style>table{border-collapse:collapse;width:100%;}td,th{border:1px solid #999;padding:6px;}h3{text-align:center;margin:8px 0;}</style>
  </head><body><h3>证据表</h3><table>${data2D.map((r:any)=>'<tr>'+r.map((c:any)=>`<td>${String(c??'')}</td>`).join('')+'</tr>').join('')}</table></body></html>`;
  const w = window.open('', '_blank'); if(!w) return;
  w.document.write(html); w.document.close(); w.focus(); setTimeout(()=>{ try{ w.print(); }catch{} }, 50); setTimeout(()=>{ try{ w.close(); }catch{} }, 600);
}
</script>

<style scoped>
.page{ padding:16px; }
.head{ display:flex; align-items:center; gap:8px; }
.spacer{ flex:1; }
.btns button{ height:36px; padding:0 12px; border:none; border-radius:10px; background:#eef2f7; color:#0f172a; cursor:pointer; }
.card{ border:1px solid #e5e7eb; background:#fff; border-radius:12px; padding:12px; margin:12px 0; box-shadow:0 6px 16px rgba(2,6,23,.06); }
.row{ display:flex; align-items:center; gap:8px; padding:6px 0; }
.row label{ width:120px; color:#475569; }
.tag{ display:inline-block; padding:3px 10px; border-radius:999px; font-size:12px; font-weight:600; }
.gray{ background:#e2e8f0; color:#334155; }
.sheet{ width:100%; height:600px; border:1px solid #e5e7eb; }
</style>


