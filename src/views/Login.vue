<template>
  <div class="login-page">
    <div class="login-card">
      <h1 class="login-title">运营平台登录</h1>
      <form @submit.prevent="onLogin" class="login-form">
        <input id="username" v-model="username" type="text" required placeholder="用户名" class="input-lg" />
        <input id="password" v-model="password" type="password" required placeholder="密码" class="input-lg" />
        <button type="submit" class="btn-lg">登录</button>
      </form>
      <div v-if="message" class="message">{{ message }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { ref } from 'vue';
import { useRouter } from 'vue-router';

const username = ref('');
const password = ref('');
const message = ref('');
const router = useRouter();

function onLogin() {
  if (username.value && password.value) {
    try {
      localStorage.setItem('authToken', 'mock-token');
      // 登录后，根据是否已选择角色决定去向
    } catch {}
    const role = localStorage.getItem('role');
    if (role) {
      router.push('/dashboard');
    } else {
      router.push('/role-select');
    }
  } else {
    message.value = '请输入用户名和密码';
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(800px 400px at 20% 10%, rgba(59,130,246,0.25), transparent 60%),
              radial-gradient(800px 400px at 80% 20%, rgba(14,165,233,0.2), transparent 60%),
              linear-gradient(135deg, #0ea5e9 0%, #2563eb 50%, #1e40af 100%);
  padding: 24px;
}
.login-card {
  background: rgba(255,255,255,0.86);
  padding: 40px;
  border-radius: var(--radius-lg);
  box-shadow: 0 18px 40px rgba(30,64,175,0.28), 0 8px 20px rgba(14,165,233,0.18);
  width: 100%;
  max-width: 400px;
}
.login-title {
  text-align: center;
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 2rem;
}
.login-form { display: flex; flex-direction: column; gap: 12px; }
.input-lg {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: #fff;
}
.btn-lg {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 500;
  cursor: pointer;
}
.btn-lg:hover { background-color: var(--color-primary-hover); }
.message { margin-top: 16px; text-align: center; color: var(--color-success); }
</style>
