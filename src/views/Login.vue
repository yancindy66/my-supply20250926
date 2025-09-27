<template>
  <div class="login-layout">
    <!-- 左侧：登录面板 -->
    <section class="panel">
      <div class="brand">探索未来之境</div>
      <div class="panel-card">
        <form @submit.prevent="onLogin" class="form">
          <label>用户</label>
          <input id="username" v-model="username" type="text" required placeholder="请输入您的用户名" />
          <label>密码</label>
          <input id="password" v-model="password" type="password" required placeholder="请输入您的密码" />
          <div class="actions">
            <button type="submit">登录</button>
            <button type="button" class="ghost" @click="goRole">返回选角色</button>
          </div>
        </form>
        <div v-if="message" class="msg">{{ message }}</div>
        <div class="welcome-footer">欢迎登录 · 探索未来之境</div>
      </div>
    </section>

    <!-- 右侧：AI 场景（同构图风格） -->
    <section class="scene">
      <div class="rings">
        <div class="ai">AI</div>
      </div>
      <div class="cube" :style="cubeStyle" @mousedown="onMouseDown" @touchstart.prevent="onTouchStart">
        <div class="face f1">DeepSeek</div>
        <div class="face f2">WMS</div>
        <div class="face f3">Finance</div>
        <div class="face f4">Warehouse</div>
        <div class="face f5">Operate</div>
        <div class="face f6">API</div>
      </div>
      <div class="gpt-dock">
        <input v-model="dockInput" placeholder="试着向 AI 询问：如何找回密码？" @keyup.enter="dockSend" />
        <button @click="dockSend">发送</button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">

import { ref, onMounted } from 'vue';
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

function goRole(){ router.push('/role-select'); }

// 右侧立方体轻交互
const rotX = ref(-10); const rotY = ref(25);
let sx=0, sy=0; const dragging = ref(false);
const cubeStyle = ref('');
function updateCube(){ cubeStyle.value = `transform: rotateX(${rotX.value}deg) rotateY(${rotY.value}deg)`; }
function onMouseDown(e: MouseEvent){ dragging.value=true; sx=e.clientX; sy=e.clientY; window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp); }
function onMove(e: MouseEvent){ if(!dragging.value) return; rotY.value += (e.clientX-sx)*0.3; rotX.value -= (e.clientY-sy)*0.3; sx=e.clientX; sy=e.clientY; updateCube(); }
function onUp(){ dragging.value=false; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); }
function onTouchStart(e: TouchEvent){ const t=e.touches[0]; dragging.value=true; sx=t.clientX; sy=t.clientY; window.addEventListener('touchmove', onTouchMove,{passive:false}); window.addEventListener('touchend', onTouchEnd); }
function onTouchMove(e: TouchEvent){ if(!dragging.value) return; const t=e.touches[0]; rotY.value += (t.clientX-sx)*0.3; rotX.value -= (t.clientY-sy)*0.3; sx=t.clientX; sy=t.clientY; updateCube(); }
function onTouchEnd(){ dragging.value=false; window.removeEventListener('touchmove', onTouchMove); window.removeEventListener('touchend', onTouchEnd); }
onMounted(()=> updateCube());

// 底部对话Dock
const dockInput = ref('');
function dockSend(){ const t=dockInput.value.trim(); if(!t) return; dockInput.value=''; alert('（占位）AI已收到：'+t); }
</script>

<style scoped>
.login-layout{ min-height:100vh; display:flex; gap:24px; padding:28px; background:linear-gradient(135deg,#f0f6ff 0%,#ffffff 60%); }
.panel{ flex: 0 0 360px; display:flex; flex-direction:column; gap:16px; }
.brand{ height:64px; display:flex; align-items:center; justify-content:center; color:#0f172a; font-weight:700; letter-spacing:.2em; background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; box-shadow:0 8px 24px rgba(2,6,23,.06); }
.panel-card{ flex:1; background:#fff; border:1px solid #e2e8f0; border-radius:12px; box-shadow:0 10px 24px rgba(2,6,23,.06); padding:20px; display:flex; flex-direction:column; justify-content:space-between; }
.panel-card h2{ margin:0 0 16px; }
.form{ display:flex; flex-direction:column; gap:10px; }
.form label{ color:#334155; font-size:14px; }
.form input{ height:38px; padding:0 10px; border:1px solid #e2e8f0; border-radius:8px; }
.actions{ display:flex; gap:10px; margin-top:6px; }
.actions button{ flex:1; height:38px; border:none; border-radius:8px; background:#2563eb; color:#fff; cursor:pointer; }
.actions .ghost{ background:#f1f5f9; color:#0f172a; }
.msg{ margin-top:8px; color:#16a34a; }
.welcome-footer{ margin-top:16px; text-align:center; color:#64748b; font-size:12px; }

.scene{ position:relative; flex:1; border:1px solid #e2e8f0; border-radius:16px; background:#f8fbff; box-shadow:0 12px 28px rgba(2,6,23,.06); overflow:hidden; display:flex; align-items:center; justify-content:center; }
.rings{ position:absolute; inset:0; display:flex; align-items:center; justify-content:center; }
.rings::before{ content:''; position:absolute; width:1200px; height:1200px; border-radius:50%; background:
  radial-gradient(circle at center, rgba(37,99,235,.18) 0 2px, transparent 2px) 0 0/24px 24px,
  radial-gradient(circle at center, rgba(37,99,235,.10) 0 1px, transparent 1px) 0 0/12px 12px; mask: radial-gradient(circle at center, #000 30%, transparent 31%);
  opacity:.6; filter: blur(.2px);
}
.ai{ position:relative; z-index:1; font-size:160px; font-weight:800; letter-spacing:.1em; color:#64748b33; }

.cube{ position:relative; width:240px; height:240px; transform-style:preserve-3d; transition:transform .06s linear; }
.cube .face{ position:absolute; width:240px; height:240px; display:flex; align-items:center; justify-content:center; color:#0f172a; font-weight:600; border-radius:10px; background:linear-gradient(180deg,#ffffff,#eef4ff); border:1px solid #dbeafe; box-shadow:0 20px 40px rgba(2,6,23,.08); }
.cube .f1{ transform: translateZ(120px); }
.cube .f2{ transform: rotateY(180deg) translateZ(120px); }
.cube .f3{ transform: rotateY(90deg) translateZ(120px); }
.cube .f4{ transform: rotateY(-90deg) translateZ(120px); }
.cube .f5{ transform: rotateX(90deg) translateZ(120px); }
.cube .f6{ transform: rotateX(-90deg) translateZ(120px); color:#64748b; }
.gpt-dock{ position:absolute; left:24px; right:24px; bottom:20px; display:flex; gap:8px; }
.gpt-dock input{ flex:1; height:40px; border-radius:10px; border:1px solid #dbeafe; padding:0 12px; background:#fff; box-shadow:0 6px 16px rgba(2,6,23,.06); }
.gpt-dock button{ height:40px; padding:0 14px; border:none; border-radius:10px; background:#2563eb; color:#fff; cursor:pointer; }
</style>
