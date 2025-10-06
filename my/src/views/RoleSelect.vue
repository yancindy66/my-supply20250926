<template>
  <div class="rs-layout">
    <section class="chat-pane">
      <div class="chat-header">登录</div>
      <div class="login-body">
        <div class="login-row">
          <label>账号</label>
          <input v-model="username" placeholder="手机/邮箱/用户名" />
        </div>
        <div class="login-row">
          <label>密码</label>
          <input v-model="password" type="password" placeholder="密码" />
        </div>
        <div class="login-actions">
          <button @click="onLogin">登录</button>
          <button class="ghost" @click="goPreview">快速预览</button>
        </div>
        <div v-if="message" class="hint">{{ message }}</div>
      </div>
      <div class="chat-footer">
        <small>选择右侧魔方也可直接预览不同角色页面</small>
      </div>
    </section>

    <section class="cube-pane">
      <div class="hero">
        <h1>请选择角色</h1>
        <p>拖拽旋转魔方，点击某一面进入对应角色</p>
      </div>
      <div class="scene" @mousedown="onMouseDown" @touchstart.prevent="onTouchStart">
        <div class="cube" :style="cubeStyle">
          <div class="face front" @click="onFaceClick('operation')"><span>平台运营</span></div>
          <div class="face back" @click="onFaceClick('inventory')"><span>存货人</span></div>
          <div class="face right" @click="onFaceClick('warehouse')"><span>仓储机构</span></div>
          <div class="face left" @click="onFaceClick('financial')"><span>金融机构</span></div>
          <div class="face top" @click="onFaceClick('guarantee')"><span>担保机构</span></div>
          <div class="face bottom"><span>帮助</span></div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';
import { login as apiLogin, me as apiMe } from '@/api/auth';
const router = useRouter();
// 聊天占位
const username = ref('');
const password = ref('');
const message = ref('');
async function onLogin(){
  if(!username.value || !password.value){ message.value='请输入账号与密码'; return; }
  message.value='';
  try{
    const resp:any = await apiLogin({ username: username.value, password: password.value });
    const token = resp?.data?.token || '';
    if(!token){ message.value='登录失败'; return; }
    try{ localStorage.setItem('auth_token', token); }catch{}
    const info:any = await apiMe();
    const roles = info?.roles || [];
    const type = info?.user?.type || '';
    const roleKey = roles[0]?.role_key || type || 'operation';
    try{ localStorage.setItem('role', roleKey); }catch{}
    router.push(roleHome(mapRoleKeyToRoute(roleKey)));
  }catch(_e:any){ message.value = '登录失败，请重试'; }
}
function mapRoleKeyToRoute(roleKey: string){
  if (roleKey==='platform' || roleKey==='platform_admin' || roleKey==='operation') return 'operation';
  if (roleKey==='depositor' || roleKey==='inventory') return 'inventory';
  if (roleKey==='warehouse' || roleKey==='warehouse_manager') return 'warehouse';
  if (roleKey==='financial' || roleKey==='financial_org') return 'financial';
  if (roleKey==='guarantee' || roleKey==='guarantee_org') return 'guarantee';
  if (roleKey==='regulator') return 'regulator';
  return 'operation';
}
function roleHome(r: string){
  switch(r){
    case 'operation': return '/dashboard';
    case 'inventory': return '/inbound/apply';
    case 'warehouse': return '/warehouse/list';
    case 'financial': return '/financing/list';
    case 'guarantee': return '/guarantee/dashboard';
    case 'regulator': return '/monitor/overview';
    default: return '/dashboard';
  }
}
function goPreview(){
  const currentRole = localStorage.getItem('role') || 'operation';
  router.push(roleHome(String(currentRole)));
}

