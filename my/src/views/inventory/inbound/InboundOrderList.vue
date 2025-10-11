<template>
  <div style="padding:16px">
    <h3>入库单列表（存货人视图，样式对齐仓库端）</h3>
    <div style="margin:8px 0; display:flex; gap:8px; align-items:center">
      <el-input v-model="wid" style="width:180px" placeholder="仓库ID" />
      <el-button type="primary" @click="load">刷新</el-button>
      <div style="flex:1"></div>
      <el-button type="success" :disabled="!multipleSelection.length" @click="batchConfirm">批量确认</el-button>
      <el-button type="danger" :disabled="!multipleSelection.length" @click="batchReject">批量驳回</el-button>
      </div>
    <el-table :data="groupedRows" size="small" border :loading="loading" @selection-change="onSelChange">
      <el-table-column type="selection" width="48" />
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="reservation_number" label="预约单号(RSV)" min-width="180" />
      <el-table-column prop="unique_reservation_code" label="预约码" min-width="120" />
      <el-table-column prop="client_batch_no" label="货物批次号" min-width="160">
        <template #default="{row}">
          <el-input v-model="row.client_batch_no" style="width:120px" placeholder="点击编辑" @blur="saveBatchNo(row)" />
        </template>
      </el-table-column>
      <el-table-column prop="owner_name" label="客户" min-width="140" />
      <el-table-column prop="commodity_text" label="商品" min-width="160" />
      <el-table-column prop="total_planned_quantity" label="预约入库量" min-width="140" />
      <el-table-column prop="created_at" label="预约日期" min-width="160" />
      <el-table-column prop="actual_in_weight" label="已入库量" min-width="120" />
      <el-table-column prop="pieces" label="件数" min-width="100" />
      <el-table-column prop="weigh_mode_text" label="入库方式" min-width="120" />
      <el-table-column prop="status_text" label="状态" min-width="120" />
      <el-table-column label="操作" min-width="200">
        <template #default="{ row }">
          <el-button size="small" type="success" @click="confirm(row.__any)">确认</el-button>
          <el-button size="small" type="danger" @click="reject(row.__any)">驳回</el-button>
      </template>
      </el-table-column>
    </el-table>

    <el-drawer v-model="showDetail" title="批次明细" size="80%">
      <div style="margin-bottom:8px">批次号：{{ currentBatch }}</div>
      <el-table :data="detailRows" size="small" border height="65vh">
        <el-table-column prop="reservation_number" label="预约单号" min-width="160" />
        <el-table-column prop="transport_no" label="运输单号" min-width="140" />
        <el-table-column prop="order_no" label="入库单号" min-width="140" />
        <el-table-column prop="status" label="入库状态" min-width="120" />
        <el-table-column prop="inbound_proof" label="入库凭证+" min-width="140" />
        <el-table-column prop="owner_name" label="客户" min-width="140" />
        <el-table-column prop="commodity_text" label="商品" min-width="160" />
        <el-table-column prop="vehicle_plate" label="车牌号" min-width="120" />
        <el-table-column prop="planned_quantity" label="预约量" min-width="100" />
        <el-table-column prop="actual_in_weight" label="已经入库量" min-width="120" />
        <el-table-column prop="weigh_mode_text" label="磅重（入库方式）" min-width="140" />
        <el-table-column prop="gross" label="毛重" min-width="100" />
        <el-table-column prop="tare" label="皮重" min-width="100" />
        <el-table-column prop="net" label="净重" min-width="100" />
        <el-table-column prop="deductions" label="扣重" min-width="100" />
        <el-table-column prop="entry_time" label="入场抓拍时间" min-width="160" />
        <el-table-column prop="exit_time" label="出场抓拍时间" min-width="160" />
        <el-table-column prop="qc_url" label="质检URL" min-width="160" />
        <el-table-column prop="driver_name" label="司机姓名" min-width="100" />
        <el-table-column prop="driver_phone" label="司机手机" min-width="130" />
        <el-table-column prop="driver_id_card" label="司机身份证" min-width="180" />
        <el-table-column prop="driver_license_url" label="司机驾驶证" min-width="160" />
      </el-table>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const loading = ref(false);
const rows = ref<any[]>([]);
const wid = ref<string>('');
const multipleSelection = ref<any[]>([]);
const showDetail = ref(false);
const currentBatch = ref('');
const detailRows = ref<any[]>([]);
const router = useRouter();

// 覆盖层：持久保存“货物批次号”等本地编辑字段，避免后端demo重启导致丢失
const OVERLAY_KEY = 'inventory_inbound_overlay.v1';
function loadOverlay(): Record<string, any>{
  try{ return JSON.parse(localStorage.getItem(OVERLAY_KEY)||'{}')||{}; }catch{ return {}; }
}
function saveOverlay(map: Record<string, any>){ try{ localStorage.setItem(OVERLAY_KEY, JSON.stringify(map)); }catch{} }
function applyOverlay(list:any[]){
  const ov = loadOverlay();
  if(!ov || !list) return list;
  list.forEach((r:any)=>{
    const key = String(r.reservation_number || r.id || '');
    if(key && ov[key] && typeof ov[key]==='object'){
      const o = ov[key];
      if(o.client_batch_no!=null) r.client_batch_no = o.client_batch_no;
    }
  });
  return list;
}

