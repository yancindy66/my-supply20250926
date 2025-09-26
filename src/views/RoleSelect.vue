<template>
  <div class="role-select-container">
    <h2>请选择角色</h2>
    <div class="role-list">
      <button v-for="r in roles" :key="r.key" @click="selectRole(r.key)">{{ r.label }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
const router = useRouter();
const roles = [
  { key: 'inventory', label: '存货人' },
  { key: 'warehouse', label: '仓储机构' },
  { key: 'financial', label: '金融机构' },
  { key: 'operation', label: '运营单位' }
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
.role-select-container {
  max-width: 400px;
  margin: 80px auto;
  padding: 32px;
  border: 1px solid #eee;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  background: #fff;
  text-align: center;
}
.role-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 32px;
}
button {
  padding: 10px 24px;
  background: #42b983;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}
</style>
