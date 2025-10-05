<template>
  <div class="page-wrap">
    <h2>续期信息审核</h2>
    <div class="card">
      <div class="row"><label>仓单号</label><span>{{ detail.receiptNo }}</span></div>
      <div class="row"><label>客户名称</label><span>{{ detail.customer }}</span></div>
      <div class="row"><label>原到期日</label><span>{{ detail.expireAt }}</span></div>
      <div class="row"><label>申请续期至</label><span>{{ detail.applyTo }}</span></div>
      <div class="row"><label>审核结论</label>
        <select class="ipt" v-model="result">
          <option value="approved">通过</option>
          <option value="rejected">拒绝</option>
        </select>
      </div>
      <div class="row"><label>审核意见</label><textarea class="ta" rows="4" v-model="comment" /></div>
      <div class="row"><button class="btn primary" @click="submit">提交审核</button></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const detail = ref<any>({});
const result = ref<'approved'|'rejected'>('approved');
const comment = ref('');
function submit(){ /* TODO: 提交审核 */ }
</script>

<style scoped>
.page-wrap{ font-size:13px; }
.card{ background:#fff; border:1px solid #eef2f6; border-radius:8px; padding:12px; max-width:720px; }
.row{ display:grid; grid-template-columns: 140px 1fr; gap:8px; padding:6px 0; align-items:start; }
.ipt{ height:28px; padding:0 10px; border:1px solid #e5e7eb; border-radius:6px; width:220px; }
.ta{ width:100%; border:1px solid #e5e7eb; border-radius:6px; padding:8px; }
.btn{ height:28px; padding:0 12px; border:1px solid #e5e7eb; background:#fff; border-radius:6px; cursor:pointer; }
.btn.primary{ background:#2563eb; border-color:#2563eb; color:#fff; }
</style>


