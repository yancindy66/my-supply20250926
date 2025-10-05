<template>
  <div class="portal">
    <h1>请选择您的角色</h1>
    <div class="grid">
      <button class="card op" @click="go('/operation-login')">
        <span class="title">运营人员</span>
        <span class="desc">进入运营管理后台</span>
      </button>
      <button class="card fi" @click="go('/financial-login')">
        <span class="title">金融机构人员</span>
        <span class="desc">银行/信托/保理等金融机构用户</span>
      </button>
      <button class="card wh" @click="go('/warehouse-login')">
        <span class="title">仓储人员</span>
        <span class="desc">监管仓/仓库从业人员</span>
      </button>
      <button class="card inv" @click="go('/inventory-login')">
        <span class="title">存货人员</span>
        <span class="desc">融资企业/存货人用户</span>
      </button>
      <button class="card ga" @click="go('/guarantee-login')">
        <span class="title">担保机构人员</span>
        <span class="desc">担保公司/再担保机构</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
const router = useRouter();
function go(path: string){ router.push(path); }
</script>

<style scoped>
.portal { min-height: 100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:22px; background: radial-gradient(1200px 600px at 50% -10%, #eef2ff, #f8fafc 60%, #ffffff); padding: 24px; }
.portal h1 { font-size: 22px; letter-spacing:.4px; color:#0f172a; margin: 0 0 6px; }
.grid { display:grid; grid-template-columns: repeat(5, 220px); gap: 14px; max-width:1200px; width:100%; justify-content:center; }
.card { height: 120px; border-radius: 14px; border: 1px solid rgba(203,213,225,.6); background: linear-gradient(180deg, rgba(255,255,255,.9), rgba(248,250,252,.9)); box-shadow: 0 10px 24px rgba(2,6,23,.06); cursor:pointer; display:flex; flex-direction:column; align-items:flex-start; justify-content:center; padding: 16px; gap:6px; transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease; }
.card:hover { transform: translateY(-2px); box-shadow: 0 16px 32px rgba(2,6,23,.10); border-color: rgba(99,102,241,.35); }
.title { font-size: 16px; font-weight: 700; color:#0f172a; }
.desc { font-size: 12px; color:#475569; }
.card.op { background-image: linear-gradient(180deg, rgba(59,130,246,.08), rgba(37,99,235,.06)); }
.card.fi { background-image: linear-gradient(180deg, rgba(16,185,129,.10), rgba(5,150,105,.06)); }
.card.wh { background-image: linear-gradient(180deg, rgba(251,191,36,.12), rgba(245,158,11,.06)); }
.card.inv { background-image: linear-gradient(180deg, rgba(168,85,247,.10), rgba(99,102,241,.06)); }
.card.ga { background-image: linear-gradient(180deg, rgba(244,63,94,.10), rgba(236,72,153,.06)); }
@media (max-width: 1200px){ .grid { grid-template-columns: repeat(2, minmax(220px, 1fr)); } }
</style>








