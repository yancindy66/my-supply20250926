<template>
  <div class="page-wrap">
    <h2>融资风险处理</h2>
    <div class="card">
      <div class="row"><label>融资单号</label><span>{{ info.financeNo }}</span></div>
      <div class="row"><label>风险等级</label><span>{{ info.riskLevel }}</span></div>
      <div class="row"><label>处理措施</label><textarea class="ta" v-model="measure" rows="4" placeholder="请输入处理措施"/></div>
      <div class="row"><button class="btn primary" @click="submit">提交处理</button></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const info = ref<any>({ financeNo: '', riskLevel: '' });
const measure = ref('');
function submit(){ /* TODO: 提交处理 */ }
</script>

<style scoped>
.page-wrap{ font-size:13px; }
.card{ background:#fff; border:1px solid #eef2f6; border-radius:8px; padding:12px; max-width:720px; }
.row{ display:grid; grid-template-columns: 140px 1fr; gap:8px; padding:6px 0; align-items:start; }
.ta{ width:100%; border:1px solid #e5e7eb; border-radius:6px; padding:8px; }
.btn{ height:28px; padding:0 12px; border:1px solid #e5e7eb; background:#fff; border-radius:6px; cursor:pointer; }
.btn.primary{ background:#2563eb; border-color:#2563eb; color:#fff; }
</style>


