<template>
  <div class="create-owner-container" v-if="form">
    <h2>编辑存货人</h2>
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
      <button type="submit">保存</button>
    </form>
    <div v-if="message" class="message">{{ message }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
const route = useRoute();
const router = useRouter();
const message = ref('');
const form = ref<any>(null);

onMounted(async () => {
  const id = route.params.id;
  const res = await fetch(`/api/inventory-owner/detail?id=${id}`);
  const data = await res.json();
  if (data.code === 0) {
    form.value = data.data;
  } else {
    message.value = '加载失败';
  }
});

async function onSubmit() {
  const res = await fetch('/api/inventory-owner/update', {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form.value)
  });
  const data = await res.json();
  if (data.code === 0) {
    message.value = '保存成功';
    setTimeout(() => router.push('/member/inventory-owner'), 500);
  } else {
    message.value = data.msg || '保存失败';
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
.message {
  color: green;
  margin-top: 16px;
}
</style>
