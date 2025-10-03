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
      <template #cell-vehicle_plate="{row}">{{ row.vehicle_plate || '-' }}</template>
      <template #cell-planned_quantity="{row}">{{ row.total_planned_quantity || row.planned_quantity }} {{ row.measurement_unit || row.unit || '' }}</template>
      <template #cell-actual_in_weight="{row}">{{ row.actual || row.calc_weight || '-' }} {{ row.measurement_unit || row.unit || '' }}</template>
      <template #cell-weigh_mode="{row}">{{ row.weigh_mode==='by_pack'?'按规格':'按磅重' }}</template>
      <template #cell-gross="{row}">{{ row.gross ?? '-' }}</template>
      <template #cell-tare="{row}">{{ row.tare ?? '-' }}</template>
      <template #cell-net="{row}">{{ (row.gross!=null && row.tare!=null) ? (Number(row.gross)-Number(row.tare)) : '-' }}</template>
      <template #cell-deductions="{row}">{{ row.deductions ?? '-' }}</template>
      <template #cell-entry_photos="{row}"><span v-if="row.entry_photos?.length">{{ row.entry_photos.length }} 张</span><span v-else>-</span></template>
      <template #cell-exit_photos="{row}"><span v-if="row.exit_photos?.length">{{ row.exit_photos.length }} 张</span><span v-else>-</span></template>
      <template #cell-inbound_proof="{row}">
        <span v-if="row.weigh_ticket_urls?.length">磅单{{ row.weigh_ticket_urls.length }}张</span>
        <span v-else-if="row.weigh_ticket_url">磅单1张</span>
        <span v-else-if="row.doc_url">附件</span>
        <span v-else>-</span>
      </template>
      <template #cell-qc_url="{row}">
        <a v-if="row.qc_url" :href="row.qc_url" target="_blank">查看</a>
        <span v-else>-</span>
      </template>
      <template #cell-driver_id_card="{row}">{{ row.driver_id_card || row.driver_id_no || '-' }}</template>
      <template #cell-driver_license_url="{row}">
        <img v-if="row.driver_license_url" :src="row.driver_license_url" class="doc-thumb" />
        <span v-else>-</span>
      </template>
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
  { key:'order_no', label:'入库单号', width:180 },
  { key:'status', label:'入库状态', width:120 },
  { key:'inbound_proof', label:'入库凭证+', width:140 },
  { key:'owner_name', label:'客户', width:160 },
  { key:'commodity', label:'商品', width:220 },
  { key:'vehicle_plate', label:'车牌号', width:140 },
  { key:'planned_quantity', label:'预约量', width:140 },
  { key:'actual_in_weight', label:'已经入库量', width:160 },
  { key:'weigh_mode', label:'磅重', width:120 },
  { key:'gross', label:'毛重', width:120 },
  { key:'tare', label:'皮重', width:120 },
  { key:'net', label:'净重', width:120 },
  { key:'deductions', label:'扣重', width:120 },
  { key:'entry_photos', label:'入场抓拍', width:140 },
  { key:'entry_time', label:'入场抓拍时间', width:180 },
  { key:'exit_photos', label:'出场抓拍', width:140 },
  { key:'exit_time', label:'出场抓拍时间', width:180 },
  { key:'qc_url', label:'质检URL', width:140 },
  { key:'driver_name', label:'司机姓名', width:140 },
  { key:'driver_phone', label:'司机手机', width:140 },
  { key:'driver_id_card', label:'司机身份证', width:180 },
  { key:'driver_license_url', label:'司机驾驶证', width:160 },
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
    // 兼容：若无 net，按 gross/tare 计算；若无 inbound_proof 字段，透传 weigh_ticket_urls/doc_url
    const patched = [...mock, ...api].map((r:any)=>{
      const net = (r.gross!=null && r.tare!=null) ? (Number(r.gross)-Number(r.tare)) : r.net;
      const inbound_proof = r.weigh_ticket_urls?.length? '磅单' : (r.weigh_ticket_url||r.doc_url)? '附件' : '';
      return { net, inbound_proof, ...r };
    });
    rows.value = patched;
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


