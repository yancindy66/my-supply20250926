<template>
  <div class="page">
    <h2>车辆入库（修正·AG Grid）</h2>
    <div class="toolbar">
      <button class="ghost" @click="load">刷新</button>
    </div>
    <div class="grid-wrap">
      <ag-grid-vue class="ag-theme-alpine grid"
        :columnDefs="colDefs"
        :rowData="rows"
        :domLayout="'normal'"
        :suppressMovableColumns="true"
        :defaultColDef="{ resizable:false, sortable:false }"
        :animateRows="true"
        :rowHeight="40"
        :headerHeight="44"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { AgGridVue } from 'ag-grid-vue3';
import { listInboundOrders } from '@/api/depositor';
const rows = ref<any[]>([]);
const colDefs = ref([
  { headerName:'预约单号', field:'reservation_number', width:180, pinned:'left' },
  { headerName:'运输单号', field:'transport_no', width:160, pinned:'left' },
  { headerName:'入库单号', field:'order_no', width:180 },
  { headerName:'入库状态', field:'status', width:120 },
  { headerName:'入库凭证+', field:'inbound_proof', width:140 },
  { headerName:'客户', field:'owner_name', width:160 },
  { headerName:'商品', field:'commodity', width:220 },
  { headerName:'车牌号', field:'vehicle_plate', width:140 },
  { headerName:'预约量', field:'planned_quantity', width:140 },
  { headerName:'已经入库量', field:'actual_in_weight', width:160 },
  { headerName:'毛重', field:'gross', width:120 },
  { headerName:'皮重', field:'tare', width:120 },
  { headerName:'净重', field:'net', width:120 },
  { headerName:'扣重', field:'deductions', width:120 },
  { headerName:'入场抓拍时间', field:'entry_time', width:180 },
  { headerName:'出场抓拍时间', field:'exit_time', width:180 },
  { headerName:'司机姓名', field:'driver_name', width:140 },
  { headerName:'司机手机', field:'driver_phone', width:140 },
  { headerName:'操作', field:'_act', width:160, pinned:'right', cellRenderer: (p:any)=> `<a class='link'>编辑</a> <a class='link danger'>删除</a>` }
]);

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
    gross: r.gross ?? '-',
    tare: r.tare ?? '-',
    net: (r.gross!=null && r.tare!=null)? (Number(r.gross)-Number(r.tare)) : (r.net ?? '-'),
    deductions: r.deductions ?? '-',
    entry_time: r.entry_time || '-',
    exit_time: r.exit_time || '-',
    driver_name: r.driver_name || '-',
    driver_phone: r.driver_phone || '-',
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
.grid{ width:100%; height:100%; min-width:1200px; }
.link{ color:#2563eb; }
.danger{ color:#ef4444; margin-left:8px; }
.ag-theme-alpine{ --ag-font-size:12px; --ag-row-height:40px; }
</style>


