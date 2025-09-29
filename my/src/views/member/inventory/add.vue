<template>
  <div class="create-owner-container">
    <h2>新增存货人</h2>
    <form @submit.prevent="onSubmit">
      <h3>1. 企业信息</h3>
      <div>
        <label>企业名称：</label>
        <input v-model="form.company" required />
      </div>
      <!-- 存货人编码为系统自动生成，不在新增表单中录入 -->
      <div>
        <label>统一社会信用代码：</label>
        <input v-model="form.creditCode" />
      </div>
      <div>
        <label>企业注册地址：</label>
        <input v-model="form.regAddress" />
      </div>
      <div>
        <label>法定代表人姓名：</label>
        <input v-model="form.legalRepName" />
      </div>
      <div>
        <label>法定代表人身份证号：</label>
        <input v-model="form.legalRepId" />
      </div>
      <div>
        <label>成立日期：</label>
        <input v-model="form.establishDate" type="date" />
      </div>
      <div>
        <label>注册资本：</label>
        <input v-model="form.registeredCapital" />
      </div>
      <div>
        <label>经营范围：</label>
        <input v-model="form.businessScope" />
      </div>

      <h3>2. 企业联系信息</h3>
      <div>
        <label>对公账户开户行：</label>
        <input v-model="form.bankName" />
      </div>
      <div>
        <label>对公账户号：</label>
        <input v-model="form.bankAccount" />
      </div>
      <div>
        <label>企业常用邮箱：</label>
        <input v-model="form.companyEmail" />
      </div>
      <div>
        <label>企业联系电话：</label>
        <input v-model="form.companyPhone" />
      </div>

      <h3>3. 经营信息（初步风控）</h3>
      <div>
        <label>年营业额范围：</label>
        <input v-model="form.annualRevenueRange" />
      </div>
      <div>
        <label>主营业务范围：</label>
        <input v-model="form.mainBusiness" />
      </div>
      <div>
        <label>常用合作方：</label>
        <input v-model="form.partners" placeholder="例：顺丰,京东仓" />
      </div>

      <h3>4. 账号管理员信息（操作员）</h3>
      <div>
        <label>管理员姓名：</label>
        <input v-model="form.adminName" />
      </div>
      <div>
        <label>部门：</label>
        <input v-model="form.adminDept" />
      </div>
      <div>
        <label>职位：</label>
        <input v-model="form.adminTitle" />
      </div>
      <div>
        <label>管理员手机号：</label>
        <input v-model="form.adminPhone" />
      </div>

      <h3>5. 联系人与地址</h3>
      <div>
        <label>联系人：</label>
        <input v-model="form.contact" required />
      </div>
      <div>
        <label>电话：</label>
        <input v-model="form.phone" required />
      </div>
      <div>
        <label>地址：</label>
        <input v-model="form.address" required />
      </div>

      <h3>6. 资质上传（仅记录文件名）</h3>
      <div>
        <label>营业执照上传：</label>
        <input type="file" @change="onFileChange('license', $event)" />
        <span v-if="form.license">{{ (form.license as any)?.name || form.license }}</span>
        <img v-if="preview.license" :src="preview.license" alt="营业执照预览" class="upload-preview" />
        <button type="button" class="mini" @click="triggerPrev($event)">更改</button>
        <button type="button" class="mini" @click="clearUpload('license')">移除</button>
      </div>
      <div>
        <label>法人公章上传：</label>
        <input type="file" @change="onFileChange('seal', $event)" />
        <span v-if="form.seal">{{ (form.seal as any)?.name || form.seal }}</span>
        <img v-if="preview.seal" :src="preview.seal" alt="公章预览" class="upload-preview" />
        <button type="button" class="mini" @click="triggerPrev($event)">更改</button>
        <button type="button" class="mini" @click="clearUpload('seal')">移除</button>
      </div>
      <div>
        <label>法人身份证正面：</label>
        <input type="file" @change="onFileChange('legalIdFront', $event)" />
        <span v-if="form.legalIdFront">{{ (form.legalIdFront as any)?.name || form.legalIdFront }}</span>
        <img v-if="preview.legalIdFront" :src="preview.legalIdFront" alt="身份证正面预览" class="upload-preview" />
        <button type="button" class="mini" @click="triggerPrev($event)">更改</button>
        <button type="button" class="mini" @click="clearUpload('legalIdFront')">移除</button>
      </div>
      <div>
        <label>法人身份证反面：</label>
        <input type="file" @change="onFileChange('legalIdBack', $event)" />
        <span v-if="form.legalIdBack">{{ (form.legalIdBack as any)?.name || form.legalIdBack }}</span>
        <img v-if="preview.legalIdBack" :src="preview.legalIdBack" alt="身份证反面预览" class="upload-preview" />
        <button type="button" class="mini" @click="triggerPrev($event)">更改</button>
        <button type="button" class="mini" @click="clearUpload('legalIdBack')">移除</button>
      </div>
      <div>
        <label>开户许可证：</label>
        <input type="file" @change="onFileChange('bankPermit', $event)" />
        <span v-if="form.bankPermit">{{ (form.bankPermit as any)?.name || form.bankPermit }}</span>
        <img v-if="preview.bankPermit" :src="preview.bankPermit" alt="开户许可证预览" class="upload-preview" />
        <button type="button" class="mini" @click="triggerPrev($event)">更改</button>
        <button type="button" class="mini" @click="clearUpload('bankPermit')">移除</button>
      </div>
      <div>
        <label>授权委托书：</label>
        <input type="file" @change="onFileChange('authLetter', $event)" />
        <span v-if="form.authLetter">{{ (form.authLetter as any)?.name || form.authLetter }}</span>
        <img v-if="preview.authLetter" :src="preview.authLetter" alt="授权委托书预览" class="upload-preview" />
        <button type="button" class="mini" @click="triggerPrev($event)">更改</button>
        <button type="button" class="mini" @click="clearUpload('authLetter')">移除</button>
      </div>
      <button type="submit" :disabled="submitting">{{ submitting ? '提交中...' : '提交' }}</button>
    </form>
    <div v-if="message" class="message">{{ message }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { createOwner } from '../../../api/inventoryOwner';

const router = useRouter();
const form = ref({
  company: '',
  code: '',
  creditCode: '', regAddress: '', legalRepName: '', legalRepId: '', establishDate: '', registeredCapital: '', businessScope: '',
  bankName: '', bankAccount: '', companyEmail: '', companyPhone: '',
  annualRevenueRange: '', mainBusiness: '', partners: '',
  adminName: '', adminDept: '', adminTitle: '', adminPhone: '',
  contact: '',
  phone: '',
  address: '',
  license: null as File | null,
  legalIdFront: null as File | null,
  legalIdBack: null as File | null,
  bankPermit: null as File | null,
  authLetter: null as File | null,
  seal: null as File | null
});
const preview = ref<Record<string, string | null>>({ license: null, seal: null, legalIdFront: null, legalIdBack: null, bankPermit: null, authLetter: null });
const message = ref('');
const submitting = ref(false);

function validateForm() {
  if (!form.value.company || !form.value.contact || !form.value.phone || !form.value.address) {
    message.value = '请填写所有必填项';
    return false;
  }
  if (!/^1[3-9]\d{9}$/.test(form.value.phone)) {
    message.value = '请输入正确的手机号';
    return false;
  }
  if (!form.value.license) {
    message.value = '请上传营业执照和法人公章';
    return false;
  }
  return true;
}

function onFileChange(type: 'license' | 'seal' | 'legalIdFront' | 'legalIdBack' | 'bankPermit' | 'authLetter', e: Event) {
  const files = (e.target as HTMLInputElement).files;
  if (files && files.length > 0) {
    const file = files[0];
    (form.value as any)[type] = file;
    try { preview.value[type] = URL.createObjectURL(file); } catch {}
    const reader = new FileReader();
    reader.onload = () => {
      const key = type + 'DataUrl';
      (form.value as any)[key] = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
}

function clearUpload(type: 'license'|'seal'|'legalIdFront'|'legalIdBack'|'bankPermit'|'authLetter') {
  (form.value as any)[type] = null;
  (form.value as any)[type + 'DataUrl'] = '';
  (preview.value as any)[type] = null;
}

function triggerPrev(e: Event) {
  const input = (e.target as HTMLElement).previousElementSibling?.previousElementSibling as HTMLInputElement | null;
  if (input) input.click();
}

async function onSubmit() {
  if (!validateForm()) return;
  submitting.value = true;
  const payload = {
    code: form.value.code,
    company: form.value.company,
    creditCode: form.value.creditCode,
    regAddress: form.value.regAddress,
    legalRepName: form.value.legalRepName,
    legalRepId: form.value.legalRepId,
    establishDate: form.value.establishDate,
    registeredCapital: form.value.registeredCapital,
    businessScope: form.value.businessScope,
    bankName: form.value.bankName,
    bankAccount: form.value.bankAccount,
    companyEmail: form.value.companyEmail,
    companyPhone: form.value.companyPhone,
    annualRevenueRange: form.value.annualRevenueRange,
    mainBusiness: form.value.mainBusiness,
    partners: form.value.partners,
    adminName: form.value.adminName,
    adminDept: form.value.adminDept,
    adminTitle: form.value.adminTitle,
    adminPhone: form.value.adminPhone,
    contact: form.value.contact,
    phone: form.value.phone,
    address: form.value.address,
    license: form.value.license ? (form.value.license as File).name : '',
    licenseDataUrl: (form.value as any).licenseDataUrl || '',
    legalIdFront: form.value.legalIdFront ? (form.value.legalIdFront as File).name : '',
    legalIdFrontDataUrl: (form.value as any).legalIdFrontDataUrl || '',
    legalIdBack: form.value.legalIdBack ? (form.value.legalIdBack as File).name : '',
    legalIdBackDataUrl: (form.value as any).legalIdBackDataUrl || '',
    bankPermit: form.value.bankPermit ? (form.value.bankPermit as File).name : '',
    bankPermitDataUrl: (form.value as any).bankPermitDataUrl || '',
    authLetter: form.value.authLetter ? (form.value.authLetter as File).name : '',
    authLetterDataUrl: (form.value as any).authLetterDataUrl || '',
    seal: form.value.seal ? (form.value.seal as File).name : '',
    sealDataUrl: (form.value as any).sealDataUrl || ''
  } as any;
  try {
    await createOwner(payload as any);
    message.value = '提交成功';
    Object.keys(preview.value).forEach(k => { const url = (preview.value as any)[k]; if (url) URL.revokeObjectURL(url); });
    setTimeout(() => router.push('/operation/member/inventory/list'), 300);
  } catch (e: any) {
    message.value = e?.message || '提交失败';
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.create-owner-container { max-width: 960px; margin: 40px auto; padding: 24px; border: 1px solid #eef2f7; border-radius: 12px; box-shadow: 0 10px 24px rgba(2,6,23,0.06); background: #fff; }
.create-owner-container h2 { margin: 0 0 16px; font-size: 20px; font-weight: 600; color:#0f172a; }
.create-owner-container h3 { position: relative; margin: 20px 0 12px; padding-left: 12px; font-size: 14px; color:#1e40af; }
.create-owner-container h3::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 4px; height: 14px; border-radius: 2px; background: linear-gradient(180deg,#60a5fa,#2563eb); }
.create-owner-container form > div { display: grid; grid-template-columns: 180px 1fr; align-items: center; gap: 8px 12px; margin-bottom: 10px; }
.create-owner-container label { display: block; color:#475569; font-size: 13px; }
.create-owner-container input { height: 34px; padding: 0 10px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; background: #fff; }
.create-owner-container input[type="file"] { height: auto; padding: 6px 10px; }
.create-owner-container input:focus { outline: none; border-color:#93c5fd; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
.upload-preview { display:inline-block; height: 52px; margin-left: 8px; border: 1px solid #e5e7eb; border-radius: 8px; vertical-align: middle; background:#fff; }
.mini{ margin-left:6px; height:26px; padding:0 10px; border:1px solid #e5e7eb; border-radius:8px; background:#fff; cursor:pointer; font-size:12px; }
.mini:hover{ filter:brightness(0.98); }
.create-owner-container button[type="submit"] { margin-top: 8px; height: 36px; padding: 0 14px; border: none; border-radius: 10px; background: linear-gradient(180deg,#3b82f6,#2563eb); color:#fff; cursor: pointer; font-size: 13px; }
.create-owner-container button[type="submit"][disabled] { opacity: .6; cursor: not-allowed; }
.message { color: #16a34a; margin-top: 16px; font-size: 13px; }
</style>


