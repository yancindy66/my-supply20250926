<template>
  <div class="stub">
    <h2>质押申请（占位）</h2>
    <form @submit.prevent="submit">
      <label>仓单ID<input v-model.number="warehouse_receipt_id" type="number" required /></label>
      <label>数量<input v-model.number="quantity" type="number" step="0.0001" required /></label>
      <label>单位<input v-model="unit" /></label>
      <button type="submit">提交</button>
    </form>
    <div class="msg" v-if="msg">{{ msg }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { createPledgeRecord } from '@/api/depositor';
const warehouse_receipt_id = ref<number|undefined>();
const quantity = ref<number|undefined>();
const unit = ref('吨');
const msg = ref('');
async function submit(){
  msg.value='';
  try{
    await createPledgeRecord({ record_number: 'PLG-'+Date.now(), warehouse_receipt_id: Number(warehouse_receipt_id.value), storage_in_id: 0, pledge_type: 'full_pledge', pledged_quantity: Number(quantity.value), pledged_unit: unit.value });
    msg.value='提交成功（占位）';
  }catch{ msg.value='提交失败'; }
}
</script>

<style scoped>
.stub{ padding:16px; }
form{ display:flex; gap:8px; align-items:center; }
label{ display:flex; gap:6px; align-items:center; }
.msg{ margin-top:10px; color:#16a34a; }
</style>