// 3D 魔方交互
const rotX = ref(-20); const rotY = ref(30);
const dragging = ref(false); let sx = 0, sy = 0;
const cubeStyle = ref('');
function updateCube(){ cubeStyle.value = `transform: rotateX(${rotX.value}deg) rotateY(${rotY.value}deg)`; }
function onMouseDown(e: MouseEvent){ dragging.value = true; sx=e.clientX; sy=e.clientY; window.addEventListener('mousemove', onMouseMove); window.addEventListener('mouseup', onMouseUp); }
function onMouseMove(e: MouseEvent){ if(!dragging.value) return; rotY.value += (e.clientX - sx)*0.4; rotX.value -= (e.clientY - sy)*0.4; if(rotX.value>80)rotX.value=80; if(rotX.value<-80)rotX.value=-80; sx=e.clientX; sy=e.clientY; updateCube(); }
function onMouseUp(){ dragging.value=false; window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp); }
function onTouchStart(e: TouchEvent){ const t=e.touches[0]; dragging.value=true; sx=t.clientX; sy=t.clientY; window.addEventListener('touchmove', onTouchMove,{passive:false}); window.addEventListener('touchend', onTouchEnd); }
function onTouchMove(e: TouchEvent){ if(!dragging.value) return; const t=e.touches[0]; rotY.value += (t.clientX - sx)*0.4; rotX.value -= (t.clientY - sy)*0.4; if(rotX.value>80)rotX.value=80; if(rotX.value<-80)rotX.value=-80; sx=t.clientX; sy=t.clientY; updateCube(); }
function onTouchEnd(){ dragging.value=false; window.removeEventListener('touchmove', onTouchMove); window.removeEventListener('touchend', onTouchEnd); }

onMounted(()=> updateCube());
function selectRole(roleKey: string) {
  try {
    localStorage.setItem('role', roleKey);
  } catch {}
  // 直接进入各角色首页进行预览
  router.push(roleHome(roleKey));
}

function onFaceClick(roleKey: string){ if(!roleKey) return; selectRole(roleKey); }
</script>

<style scoped>
.rs-layout{ min-height:100vh; display:flex; gap:24px; padding:24px; background:
  radial-gradient(800px 400px at 20% 10%, rgba(59,130,246,0.18), transparent 60%),
  radial-gradient(800px 400px at 80% 20%, rgba(14,165,233,0.16), transparent 60%),
  linear-gradient(135deg, #eaf2ff 0%, #f7fbff 60%, #ffffff 100%);
}
.chat-pane{ flex:1 1 55%; display:flex; flex-direction:column; background:#fff; border:1px solid rgba(2,6,23,0.08); border-radius:12px; box-shadow:0 10px 24px rgba(2,6,23,0.06); overflow:hidden; }
.chat-header{ padding:14px 16px; font-weight:600; border-bottom:1px solid rgba(2,6,23,0.06); }
.login-body{ padding:16px; display:flex; flex-direction:column; gap:10px; }
.login-row{ display:flex; align-items:center; gap:8px; }
.login-row label{ width:64px; color:#475569; }
.login-row input{ flex:1; height:36px; border:1px solid #e2e8f0; border-radius:8px; padding:0 10px; }
.login-actions{ display:flex; gap:10px; padding:0 16px 6px; }
.login-actions button{ height:36px; padding:0 14px; border:none; border-radius:8px; background:#2563eb; color:#fff; cursor:pointer; }
.login-actions .ghost{ background:#f1f5f9; color:#0f172a; }
.hint{ color:#ef4444; padding:0 16px; }
.chat-footer{ padding:8px 16px; border-top:1px solid rgba(2,6,23,0.06); color:#64748b; }

.cube-pane{ flex:1 1 45%; display:flex; flex-direction:column; align-items:center; }
.hero{ text-align:center; margin-bottom:14px; }
.hero h1{ margin:0; font-size:22px; color:#0f172a; }
.hero p{ margin:6px 0 0; color:#475569; font-size:13px; }
.scene{ width:360px; height:360px; perspective:1000px; cursor:grab; }
.cube{ position:relative; width:260px; height:260px; transform-style:preserve-3d; margin:50px auto; transition: transform .05s linear; }
.face{ position:absolute; width:260px; height:260px; display:flex; align-items:center; justify-content:center; font-weight:600; color:#0f172a; border:1px solid rgba(2,6,23,0.08); border-radius:14px; background:#fff; box-shadow:0 20px 40px rgba(2,6,23,0.08); }
.face span{ pointer-events:none; }
.face:hover{ outline:3px solid rgba(37,99,235,.25); }
.front{ transform: translateZ(130px); }
.back{ transform: rotateY(180deg) translateZ(130px); }
.right{ transform: rotateY(90deg) translateZ(130px); }
.left{ transform: rotateY(-90deg) translateZ(130px); }
.top{ transform: rotateX(90deg) translateZ(130px); }
.bottom{ transform: rotateX(-90deg) translateZ(130px); color:#64748b; }
.scene:active{ cursor:grabbing; }
</style>
