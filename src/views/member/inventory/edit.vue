<template>
  <div class="create-owner-container" v-if="form">
    <div class="detail-header">
      <button class="btn-back" @click="goBack">返回</button>
      <h2>编辑存货人</h2>
    </div>
    <form @submit.prevent="onSubmit">
      <h3>1. 企业信息</h3>
      <div>
        <label>企业名称：</label>
        <input v-model="form.company" required />
      </div>
      <div>
        <label>存货人编码：</label>
        <input :value="form.code" disabled />
      </div>
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
        <span v-if="form.license" class="file-name">{{ fileLabel(form.license) }}</span>
        <img v-if="editPreview('license')" :src="editPreview('license')" class="upload-preview" alt="营业执照预览" />
        <button type="button" class="mini" @click="clearUpload('license')">移除</button>
      </div>
      <div>
        <label>法人公章上传：</label>
        <input type="file" @change="onFileChange('seal', $event)" />
        <span v-if="form.seal" class="file-name">{{ fileLabel(form.seal) }}</span>
        <img v-if="editPreview('seal')" :src="editPreview('seal')" class="upload-preview" alt="公章预览" />
        <button type="button" class="mini" @click="clearUpload('seal')">移除</button>
      </div>
      <div>
        <label>法人身份证正面：</label>
        <input type="file" @change="onFileChange('legalIdFront', $event)" />
        <span v-if="form.legalIdFront" class="file-name">{{ fileLabel(form.legalIdFront) }}</span>
        <img v-if="editPreview('legalIdFront')" :src="editPreview('legalIdFront')" class="upload-preview" alt="身份证正面预览" />
        <button type="button" class="mini" @click="clearUpload('legalIdFront')">移除</button>
      </div>
      <div>
        <label>法人身份证反面：</label>
        <input type="file" @change="onFileChange('legalIdBack', $event)" />
        <span v-if="form.legalIdBack" class="file-name">{{ fileLabel(form.legalIdBack) }}</span>
        <img v-if="editPreview('legalIdBack')" :src="editPreview('legalIdBack')" class="upload-preview" alt="身份证反面预览" />
        <button type="button" class="mini" @click="clearUpload('legalIdBack')">移除</button>
      </div>
      <div>
        <label>开户许可证：</label>
        <input type="file" @change="onFileChange('bankPermit', $event)" />
        <span v-if="form.bankPermit" class="file-name">{{ fileLabel(form.bankPermit) }}</span>
        <img v-if="editPreview('bankPermit')" :src="editPreview('bankPermit')" class="upload-preview" alt="开户许可证预览" />
        <button type="button" class="mini" @click="clearUpload('bankPermit')">移除</button>
      </div>
      <div>
        <label>授权委托书：</label>
        <input type="file" @change="onFileChange('authLetter', $event)" />
        <span v-if="form.authLetter" class="file-name">{{ fileLabel(form.authLetter) }}</span>
        <img v-if="editPreview('authLetter')" :src="editPreview('authLetter')" class="upload-preview" alt="授权委托书预览" />
        <button type="button" class="mini" @click="clearUpload('authLetter')">移除</button>
      </div>
      <button type="submit" class="btn-primary">保存</button>
    </form>
    <div v-if="message" class="message">{{ message }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getOwnerDetail, updateOwner, ownerFileUrl } from '../../../api/inventoryOwner';

const route = useRoute();
const router = useRouter();
const message = ref('');
const form = ref<any>(null);

onMounted(async () => {
  const id = Number(route.params.id);
  try {
    const data = await getOwnerDetail(id);
    form.value = { ...data } as any;
  } catch (e) {
    message.value = '加载失败';
  }
});

async function onSubmit() {
  if (!/^1[3-9]\d{9}$/.test(form.value.phone)) {
    message.value = '请输入正确的手机号';
    return;
  }
  const payload = {
    ...form.value,
    license: form.value.license && form.value.license.name ? form.value.license.name : (form.value.license || ''),
    licenseDataUrl: form.value.licenseDataUrl || '',
    legalIdFront: form.value.legalIdFront && form.value.legalIdFront.name ? form.value.legalIdFront.name : (form.value.legalIdFront || ''),
    legalIdFrontDataUrl: form.value.legalIdFrontDataUrl || '',
    legalIdBack: form.value.legalIdBack && form.value.legalIdBack.name ? form.value.legalIdBack.name : (form.value.legalIdBack || ''),
    legalIdBackDataUrl: form.value.legalIdBackDataUrl || '',
    bankPermit: form.value.bankPermit && form.value.bankPermit.name ? form.value.bankPermit.name : (form.value.bankPermit || ''),
    bankPermitDataUrl: form.value.bankPermitDataUrl || '',
    authLetter: form.value.authLetter && form.value.authLetter.name ? form.value.authLetter.name : (form.value.authLetter || ''),
    authLetterDataUrl: form.value.authLetterDataUrl || '',
    seal: form.value.seal && form.value.seal.name ? form.value.seal.name : (form.value.seal || ''),
    sealDataUrl: form.value.sealDataUrl || ''
  };
  try {
    await updateOwner(payload as any);
    message.value = '保存成功';
    setTimeout(() => router.push('/operation/member/inventory/list'), 500);
  } catch (e: any) {
    message.value = e?.message || '保存失败';
  }
}

