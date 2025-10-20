<template>
  <div class="login-layout">
    <!-- 左下角：极简登录面板（可隐藏/展开） -->
    <section class="panel" :class="{visible: showPanel}">
        <div class="panel-card">
          <button type="button" class="close-btn" @click="showPanel=false" aria-label="关闭登录面板">×</button>
          <div class="topline"></div>
          <div class="brand-row">
          <span class="tiles" aria-hidden="true">
            <i class="c1"></i><i class="c2"></i><i class="c3"></i><i class="c4"></i>
          </span>
              <div class="brand-text">
              <div class="title">汇融至信· 云 TrustFusion</div>
            </div>
        </div>
          
          
        <form @submit.prevent="onLogin" class="form">
          <label>账号</label>
          <input id="username" class="field" v-model="username" type="text" required placeholder="手机/邮箱/用户名" />
          <label>密码</label>
          <input id="password" class="field" v-model="password" type="password" required placeholder="请输入密码" />
          <div class="otp-row" role="group" aria-label="短信验证码">
            <input class="otp-input" v-model="captcha" placeholder="短信验证码" />
            <button type="button" class="otp-btn" :class="{disabled:smsWait>0}" :disabled="smsWait>0" @click="sendSms">
              <span class="txt">{{ smsWait>0 ? `${smsWait}s` : '发送短信' }}</span>
            </button>
      </div>
          <div class="inline-check right">
            <a class="link" href="javascript:void(0)">忘记密码？</a>
      </div>
          <div class="actions">
      <button type="submit">登录</button>
          </div>
          <div class="links-row">
            <a class="link" href="javascript:void(0)" @click="goRegister()">没有账号？创建账户 →</a>
          </div>
    </form>
        <div v-if="message" class="msg">{{ message }}</div>
      </div>
    </section>
    
    <!-- 面板隐藏时的浮动按钮 -->
    <button v-if="!showPanel" class="panel-toggle" @click="showPanel=true" aria-label="打开登录">
      <span class="tiles tiles-lg" aria-hidden="true">
        <i class="c1"></i><i class="c2"></i><i class="c3"></i><i class="c4"></i>
      </span>
    </button>
    
    <!-- 背景：AI 蓝色动效 -->
    <section class="blue-pane">
      <div class="blue-overlay"></div>
      <!-- 中央 AI 核心光晕 + 扫描环 + 轨道粒子 -->
      <div class="ai-core">
        <div class="glow"></div>
        <div class="conic"></div>
        <div class="title">AI</div>
      </div>
      <div class="rings-center">
        <span class="ring r1"></span>
        <span class="ring r2"></span>
        <span class="ring r3"></span>
        <span class="scan"></span>
      </div>
      <div class="orbit">
        <span class="dot d1"></span>
        <span class="dot d2"></span>
        <span class="dot d3"></span>
        <span class="dot d4"></span>
        <span class="dot d5"></span>
        <span class="dot d6"></span>
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
const role = ref('');
const logoSrc = (typeof window !== 'undefined' && window.location) ? undefined : undefined;
const showPanel = ref(false);

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
  // 预览：自动按用户名推断一个角色：邮箱->operation，手机号->inventory，其他->warehouse
  const u = String(username.value||'');
  let r = 'warehouse';
  if(/@/.test(u)) r = 'operation';
  else if(/^1\d{10}$/.test(u)) r = 'inventory';
  // 预览模式：写入最小登录态（token + user + 归属）
  try{ localStorage.setItem('auth_token','preview'); }catch{}
  try{ localStorage.setItem('role', r); }catch{}
  const fakeUser:any = { id: 999, username: 'preview', name: '预览用户', type: r };
  if (r==='warehouse') fakeUser.warehouse_id = 1;
  if (r==='inventory') fakeUser.organization_id = 1001;
  try{ localStorage.setItem('auth_user_json', JSON.stringify(fakeUser)); }catch{}
  router.push(rolePreviewHome(r));
}

