<template>
  <div class="page-wrap">
    <h2>平台运营（Operation）Dashboard</h2>
    <div class="cards">
      <div class="card">今日入库申请<span class="num">—</span></div>
      <div class="card">今日出库申请<span class="num">—</span></div>
      <div class="card">异常预警<span class="num">—</span></div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.cards{ display:grid; grid-template-columns: repeat(3, minmax(180px, 1fr)); gap:12px; margin-top:12px; }
.card{ background:#fff; border:1px solid #eef2f6; border-radius:8px; padding:12px; }
.num{ float:right; color:#64748b; }
</style>


