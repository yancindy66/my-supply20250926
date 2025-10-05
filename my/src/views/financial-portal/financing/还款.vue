<template>
  <div class="page-wrap">
    <h2>融资还款</h2>
    <div class="card">
      <div class="row"><label>融资单号</label><span>{{ info.financeNo }}</span></div>
      <div class="row"><label>应还金额</label><span>{{ info.amountDue }}</span></div>
      <div class="row"><label>本次还款</label><input class="ipt" v-model="amount" type="number" min="0" /></div>
      <div class="row"><button class="btn primary" @click="submit">确认还款</button></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const info = ref<any>({ financeNo: '', amountDue: 0 });
const amount = ref<number|''>('');
function submit(){ /* TODO: 提交还款 */ }
</script>

<style scoped>
.page-wrap{ font-size:13px; }
.card{ background:#fff; border:1px solid #eef2f6; border-radius:8px; padding:12px; max-width:560px; }
.row{ display:grid; grid-template-columns: 140px 1fr; gap:8px; padding:6px 0; align-items:center; }
.ipt{ height:28px; padding:0 10px; border:1px solid #e5e7eb; border-radius:6px; }
.btn{ height:28px; padding:0 12px; border:1px solid #e5e7eb; background:#fff; border-radius:6px; cursor:pointer; }
.btn.primary{ background:#2563eb; border-color:#2563eb; color:#fff; }
</style>


