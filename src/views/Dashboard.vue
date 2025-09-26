<template>
  <div class="dashboard-container">
    <h2>仪表盘</h2>
    <DashboardList :list="list" />
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import DashboardList from '../components/DashboardList.vue';
const list = ref<{ id: number; name: string; value: number }[]>([]);
const error = ref('');

onMounted(async () => {
  try {
    const res = await fetch('/api/dashboard/list');
    const payload = await res.json();
    if (payload?.code === 0) {
      const arr = Array.isArray(payload.data)
        ? payload.data
        : (Array.isArray(payload.data?.widgets) ? payload.data.widgets : []);
      list.value = arr;
    } else {
      error.value = '获取数据失败';
    }
  } catch (e) {
    error.value = '请求出错';
  }
});
</script>

<style scoped>
.dashboard-container {
  max-width: 400px;
  margin: 80px auto;
  padding: 32px;
  border: 1px solid #eee;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  background: #fff;
}
ul {
  padding: 0;
  list-style: none;
}
li {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}
.error {
  color: red;
  margin-top: 16px;
  text-align: center;
}
</style>
