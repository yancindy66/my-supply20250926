<template>
  <div class="page">
    <h2>入库申请</h2>
    <form class="form" @submit.prevent="submit">
      <div class="row">
        <label>仓库选择</label>
        <input v-model="form.warehouse_name" placeholder="填写仓库名称(占位)" />
        <label>商品信息</label>
        <input v-model="form.commodity_name" placeholder="填写商品名称(占位)" />
      </div>
      <div class="row">
        <label>数量</label>
        <input v-model.number="form.planned_quantity" type="number" min="0" step="0.01" />
        <label>计量单位</label>
        <input v-model="form.measurement_unit" placeholder="吨" />
      </div>
      <div class="row">
        <label>入库时间</label>
        <input v-model="form.arrival_time" type="datetime-local" />
        <label>备注</label>
        <input v-model="form.remarks" placeholder="备注" />
      </div>
      <div class="toolbar">
        <button type="submit">提交申请</button>
        <button type="button" class="ghost" @click="saveDraft">保存草稿</button>
        <button type="button" class="ghost" @click="reset">重置</button>
        <button type="button" class="ghost" @click="goList">返回列表</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { createInboundOrder } from '@/api/depositor';
const router = useRouter();

const form = ref({
  warehouse_name: '',
  commodity_name: '',
  planned_quantity: 100,
  measurement_unit: '吨',
  arrival_time: '',
  remarks: ''
});

async function submit(){
  try{
    await createInboundOrder({ planned_quantity: form.value.planned_quantity, measurement_unit: form.value.measurement_unit });
    alert('提交成功');
    router.push('/inbound/order/list');
  }catch(e:any){ alert('提交失败：'+(e?.message||e)); }
}
function saveDraft(){ alert('草稿保存（占位）'); }
function reset(){
  form.value = { warehouse_name:'', commodity_name:'', planned_quantity:100, measurement_unit:'吨', arrival_time:'', remarks:'' } as any;
}
function goList(){ router.push('/inbound/order/list'); }
</script>

<style scoped>
.page{ padding:16px; }
.form{ display:flex; flex-direction:column; gap:12px; margin-top:8px; }
.row{ display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
.row label{ width:88px; color:#475569; }
.row input{ height:36px; padding:0 10px; border:1px solid #e2e8f0; border-radius:8px; }
.toolbar{ display:flex; gap:10px; }
.ghost{ background:#e5e7eb; color:#111827; border:none; border-radius:8px; padding:0 12px; height:36px; }
button{ height:36px; padding:0 12px; border:none; border-radius:8px; background:#2563eb; color:#fff; cursor:pointer; }
</style>


