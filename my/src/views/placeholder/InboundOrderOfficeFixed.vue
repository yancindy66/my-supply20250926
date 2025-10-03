<template>
  <div class="page">
    <h2>车辆入库（修正）</h2>
    <div class="toolbar">
      <button class="ghost" @click="load">刷新</button>
    </div>
    <FixedTable :columns="columns" :rows="rows" :default-fix="true">
      <template #cell-reservation_number="{row}">
        <span class="resv-link">{{ row.reservation_number || row.order_no }}</span>
      </template>
      <template #cell-commodity="{row}">{{ (row.commodity_name||'-') + (row.commodity_spec?(' / '+row.commodity_spec):'') }}</template>
      <template #cell-planned_quantity="{row}">{{ row.total_planned_quantity || row.planned_quantity }} {{ row.measurement_unit || row.unit || '' }}</template>
      <template #cell-status="{row}"><span :class="['tag', statusColor(row.status)]">{{ mapStatus(row.status) }}</span></template>
      <template #cell-actions="{row}">
        <button class="link" @click="editRow(row)">编辑</button>
        <button class="link danger" @click="removeRow(row)">删除</button>
      </template>
    </FixedTable>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import FixedTable from '@/components/FixedTable.vue';
import http from '@/api/http';
import { listInboundOrders } from '@/api/depositor';

type Col = { key:string; label:string; width?:number };
const columns: Col[] = [
  { key:'reservation_number', label:'预约单号', width:180 },
  { key:'transport_no', label:'运输单号', width:160 },
  { key:'owner_name', label:'客户', width:160 },
  { key:'commodity', label:'商品', width:220 },
  { key:'planned_quantity', label:'预约量', width:140 },
  { key:'eta', label:'预计入库时间', width:180 },
  { key:'status', label:'状态', width:120 },
  { key:'created_at', label:'申请入库时间', width:180 },
  { key:'actions', label:'操作', width:180 }
];

const rows = ref<any[]>([]);

function mapStatus(s: string){ const m:Record<string,string>={ created:'已创建', receiving:'收货中', completed:'已完成', cancelled:'已取消' }; return m[s]||s||'-'; }
function statusColor(s:string){ const map:Record<string,string>={ created:'blue', receiving:'orange', completed:'green', cancelled:'gray' }; return map[s]||'gray'; }

async function load(){
  try{
    const resp:any = await listInboundOrders({ page:1, pageSize:50 });
    const api = resp?.data?.list || [];
    let mock:any[] = [];
    try{ mock = JSON.parse(localStorage.getItem('mockInboundOrders')||'[]')||[]; }catch{}
    rows.value = [...mock, ...api];
  }catch{ rows.value = []; }
}
load();

function editRow(_row:any){ alert('编辑（占位）'); }
function removeRow(row:any){
  if(!confirm('确认删除？')) return;
  try{
    const mock = JSON.parse(localStorage.getItem('mockInboundOrders')||'[]')||[];
    const idx = mock.findIndex((x:any)=> (x.order_no||x.reservation_number)===(row.order_no||row.reservation_number));
    if(idx>=0){ mock.splice(idx,1); localStorage.setItem('mockInboundOrders', JSON.stringify(mock)); }
    rows.value = rows.value.filter((x:any)=> (x.order_no||x.reservation_number)!==(row.order_no||row.reservation_number));
  }catch{}
}
</script>

<style scoped>
.page{ padding:16px; }
.toolbar{ margin:12px 0; display:flex; gap:8px; }
.ghost{ background:#eef2f7; color:#0f172a; height:36px; padding:0 12px; border:none; border-radius:10px; }
.tag{ display:inline-block; padding:3px 10px; border-radius:999px; font-size:12px; }
.blue{ background:#e0f2fe; color:#075985; }
.orange{ background:#ffedd5; color:#9a3412; }
.green{ background:#dcfce7; color:#166534; }
.gray{ background:#e2e8f0; color:#334155; }
.link{ background:transparent; color:#2563eb; padding:0 6px; }
.danger{ color:#ef4444; }
.resv-link{ color:#0f172a; border-bottom:1px dashed #cbd5e1; }
</style>


