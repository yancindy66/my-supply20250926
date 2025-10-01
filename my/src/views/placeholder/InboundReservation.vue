<template>
  <div class="dash">
    <h2>入库工作台</h2>
    <div class="kpis">
      <div class="card">
        <div class="num">{{ reservationTotal }}</div>
        <div class="label">入库预约（条）</div>
      </div>
      <div class="card">
        <div class="num">{{ orderTotal }}</div>
        <div class="label">入库申请（条）</div>
      </div>
    </div>
    <div class="actions">
      <button @click="go('/inbound/order/apply')">新建入库申请</button>
      <button class="ghost" @click="go('/inbound/order/list')">查看入库申请列表</button>
      <button class="ghost" @click="refresh">刷新</button>
    </div>
    <div class="tips">此页作为“入库仪表盘”，后续可接入更多统计图与趋势。</div>
  </div>
 </template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { listReservations, listInboundOrders } from '@/api/depositor';
const router = useRouter();
const reservationTotal = ref(0);
const orderTotal = ref(0);
async function refresh(){
  try{ const r:any = await listReservations({ page:1, pageSize:1 }); reservationTotal.value = Number(r?.data?.total|| r?.data?.list?.length || 0); }catch{ reservationTotal.value=0; }
  try{ const o:any = await listInboundOrders({ page:1, pageSize:1 }); orderTotal.value = Number(o?.data?.total|| o?.data?.list?.length || 0); }catch{ orderTotal.value=0; }
}
function go(p:string){ router.push(p); }
refresh();
</script>

<style scoped>
.dash{ padding:16px; }
.kpis{ display:flex; gap:16px; margin:12px 0; }
.card{ width:180px; height:100px; border-radius:12px; background:linear-gradient(135deg,#2563eb,#3b82f6); color:#fff; display:flex; flex-direction:column; align-items:center; justify-content:center; box-shadow:0 10px 24px rgba(37,99,235,.18); }
.card .num{ font-size:32px; font-weight:800; }
.card .label{ opacity:.9; margin-top:6px; }
.actions{ display:flex; gap:10px; margin:8px 0; }
button{ height:36px; padding:0 12px; border:none; border-radius:8px; background:#2563eb; color:#fff; cursor:pointer; }
.ghost{ background:#e5e7eb; color:#111827; }
.tips{ margin-top:10px; color:#64748b; }
</style>


