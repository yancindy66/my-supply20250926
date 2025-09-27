<template>
  <div class="login-layout">
    <!-- 左侧：登录面板（位于左侧，底部含欢迎文案） -->
    <section class="panel">
      <div class="brand">探索未来之境</div>
      <div class="panel-card">
        <form @submit.prevent="onLogin" class="form">
          <label>角色</label>
          <select v-model="role" required>
            <option value="operation">平台运营</option>
            <option value="inventory">存货人</option>
            <option value="warehouse">仓储机构</option>
            <option value="financial">金融机构</option>
            <option value="guarantee">担保机构</option>
          </select>
          <label>用户</label>
          <input id="username" v-model="username" type="text" required placeholder="请输入您的用户名" />
          <label>密码</label>
          <input id="password" v-model="password" type="password" required placeholder="请输入您的密码" />
          <div class="actions">
            <button type="submit">登录</button>
            <button type="button" class="ghost" @click="goRole">重置角色</button>
          </div>
        </form>
        <div v-if="message" class="msg">{{ message }}</div>
        <div class="welcome-footer">欢迎登录 · 探索未来之境</div>
      </div>
    </section>
    
    <!-- 右侧：AI 对话（全幅） -->
    <section class="ai-pane">
      <div class="rings"></div>
      <div class="stars"></div>
      <!-- 中心发光蓝色光圈 + 透明玻璃魔方 -->
      <div class="halo"></div>
      <div class="glass-cube" :style="cubeStyle" @mousedown="onMouseDown" @touchstart.prevent="onTouchStart">
        <div class="gface g1" @click="goTool('excel')">GPT + Excel</div>
        <div class="gface g2" @click="goTool('tripo')">GPT + TRIPO</div>
        <div class="gface g3" @click="goTool('canva')">GPT + Canva</div>
        <div class="gface g4" @click="goTool('mermaid')">GPT + Mermaid</div>
        <div class="gface g5" @click="goTool('wps')">GPT + WPS</div>
        <div class="gface g6" @click="goTool('flow')">GPT + Flow</div>
      </div>
      <div class="chat-pane bottom glass">
        <div class="chat-header">AI 助手</div>
        <div class="chat-body" ref="loginChatBodyRef">
          <div v-for="(m,i) in loginMessages" :key="i" class="msg" :class="m.role">
            <div class="bubble">{{ m.text }}</div>
          </div>
        </div>
        <div class="chat-input">
          <input v-model="loginInput" placeholder="向 AI 提问：例如 用 Excel 统计上月入库数据" @keyup.enter="loginSend" />
          <button @click="loginSend">发送</button>
      </div>
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
const role = ref(localStorage.getItem('role') || 'operation');

