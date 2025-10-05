<template>
  <div class="home">
    <h2>担保机构工作台</h2>
    <p>这里是担保机构人员的首页占位页。后续提供担保项目、风险预警与审批待办等。</p>
    <div class="links">
      <router-link to="/operation/member/guarantee-agencies" class="btn">进入担保机构</router-link>
      <router-link to="/logout" class="btn ghost">切换身份</router-link>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.home{ padding:24px; }
h2{ margin:0 0 10px; font-size:18px; }
.links{ display:flex; gap:10px; margin-top:12px; }
.btn{ height:32px; padding:0 12px; border-radius:8px; background:#2563eb; color:#fff; display:inline-flex; align-items:center; }
.btn.ghost{ background:#fff; color:#1f2937; border:1px solid #e5e7eb; }
</style>