function onFileChange(type: 'license' | 'seal' | 'legalIdFront' | 'legalIdBack' | 'bankPermit' | 'authLetter', e: Event) {
  const files = (e.target as HTMLInputElement).files;
  if (files && files.length > 0) {
    const file = files[0];
    form.value[type] = file;
    const reader = new FileReader();
    reader.onload = () => { form.value[type + 'DataUrl'] = reader.result as string; };
    reader.readAsDataURL(file);
  }
}

function fileLabel(v: any) { return v?.name ? v.name : v; }
function editPreview(field: string): string | '' {
  if (!form.value) return '';
  const dataUrl = form.value[field + 'DataUrl'];
  if (dataUrl) return dataUrl;
  const name = form.value[field];
  if (!name) return '';
  return ownerFileUrl(Number(route.params.id), field as any, fileLabel(name));
}
function goBack() { router.push('/operation/member/inventory/list'); }

function clearUpload(type: 'license'|'seal'|'legalIdFront'|'legalIdBack'|'bankPermit'|'authLetter') {
  if (!form.value) return;
  form.value[type] = null;
  form.value[type + 'DataUrl'] = '';
}
</script>

<style scoped>
.create-owner-container {
  max-width: 960px;
  margin: 24px auto;
  padding: 12px;
  border: none;
  border-radius: 14px;
  box-shadow: 0 10px 24px rgba(15,23,42,.08), inset 0 1px 0 rgba(255,255,255,.5);
  background: linear-gradient(180deg, rgba(255,255,255,.22), rgba(236,244,255,.20));
  backdrop-filter: saturate(1.1) blur(12px);
}
.detail-header { display:flex; align-items:center; gap:12px; margin-bottom: 8px; }
.btn-back { height: 28px; padding: 0 10px; border-radius: 999px; border: 1px solid rgba(148,163,184,.28); background: linear-gradient(180deg, rgba(255,255,255,.66), rgba(248,250,252,.72)); cursor: pointer; font-size:12px; color:#334155; transition: transform .12s ease, box-shadow .12s ease, border-color .12s ease; box-shadow: inset 0 1px 0 rgba(255,255,255,.6), 0 3px 8px rgba(15,23,42,.06); }
.btn-back:hover { transform: translateY(-1px); box-shadow: inset 0 1px 0 rgba(255,255,255,.7), 0 8px 16px rgba(15,23,42,.10); border-color: rgba(59,130,246,.45); }
.create-owner-container h2 { margin: 0 0 8px; font-size: 20px; font-weight: 600; color:#0f172a; }
.create-owner-container h3 { position: relative; margin: 20px 0 12px; padding-left: 12px; font-size: 14px; color:#1e40af; }
.create-owner-container h3::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 4px; height: 14px; border-radius: 2px; background: linear-gradient(180deg,#60a5fa,#2563eb); }
.create-owner-container form > div { display: grid; grid-template-columns: 180px 1fr; align-items: center; gap: 8px 12px; margin-bottom: 10px; background: transparent; }
.create-owner-container label { display: block; color:#475569; font-size: 13px; }
.create-owner-container input { height: 34px; padding: 0 10px; border: 1px solid rgba(148,163,184,.28); border-radius: 10px; font-size: 13px; background: rgba(255,255,255,.7); backdrop-filter: blur(4px); }
.create-owner-container input[type="file"] { height: auto; padding: 6px 10px; }
.create-owner-container input:focus { outline: none; border-color:#93c5fd; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
.file-name { margin-left: 8px; color: #666; font-size: 12px; }
.upload-preview { display:inline-block; height: 52px; margin-left: 8px; border: 1px solid #e5e7eb; border-radius: 8px; vertical-align: middle; background:#fff; }
.create-owner-container .btn-primary { margin-top: 8px; height: 32px; padding: 0 14px; border-radius: 999px; border: 1px solid rgba(37,99,235,.35); background: linear-gradient(180deg, rgba(59,130,246,.18), rgba(37,99,235,.16)); color:#0f172a; cursor: pointer; font-size: 13px; transition: transform .12s ease, box-shadow .12s ease, border-color .12s ease, background .2s ease; backdrop-filter: blur(6px); box-shadow: inset 0 1px 0 rgba(255,255,255,.6), 0 3px 8px rgba(15,23,42,.06); }
.create-owner-container .btn-primary:hover { transform: translateY(-1px); box-shadow: inset 0 1px 0 rgba(255,255,255,.7), 0 8px 16px rgba(15,23,42,.10); border-color: rgba(59,130,246,.45); }
.message { color: #16a34a; margin-top: 16px; font-size: 13px; }
.mini{ margin-left:6px; height:24px; padding:0 10px; border:1px solid rgba(148,163,184,.28); border-radius:999px; background: linear-gradient(180deg, rgba(255,255,255,.66), rgba(248,250,252,.72)); cursor:pointer; font-size:12px; color:#334155; transition: transform .12s ease, box-shadow .12s ease, border-color .12s ease; box-shadow: inset 0 1px 0 rgba(255,255,255,.6), 0 3px 8px rgba(15,23,42,.06); }
.mini:hover{ transform: translateY(-1px); box-shadow: inset 0 1px 0 rgba(255,255,255,.7), 0 8px 16px rgba(15,23,42,.10); border-color: rgba(59,130,246,.35); }
</style>


