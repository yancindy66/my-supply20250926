<template>
  <div class="create-owner-container">
    <h2>新增存货人</h2>
    <form @submit.prevent="onSubmit">
      <div>
        <label>公司名称：</label>
        <input v-model="form.company" required />
      </div>
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
      <div>
        <label>营业执照上传：</label>
        <input type="file" @change="onFileChange('license', $event)" />
      </div>
      <div>
        <label>法人公章上传：</label>
        <input type="file" @change="onFileChange('seal', $event)" />
      </div>
      <button type="submit">提交</button>
    </form>
    <div v-if="message" class="message">{{ message }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();
const form = ref({
  company: '',
  contact: '',
  phone: '',
  address: '',
  license: null as File | null,
  seal: null as File | null
});
const message = ref('');

function validateForm() {
  if (!form.value.company || !form.value.contact || !form.value.phone || !form.value.address) {
    message.value = '请填写所有必填项';
    return false;
  }
  if (!/^1[3-9]\d{9}$/.test(form.value.phone)) {
    message.value = '请输入正确的手机号';
    return false;
  }
  if (!form.value.license || !form.value.seal) {
    message.value = '请上传营业执照和法人公章';
    return false;
  }
  return true;
}

function onFileChange(type: 'license' | 'seal', e: Event) {
  const files = (e.target as HTMLInputElement).files;
  if (files && files.length > 0) {
    form.value[type] = files[0];
  }
}

async function onSubmit() {
  if (!validateForm()) return;
  const payload = {
    company: form.value.company,
    contact: form.value.contact,
    phone: form.value.phone,
    address: form.value.address,
    license: form.value.license ? form.value.license.name : '',
    seal: form.value.seal ? form.value.seal.name : ''
  };
  const res = await fetch('/api/inventory-owner/create', {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (data.code === 0) {
    message.value = '提交成功';
    setTimeout(() => router.push('/member/inventory-owner'), 500);
  } else {
    message.value = data.msg || '提交失败';
  }
}
</script>

<style scoped>
.create-owner-container {
  max-width: 400px;
  margin: 80px auto;
  padding: 32px;
  border: 1px solid #eee;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  background: #fff;
}
.create-owner-container label {
  display: inline-block;
  width: 100px;
}
.create-owner-container input {
  margin-bottom: 12px;
}
.message {
  color: green;
  margin-top: 16px;
}
</style>