function getWid(){
  if(wid.value) return wid.value;
  try{ const s = localStorage.getItem('warehouseId')||''; if(s) return s; }catch{}
  return '1';
}

async function load(){
  loading.value = true;
  try{
    const r = await fetch(`/v1/inbound/reservations`);
    const j = await r.json();
    const server = j?.data?.list || j?.data?.data?.list || j?.data?.data || [];
    rows.value = applyOverlay(server.slice());
    try{ localStorage.setItem('inventory_inbound_rows', JSON.stringify(rows.value)); }catch{}
  }catch{
    // 回退到本地缓存，避免切页返回后数据丢失
    try{ rows.value = applyOverlay(JSON.parse(localStorage.getItem('inventory_inbound_rows')||'[]')||[]); }catch{ rows.value=[]; }
  }
  loading.value = false;
}

async function confirm(row:any){
  try{
    const id = row.id || row.reservation_number;
    const r = await fetch(`/v1/inbound/reservations/${encodeURIComponent(id)}/confirm`, { method:'POST' });
    if(!r.ok){ const t=await r.text(); alert('确认失败：'+t); return; }
    await load();
    alert('已确认');
    try{ router.push('/inbound/list'); }catch{}
  }catch(e:any){ alert('确认失败：'+(e?.message||e)); }
}

async function reject(row:any){
  const reason = window.prompt('请输入驳回理由','资料不完整');
  if(reason==null) return;
  try{
    const id = row.id || row.reservation_number;
    const r = await fetch(`/v1/inbound/reservations/${encodeURIComponent(id)}/reject`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ reason }) });
    if(!r.ok){ const t=await r.text(); alert('驳回失败：'+t); return; }
    await load();
    alert('已驳回');
    try{ router.push('/inbound/list'); }catch{}
  }catch(e:any){ alert('驳回失败：'+(e?.message||e)); }
}

function mapStatusText(s: string){ const m:Record<string,string>={ pending:'待审核', approved:'审核通过', rejected:'已驳回', completed:'已完成' }; return m[s]||s||'-'; }

const groupedRows = computed(()=>{
  return (rows.value||[]).map((r:any)=>{
    const sumQty = Number(r.total_planned_quantity || 0);
    const commodity = r.commodity_text || (r.detail_lines && r.detail_lines[0]?.commodity_text) || `#${r.commodity_id||''}`;
    const weighModeText = r.weigh_mode==='by_pack' ? '按规格' : (r.weigh_mode==='by_weight' ? '按磅重' : (r.weigh_mode_text || '-'));
    const actualIn = r.actual_in_weight ?? r.actual ?? (r.detail_lines ? r.detail_lines.reduce((s:any,d:any)=> s + Number(d.actual_in_weight||0), 0) : '-');
    const pieces = r.pieces ?? (r.detail_lines ? r.detail_lines.reduce((s:any,d:any)=> s + Number(d.pieces||0), 0) : '-');
    return {
      reservation_number: r.reservation_number,
      unique_reservation_code: r.unique_reservation_code,
      client_batch_no: r.client_batch_no || r.client_reservation_no || '-',
      owner_name: r.owner_name || '-',
      commodity_text: commodity,
      total_planned_quantity: sumQty,
      created_at: r.created_at || '-',
      actual_in_weight: actualIn,
      pieces,
      weigh_mode_text: weighModeText,
      status_text: mapStatusText(String(r.status||'')),
      __any: r
    };
  });
});

function onSelChange(list:any[]){ multipleSelection.value = list||[]; }

