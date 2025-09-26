<template>
  <div class="page">
    <div class="hero">
      <h1>请选择您的角色</h1>
      <p>进入系统前，请先选择你的身份以获得相应的功能菜单</p>
    </div>
    <div class="grid">
      <div class="card" v-for="r in roles" :key="r.key" @click="selectRole(r.key)">
        <div class="icon">{{ r.icon }}</div>
        <div class="title">{{ r.label }}</div>
        <div class="desc">{{ r.desc }}</div>
      </div>
    </div>
  </div>
  
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
const router = useRouter();
const roles = [
  { key: 'inventory', label: '存货人', icon: '📦', desc: '入库/出库/移库、仓单与融资交易' },
  { key: 'warehouse', label: '仓储机构', icon: '🏬', desc: '仓库/入出库/移库、续期过户、公告' },
  { key: 'financial', label: '金融机构', icon: '🏦', desc: '仓单质押融资与公告' },
  { key: 'guarantee', label: '担保机构', icon: '🛡️', desc: '融资担保与公告' },
  { key: 'operation', label: '平台运营', icon: '🧭', desc: '汇总看板与全局管理' }
];
function selectRole(roleKey: string) {
  try {
    localStorage.setItem('role', roleKey);
  } catch {}
  // 先选角色再登录
  router.push('/login');
}
</script>

<style scoped>
.page{
  min-height:100vh; padding:40px 24px; display:flex; flex-direction:column; align-items:center;
  background:
    radial-gradient(800px 400px at 20% 10%, rgba(59,130,246,0.18), transparent 60%),
    radial-gradient(800px 400px at 80% 20%, rgba(14,165,233,0.16), transparent 60%),
    linear-gradient(135deg, #eaf2ff 0%, #f7fbff 60%, #ffffff 100%);
}
.hero{ text-align:center; margin-bottom:28px; }
.hero h1{ margin:0; font-size:28px; color:#0f172a; }
.hero p{ margin:8px 0 0; color:#475569; }
.grid{ display:grid; grid-template-columns: repeat(auto-fill,minmax(220px,1fr)); gap:16px; width:100%; max-width:980px; }
.card{
  cursor:pointer; border:1px solid rgba(2,6,23,0.08); border-radius:12px; padding:20px; background:#fff;
  box-shadow: 0 8px 24px rgba(2,6,23,0.06); transition: transform .15s ease, box-shadow .15s ease;
}
.card:hover{ transform: translateY(-2px); box-shadow: 0 14px 32px rgba(2,6,23,0.12); }
.icon{ font-size:28px; }
.title{ margin-top:10px; font-weight:600; color:#0f172a; }
.desc{ margin-top:6px; color:#64748b; font-size:13px; line-height:1.4; }
</style>
