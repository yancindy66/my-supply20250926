<template>
  <div class="edit-container" v-if="form">
    <div class="detail-header">
      <button class="btn-back" @click="goBack">返回</button>
      <h2>编辑监管仓库</h2>
    </div>
    <form @submit.prevent="onSubmit">
      <div class="grid">
        <label>仓库名称<input v-model="form.name" required /></label>
        <label>统一社会信用代码<input v-model="form.creditCode" required /></label>
        <label>仓库类型<input v-model="form.warehouseType" required /></label>
        <label class="col-2">仓库地址<input v-model="form.address" required /></label>
        <label>仓库面积(㎡)<input v-model="form.area" /></label>
        <label>可用容积(m³)<input v-model="form.capacity" /></label>
        <label>最大承重(吨/㎡)<input v-model="form.maxLoad" /></label>
        <label class="col-2">安保措施描述<input v-model="form.securityDesc" /></label>
        <label>主要监控服务商<input v-model="form.securityVendor" /></label>
        <label>物联网接入<input v-model="form.iotAccess" /></label>
        <label>合作起始日期<input v-model="form.coop_start_date" type="date" required /></label>
        <label>合作状态<input v-model="form.coop_status" required /></label>
        <label>负责人姓名<input v-model="form.headName" required /></label>
        <label>负责人手机<input v-model="form.headPhone" required /></label>
        <label>负责人邮箱<input v-model="form.headEmail" /></label>
        <label>风险评级<input v-model="form.risk_rating" /></label>
        <label>准入审核状态<input v-model="form.admission_status" required /></label>
        <label>管理员账号<input v-model="form.admin_account" required /></label>
        <label class="col-2">备注<input v-model="form.remark" /></label>
      </div>
      <button type="submit" class="btn-primary">保存</button>
    </form>
    <div v-if="msg" class="msg">{{ msg }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { warehouseApi } from '../../../api/memberModules';

const route = useRoute();
const router = useRouter();
const form = ref<any>(null);
const msg = ref('');

onMounted(async ()=>{
  const id = Number(route.params.id);
  const res:any = await warehouseApi.detail(id);
  form.value = res?.data || res || {};
});

async function onSubmit(){
  try{ await warehouseApi.update(form.value); msg.value='保存成功'; setTimeout(()=> router.push('/operation/member/supervised-warehouses'), 400); }
  catch(e:any){ msg.value = e?.message || '保存失败'; }
}
function goBack(){ router.push('/operation/member/supervised-warehouses'); }
</script>

<style scoped>
.edit-container { max-width: 960px; margin: 24px auto; padding: 16px; border-radius: 14px; background: #fff; box-shadow: 0 10px 24px rgba(2,6,23,.06); }
.detail-header { display:flex; align-items:center; gap:12px; margin-bottom: 8px; }
.btn-back { height: 28px; padding: 0 10px; border-radius: 999px; border: 1px solid rgba(148,163,184,.28); background: linear-gradient(180deg, rgba(255,255,255,.66), rgba(248,250,252,.72)); cursor:pointer; }
.grid { display:grid; grid-template-columns: 1fr 1fr; gap: 10px 12px; margin-bottom: 12px; }
.grid .col-2 { grid-column: span 2; }
label { display:grid; grid-template-columns: 180px 1fr; align-items:center; gap:8px; font-size:13px; color:#475569; }
input { height: 30px; border:1px solid #e5e7eb; border-radius:8px; padding:0 10px; }
.btn-primary { height: 32px; padding: 0 14px; border-radius: 999px; border: 1px solid rgba(37,99,235,.35); background: linear-gradient(180deg, rgba(59,130,246,.18), rgba(37,99,235,.16)); cursor:pointer; }
.msg { margin-top: 10px; color:#16a34a; }
</style>








