<template>
  <div class="stub">
    <h2>入库预约（占位）</h2>
    <form class="form" @submit.prevent="create">
      <div class="row">
        <label>目标仓库ID</label>
        <input v-model.number="form.target_warehouse_id" type="number" min="1" required />
        <label>品类ID</label>
        <input v-model.number="form.commodity_id" type="number" min="1" required />
      </div>
      <div class="row">
        <label>计划数量</label>
        <input v-model.number="form.total_planned_quantity" type="number" min="0" step="0.01" required />
        <label>计量单位</label>
        <input v-model="form.measurement_unit" placeholder="吨" required />
      </div>
      <div class="toolbar">
        <button type="submit">新建预约</button>
        <button type="button" class="ghost" @click="load">刷新</button>
      </div>
    </form>
    <div v-if="loading">加载中...</div>
    <div v-else>
      <pre>{{ list }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { listReservations, createReservation } from '@/api/depositor';
const loading = ref(false);
const list = ref<any[]>([]);
const form = ref({ target_warehouse_id: 1, commodity_id: 1, total_planned_quantity: 100, measurement_unit: '吨' });
async function load(){
  loading.value = true;
  try{ const resp = await listReservations({ page:1, pageSize:10 }); list.value = (resp as any)?.data?.list || []; }catch{ list.value=[]; }
  loading.value = false;
}
async function create(){
  try{
    await createReservation(form.value as any);
    alert('提交成功');
    await load();
  }catch(e:any){
    alert('提交失败：'+(e?.message||e));
  }
}
load();
</script>

<style scoped>
.stub{ padding:16px; }
.form{ display:flex; flex-direction:column; gap:10px; margin:12px 0; }
.row{ display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
.row label{ width:88px; color:#475569; }
.row input{ height:36px; padding:0 10px; border:1px solid #e2e8f0; border-radius:8px; }
.toolbar{ margin: 12px 0; }
.ghost{ margin-left:8px; }
</style>


