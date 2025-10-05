<template>
  <div class="page-wrap">
    <h2>融资申请信息查看</h2>
    <div class="card">
      <div class="row"><label>机构名称</label><span>{{ detail.orgName }}</span></div>
      <div class="row"><label>申请单号</label><span>{{ detail.applyNo }}</span></div>
      <div class="row"><label>申请金额</label><span>{{ detail.applyAmount }}</span></div>
      <div class="row"><label>状态</label><span>{{ detail.status }}</span></div>
      <div class="row"><label>申请时间</label><span>{{ detail.applyTime }}</span></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const detail = ref<any>({});
</script>

<style scoped>
.page-wrap{ font-size:13px; }
.card{ background:#fff; border:1px solid #eef2f6; border-radius:8px; padding:12px; max-width:720px; }
.row{ display:grid; grid-template-columns: 140px 1fr; gap:8px; padding:6px 0; }
label{ color:#64748b; }
</style>


