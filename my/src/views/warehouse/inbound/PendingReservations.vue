<template>
  <div style="padding:16px">
    <h3>待审核入库申请</h3>
    <div style="margin:8px 0; display:flex; gap:8px; align-items:center">
      <el-input v-model="wid" style="width:180px" placeholder="仓库ID" />
      <el-button type="primary" @click="load">刷新</el-button>
      <div style="flex:1"></div>
      <el-button type="success" :disabled="!multipleSelection.length" @click="batchConfirm">批量确认</el-button>
      <el-button type="danger" :disabled="!multipleSelection.length" @click="batchReject">批量驳回</el-button>
    </div>
    <el-table :data="groupedRows" size="small" border :loading="loading" @selection-change="onSelChange">
      <el-table-column type="selection" width="48" />
      <el-table-column prop="reservation_number" label="预约单号(RSV)" min-width="180" />
      <el-table-column prop="client_batch_no" label="货物批次号" min-width="160">
        <template #default="{row}"><el-link type="primary" @click="openDetail(row)">{{ row.client_batch_no || '-' }}</el-link></template>
      </el-table-column>
      <el-table-column prop="owner_name" label="客户" min-width="140" />
      <el-table-column prop="commodity_text" label="商品" min-width="160" />
      <el-table-column prop="sum_quantity" label="预约入库量(吨)" min-width="140" />
      <el-table-column prop="created_at" label="预约日期" min-width="160" />
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

const loading = ref(false);
const rows = ref<any[]>([]);
const wid = ref<string>('');
const multipleSelection = ref<any[]>([]);
const showDetail = ref(false);
const currentBatch = ref('');
const detailRows = ref<any[]>([]);

function getWid(){
  if(wid.value) return wid.value;
  try{ const s = localStorage.getItem('warehouseId')||''; if(s) return s; }catch{}
  return '1';
}

async function load(){
  loading.value = true;
  try{
    const r = await fetch(`/v1/inbound/reservations/pending?warehouse_id=${encodeURIComponent(getWid())}`);
    const j = await r.json();
    rows.value = j?.data?.list || [];
  }catch{ rows.value = []; }
  loading.value = false;
}

async function confirm(row:any){
  try{
    const id = row.id || row.reservation_number;
    const r = await fetch(`/v1/inbound/reservations/${encodeURIComponent(id)}/confirm`, { method:'POST' });
    if(!r.ok){ const t=await r.text(); alert('确认失败：'+t); return; }
    await load();
    alert('已确认并入库');
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
  }catch(e:any){ alert('驳回失败：'+(e?.message||e)); }
}

function mapStatusText(s: string){ const m:Record<string,string>={ pending:'待审核', approved:'审核通过', rejected:'已驳回', completed:'已完成' }; return m[s]||s||'-'; }

const groupedRows = computed(()=>{
  return (rows.value||[]).map((r:any)=>{
    const sumQty = Number(r.total_planned_quantity || 0);
    const commodity = r.commodity_text || (r.detail_lines && r.detail_lines[0]?.commodity_text) || `#${r.commodity_id||''}`;
    return {
      reservation_number: r.reservation_number,
      client_batch_no: r.client_batch_no || r.client_reservation_no || '-',
      owner_name: r.owner_name || '-',
      commodity_text: commodity,
      sum_quantity: sumQty,
      created_at: r.created_at || '-',
      status_text: mapStatusText(String(r.status||'')),
      __any: r
    };
  });
});

function onSelChange(list:any[]){ multipleSelection.value = list||[]; }

async function batchConfirm(){
  if(!multipleSelection.value.length) return;
  for(const it of multipleSelection.value){ try{ await confirm(it.__any); }catch{} }
  await load();
}
async function batchReject(){
  if(!multipleSelection.value.length) return;
  for(const it of multipleSelection.value){ try{ await reject(it.__any); }catch{} }
  await load();
}

function openDetail(row:any){
  currentBatch.value = row.client_batch_no || '-';
  const raw = row.__any || {};
  const list = Array.isArray(raw.detail_lines) ? raw.detail_lines.slice() : [];
  // 补全缺失字段，保证与存货人“车辆入库”字段一致
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

load();
</script>


