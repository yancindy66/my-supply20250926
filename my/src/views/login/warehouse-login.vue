<template>
  <div class="login-card">
    <h2>仓储人员登录</h2>
    <form @submit.prevent="onSubmit">
      <label>用户名<input v-model.trim="username" required /></label>
      <label>密码<input v-model.trim="password" type="password" required /></label>
      <button type="submit" :disabled="loading">{{ loading ? '登录中...' : '登录' }}</button>
    </form>
    <p v-if="msg" class="msg">{{ msg }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { login } from '../../api/auth';
const router = useRouter();
const username = ref('');
const password = ref('');
const loading = ref(false);
const msg = ref('');
async function onSubmit(){
  loading.value=true; msg.value='';
  try{
    const res = await login({ role:'warehouse', username: username.value, password: password.value });
    localStorage.setItem('authToken', res.token);
    localStorage.setItem('currentRole', 'warehouse');
    router.push('/warehouse/dashboard');
  }catch(e:any){ msg.value=e?.message||'登录失败'; } finally { loading.value=false; }
}
</script>

<style scoped>
.login-card{ max-width: 400px; margin: 80px auto; padding: 24px; border:1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 10px 24px rgba(2,6,23,0.06); background:#fff; }
h2{ margin:0 0 12px; font-size:18px; }
form{ display:grid; gap:10px; }
label{ display:grid; gap:6px; font-size:12px; color:#475569; }
input{ height:34px; padding:0 10px; border:1px solid #e5e7eb; border-radius:8px; }
button{ height:34px; border:none; border-radius:10px; background:linear-gradient(180deg,#3b82f6,#2563eb); color:#fff; cursor:pointer; }
.msg{ margin-top:8px; color:#dc2626; font-size:12px; }
</style>


