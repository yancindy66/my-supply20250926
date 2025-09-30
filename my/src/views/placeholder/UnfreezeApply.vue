<template>
  <div class="stub">
    <h2>解冻申请（占位）</h2>
    <form @submit.prevent="submit">
      <label>质押记录ID<input v-model.number="pledge_record_id" type="number" required /></label>
      <label>原因<input v-model="reason" /></label>
      <button type="submit">提交</button>
    </form>
    <div class="msg" v-if="msg">{{ msg }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const pledge_record_id = ref<number|undefined>();
const reason = ref('按计划出库，申请解冻');
const msg = ref('');
async function submit(){
  msg.value='';
  try{ /* 待接解冻申请API */ msg.value='提交成功（占位）'; }catch{ msg.value='提交失败'; }
}
</script>

<style scoped>
.stub{ padding:16px; }
form{ display:flex; gap:8px; align-items:center; }
label{ display:flex; gap:6px; align-items:center; }
.msg{ margin-top:10px; color:#16a34a; }
</style>


