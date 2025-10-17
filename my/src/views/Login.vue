<template>
  <div class="login-layout">
    <!-- 左侧：登录面板（位于左侧，底部含欢迎文案） -->
    <section class="panel">
        <div class="panel-card">
          <div class="brand-row">
          <img v-if="logoSrc" class="logo" :src="logoSrc" alt="logo" />
            <div class="tag">探索未来之境</div>
        </div>
          
        <form @submit.prevent="onLogin" class="form">
          <label>角色</label>
          <select v-model="role" required>
            <option value="operation">平台运营</option>
            <option value="inventory">存货人</option>
            <option value="warehouse">仓储机构</option>
            <option value="financial">金融机构</option>
            <option value="guarantee">担保机构</option>
          </select>
          <label>账号</label>
          <input id="username" v-model="username" type="text" required placeholder="手机/邮箱/用户名" />
          <label>密码</label>
          <input id="password" v-model="password" type="password" required placeholder="请输入密码" />
          <div class="inline">
            <input v-model="captcha" placeholder="验证码" />
            <button type="button" class="ghost small" :disabled="smsWait>0" @click="sendSms">{{ smsWait>0 ? `${smsWait}s` : '获取验证码' }}</button>
      </div>
          <div class="inline-check">
            <label class="remember"><input type="checkbox" v-model="remember" /> 记住我</label>
            <a class="link" href="javascript:void(0)">忘记密码？</a>
      </div>
          <div class="actions">
      <button type="submit">登录</button>
            <button type="button" class="ghost" @click="router.push('/register')">注册新账号</button>
            <button type="button" class="ghost" @click="previewLogin">快速预览</button>
          </div>
          <div class="social-row cute">
            <span>快捷登录：</span>
            <button type="button" class="s cute face" title="刷脸登录" @click="loginWithFace">🙂</button>
            <button type="button" class="s cute finger" title="指纹登录" @click="loginWithFingerprint">🔒</button>
            <button type="button" class="s cute wechat" title="微信登录" aria-label="微信登录" @click="loginWithWeChat">微信</button>
          </div>
    </form>
        <div v-if="message" class="msg">{{ message }}</div>
        <div class="welcome-footer">为确保账号安全，请勿在公共设备保存密码</div>
      </div>
    </section>
    
    <!-- 右侧：星云背景 + 中央全息AI + 右侧魔方 -->
    <section class="ai-pane">
      <div class="rings"></div>
      <div class="stars"></div>
      <!-- 静态光晕已移除 -->
      <div class="screen-pulse"></div>
      <div class="trails"></div>
      <div class="ai-word">AI</div>
      <div class="ripple">
        <span class="ring r1"></span>
        <span class="ring r2"></span>
        <span class="ring r3"></span>
        <span class="ring r4"></span>
        <span class="ring r5"></span>
        <span class="dots"></span>
      </div>
      <div class="cube-wrap">
        <div class="glass-cube" :style="cubeStyle" @mousedown="onMouseDown" @touchstart.prevent="onTouchStart">
          <div class="gface g1" @click="goTool('sheet')">
            <span class="gtext">GPT+EXCEL</span>
          </div>
          <div class="gface g2"></div>
          <div class="gface g3" @click="goTool('sheet')">
            <span class="gtext">AI SHEET</span>
          </div>
          <div class="gface g4"></div>
          <div class="gface g5"></div>
          <div class="gface g6"></div>
          <div class="eline e-top"></div>
          <div class="eline e-left"></div>
          <div class="eline e-right"></div>
        </div>
      </div>
      <div class="gpt-bar">
        <input placeholder="向 GPT 发送问题..." />
        <button>发送</button>
      </div>
      
      <!-- 微信扫码登录弹窗 -->
      <div v-if="showWechat" class="wx-mask" @click="closeWechat">
        <div class="wx-modal" @click.stop>
          <div class="wx-title">微信扫码登录</div>
          <div class="wx-body">
            <img v-if="wechatQrUrl" :src="wechatQrUrl" alt="wechat-qr" />
            <div class="wx-tip">请使用微信扫描二维码完成登录</div>
          </div>
          <div class="wx-actions">
            <button class="ghost" @click="closeWechat">取消</button>
          </div>
        </div>
      </div>

    </section>
  </div>
</template>

<script setup lang="ts">

