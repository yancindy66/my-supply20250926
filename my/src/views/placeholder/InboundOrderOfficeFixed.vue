<template>
  <div class="page">
    <h2>车辆入库（修正·Handsontable）</h2>
    <div class="toolbar">
      <button class="ghost" @click="load">刷新</button>
    </div>
    <div class="grid-wrap">
      <hot-table
        class="grid"
        :data="rows"
        :colHeaders="colHeaders"
        :columns="hotColumns"
        :fixedColumnsLeft="2"
        :stretchH="'all'"
        :licenseKey="'non-commercial-and-evaluation'"
        :rowHeights="40"
        :height="'70vh'"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { HotTable } from '@handsontable/vue3';
import 'handsontable/dist/handsontable.full.min.css';
import { listInboundOrders } from '@/api/depositor';
const rows = ref<any[]>([]);
const colHeaders = ['预约单号','运输单号','入库单号','入库状态','入库凭证+','客户','商品','车牌号','预约量','已经入库量','磅重（入库方式）','毛重','皮重','净重','扣重','入场抓拍','入场抓拍时间','出场抓拍','出场抓拍时间','质检URL','司机姓名','司机手机','司机身份证','司机驾驶证','操作'];
const hotColumns = [
  { data:'reservation_number' },
  { data:'transport_no' },
  { data:'order_no' },
  { data:'status' },
  { data:'inbound_proof' },
  { data:'owner_name' },
  { data:'commodity' },
  { data:'vehicle_plate' },
  { data:'planned_quantity' },
  { data:'actual_in_weight' },
  { data:'weigh_mode_text' },
  { data:'gross' },
  { data:'tare' },
  { data:'net' },
  { data:'deductions' },
  { data:'entry_photos_count' },
  { data:'entry_time' },
  { data:'exit_photos_count' },
  { data:'exit_time' },
  { data:'qc_url' },
  { data:'driver_name' },
  { data:'driver_phone' },
  { data:'driver_id_card' },
  { data:'driver_license_url' },
  { data:'_act' }
];

function mapStatus(s: string){ const m:Record<string,string>={ created:'已创建', receiving:'收货中', completed:'已完成', cancelled:'已取消' }; return m[s]||s||'-'; }

async function load(){
  const resp:any = await listInboundOrders({ page:1, pageSize:100 });
  const api = resp?.data?.list || [];
  let mock:any[] = [];
  try{ mock = JSON.parse(localStorage.getItem('mockInboundOrders')||'[]')||[]; }catch{}
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
  rows.value = data;
}

onMounted(load);
</script>

<style scoped>
.page{ padding:16px; }
.toolbar{ margin:12px 0; display:flex; gap:8px; }
.ghost{ background:#eef2f7; color:#0f172a; height:36px; padding:0 12px; border:none; border-radius:10px; }
.grid-wrap{ border:1px solid #e5e7eb; border-radius:12px; overflow:auto; box-shadow:0 10px 24px rgba(2,6,23,.06); height:70vh; }
.grid{ width:100%; height:100%; min-width:1400px; }
.link{ color:#2563eb; }
.danger{ color:#ef4444; margin-left:8px; }
.ag-theme-alpine{ --ag-font-size:12px; --ag-row-height:40px; }
</style>


