<template>
  <div class="page">
    <h2>门岗核验（微信扫码 + 手机号）</h2>
    <div class="panel">
      <div class="row">
        <label>预约码</label>
        <input v-model="code" placeholder="6位预约码" maxlength="6" />
        <button @click="fetchByCode" :disabled="loading">查询</button>
      </div>
      <div class="row">
        <label>司机手机号</label>
        <input v-model="phone" placeholder="用于核验与联系" />
        <label>车牌</label>
        <input v-model="plate" placeholder="车牌号" />
        <button @click="verify" :disabled="!code || !phone || loading">核验</button>
      </div>
      <div class="hint" v-if="reservation">
        <div>预约单号：{{ reservation.reservation_number }}｜货主：{{ reservation.owner_name }}</div>
        <div>目标仓库：{{ warehouseText }}</div>
        <div>商品：{{ productText }}</div>
      </div>
      <div v-if="result" class="result" :class="{warn: !result.phoneMatched}">
        <div>车单号：{{ result.inbound_order_no }}</div>
        <div>手机号一致：{{ result.phoneMatched ? '是' : '否（已告警仓库负责人）' }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import http from '@/api/http';
import { getReservationByCode, gateVerifyWechat } from '@/api/depositor';

const code = ref('');
const phone = ref('');
const plate = ref('');
const loading = ref(false);
const reservation = ref<any>(null);
const result = ref<any>(null);
const warehouses = ref<any[]>([]);
const products = ref<any[]>([]);

async function loadMaster(){
  try{ const w:any = await http.get('/api/warehouses'); warehouses.value = w?.data || []; }catch{}
  try{ const p:any = await http.get('/api/products'); products.value = p?.data || []; }catch{}
}
loadMaster();

const warehouseText = computed(()=>{
  const w = warehouses.value.find((x:any)=> String(x.id)===String(reservation.value?.target_warehouse_id));
  return w? `${w.name}（${w.address||''}）` : '-';
});
const productText = computed(()=>{
  const p = products.value.find((x:any)=> String(x.id)===String(reservation.value?.commodity_id));
  return p? `${p.name}${p.spec?(' / '+p.spec):''}` : '-';
});

async function fetchByCode(){
  if(!code.value) return;
  loading.value = true;
  try{
    const resp:any = await getReservationByCode(code.value);
    reservation.value = resp?.data || null;
  }catch{ reservation.value = null; }
  loading.value = false;
}

async function verify(){
  if(!code.value || !phone.value) return;
  loading.value = true;
  try{
    const resp:any = await gateVerifyWechat({ reservation_code: code.value, driver_phone: phone.value, vehicle_plate: plate.value, wechat_openid: 'demo-openid' });
    result.value = resp?.data || null;
    if(resp?.data?.reservation) reservation.value = resp.data.reservation;
    alert(resp?.data?.phoneMatched ? '核验通过' : '手机号不一致，已告警仓库负责人');
  }catch(e:any){ alert('核验失败：'+(e?.message||e)); }
  loading.value = false;
}
</script>

<style scoped>
.page{ padding:16px; }
.panel{ background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:12px; box-shadow:0 6px 16px rgba(2,6,23,.06); }
.row{ display:flex; gap:8px; align-items:center; margin-bottom:10px; flex-wrap:wrap; }
label{ color:#475569; min-width:80px; }
input{ height:36px; padding:0 10px; border:1px solid #e5e7eb; border-radius:8px; }
button{ height:36px; padding:0 12px; border:none; border-radius:10px; background:#2563eb; color:#fff; cursor:pointer; }
.hint{ color:#334155; font-size:13px; background:#f8fafc; border:1px dashed #e2e8f0; padding:8px; border-radius:8px; }
.result{ margin-top:10px; padding:8px; background:#ecfdf5; color:#065f46; border-radius:8px; border:1px solid #a7f3d0; }
.result.warn{ background:#fff7ed; color:#92400e; border-color:#fed7aa; }
</style>