import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { login as apiLogin, me as apiMe } from '@/api/auth';

const username = ref('');
const password = ref('');
const captcha = ref('');
const smsWait = ref(0);
let smsTimer: any = null;
function sendSms(){
  if(smsWait.value>0) return;
  smsWait.value = 60;
  smsTimer && clearInterval(smsTimer);
  smsTimer = setInterval(()=>{
    smsWait.value -= 1;
    if(smsWait.value<=0){ clearInterval(smsTimer); smsTimer=null; smsWait.value=0; }
  },1000);
}
const remember = ref(false);
const message = ref('');
const router = useRouter();
const role = ref(localStorage.getItem('role') || 'operation');
const logoSrc = (typeof window !== 'undefined' && window.location) ? undefined : undefined;

async function onLogin() {
  if (!username.value || !password.value) { message.value='请输入用户名和密码'; return; }
  message.value = '';
  try {
    const resp = await apiLogin({ username: username.value, password: password.value });
    const token = (resp as any)?.data?.token || '';
    if (!token) { message.value = '登录失败'; return; }
    try { localStorage.setItem('auth_token', token); } catch {}
    const info = await apiMe();
    try { localStorage.setItem('auth_user_json', JSON.stringify((info as any)?.user || { id:1, username: username.value })); } catch {}
    // 根据后端返回的角色与类型确定首页
    const roles = (info as any)?.roles || [];
    const type = (info as any)?.user?.type || '';
    const roleKey = roles[0]?.role_key || type || 'platform';
    try { localStorage.setItem('role', roleKey); } catch {}
    router.push(homeByRole(mapRoleKeyToRoute(roleKey)));
  } catch(e:any) {
    message.value = '登录失败，请重试';
  }
}

function rolePreviewHome(roleKey: string){
  if (roleKey==='operation') return '/dashboard';
  if (roleKey==='inventory') return '/inbound/order/list';
  if (roleKey==='warehouse') return '/warehouse/list';
  if (roleKey==='financial') return '/financing/list';
  if (roleKey==='guarantee') return '/guarantee/dashboard';
  if (roleKey==='regulator') return '/monitor/overview';
  return '/dashboard';
}
function previewLogin(){
  try{ localStorage.setItem('auth_token','preview'); }catch{}
  try{ localStorage.setItem('role', String(role.value||'operation')); }catch{}
  router.push(rolePreviewHome(String(role.value||'operation')));
}

// 三种快捷登录（占位实现：调用后端 /api/auth/*，失败则给出提示）
// 现已在 Nginx 开启 CORS，可在开发环境直连线上域名
const API_BASE = (typeof import.meta!=='undefined' && (import.meta as any).env && (import.meta as any).env.DEV)
  ? String((import.meta as any).env.VITE_BACKEND_TARGET || '')
  : '';