async function saveBatchNo(row:any){
  const raw = row.__any; if(!raw) return;
  try{
    const id = raw.id || raw.reservation_number;
    await fetch(`/v1/inbound/reservations/${encodeURIComponent(id)}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ client_batch_no: row.client_batch_no }) });
    raw.client_batch_no = row.client_batch_no;
    // 叠加保存到本地覆盖层，避免后端demo重启丢失
    const key = String(raw.reservation_number || raw.id || '');
    if(key){ const ov = loadOverlay(); ov[key] = { ...(ov[key]||{}), client_batch_no: row.client_batch_no }; saveOverlay(ov); }
    try{ localStorage.setItem('inventory_inbound_rows', JSON.stringify(rows.value)); }catch{}
  }catch(e:any){ alert('保存失败：'+(e?.message||e)); }
}

async function batchConfirm(){
  if(!multipleSelection.value.length) return;
  for(const it of multipleSelection.value){
    try{
      const id = it.__any?.id || it.__any?.reservation_number;
      if(!id) continue;
      const r = await fetch(`/v1/inbound/reservations/${encodeURIComponent(id)}/confirm`, { method:'POST' });
      if(!r.ok){ /* ignore */ }
    }catch{}
  }
  await load();
  try{ router.push('/inbound/list'); }catch{}
}
async function batchReject(){
  if(!multipleSelection.value.length) return;
  const reason = window.prompt('请输入驳回理由','资料不完整');
  if(reason==null) return;
  for(const it of multipleSelection.value){
    try{
      const id = it.__any?.id || it.__any?.reservation_number;
      if(!id) continue;
      await fetch(`/v1/inbound/reservations/${encodeURIComponent(id)}/reject`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ reason }) });
    }catch{}
  }
  await load();
  try{ router.push('/inbound/list'); }catch{}
}

function openDetail(row:any){
  currentBatch.value = row.client_batch_no || '-';
  const raw = row.__any || {};
  const list = Array.isArray(raw.detail_lines) ? raw.detail_lines.slice() : [];
  detailRows.value = list.map((d:any)=>({
    reservation_number: d.reservation_number || raw.reservation_number || '-',
    transport_no: d.transport_no || '-',
    order_no: d.order_no || '-',
    status: d.status || '待审核',
    inbound_proof: d.inbound_proof || '-',
    owner_name: d.owner_name || raw.owner_name || '-',
    commodity_text: d.commodity_text || (raw.commodity_id?('#'+raw.commodity_id):'-'),
    vehicle_plate: d.vehicle_plate || '-',
    planned_quantity: d.planned_quantity ?? '-',
    actual_in_weight: d.actual_in_weight ?? '-',
    weigh_mode_text: d.weigh_mode_text || '-',
    gross: d.gross ?? '-',
    tare: d.tare ?? '-',
    net: d.net ?? '-',
    deductions: d.deductions ?? '-',
    entry_time: d.entry_time || '-',
    exit_time: d.exit_time || '-',
    qc_url: d.qc_url || '-',
    driver_name: d.driver_name || '-',
    driver_phone: d.driver_phone || '-',
    driver_id_card: d.driver_id_card || '-',
    driver_license_url: d.driver_license_url || '-'
  }));
  showDetail.value = true;
}

// 导出：严格按当前表数据导出，保持一致
function exportCsv(){
  const headers = ['序号','预约单号','预约码','货物批次号','客户','商品','预约入库量','预约日期','已入库量','件数','入库方式','状态'];
  const rowsCsv = groupedRows.value.map((r:any, idx:number)=>[
    String(idx+1), r.reservation_number||'', r.unique_reservation_code||'', r.client_batch_no||'', r.owner_name||'', r.commodity_text||'',
    String(r.total_planned_quantity||''), r.created_at||'', String(r.actual_in_weight||''), String(r.pieces||''), r.weigh_mode_text||'', r.status_text||''
  ]);
  const csv = [headers.join(','), ...rowsCsv.map(a=>a.map(x=> String(x).replaceAll('"','""')).map(x=> /[",\n]/.test(x)?`"${x}"`:x).join(','))].join('\n');
  const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = '入库单列表.csv'; a.click(); URL.revokeObjectURL(a.href);
}

// 批量导入：接收csv，仅映射“货物批次号”等关键字段，合并到当前表
async function importCsv(file: File){
  const text = await file.text();
  const lines = text.split(/\r?\n/).filter(Boolean);
  if(!lines.length) return;
  const header = lines[0].split(',');
  const idx:Record<string,number>={}; header.forEach((h,i)=> idx[h.trim()]=i);
  const map = (r:string[])=>({ client_batch_no: r[idx['货物批次号']]||r[idx['客户批次号']]||r[idx['客户预约号']]||'', owner_name: r[idx['客户']]||'', commodity_text: r[idx['商品']]||'', total_planned_quantity: Number(r[idx['预约入库量']]||r[idx['数量']]||0)||0, created_at: r[idx['预约日期']]||'' });
  const imported = lines.slice(1).map(ln=> map(ln.split(',')));
  // 合并：追加到内存并缓存
  const current = groupedRows.value.map(x=> ({ ...x }));
  const merged = [...imported.map(x=> ({ ...x, reservation_number:'', unique_reservation_code:'', actual_in_weight:'-', pieces:'-', weigh_mode_text:'-', status_text:'待审核', __any:{ client_batch_no: x.client_batch_no } })), ...current];
  // 回写 rows（仅最简合并：把导入项塞在前面，真实入库仍以后端为准）
  rows.value = merged.map(m=> ({ reservation_number: m.reservation_number, unique_reservation_code: m.unique_reservation_code, client_batch_no: m.client_batch_no, owner_name: m.owner_name, commodity_text: m.commodity_text, total_planned_quantity: m.total_planned_quantity, created_at: m.created_at, actual_in_weight: m.actual_in_weight, pieces: m.pieces, weigh_mode_text: m.weigh_mode_text, status_text: m.status_text, detail_lines: [], id: m.__any?.id }));
  try{ localStorage.setItem('inventory_inbound_rows', JSON.stringify(rows.value)); }catch{}
}

function onImportFile(e: Event){ const f=(e.target as HTMLInputElement).files?.[0]; if(!f) return; importCsv(f); (e.target as HTMLInputElement).value=''; }

load();
</script>

<style scoped>
/******************** 保留 InboundOrderList 原有样式或按需简化，此处不改动以免影响全局 ********************/
</style>


