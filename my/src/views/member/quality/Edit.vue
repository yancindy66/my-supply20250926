<template>
  <div class="edit-container" v-if="form">
    <div class="detail-header">
      <button class="btn-back" @click="goBack">返回</button>
      <h2>编辑质检机构</h2>
    </div>
    <form @submit.prevent="onSubmit">
      <div class="grid">
        <label>机构名称<input v-model="form.name" required /></label>
        <label>统一社会信用代码<input v-model="form.creditCode" required /></label>
        <label>资质证书编号<input v-model="form.qualCertNo" required /></label>
        <label>资质有效期<input v-model="form.qualValidTo" type="date" required /></label>
        <label class="col-2">资质认证类型<input v-model="qualTypesStr" placeholder="CMA, CNAS..." /></label>
        <label class="col-2">可检测货物品类<input v-model="testingCatsStr" placeholder="多级分类以 / 号分隔" /></label>
        <label class="col-2">检测能力描述<input v-model="form.capabilityDesc" /></label>
        <label>注册地址<input v-model="form.regAddress" required /></label>
        <label>经营地址<input v-model="form.bizAddress" required /></label>
        <label>官方网址<input v-model="form.website" /></label>
        <label>客服电话<input v-model="form.servicePhone" required /></label>
        <label class="col-2">报告查询链接<input v-model="form.reportVerifyUrl" /></label>
        <label>业务联系人<input v-model="form.contact" required /></label>
        <label>联系人部门及职务<input v-model="form.contactTitle" required /></label>
        <label>联系人手机<input v-model="form.contactPhone" required /></label>
        <label>联系人邮箱<input v-model="form.contactEmail" required /></label>
        <label>合作起始日期<input v-model="form.coop_start_date" type="date" required /></label>
        <label>合作状态<input v-model="form.coop_status" required /></label>
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
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { qualityApi } from '../../../api/memberModules';

const route = useRoute();
const router = useRouter();
const form = ref<any>(null);
const msg = ref('');

const qualTypesStr = computed({
  get(){ const a=form.value?.qualification_type||[]; return Array.isArray(a)? a.join(', '):''; },
  set(v:string){ const a=(v||'').split(',').map(s=>s.trim()).filter(Boolean); if(form.value) form.value.qualification_type=a; }
});
const testingCatsStr = computed({
  get(){ const a=form.value?.testing_categories||[]; return Array.isArray(a)? a.map((x:any)=> typeof x==='string'?x:(x?.label||x?.value||'')).join(' / '):''; },
  set(v:string){ if(!form.value) return; form.value.testing_categories = (v||'').split('/').map(s=>s.trim()).filter(Boolean); }
});

onMounted(async ()=>{
  const id = Number(route.params.id);
  const res:any = await qualityApi.detail(id);
  form.value = res?.data || res || {};
});

async function onSubmit(){
  try{ await qualityApi.update(form.value); msg.value='保存成功'; setTimeout(()=> router.push('/operation/member/quality-agencies'), 400); }
  catch(e:any){ msg.value = e?.message || '保存失败'; }
}
function goBack(){ router.push('/operation/member/quality-agencies'); }
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








