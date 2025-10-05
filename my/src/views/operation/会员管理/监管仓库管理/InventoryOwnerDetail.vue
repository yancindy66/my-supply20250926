<template>
  <div class="owner-detail-container" v-if="detail">
    <h2>存货人详情</h2>
    <div><strong>公司名称：</strong>{{ detail.company }}</div>
    <div><strong>联系人：</strong>{{ detail.contact }}</div>
    <div><strong>电话：</strong>{{ detail.phone }}</div>
    <div><strong>地址：</strong>{{ detail.address }}</div>
    <div><strong>营业执照：</strong>{{ detail.license && detail.license.name ? detail.license.name : detail.license }}</div>
    <div><strong>法人公章：</strong>{{ detail.seal && detail.seal.name ? detail.seal.name : detail.seal }}</div>
  </div>
  <div v-else class="error">未找到数据</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
const route = useRoute();
const detail = ref<any>(null);

onMounted(async () => {
  const id = route.params.id;
  const res = await fetch(`/api/inventory-owner/detail?id=${id}`);
  const data = await res.json();
  if (data.code === 0) {
    detail.value = data.data;
  } else {
    detail.value = null;
  }
});
</script>

<style scoped>
.owner-detail-container {
  max-width: 400px;
  margin: 80px auto;
  padding: 32px;
  border: 1px solid #eee;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  background: #fff;
}
.error {
  color: red;
  text-align: center;
  margin-top: 80px;
}
</style>