function goRegister(){ router.push('/register'); }

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
/* 左右两栏 */
.login-layout{ position:relative; min-height:100vh; display:block; padding:0; font-family: 'Inter', 'Noto Sans SC', 'Microsoft YaHei', 'Segoe UI', Arial, sans-serif; background:
  radial-gradient(1200px 800px at 25% -10%, rgba(21,62,150,.28), transparent 60%),
  linear-gradient(180deg,#0b1f48 0%, #0b2d66 40%, #0a2c68 100%);
}
.panel{ position:fixed; left:24px; bottom:24px; width:300px; display:flex; flex-direction:column; align-items:stretch; justify-content:flex-start; padding:16px; z-index:100; }
.panel{ transform: translateY(140%); opacity:0; pointer-events:none; transition: all .28s ease; }
.panel.visible{ transform: translateY(0); opacity:1; pointer-events:auto; }
.panel .close-btn{ position:absolute; right:10px; top:10px; width:24px; height:24px; border:none; background: transparent; color:#6b7280; font-size:20px; line-height:24px; cursor:pointer; }
.panel .close-btn:hover{ color:#111827; }
.panel .panel-card{ position:relative; width:100%; padding:16px 14px; border-radius:12px; background:#ffffff; border:1px solid #e5e7eb; box-shadow:0 10px 24px rgba(2,6,23,.10); }
.brand-row{ display:flex; align-items:center; justify-content:flex-start; gap:10px; margin-bottom:12px; }
.brand-row .tiles{ display:inline-grid; grid-template-columns:10px 10px; grid-template-rows:10px 10px; gap:2px; }
.brand-row .tiles i{ display:block; width:10px; height:10px; border-radius:2px; }
.brand-row .tiles .c1{ background:#f35325; }
.brand-row .tiles .c2{ background:#81bc06; }
.brand-row .tiles .c3{ background:#05a6f0; }
.brand-row .tiles .c4{ background:#ffba08; }
.brand-text{ display:flex; flex-direction:column; }
.brand-text .title{ font-size:14px; font-weight:800; letter-spacing:.02em; color:#111827; }
.brand-text .subtitle{ margin-top:2px; font-size:11px; color:#6b7280; letter-spacing:.02em; }
.brand{ height:64px; display:flex; align-items:center; justify-content:center; color:#0f172a; font-weight:700; letter-spacing:.2em; background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; box-shadow:0 8px 24px rgba(2,6,23,.06); }
.panel-card{ position:relative; flex:1; padding:12px 0 0; display:flex; flex-direction:column; justify-content:flex-start; min-height:auto; }
.panel-card h2{ margin:0 0 16px; color:#e6eeff; }
.form{ display:flex; flex-direction:column; gap:14px; margin-top:6px; }
.form label{ color:#374151; font-size:13px; }
.form input, .form select{ height:32px; padding:0 8px; border:1px solid #e5e7eb; border-radius:6px; background:#ffffff; box-shadow:none; color:#111827; font-size:13px; }
.form input::placeholder{ color:#9ca3af; }
.form input:focus, .form select:focus{ outline:none; border-color:#2563eb; box-shadow:0 0 0 3px rgba(37,99,235,.15); background:#ffffff; color:#111827; }
.inline{ display:flex; gap:10px; align-items:center; }
.inline .ghost.small{ height:44px; padding:0 12px; border-radius:12px; border:1px solid rgba(2,6,23,.06); background:linear-gradient(180deg,rgba(255,255,255,.94),rgba(246,249,255,.9)); box-shadow:0 6px 16px rgba(2,6,23,.06); color:#0f172a; font-weight:600; }
.inline .ghost.small:disabled{ opacity:.6; cursor:not-allowed; }
.otp-row{ display:flex; gap:6px; align-items:center; }
.otp-input{ flex:0 0 90px; width:90px; height:32px; padding:0 6px; border:1px solid #e5e7eb; border-radius:6px; background:#ffffff; color:#111827; font-size:13px; }
.otp-btn{ position:relative; height:32px; padding:0 10px; border:1px solid #1d4ed8; border-radius:6px; background:#1d4ed8; color:#fff; font-weight:700; letter-spacing:.01em; cursor:pointer; box-shadow:0 4px 10px rgba(29,78,216,.16); overflow:hidden; white-space:nowrap; font-size:13px; }
.otp-btn.fancy .shine{ position:absolute; left:8px; top:50%; width:14px; height:14px; transform: translateY(-50%); border-radius:50%; background: radial-gradient(circle at 30% 30%, #fff, rgba(255,255,255,.6) 40%, rgba(255,255,255,0) 60%); box-shadow:0 0 16px rgba(255,255,255,.8); }
.otp-btn .spark{ position:absolute; inset:0; background:radial-gradient(12px 12px at -10% 50%, rgba(255,255,255,.0), rgba(255,255,255,.0) 30%, rgba(255,255,255,.9) 31%, rgba(255,255,255,.0) 32%) repeat-x; background-size:24px 100%; animation: spark-move 1.6s linear infinite; mix-blend-mode: screen; opacity:.6; }
@keyframes spark-move{ 0%{ background-position-x:0 } 100%{ background-position-x:240px } }
.otp-btn.disabled{ filter: grayscale(.3); opacity:.7; cursor:not-allowed; box-shadow:none; }
.otp-btn .txt{ position:relative; z-index:1; }
.inline-check{ display:flex; justify-content:space-between; align-items:center; font-size:13px; margin-top:2px; color:#667085; }
.inline-check.right{ justify-content:flex-end; }
.inline-check .remember{ display:flex; align-items:center; gap:6px; }
.inline-check .link{ color:#2563eb; text-decoration:none; }
.inline-check .link:hover{ text-decoration:underline; }
.actions{ display:flex; gap:10px; margin-top:6px; }
.actions button{ flex:1; height:40px; border:1px solid #2563eb; border-radius:10px; background:#2563eb; color:#fff; cursor:pointer; box-shadow:0 8px 18px rgba(37,99,235,.20); font-weight:700; letter-spacing:.02em; }
.actions button:hover{ transform: translateY(-1px); box-shadow:0 16px 32px rgba(37,99,235,.32); }
.actions .ghost{ background:linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.04)); color:#e6eeff; border:1px solid rgba(122,168,255,.22); box-shadow:0 8px 18px rgba(2,6,23,.16); }
.msg{ margin-top:8px; color:#16a34a; }
.welcome-footer{ margin-top:16px; text-align:center; color:#64748b; font-size:12px; }
/* 快捷登录按钮：可爱玻璃风 */
.social-row{ display:flex; align-items:center; gap:12px; margin-top:18px; font-size:14px; color:#a9bff1; }
.social-row.cute .s{ width:44px; height:44px; border-radius:12px; border:1px solid rgba(15,23,42,.08); background:linear-gradient(180deg,rgba(255,255,255,.96),rgba(245,248,255,.9)); display:flex; align-items:center; justify-content:center; font-size:20px; cursor:pointer; box-shadow:0 6px 18px rgba(2,6,23,.08), inset 0 2px 4px rgba(255,255,255,.5); transition: transform .15s ease, box-shadow .15s ease; }
.social-row.cute .s:hover{ transform: translateY(-2px); box-shadow:0 10px 22px rgba(2,6,23,.12), inset 0 2px 4px rgba(255,255,255,.6); }
.social-row.cute .s.face{ color:#0ea5e9; }
.social-row.cute .s.finger{ color:#10b981; }
/* WeChat 改为品牌色胶囊按钮，避免与图标块风格冲突 */
.social-row.cute .s.wechat{ height:40px; padding:0 16px; width:auto; border-radius:999px; border:none; font-size:14px; font-weight:700; letter-spacing:.02em; color:#fff; background:linear-gradient(135deg,#22c55e,#16a34a); box-shadow:0 8px 18px rgba(34,197,94,.28); }
.social-row.cute .s.wechat:hover{ transform: translateY(-2px); box-shadow:0 12px 26px rgba(34,197,94,.34); }

.cube-pane{ position:relative; border:1px solid #e2e8f0; border-radius:16px; background:#f8fbff; box-shadow:0 12px 28px rgba(2,6,23,.06); overflow:hidden; display:flex; flex-direction:column; align-items:center; justify-content:center; }
/* 右侧蓝色背景（图片+渐变） */
.blue-pane{ position:relative; z-index:1; width:100%; min-height:100vh; overflow:hidden; border-left:1px solid #0f3b9a44; }
.panel-toggle{ position:fixed; left:24px; bottom:24px; height:40px; padding:0 16px; border:none; border-radius:999px; background:#1d4ed8; color:#fff; cursor:pointer; box-shadow:0 8px 18px rgba(29,78,216,.28); font-weight:700; letter-spacing:.02em; z-index:200; }
.panel-toggle .tiles-lg{ display:inline-grid; grid-template-columns:12px 12px; grid-template-rows:12px 12px; gap:3px; margin-right:6px; vertical-align:middle; }
.panel-toggle .tiles-lg i{ display:block; width:12px; height:12px; border-radius:2px; }
.panel-toggle .tiles-lg .c1{ background:#f35325; }
.panel-toggle .tiles-lg .c2{ background:#81bc06; }
.panel-toggle .tiles-lg .c3{ background:#05a6f0; }
.panel-toggle .tiles-lg .c4{ background:#ffba08; }
.blue-overlay{ position:absolute; inset:0; background:
  radial-gradient(900px 700px at 60% 40%, rgba(24,76,170,.28), transparent 65%),
  radial-gradient(600px 450px at 60% 40%, rgba(40,110,230,.18), transparent 70%);
  pointer-events:none; }
/* AI 核心光晕 */
.ai-core{ position:absolute; left:50%; top:50%; transform: translate(-50%,-50%); width:340px; height:340px; border-radius:50%; filter: drop-shadow(0 0 40px rgba(100,160,255,.35)); }
.ai-core .glow{ position:absolute; inset:0; border-radius:50%; background: radial-gradient(circle at center, rgba(160,210,255,.35), rgba(80,140,240,.08) 60%, transparent 70%); animation: core-breathe 4s ease-in-out infinite; }
.ai-core .conic{ position:absolute; inset:-18%; border-radius:50%; background: conic-gradient(from 0deg, rgba(120,180,255,.15), transparent 30%, rgba(120,180,255,.12), transparent 60%, rgba(120,180,255,.10)); mask: radial-gradient(circle at center, black 45%, transparent 48%); animation: core-rot 10s linear infinite; }
.ai-core .title{ position:absolute; left:50%; top:50%; transform: translate(-50%,-50%); font-size:120px; font-weight:800; letter-spacing:.12em; background: linear-gradient(180deg,#f5f7fa,#bfc7d5); -webkit-background-clip:text; background-clip:text; color:transparent; text-shadow: 0 0 24px rgba(150,200,255,.8); }
@keyframes core-breathe{ 0%,100%{ filter: blur(0.6px); opacity:.95 } 50%{ filter: blur(1.2px); opacity:1 } }
@keyframes core-rot{ to{ transform: rotate(360deg); } }
/* 中央光圈 */
.rings-center{ position:absolute; left:50%; top:50%; transform: translate(-50%,-50%); width:min(70%,900px); aspect-ratio:1/1; border-radius:50%; pointer-events:none; z-index:1; }
.rings-center .ring{ position:absolute; left:50%; top:50%; transform: translate(-50%,-50%); border-radius:50%; border:2px solid rgba(120,170,255,.25); }
.rings-center .r1{ width:85%; height:85%; box-shadow:0 0 80px rgba(60,120,220,.25) inset; }
.rings-center .r2{ width:70%; height:70%; border-color: rgba(160,200,255,.28); filter: blur(.4px); }
.rings-center .r3{ width:55%; height:55%; border-color: rgba(200,230,255,.32); filter: blur(.6px); }
.rings-center .scan{ position:absolute; left:50%; top:50%; width:100%; height:100%; transform: translate(-50%,-50%); border-radius:50%; border:1px dashed rgba(180,220,255,.25); animation: scan-rot 6s linear infinite; }
@keyframes scan-rot{ to{ transform: translate(-50%,-50%) rotate(360deg); } }
/* 居中魔方 */
.blue-pane .cube-wrap.center{ position:absolute; left:50%; top:50%; right:auto; transform: translate(-50%,-50%); width:220px; height:220px; z-index:2; }
.blue-pane .glass-cube{ width:220px; height:220px; transform-style:preserve-3d; filter: drop-shadow(0 30px 80px rgba(60,120,220,.35)); }
.gface{ position:absolute; width:220px; height:220px; border-radius:16px; backface-visibility:hidden; -webkit-backface-visibility:hidden; border:1px solid rgba(255,255,255,.16); box-shadow: inset 0 0 26px rgba(255,255,255,.12), inset -12px -12px 28px rgba(0,0,0,.22); backdrop-filter: blur(6px) saturate(140%); -webkit-backdrop-filter: blur(6px) saturate(140%); }
.g1{ background: linear-gradient(145deg, rgba(80,130,255,.22), rgba(38,66,200,.12)); transform: translateZ(110px); }
.g2{ background: linear-gradient(145deg, rgba(60,110,240,.20), rgba(30,60,180,.10)); transform: rotateY(180deg) translateZ(110px); }
.g3{ background: linear-gradient(145deg, rgba(72,118,248,.22), rgba(32,68,198,.10)); transform: rotateY(90deg) translateZ(110px); }
.g4{ background: linear-gradient(145deg, rgba(68,108,238,.20), rgba(30,62,188,.10)); transform: rotateY(-90deg) translateZ(110px); }
.g5{ background: linear-gradient(145deg, rgba(96,138,255,.24), rgba(42,78,210,.12)); transform: rotateX(90deg) translateZ(110px); }
.g6{ background: linear-gradient(145deg, rgba(52,92,220,.20), rgba(24,54,160,.10)); transform: rotateX(-90deg) translateZ(110px); }
/* 轨道粒子 */
.orbit{ position:absolute; left:50%; top:50%; transform: translate(-50%,-50%); width:66%; height:66%; pointer-events:none; }
.orbit .dot{ position:absolute; width:6px; height:6px; border-radius:50%; background:#a8c8ff; box-shadow:0 0 12px #84a7ff; }
.orbit .d1{ left:12%; top:48%; animation: orb1 7s linear infinite; }
.orbit .d2{ left:86%; top:52%; animation: orb2 9s linear infinite; }
.orbit .d3{ left:48%; top:10%; animation: orb3 6s linear infinite; }
.orbit .d4{ left:52%; top:90%; animation: orb4 8s linear infinite; }
.orbit .d5{ left:28%; top:22%; animation: orb5 10s linear infinite; }
.orbit .d6{ left:78%; top:28%; animation: orb6 11s linear infinite; }
@keyframes orb1{ to{ transform: rotate(360deg) translateX(40px) rotate(-360deg); } }
@keyframes orb2{ to{ transform: rotate(-360deg) translateX(60px) rotate(360deg); } }
@keyframes orb3{ to{ transform: rotate(360deg) translateX(32px) rotate(-360deg); } }
@keyframes orb4{ to{ transform: rotate(-360deg) translateX(36px) rotate(360deg); } }
@keyframes orb5{ to{ transform: rotate(360deg) translateX(50px) rotate(-360deg); } }
@keyframes orb6{ to{ transform: rotate(-360deg) translateX(44px) rotate(360deg); } }

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
/* 强制隐藏旧版 AI/魔方相关元素（即便残留也不显示） */
/* 旧版特效禁用（保留魔方显示） */
.ai-word,.ripple,.gpt-bar,.stars,.trails,.screen-pulse{ display:none !important; }
.ai-pane{ display:none !important; }
</style>
