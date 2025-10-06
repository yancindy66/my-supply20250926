<template>
  <div class="page-wrap">
    <h2>金融机构端（Financial）Dashboard</h2>
    <div class="cards">
      <div class="card">待审核申请<span class="num">—</span></div>
      <div class="card">在办融资<span class="num">—</span></div>
      <div class="card">风险预警<span class="num">—</span></div>
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