async function postJSON(url: string, body: any){
  const res = await fetch(API_BASE + url, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(body||{}) });
  if(!res.ok) throw new Error('HTTP '+res.status);
  return await res.json();
}
function mapRoleKeyToRoute(roleKey: string) {
  if (roleKey==='platform' || roleKey==='platform_admin' || roleKey==='operation') return 'operation';
  if (roleKey==='depositor' || roleKey==='inventory') return 'inventory';
  if (roleKey==='warehouse' || roleKey==='warehouse_manager') return 'warehouse';
  if (roleKey==='financial' || roleKey==='financial_org') return 'financial';
  if (roleKey==='guarantee' || roleKey==='guarantee_org') return 'guarantee';
  if (roleKey==='regulator') return 'regulator';
  return 'operation';
}
function homeByRole(r: string){
  switch(r){
    case 'operation': return '/dashboard';
    case 'inventory': return '/inbound/order/list';
    case 'warehouse': return '/warehouse/list';
    case 'financial': return '/financing/list';
    case 'guarantee': return '/guarantee/dashboard';
    case 'regulator': return '/monitor/overview';
    default: return '/dashboard';
  }
}
async function loginSuccess(token: string, r?: string){
  try{ localStorage.setItem('authToken', token||'mock-token'); }catch{}
  try{ localStorage.setItem('role', String(r||role.value||'operation')); }catch{}
  const currentRole = String(r||role.value||'operation');
  router.push(homeByRole(currentRole));
}
async function loginWithWeChat(){
  message.value = '';
  try{
    // 不再从前端传角色，后端按注册绑定的角色返回
    const data = await postJSON('/api/auth/wechat/qr', { scene: 'login' });
    if(data?.token){ await loginSuccess(data.token); return; }
    // 打开弹窗显示二维码并开始轮询
    showWechat.value = true;
    wechatScene.value = String(data?.scene || ('SCN-'+Date.now()));
    wechatQrUrl.value = String(data?.qr_url || `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent('WECHAT_LOGIN_'+wechatScene.value)}`);
    startWechatPolling();
  }catch(e){
    // 失败也给出占位弹窗，便于联调与UI确认
    showWechat.value = true;
    wechatScene.value = 'SCN-DEMO-'+Date.now();
    wechatQrUrl.value = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent('WECHAT_LOGIN_'+wechatScene.value)}`;
    message.value = '微信登录接口未就绪，已展示占位二维码';
  }
}
async function loginWithFace(){
  message.value = '';
  try{
    const data = await postJSON('/api/auth/face', { scene: 'login' });
    if(data?.token){ await loginSuccess(data.token); return; }
    message.value = '刷脸登录已发起';
  }catch(e){ message.value = '刷脸登录暂不可用'; }
}
async function loginWithFingerprint(){
  message.value = '';
  try{
    const data = await postJSON('/api/auth/fingerprint', { scene: 'login' });
    if(data?.token){ await loginSuccess(data.token); return; }
    message.value = '指纹登录已发起';
  }catch(e){ message.value = '指纹登录暂不可用'; }
}

// 微信轮询弹窗
const showWechat = ref(false);
const wechatQrUrl = ref('');
const wechatScene = ref('');
let wechatTimer: any = null;
function startWechatPolling(){
  wechatTimer && clearInterval(wechatTimer);
  const startedAt = Date.now();
  wechatTimer = setInterval(async ()=>{
    if(Date.now()-startedAt > 120000){ // 2 分钟超时
      clearInterval(wechatTimer); wechatTimer=null; message.value='微信二维码已过期，请重试'; showWechat.value=false; return;
    }
    try{
      const res = await fetch(`${API_BASE}/api/auth/wechat/status?scene=${encodeURIComponent(wechatScene.value)}`);
      if(res.ok){
        const data = await res.json();
        if(data?.token){ clearInterval(wechatTimer); wechatTimer=null; showWechat.value=false; await loginSuccess(data.token, data?.role); }
        if(data?.status==='expired'){ clearInterval(wechatTimer); wechatTimer=null; message.value='二维码已过期，请重试'; showWechat.value=false; }
      }
    }catch(_){ /* 忽略单次错误，继续轮询 */ }
  }, 2000);
}
function closeWechat(){
  showWechat.value=false; wechatTimer && clearInterval(wechatTimer); wechatTimer=null;
}

function goRole(){ router.push('/role-select'); }

// 右侧立方体轻交互
const rotX = ref(-28); const rotY = ref(32);
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

// 工具跳转：点击魔方 -> 平滑进入各功能实验页（先实现 excel）
function goTool(key: string){
  if(key==='excel'){ router.push('/lab/excel'); return; }
  if(key==='sheet'){ router.push('/lab/sheet'); return; }
  // 其他工具占位：后续新增路由
  message.value = '即将开放：'+key.toUpperCase();
}


</script>

<style scoped>
/* 左右两栏：整体浅色（白→蓝灰）背景 */
.login-layout{ min-height:100vh; display:grid; grid-template-columns:480px 1fr; gap:0; padding:0; font-family: 'Inter', 'Noto Sans SC', 'Microsoft YaHei', 'Segoe UI', Arial, sans-serif; background:
  linear-gradient(180deg,#ffffff 0%, #f5f8ff 45%, #e9eef7 100%);
}
.panel{ display:flex; flex-direction:column; align-items:stretch; justify-content:flex-start; padding:40px 28px; }
.panel .panel-card{ width:100%; padding:28px 24px; border-radius:18px; backdrop-filter: blur(16px) saturate(170%); -webkit-backdrop-filter: blur(16px) saturate(170%); background:
  linear-gradient(180deg, rgba(255,255,255,.90), rgba(237,242,255,.78)),
  radial-gradient(800px 400px at 0% -10%, rgba(189,213,255,.35), transparent 60%),
  radial-gradient(600px 300px at 100% -10%, rgba(174,205,255,.28), transparent 64%);
  border:1px solid rgba(255,255,255,.85);
  box-shadow: 0 24px 54px rgba(2,6,23,.16), inset 0 1px 0 rgba(255,255,255,.8);
}
.brand-row{ display:flex; align-items:center; justify-content:flex-start; gap:12px; margin-bottom:12px; }
.brand-row .logo{ height:40px; opacity:.95; }
.brand-row .tag{ font-size:20px; font-weight:800; letter-spacing:.06em; color:#0f172a; }
.brand{ height:64px; display:flex; align-items:center; justify-content:center; color:#0f172a; font-weight:700; letter-spacing:.2em; background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; box-shadow:0 8px 24px rgba(2,6,23,.06); }
.panel-card{ position:relative; flex:1; background:#fff; border:1px solid #e2e8f0; border-radius:12px; box-shadow:0 10px 24px rgba(2,6,23,.06); padding:20px; display:flex; flex-direction:column; justify-content:flex-end; min-height:520px; }
.panel-card h2{ margin:0 0 16px; }
.form{ display:flex; flex-direction:column; gap:14px; margin-top:6px; }
.form label{ color:#334155; font-size:14px; }
.form input, .form select{ height:44px; padding:0 14px; border:1px solid rgba(2,6,23,.06); border-radius:12px; background:linear-gradient(180deg,rgba(255,255,255,.95),rgba(248,251,255,.88)); box-shadow:0 8px 18px rgba(2,6,23,.06), inset 0 1px 2px rgba(2,6,23,.03); font-size:15px; }
.form input::placeholder{ color:#94a3b8; }
.form input:focus, .form select:focus{ outline:none; border-color:#93c5fd; box-shadow:0 0 0 2px rgba(147,197,253,.35), 0 10px 22px rgba(2,6,23,.08); }
.inline{ display:flex; gap:10px; align-items:center; }
.inline .ghost.small{ height:44px; padding:0 12px; border-radius:12px; border:1px solid rgba(2,6,23,.06); background:linear-gradient(180deg,rgba(255,255,255,.94),rgba(246,249,255,.9)); box-shadow:0 6px 16px rgba(2,6,23,.06); color:#0f172a; font-weight:600; }
.inline .ghost.small:disabled{ opacity:.6; cursor:not-allowed; }
.inline-check{ display:flex; justify-content:space-between; align-items:center; font-size:13px; margin-top:2px; color:#667085; }
.inline-check .remember{ display:flex; align-items:center; gap:6px; }
.inline-check .link{ color:#2563eb; text-decoration:none; }
.inline-check .link:hover{ text-decoration:underline; }
.actions{ display:flex; gap:12px; margin-top:10px; }
.actions button{ flex:1; height:46px; border:none; border-radius:14px; background:linear-gradient(135deg,#2563eb,#3b82f6); color:#fff; cursor:pointer; box-shadow:0 12px 26px rgba(37,99,235,.28); font-weight:700; letter-spacing:.02em; }
.actions button:hover{ transform: translateY(-1px); box-shadow:0 16px 32px rgba(37,99,235,.32); }
.actions .ghost{ background:#f1f5f9; color:#0f172a; }
.msg{ margin-top:8px; color:#16a34a; }
.welcome-footer{ margin-top:16px; text-align:center; color:#64748b; font-size:12px; }
/* 快捷登录按钮：可爱玻璃风 */
.social-row{ display:flex; align-items:center; gap:12px; margin-top:18px; font-size:14px; color:#475569; }
.social-row.cute .s{ width:44px; height:44px; border-radius:12px; border:1px solid rgba(15,23,42,.08); background:linear-gradient(180deg,rgba(255,255,255,.96),rgba(245,248,255,.9)); display:flex; align-items:center; justify-content:center; font-size:20px; cursor:pointer; box-shadow:0 6px 18px rgba(2,6,23,.08), inset 0 2px 4px rgba(255,255,255,.5); transition: transform .15s ease, box-shadow .15s ease; }
.social-row.cute .s:hover{ transform: translateY(-2px); box-shadow:0 10px 22px rgba(2,6,23,.12), inset 0 2px 4px rgba(255,255,255,.6); }
.social-row.cute .s.face{ color:#0ea5e9; }
.social-row.cute .s.finger{ color:#10b981; }
/* WeChat 改为品牌色胶囊按钮，避免与图标块风格冲突 */
.social-row.cute .s.wechat{ height:40px; padding:0 16px; width:auto; border-radius:999px; border:none; font-size:14px; font-weight:700; letter-spacing:.02em; color:#fff; background:linear-gradient(135deg,#22c55e,#16a34a); box-shadow:0 8px 18px rgba(34,197,94,.28); }
.social-row.cute .s.wechat:hover{ transform: translateY(-2px); box-shadow:0 12px 26px rgba(34,197,94,.34); }

.cube-pane{ position:relative; border:1px solid #e2e8f0; border-radius:16px; background:#f8fbff; box-shadow:0 12px 28px rgba(2,6,23,.06); overflow:hidden; display:flex; flex-direction:column; align-items:center; justify-content:center; }
.ai-pane{ position:relative; width:100%; min-height:100vh; overflow:hidden; display:flex; align-items:center; justify-content:center; background:
  radial-gradient(1200px 800px at 60% 40%, rgba(180,200,255,.35), transparent 65%),
  radial-gradient(1400px 900px at 75% 60%, rgba(160,190,255,.22), transparent 68%),
  linear-gradient(180deg,#ffffff 0%, #f5f8ff 45%, #e9eef7 100%);
  border-left:1px solid #dbeafe; box-shadow: inset 20px 0 40px -40px rgba(15,23,42,.12); perspective: 600px; perspective-origin: 75% 35%; }
.ai-pane::before{ content:""; position:absolute; left:0; top:0; bottom:0; width:1px; background: linear-gradient(180deg,#dbeafe 0%, #c7d2fe 100%); opacity:.9; }
.rings{ display:none; }
.ai{ position:relative; z-index:1; font-size:160px; font-weight:800; letter-spacing:.1em; color:#64748b33; }

/* 简单粒子星点背景 */
.stars{ position:absolute; inset:0; pointer-events:none; background:
  radial-gradient(2px 2px at 8% 18%, rgba(120,150,200,.45), transparent 70%),
  radial-gradient(1.8px 1.8px at 22% 64%, rgba(120,150,200,.35), transparent 70%),
  radial-gradient(1.6px 1.6px at 66% 42%, rgba(120,150,200,.30), transparent 70%),
  radial-gradient(1.4px 1.4px at 82% 78%, rgba(120,150,200,.28), transparent 70%),
  radial-gradient(2px 2px at 44% 12%, rgba(120,150,200,.45), transparent 70%);
  animation: starsMove 14s linear infinite alternate; opacity:.8;
}
@keyframes starsMove{ 0%{ transform: translateY(0) } 100%{ transform: translateY(-12px) } }
/* 星轨 */
.trails{ position:absolute; inset:0; pointer-events:none; background:
  conic-gradient(from 90deg, rgba(160,190,255,.12), transparent 20%, rgba(160,190,255,.10) 40%, transparent 60%, rgba(160,190,255,.08) 80%, transparent),
  conic-gradient(from -90deg, rgba(160,190,255,.10), transparent 25%, rgba(160,190,255,.08) 50%, transparent 75%, rgba(160,190,255,.06));
  mask: radial-gradient(circle at center, rgba(0,0,0,.7) 0%, transparent 65%);
  animation: trail-rot 40s linear infinite;
}
@keyframes trail-rot{ to { transform: rotate(360deg); } }
/* 全幅扩散：AI 出光时带星点的波纹推开 */
.screen-pulse{ position:absolute; inset:-10%; pointer-events:none; background: radial-gradient(circle at center, rgba(120,180,255,.10), rgba(120,180,255,.0) 60%); mask: radial-gradient(circle at center, rgba(0,0,0,.8) 0, transparent 65%); -webkit-mask: radial-gradient(circle at center, rgba(0,0,0,.8) 0, transparent 65%); animation: screen-wave 3.2s ease-out infinite; opacity:.45; }
@keyframes screen-wave{ 0%{ transform: scale(.8); opacity:.45 } 80%{ transform: scale(1.6); opacity:.08 } 100%{ transform: scale(1.8); opacity:0 } }

.halo{ display:none; }
/* 中心全息AI文字 */
.ai-word{ position:absolute; left:50%; top:42%; transform: translate(-50%,-50%); font-size:136px; font-weight:800; letter-spacing:.12em; background: linear-gradient(180deg,#f5f7fa,#bfc7d5); -webkit-background-clip:text; background-clip:text; color:transparent; text-shadow: 0 0 18px rgba(170,200,255,.75), 0 0 80px rgba(140,180,255,.40); mix-blend-mode: screen; animation: ai-breathe 4s ease-in-out infinite, ai-flash 6s ease-in-out infinite; }
@keyframes ai-breathe{ 0%,100%{ filter: blur(.2px); opacity:.95; } 50%{ filter: blur(.6px); opacity:1; } }
@keyframes ai-flash{ 0%,20%,100%{ text-shadow: 0 0 18px rgba(170,200,255,.75), 0 0 80px rgba(140,180,255,.40); } 21%{ text-shadow: 0 0 28px rgba(190,220,255,1), 0 0 140px rgba(160,200,255,.65); } }
/* 涟漪扫描层 */
.ripple{ position:absolute; width:min(70%,900px); aspect-ratio:1/1; border-radius:50%; z-index:1; pointer-events:none; }
.ripple .ring{ position:absolute; left:50%; top:50%; width:36%; height:36%; border-radius:50%; border:2px solid rgba(160,190,255,.55); transform: translate(-50%,-50%); filter: blur(.4px); }
.ripple .r1{ animation: wave1 2.4s ease-out infinite; }
.ripple .r2{ animation: wave2 3.2s ease-out infinite .4s; border-color: rgba(120,180,255,.45); }
.ripple .r3{ animation: wave3 4.2s ease-out infinite .8s; border-color: rgba(120,180,255,.30); }
/* 更远两层，速度更慢更淡，蔓延至四角 */
.ripple .r4{ animation: wave4 6s ease-out infinite 1.2s; border-color: rgba(160,190,255,.20); }
.ripple .r5{ animation: wave5 8s ease-out infinite 1.6s; border-color: rgba(160,190,255,.12); }
@keyframes wave1{ 0%{ width:14%; height:14%; opacity:.9 } 100%{ width:100%; height:100%; opacity:0 } }
@keyframes wave2{ 0%{ width:18%; height:18%; opacity:.7 } 100%{ width:100%; height:100%; opacity:0 } }
@keyframes wave3{ 0%{ width:22%; height:22%; opacity:.55 } 100%{ width:100%; height:100%; opacity:0 } }
@keyframes wave4{ 0%{ width:26%; height:26%; opacity:.35 } 100%{ width:140%; height:140%; opacity:0 } }
@keyframes wave5{ 0%{ width:30%; height:30%; opacity:.25 } 100%{ width:180%; height:180%; opacity:0 } }
/* 序列点亮的扩散点阵 */
.ripple .dots{ position:absolute; inset:8% 8%; border-radius:50%; background:
  radial-gradient(2px 2px at 10% 20%, rgba(120,180,255,.0), transparent 70%),
  radial-gradient(2px 2px at 30% 60%, rgba(120,180,255,.0), transparent 70%),
  radial-gradient(2px 2px at 60% 40%, rgba(120,180,255,.0), transparent 70%),
  radial-gradient(2px 2px at 80% 80%, rgba(120,180,255,.0), transparent 70%);
  animation: dots-scan 2.4s linear infinite; mix-blend-mode: screen; opacity:.6; }
@keyframes dots-scan{ 0%{ filter: brightness(1) } 50%{ filter: brightness(1.6) } 100%{ filter: brightness(1) } }

/* 玻璃拟态立方体（透明 + 折射高光） */
.cube-wrap{ position:absolute; right:6%; top:10%; width:200px; height:200px; z-index:6; animation: cube-spin 28s linear infinite; transform-style:preserve-3d; will-change: transform; }
@keyframes cube-spin{ from{ transform: rotateY(0deg); } to{ transform: rotateY(360deg); } }
.glass-cube{ position:relative; width:200px; height:200px; transform-style:preserve-3d; cursor:grab; filter: drop-shadow(0 30px 80px rgba(100,160,255,.35)); will-change: transform; }
.gpt-bar{ position:absolute; left:50%; transform: translateX(-50%); bottom:6%; width:min(720px,68%); height:54px; display:flex; gap:8px; align-items:center; padding:8px; border-radius:14px; background: linear-gradient(180deg, rgba(255,255,255,.12), rgba(255,255,255,.06)); border:1px solid rgba(255,255,255,.25); backdrop-filter: blur(10px) saturate(140%); -webkit-backdrop-filter: blur(10px) saturate(140%); box-shadow: 0 12px 36px rgba(2,6,23,.35); }
.gpt-bar input{ flex:1; height:38px; border:none; border-radius:10px; padding:0 12px; background: rgba(255,255,255,.65); outline:none; }
.gpt-bar button{ height:38px; padding:0 16px; border:none; border-radius:10px; background: linear-gradient(135deg,#0ea5e9,#60a5fa); color:#fff; font-weight:600; cursor:pointer; box-shadow:0 8px 20px rgba(14,165,233,.45); }
/* 面通用样式（不设统一背景，按面赋色） */
.gface{ position:absolute; width:200px; height:200px; border-radius:12px; backface-visibility: hidden; -webkit-backface-visibility: hidden; border:1px solid rgba(255,255,255,.22); box-shadow: inset 0 0 28px rgba(255,255,255,.18), inset -14px -14px 32px rgba(0,0,0,.28), 0 18px 48px rgba(6,22,80,.45); backdrop-filter: blur(6px) saturate(140%); -webkit-backdrop-filter: blur(6px) saturate(140%); }
/* 玻璃质感：六面半透明+细腻高光，便于看到边与厚度 */
.g1{ background: linear-gradient(145deg, rgba(90,130,255,.28), rgba(40,70,210,.18)); }
.gtext{ position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); color:#e9efff; font-weight:700; letter-spacing:.08em; text-shadow:0 4px 18px rgba(0,10,60,.45); pointer-events:none; }
.g2{ background: linear-gradient(145deg, rgba(60,100,230,.24), rgba(30,60,180,.16)); }
.g3{ background: linear-gradient(145deg, rgba(75,115,245,.26), rgba(34,70,200,.16)); }
.g4{ background: linear-gradient(145deg, rgba(68,108,238,.24), rgba(30,62,188,.14)); }
.g5{ background: linear-gradient(145deg, rgba(96,138,255,.28), rgba(42,78,210,.18)); }
.g6{ background: linear-gradient(145deg, rgba(52,92,220,.24), rgba(24,54,160,.14)); }
/* 高光边与分界：模拟实体块 */
.gface::before{ content:''; position:absolute; inset:0; border-radius:12px; background: linear-gradient(180deg, rgba(255,255,255,.35), rgba(255,255,255,.0)); opacity:.28; mix-blend-mode: screen; }
.gface::after{ content:''; position:absolute; inset:0; border-radius:12px; box-shadow: inset -8px -8px 24px rgba(0,0,0,.25); opacity:.6; }
.g1{ transform: translateZ(100px); }
.g2{ transform: rotateY(180deg) translateZ(100px); }
.g3{ transform: rotateY(90deg) translateZ(100px); }
.g4{ transform: rotateY(-90deg) translateZ(100px); }
.g5{ transform: rotateX(90deg) translateZ(100px); }
.g6{ transform: rotateX(-90deg) translateZ(100px); }

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

/* 微信二维码弹窗 */
.wx-mask{ position:fixed; inset:0; background:rgba(2,6,23,.35); backdrop-filter: blur(2px); display:flex; align-items:center; justify-content:center; z-index:30; }
.wx-modal{ width:320px; border-radius:14px; background: linear-gradient(180deg,rgba(255,255,255,.98),rgba(244,248,255,.95)); border:1px solid rgba(255,255,255,.85); box-shadow:0 24px 54px rgba(2,6,23,.28); overflow:hidden; }
.wx-title{ padding:14px 16px; font-weight:800; letter-spacing:.04em; color:#0f172a; border-bottom:1px solid rgba(2,6,23,.06); }
.wx-body{ padding:16px; display:flex; flex-direction:column; align-items:center; gap:12px; }
.wx-body img{ width:220px; height:220px; border-radius:8px; background:#fff; border:1px solid #e2e8f0; box-shadow:0 8px 22px rgba(2,6,23,.08); }
.wx-tip{ color:#475569; font-size:13px; }
.wx-actions{ padding:12px 16px; display:flex; justify-content:flex-end; }
.wx-actions .ghost{ height:36px; padding:0 12px; border-radius:10px; border:1px solid rgba(2,6,23,.06); background:#f8fafc; }
</style>
