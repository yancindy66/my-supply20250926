<template>
  <div class="welcome-container">
    <h2>欢迎页面</h2>
    <p>登录成功，欢迎来到系统！</p>
      <button @click="goApply">去入库申请</button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
const router = useRouter();
function goApply() {
  router.push('/storage-apply');
}
</script>

<style scoped>
.welcome-container {
  max-width: 320px;
  margin: 80px auto;
  padding: 32px;
  border: 1px solid #eee;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  background: #fff;
  text-align: center;
}
button {
  margin-top: 24px;
  padding: 10px 24px;
  background: #42b983;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}
</style>
