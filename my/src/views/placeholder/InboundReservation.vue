<template>
  <div class="stub">
    <h2>入库预约（占位）</h2>
    <div class="toolbar">
      <button @click="load">刷新</button>
    </div>
    <div v-if="loading">加载中...</div>
    <div v-else>
      <pre>{{ list }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { listReservations } from '@/api/depositor';
const loading = ref(false);
const list = ref<any[]>([]);
async function load(){
  loading.value = true;
  try{ const resp = await listReservations({ page:1, pageSize:10 }); list.value = (resp as any)?.data?.list || []; }catch{ list.value=[]; }
  loading.value = false;
}
load();
</script>

<style scoped>
.stub{ padding:16px; }
.toolbar{ margin: 12px 0; }
</style>