function onLogin() {
  if (username.value && password.value) {
    try {
      localStorage.setItem('authToken', 'mock-token');
      // 登录后，根据是否已选择角色决定去向
    } catch {}
    try{ localStorage.setItem('role', String(role.value||'operation')); }catch{}
    const r = localStorage.getItem('role');
    if (r) {
      router.push('/dashboard');
    } else {
      message.value = '请选择角色';
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

// 底部对话Dock（角色页）
const dockInput = ref('');
function dockSend(){ const t=dockInput.value.trim(); if(!t) return; dockInput.value=''; alert('（占位）AI已收到：'+t); }

// 工具跳转：点击魔方 -> 平滑进入各功能实验页（先实现 excel）
function goTool(key: string){
  if(key==='excel'){
    router.push('/lab/excel');
    return;
  }
  // 其他工具占位：后续新增路由
  message.value = '即将开放：'+key.toUpperCase();
}

// 登录页右侧全幅聊天
const loginMessages = ref<Array<{role:'user'|'assistant'; text:string}>>([
  { role:'assistant', text:'你好，我是平台 AI 助手。可以和 Excel/Canva/WPS 等工具协作完成任务。' }
]);
const loginInput = ref('');
const loginChatBodyRef = ref<HTMLElement|null>(null);
function loginSend(){ const t=loginInput.value.trim(); if(!t) return; loginMessages.value.push({role:'user', text:t}); loginInput.value='';
  setTimeout(()=>{ loginMessages.value.push({role:'assistant', text:'（占位回复）我已理解你的需求：'+t}); try{ const el=loginChatBodyRef.value; if(el) el.scrollTop=el.scrollHeight; }catch{} }, 250);
}
</script>

<style scoped>
.login-layout{ min-height:100vh; display:grid; grid-template-columns:360px 1fr; gap:24px; padding:28px; background:linear-gradient(135deg,#f0f6ff 0%,#ffffff 60%); }
.panel{ display:flex; flex-direction:column; gap:16px; }
.brand{ height:64px; display:flex; align-items:center; justify-content:center; color:#0f172a; font-weight:700; letter-spacing:.2em; background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; box-shadow:0 8px 24px rgba(2,6,23,.06); }
.panel-card{ position:relative; flex:1; background:#fff; border:1px solid #e2e8f0; border-radius:12px; box-shadow:0 10px 24px rgba(2,6,23,.06); padding:20px; display:flex; flex-direction:column; justify-content:flex-end; min-height:520px; }
.panel-card h2{ margin:0 0 16px; }
.form{ display:flex; flex-direction:column; gap:10px; }
.form label{ color:#334155; font-size:14px; }
.form input, .form select{ height:38px; padding:0 10px; border:1px solid #e2e8f0; border-radius:8px; }
.actions{ display:flex; gap:10px; margin-top:6px; }
.actions button{ flex:1; height:38px; border:none; border-radius:8px; background:#2563eb; color:#fff; cursor:pointer; }
.actions .ghost{ background:#f1f5f9; color:#0f172a; }
.msg{ margin-top:8px; color:#16a34a; }
.welcome-footer{ margin-top:16px; text-align:center; color:#64748b; font-size:12px; }

.cube-pane{ position:relative; border:1px solid #e2e8f0; border-radius:16px; background:#f8fbff; box-shadow:0 12px 28px rgba(2,6,23,.06); overflow:hidden; display:flex; flex-direction:column; align-items:center; justify-content:center; }
.ai-pane{ position:relative; border:1px solid rgba(255,255,255,0.06); border-radius:16px; background:linear-gradient(140deg,#0b1226 0%,#0f1d3a 45%,#162a59 100%); box-shadow:0 12px 28px rgba(2,6,23,.25); overflow:hidden; display:flex; align-items:center; justify-content:center; }
.rings{ position:absolute; inset:0; display:flex; align-items:center; justify-content:center; }
.rings::before{ content:''; position:absolute; width:1200px; height:1200px; border-radius:50%; background:
  radial-gradient(circle at center, rgba(37,99,235,.20) 0 2px, transparent 2px) 0 0/24px 24px,
  radial-gradient(circle at center, rgba(37,99,235,.10) 0 1px, transparent 1px) 0 0/12px 12px; mask: radial-gradient(circle at center, #000 30%, transparent 31%);
  opacity:.65; filter: blur(.2px); animation:pulse 3.2s ease-in-out infinite;
}
@keyframes pulse{ 0%{ transform: scale(.98); opacity:.55 } 50%{ transform: scale(1.02); opacity:.8 } 100%{ transform: scale(.98); opacity:.55 } }
/* 环形扫描（发光扇形沿外环匀速旋转） */
.rings::after{ content:''; position:absolute; width:1200px; height:1200px; border-radius:50%;
  background: conic-gradient(from 0deg, rgba(99,102,241,0) 0deg, rgba(99,102,241,.65) 10deg, rgba(99,102,241,0) 20deg);
  mask: radial-gradient(circle at center, transparent 0 45%, #000 46% 47%, transparent 48% 100%);
  -webkit-mask: radial-gradient(circle at center, transparent 0 45%, #000 46% 47%, transparent 48% 100%);
  filter: blur(1px) drop-shadow(0 0 12px rgba(99,102,241,.55));
  animation: sweep 4s linear infinite;
}
@keyframes sweep { to { transform: rotate(360deg); } }
.rings::after{ display:none; }
.ai{ position:relative; z-index:1; font-size:160px; font-weight:800; letter-spacing:.1em; color:#64748b33; }

/* 简单粒子星点背景 */
.stars{ position:absolute; inset:0; pointer-events:none; background:
  radial-gradient(2px 2px at 10% 20%, rgba(99,102,241,.45), transparent 70%),
  radial-gradient(1.5px 1.5px at 30% 60%, rgba(99,102,241,.35), transparent 70%),
  radial-gradient(1.8px 1.8px at 60% 40%, rgba(99,102,241,.25), transparent 70%),
  radial-gradient(1.8px 1.8px at 80% 80%, rgba(99,102,241,.30), transparent 70%);
  animation: starsMove 14s linear infinite alternate;
}
@keyframes starsMove{ 0%{ transform: translateY(0) } 100%{ transform: translateY(-12px) } }

.halo{ position:absolute; width:min(62%,720px); aspect-ratio:1/1; border-radius:50%; z-index:1; }
.halo::before{ content:''; position:absolute; inset:0; border-radius:50%; box-shadow:0 0 140px 40px rgba(32,123,255,.25) inset, 0 0 160px 20px rgba(32,123,255,.25); background:
  radial-gradient(closest-side, rgba(30,144,255,.45) 0%, rgba(30,144,255,.15) 55%, rgba(30,144,255,0) 60%),
  radial-gradient(closest-side, transparent 64%, rgba(135,206,255,.35) 66%, transparent 68%);
  filter: blur(0.4px);
}

/* 玻璃拟态立方体（透明 + 折射高光） */
.glass-cube{ position:absolute; width:240px; height:240px; transform-style:preserve-3d; transform:rotateX(-18deg) rotateY(30deg); z-index:2; cursor:grab; }
.gface{ position:absolute; width:240px; height:240px; display:flex; align-items:center; justify-content:center; color:#e6f0ff; font-weight:600; text-shadow:0 0 8px rgba(0,119,255,.5); border-radius:12px; background: linear-gradient(145deg, rgba(255,255,255,.12), rgba(255,255,255,.02)); border:1px solid rgba(255,255,255,.18); box-shadow: inset 0 0 24px rgba(255,255,255,.12), 0 18px 50px rgba(3,23,78,.35); }
.g1{ transform: translateZ(120px); }
.g2{ transform: rotateY(180deg) translateZ(120px); }
.g3{ transform: rotateY(90deg) translateZ(120px); }
.g4{ transform: rotateY(-90deg) translateZ(120px); }
.g5{ transform: rotateX(90deg) translateZ(120px); }
.g6{ transform: rotateX(-90deg) translateZ(120px); }

/* 右侧对话面板玻璃风格 */
.chat-pane.bottom.glass{
  position:absolute; left:32px; right:32px; bottom:24px; height:220px;
  background: rgba(10,18,44,.35);
  border:1px solid rgba(255,255,255,.12);
  border-radius:14px;
  box-shadow: 0 10px 40px rgba(1,8,36,.45);
  backdrop-filter: blur(8px) saturate(140%);
  z-index:3; display:flex; flex-direction:column;
}
.chat-header{ padding:12px 16px; font-weight:600; color:#e6eeff; border-bottom:1px solid rgba(255,255,255,.12); }
.chat-body{ flex:1; overflow:auto; padding:12px 14px; }
.msg{ display:flex; margin:8px 0; }
.msg.assistant{ justify-content:flex-start; }
.msg.user{ justify-content:flex-end; }
.bubble{ max-width:72%; padding:10px 12px; border-radius:12px; line-height:1.5; font-size:14px; }
.msg.assistant .bubble{ background:rgba(255,255,255,.12); color:#e6eeff; border:1px solid rgba(255,255,255,.16); }
.msg.user .bubble{ background:#2563eb; color:#fff; }
.chat-input{ display:flex; gap:8px; padding:10px 12px; border-top:1px solid rgba(255,255,255,.12); }
.chat-input input{ flex:1; height:40px; border-radius:10px; border:1px solid rgba(255,255,255,.18); padding:0 12px; background:rgba(255,255,255,.08); color:#e6eeff; }
.chat-input button{ height:40px; padding:0 14px; border:none; border-radius:10px; background:#2563eb; color:#fff; cursor:pointer; }
.gpt-dock{ position:absolute; left:24px; right:24px; bottom:20px; display:flex; gap:8px; }
.gpt-dock input{ flex:1; height:40px; border-radius:10px; border:1px solid #dbeafe; padding:0 12px; background:#fff; box-shadow:0 6px 16px rgba(2,6,23,.06); }
.gpt-dock button{ height:40px; padding:0 14px; border:none; border-radius:10px; background:#2563eb; color:#fff; cursor:pointer; }
</style>
