<template>
  <div class="page">
    <h2>车辆入库（修正·Tabulator验证）</h2>
    <div class="toolbar">
      <button class="ghost" @click="load">刷新</button>
      <span v-if="err" class="err">{{ err }}</span>
    </div>

    <div v-if="tabOk" class="tabu-wrap">
      <link rel="stylesheet" href="https://unpkg.com/tabulator-tables@5.6.2/dist/css/tabulator.min.css">
      <div ref="tabuEl"></div>
    </div>

    <div v-else class="fallback">
      <FixedTable :columns="fallbackColumns" :rows="rows" :default-fix="true">
        <template #cell-reservation_number="{row}"><span class="resv-link">{{ row.reservation_number || row.order_no }}</span></template>
        <template #cell-commodity="{row}">{{ (row.commodity_name||'-') + (row.commodity_spec?(' / '+row.commodity_spec):'') }}</template>
        <template #cell-actions="{row}"><button class="link">编辑</button><button class="link danger">删除</button></template>
      </FixedTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import FixedTable from '@/components/FixedTable.vue';
import { listInboundOrders } from '@/api/depositor';

const tabuEl = ref<HTMLDivElement|null>(null);
let table:any = null;
const tabOk = ref(false);
const err = ref('');
const rows = ref<any[]>([]);
const fallbackColumns = [
  { key:'reservation_number', label:'预约单号', width:180 },
  { key:'transport_no', label:'运输单号', width:160 },
  { key:'owner_name', label:'客户', width:160 },
  { key:'commodity', label:'商品', width:220 },
  { key:'actions', label:'操作', width:160 },
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
    gross: r.gross ?? '-',
    tare: r.tare ?? '-',
    net: (r.gross!=null && r.tare!=null)? (Number(r.gross)-Number(r.tare)) : (r.net ?? '-'),
    deductions: r.deductions ?? '-',
    entry_time: r.entry_time || '-',
    exit_time: r.exit_time || '-',
    driver_name: r.driver_name || '-',
    driver_phone: r.driver_phone || '-',
  }));
  if(table){ table.setData(data); return; }
  try{
    const Tabulator = (await import('https://unpkg.com/tabulator-tables@5.6.2/dist/js/tabulator_esm.min.js')).default;
    table = new Tabulator(tabuEl.value, {
    data,
    reactiveData:true,
    height:"620px",
    layout:"fitDataStretch",
    columns:[
      {title:"预约单号", field:"reservation_number", width:180, frozen:true},
      {title:"运输单号", field:"transport_no", width:160, frozen:true},
      {title:"入库单号", field:"order_no", width:180},
      {title:"入库状态", field:"status", width:120},
      {title:"客户", field:"owner_name", width:160},
      {title:"商品", field:"commodity", width:220},
      {title:"车牌号", field:"vehicle_plate", width:140},
      {title:"预约量", field:"planned_quantity", width:140},
      {title:"已经入库量", field:"actual_in_weight", width:160},
      {title:"毛重", field:"gross", width:120},
      {title:"皮重", field:"tare", width:120},
      {title:"净重", field:"net", width:120},
      {title:"扣重", field:"deductions", width:120},
      {title:"入场抓拍时间", field:"entry_time", width:180},
      {title:"出场抓拍时间", field:"exit_time", width:180},
      {title:"司机姓名", field:"driver_name", width:140},
      {title:"司机手机", field:"driver_phone", width:140},
      {title:"操作", field:"_act", width:160, headerHozAlign:"center", hozAlign:"center", frozen:true, formatter:()=>'<a class=\'link\'>编辑</a> <a class=\'link danger\'>删除</a>'}
    ],
    columnHeaderVertAlign:"middle",
    movableColumns:false,
    resizableColumns:false,
    placeholder:"暂无数据",
    rowHeight:40,
    scrollHorizontal:true
    });
    tabOk.value = true;
  }catch(e:any){ err.value = 'CDN加载失败，使用本地回退表格'; tabOk.value = false; }
}

onMounted(load);
onBeforeUnmount(()=>{ try{ table?.destroy?.(); }catch{} table=null; });
</script>

<style scoped>
.page{ padding:16px; }
.toolbar{ margin:12px 0; display:flex; gap:8px; }
.ghost{ background:#eef2f7; color:#0f172a; height:36px; padding:0 12px; border:none; border-radius:10px; }
.tabu-wrap{ border:1px solid #e5e7eb; border-radius:12px; overflow:hidden; box-shadow:0 10px 24px rgba(2,6,23,.06); }
.link{ color:#2563eb; }
.danger{ color:#ef4444; margin-left:8px; }
.fallback{ border:1px dashed #e5e7eb; padding:8px; border-radius:12px; }
.err{ color:#ef4444; margin-left:12px; }
</style>


