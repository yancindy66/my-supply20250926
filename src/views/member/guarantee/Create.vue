<template>
  <div class="create-owner-container">
    <h2>新增担保机构</h2>
    <form @submit.prevent="onSubmit">
      <h3>1. 基础信息</h3>
      <div>
        <label>机构名称：</label>
        <input v-model="form.name" required placeholder="例如：XX融资担保有限公司" />
      </div>
      <div>
        <label>统一社会信用代码：</label>
        <input v-model="form.creditCode" required />
      </div>
      <div>
        <label>融资性担保机构许可证编号：</label>
        <input v-model="form.license_no" required />
      </div>
      <div>
        <label>机构类型：</label>
        <select v-model="form.type" required>
          <option value="">请选择</option>
          <option>融资性担保公司</option>
          <option>再担保公司</option>
          <option>政策性担保机构</option>
          <option>其他</option>
        </select>
      </div>

      <h3>2. 资本信息</h3>
      <div>
        <label>注册资本：</label>
        <input v-model="form.registeredCapital" required placeholder="单位：万元" />
      </div>
      <div>
        <label>放大倍数：</label>
        <input v-model="form.leverage" placeholder="担保余额/净资产" />
      </div>
      <div>
        <label>担保责任余额：</label>
        <input v-model="form.guaranteeOutstanding" placeholder="当前责任余额" />
      </div>

      <h3>3. 联系信息</h3>
      <div>
        <label>注册地址：</label>
        <input v-model="form.regAddress" required />
      </div>
      <div>
        <label>经营地址：</label>
        <input v-model="form.bizAddress" required />
      </div>
      <div>
        <label>客服电话：</label>
        <input v-model="form.servicePhone" required />
      </div>
      <div>
        <label>业务联系人：</label>
        <input v-model="form.contact" required />
      </div>
      <div>
        <label>联系人部门及职务：</label>
        <input v-model="form.contactTitle" required />
      </div>
      <div>
        <label>联系人手机：</label>
        <input v-model="form.contactPhone" required />
      </div>
      <div>
        <label>联系人邮箱：</label>
        <input v-model="form.contactEmail" required />
      </div>

      <h3>4. 业务信息</h3>
      <div>
        <label>合作金融机构：</label>
        <select v-model="partnerFinancialIds" multiple size="4" required>
          <option v-for="fi in financialOptions" :key="fi.id" :value="fi.id">{{ fi.name }}</option>
        </select>
      </div>
      <div>
        <label>主要担保业务类型：</label>
        <input v-model="form.mainGuaranteeTypes" required placeholder="逗号分隔：贷款担保, 票据承兑担保..." />
      </div>
      <div>
        <label>合作起始日期：</label>
        <input v-model="form.coop_start_date" type="date" required />
      </div>
      <div>
        <label>合作状态：</label>
        <select v-model="form.coop_status" required>
          <option value="">请选择</option>
          <option>合作中</option>
          <option>已暂停</option>
          <option>已终止</option>
        </select>
      </div>

      <h3>5. 风控与资质</h3>
      <div>
        <label>风险评级：</label>
        <input v-model="form.risk_rating" placeholder="例如：A/BBB..." />
      </div>
      <div>
        <label>准入审核状态：</label>
        <select v-model="form.admission_status" required>
          <option value="">请选择</option>
          <option>待审核</option>
          <option>审核通过</option>
          <option>审核驳回</option>
        </select>
      </div>
      <div>
        <label>相关资质文件（许可证/执照/身份证 等）：</label>
        <input type="file" multiple @change="onMultiFile($event)" />
        <div class="files">
          <template v-for="(f, idx) in formFiles" :key="idx">
            <span class="file-chip">{{ f.name }} <button type="button" class="mini" @click="removeFile(idx)">移除</button></span>
          </template>
        </div>
      </div>

      <h3>6. 系统与管理</h3>
      <div>
        <label>机构管理员账号：</label>
        <input v-model="form.admin_account" required />
      </div>

      <h3>7. 备注</h3>
      <div>
        <label>备注：</label>
        <textarea v-model="form.remark" rows="3"></textarea>
      </div>

      <button type="submit" :disabled="submitting">{{ submitting ? '提交中...' : '提交' }}</button>
      <button type="button" class="mini" @click="goBack">返回</button>
    </form>
    <div v-if="message" class="message">{{ message }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { guaranteeApi, financialApi } from '../../../api/memberModules';
const router = useRouter();

const form = ref<any>({
  name: '', creditCode: '', license_no: '', type: '',
  registeredCapital: '', leverage: '', guaranteeOutstanding: '',
  regAddress: '', bizAddress: '', servicePhone: '',
  contact: '', contactTitle: '', contactPhone: '', contactEmail: '',
  mainGuaranteeTypes: '', coop_start_date: '', coop_status: '',
  risk_rating: '', admission_status: '',
  admin_account: '', remark: ''
});

const financialOptions = ref<Array<{id:number; name:string}>>([]);
const partnerFinancialIds = ref<number[]>([]);
const formFiles = ref<Array<{ name: string; dataUrl: string }>>([]);
const message = ref('');
const submitting = ref(false);

onMounted(async()=>{
  try{
    const res:any = await financialApi.list({ page:1, pageSize:9999 });
    const list = (res?.data?.list || []).map((x:any)=>({ id:x.id, name:x.name || x.company || x.code || ('机构#'+x.id) }));
    financialOptions.value = list;
  } catch {}
});

function onMultiFile(e: Event){
  const files = (e.target as HTMLInputElement).files; if(!files) return;
  Array.from(files).forEach(f=>{ const r=new FileReader(); r.onload=()=>{ formFiles.value.push({ name:f.name, dataUrl:String(r.result||'') }); }; r.readAsDataURL(f); });
  (e.target as HTMLInputElement).value='';
}
function removeFile(index:number){ formFiles.value.splice(index,1); }

function validateForm(): boolean {
  const must = ['name','creditCode','license_no','type','registeredCapital','regAddress','bizAddress','servicePhone','contact','contactTitle','contactPhone','contactEmail','mainGuaranteeTypes','coop_start_date','coop_status','admission_status','admin_account'];
  for (const k of must){ if(!String(form.value[k]||'').trim()){ message.value=`请填写必填项：${k}`; return false; } }
  if (!partnerFinancialIds.value.length){ message.value='请选择合作金融机构'; return false; }
  if (!formFiles.value.length){ message.value='请上传相关资质文件'; return false; }
  return true;
}

async function onSubmit(){
  if(!validateForm()) return;
  submitting.value = true;
  try{
    const payload = { ...form.value, partner_financial_ids: partnerFinancialIds.value, qualification_files: formFiles.value };
    await guaranteeApi.create(payload);
    message.value='提交成功';
    setTimeout(()=> router.push('/operation/member/guarantee-agencies'), 300);
  } catch(e:any){ message.value = e?.message || '提交失败'; } finally { submitting.value=false; }
}

function goBack(){ router.back(); }
</script>

<style scoped>
.create-owner-container { max-width: 960px; margin: 40px auto; padding: 24px; border: 1px solid #eef2f7; border-radius: 12px; box-shadow: 0 10px 24px rgba(2,6,23,0.06); background: #fff; }
.create-owner-container h2 { margin: 0 0 16px; font-size: 20px; font-weight: 600; color:#0f172a; }
.create-owner-container h3 { position: relative; margin: 20px 0 12px; padding-left: 12px; font-size: 14px; color:#1e40af; }
.create-owner-container h3::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 4px; height: 14px; border-radius: 2px; background: linear-gradient(180deg,#60a5fa,#2563eb); }
.create-owner-container form > div { display: grid; grid-template-columns: 220px 1fr; align-items: center; gap: 8px 12px; margin-bottom: 10px; }
.create-owner-container label { display: block; color:#475569; font-size: 13px; }
.create-owner-container input, .create-owner-container select, .create-owner-container textarea { height: 34px; padding: 0 10px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; background: #fff; }
.create-owner-container textarea { height: auto; padding: 8px 10px; }
.create-owner-container select[multiple] { height: 96px; }
.create-owner-container input:focus, .create-owner-container select:focus, .create-owner-container textarea:focus { outline: none; border-color:#93c5fd; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
.files { display:flex; flex-wrap: wrap; gap: 6px; }
.file-chip { display:inline-flex; align-items:center; gap:6px; padding:4px 8px; background:#f1f5f9; border:1px solid #e2e8f0; border-radius:999px; font-size:12px; }
.mini{ margin-left:6px; height:26px; padding:0 10px; border:1px solid #e5e7eb; border-radius:8px; background:#fff; cursor:pointer; font-size:12px; }
.create-owner-container button[type="submit"] { margin-top: 8px; height: 36px; padding: 0 14px; border: none; border-radius: 10px; background: linear-gradient(180deg,#3b82f6,#2563eb); color:#fff; cursor: pointer; font-size: 13px; }
.create-owner-container button[type="submit"][disabled] { opacity: .6; cursor: not-allowed; }
.message { color: #16a34a; margin-top: 16px; font-size: 13px; }
</style>








