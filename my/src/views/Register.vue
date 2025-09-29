<template>
  <div class="register-layout">
    <section class="card glass">
      <h2 class="title">平台注册</h2>
      <div class="role-row">
        <label>注册角色*</label>
        <select v-model="role" required>
          <option value="operation">平台运营</option>
          <option value="inventory">存货人</option>
          <option value="warehouse">仓储机构</option>
          <option value="financial">金融机构</option>
          <option value="guarantee">担保机构</option>
        </select>
        <small class="hint">不同角色所需材料略有差异，选择后自动调整表单</small>
      </div>

      <!-- 资质上传与OCR识别（独立卡块，位于角色选择后） -->
      <div class="pane upload-pane" style="margin-bottom:14px;">
        <div class="block-title">资质上传与OCR识别</div>
        <div class="inline">
          <input ref="licenseInput" type="file" accept="image/*,.pdf" @change="onFile" style="display:none" />
          <button type="button" class="chip" @click="chooseFile">选择营业执照</button>
          <button type="button" class="chip primary" :disabled="ocrLoading || !licenseFile" @click="runOCR">{{ ocrLoading?'识别中…':'OCR识别并回填' }}</button>
        </div>
        <small class="hint">支持 JPG/PNG/PDF；识别后自动回填“单位名称/统一社会信用代码/法人姓名”。</small>
        <div v-if="licenseFile" class="preview" style="margin-top:8px;">
          <img v-if="isImage" :src="licensePreview" class="thumb" alt="license-preview" @click="openPreview" />
          <div v-else class="file-chip">{{ licenseFile?.name || '已选择文件' }}</div>
          <button type="button" class="chip" @click="removeFile">移除</button>
        </div>
        <div v-if="showPreview" class="preview-mask" @click.self="showPreview=false">
          <img :src="licensePreview" class="preview-large" @click="showPreview=false">
        </div>
      </div>

      

      
      <form class="grid" @submit.prevent="submitAll">
        <!-- A. 核心账户信息 -->
        <div class="block pane"><div class="block-title">账户信息</div>
          <label>单位名称（全称）</label>
          <input v-model="orgName" placeholder="与营业执照一致" />

          <label>统一社会信用代码</label>
          <input v-model="uscc" placeholder="18位统一社会信用代码" />

          <label>管理员账号（邮箱或手机号）</label>
          <input v-model="adminAccount" placeholder="邮箱或手机号" />

          <label>管理员密码</label>
          <div class="inline">
            <input :type="passVisible?'text':'password'" v-model="adminPass" placeholder="至少8位，含字母数字特殊字符" />
            <button type="button" class="chip" @click="passVisible=!passVisible">{{ passVisible?'隐藏':'显示' }}</button>
            <button type="button" class="chip" @click="copyPass">复制</button>
            <button type="button" class="chip primary" @click="genPass">生成</button>
          </div>
          <div class="inline small-row">
            <label class="small">长度</label>
            <input type="number" v-model.number="passLen" min="8" max="32" style="width:80px" />
            <label class="small"><input type="checkbox" v-model="incUpper" />大写</label>
            <label class="small"><input type="checkbox" v-model="incLower" />小写</label>
            <label class="small"><input type="checkbox" v-model="incNums" />数字</label>
            <label class="small"><input type="checkbox" v-model="incSyms" />符号</label>
          </div>

          <label>确认密码</label>
          <div class="inline">
            <input :type="pass2Visible?'text':'password'" v-model="adminPass2" placeholder="再次输入密码" />
            <button type="button" class="chip" @click="pass2Visible=!pass2Visible">{{ pass2Visible?'隐藏':'显示' }}</button>
          </div>

          <label>管理员姓名</label>
          <input v-model="adminName" />

          <label>管理员手机号</label>
          <div class="inline">
            <input v-model="adminPhone" placeholder="11位手机号" />
            <button type="button" class="chip primary" :disabled="smsLeft>0" @click="sendCode">{{ smsLeft>0 ? smsLeft+'s' : '获取验证码' }}</button>
          </div>

          <label>短信验证码</label>
          <input v-model="smsCode" />

          <label>管理员邮箱</label>
          <input v-model="adminEmail" type="email" placeholder="name@company.com" />
        </div>

        <!-- B. 单位基本信息（含法人信息） -->
        <div class="block pane"><div class="block-title">单位信息</div>
          <label>单位类型</label>
          <select v-model="orgType">
            <option value="">请选择</option>
            <option>国有企业</option>
            <option>民营企业</option>
            <option>外资企业</option>
            <option>事业单位</option>
            <option>社会团体</option>
            <option>其他</option>
          </select>

          <label>所属行业</label>
          <select v-model="industry">
            <option value="">请选择</option>
            <option>制造业</option>
            <option>物流业</option>
            <option>金融业</option>
            <option>零售业</option>
            <option>信息技术</option>
          </select>

          <label>单位规模</label>
          <select v-model="scale">
            <option value="">请选择</option>
            <option>1-50人</option>
            <option>51-200人</option>
            <option>201-500人</option>
            <option>500人以上</option>
          </select>

          <label>单位注册地址</label>
          <input v-model="regAddress" />

          <label>单位联系电话</label>
          <input v-model="orgPhone" />

          <label>法定代表人姓名</label>
          <input v-model="legalName" />

          <label>法定代表人身份证号</label>
          <input v-model="legalId" placeholder="如非必须，可注册后完善" />
        </div>

        <!-- C. 仓储机构扩展信息 -->
        <div class="block pane" v-if="role==='warehouse'"><div class="block-title">仓储机构信息</div>
            <label>仓库类型</label>
            <select v-model="warehouseType">
              <option>平面仓</option>
              <option>立体仓</option>
              <option>冷链仓</option>
            </select>
            <label>仓库地址</label>
            <input v-model="warehouseAddr" />
        </div>

        <!-- D. 协议 -->
        <div class="block pane"><div class="block-title">协议与授权</div>
          <label class="agree"><input type="checkbox" v-model="agreeUser" /> 已阅读并同意《用户协议》</label>
          <label class="agree"><input type="checkbox" v-model="agreePrivacy" /> 已阅读并同意《隐私政策》</label>
          <label class="agree"><input type="checkbox" v-model="agreeNotify" /> 同意接收系统通知</label>
        </div>

        <div class="full actions">
          <button type="button" class="ghost" @click="router.push('/login')">返回登录</button>
          <button :disabled="!agreeUser||!agreePrivacy" type="submit" class="primary pill">提交注册</button>
        </div>
        <div v-if="msg" class="full msg">{{ msg }}</div>
      </form>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const role = ref('operation');

// Step1
const orgName = ref('');
const uscc = ref('');
const adminAccount = ref('');
const adminPass = ref('');
const adminPass2 = ref('');
const passVisible = ref(false);
const pass2Visible = ref(false);
// 自定义密码规则
const passLen = ref(12);
const incUpper = ref(true);
const incLower = ref(true);
const incNums = ref(true);
const incSyms = ref(true);
const adminName = ref('');
const adminPhone = ref('');
const adminEmail = ref('');
const smsCode = ref('');
const smsLeft = ref(0);
let smsTimer:any=null;
function sendCode(){
  if(smsLeft.value>0) return;
  smsLeft.value=60; smsTimer&&clearInterval(smsTimer);
  smsTimer=setInterval(()=>{ smsLeft.value--; if(smsLeft.value<=0){clearInterval(smsTimer); smsTimer=null; smsLeft.value=0;} },1000);
  // TODO: 调 /api/auth/sms/send（mock）
}
function genPass(){
  const upper='ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower='abcdefghijkmnpqrstuvwxyz';
  const nums='23456789';
  const syms='!@#$%^&*()-_+=';
  let pool='';
  if(incUpper.value) pool+=upper;
  if(incLower.value) pool+=lower;
  if(incNums.value)  pool+=nums;
  if(incSyms.value)  pool+=syms;
  const len=Math.min(32,Math.max(8,passLen.value||12));
  if(!pool){ pool=upper+lower+nums; }
  const arr:string[]=[];
  const pushFrom=(s:string)=>{ if(!s) return; arr.push(s[Math.floor(Math.random()*s.length)]); };
  // 保证至少包含选中的类别
  if(incUpper.value) pushFrom(upper);
  if(incLower.value) pushFrom(lower);
  if(incNums.value)  pushFrom(nums);
  if(incSyms.value)  pushFrom(syms);
  while(arr.length<len){ arr.push(pool[Math.floor(Math.random()*pool.length)]); }
  // 打乱
  const pwd = arr.sort(()=>Math.random()-0.5).join('');
  adminPass.value=pwd; adminPass2.value=pwd;
}
async function copyPass(){
  try{ await navigator.clipboard.writeText(adminPass.value||''); }catch(_){/* ignore */}
}
function next1(){}

// Step2
const orgType = ref('');
const industry = ref('');
const scale = ref('');
const regAddress = ref('');
const orgPhone = ref('');
function next2(){}

// Step3
const legalName = ref('');
const legalId = ref('');
const licenseFile = ref<File|null>(null);
const licensePreview = ref('');
const isImage = ref(false);
const showPreview = ref(false);
function openPreview(){ if(isImage.value && licensePreview.value){ showPreview.value=true } }
// 触发文件选择
const licenseInput = ref<HTMLInputElement|null>(null);
function chooseFile(){ licenseInput.value?.click(); }
async function onFile(e:Event){
  const t=e.target as HTMLInputElement; const f=t.files?.[0]||null;
  // 先清理旧预览
  if(licensePreview.value) { URL.revokeObjectURL(licensePreview.value); licensePreview.value=''; }
  licenseFile.value=f;
  if(!f){ isImage.value=false; return; }
  const type = f.type || '';
  isImage.value = type.startsWith('image/') || /\.(png|jpg|jpeg)$/i.test(f.name||'');
  // 体积限制：原文件>2MB 则压缩；目标<=1600px 且大约<=500KB
  if(isImage.value){
    const MAX_SIDE=1600; const MAX_KB=500;
    const url = URL.createObjectURL(f);
    const img = new Image();
    await new Promise<void>((resolve)=>{ img.onload=()=>resolve(); img.src=url; });
    let {width, height} = img;
    let scale = 1;
    if(width>MAX_SIDE || height>MAX_SIDE){ scale = Math.min(MAX_SIDE/width, MAX_SIDE/height); }
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(width*scale); canvas.height = Math.round(height*scale);
    const ctx = canvas.getContext('2d');
    if(ctx){ ctx.drawImage(img,0,0,canvas.width,canvas.height); }
    let q = 0.9; let blob:Blob|null = await new Promise(res=>canvas.toBlob(b=>res(b),'image/jpeg',q));
    while(blob && blob.size/1024>MAX_KB && q>0.4){ q-=0.1; blob = await new Promise(res=>canvas.toBlob(b=>res(b),'image/jpeg',q)); }
    URL.revokeObjectURL(url);
    if(blob && blob.size < f.size){
      licenseFile.value = new File([blob], f.name.replace(/\.(png|jpg|jpeg)$/i,'.jpg'), { type:'image/jpeg' });
    }
    licensePreview.value = URL.createObjectURL(licenseFile.value!);
  }
}
function removeFile(){
  if(licensePreview.value) { URL.revokeObjectURL(licensePreview.value); }
  licensePreview.value=''; isImage.value=false; licenseFile.value=null;
}
function next3(){}
// OCR
const ocrLoading = ref(false);
async function runOCR(){
  if(!licenseFile.value) return;
  try{
    ocrLoading.value=true;
    const fd = new FormData();
    fd.append('file', licenseFile.value);
    // 调用后端 OCR API
    const res = await fetch('/api/ocr/business-license', { method:'POST', body: fd });
    if(!res.ok){ throw new Error(await res.text().catch(()=> 'OCR_FAILED')); }
    const data = await res.json().catch(()=> ({}));
    // 预期返回：{ org_name, uscc, legal_name, extra?:{} }
    if(data){
      if(data.org_name && !orgName.value) orgName.value = String(data.org_name);
      if(data.uscc && !uscc.value) uscc.value = String(data.uscc);
      if(data.legal_name && !legalName.value) legalName.value = String(data.legal_name);
    }
  }catch(e){
    console.error(e);
    // 简单提示（可替换为全局 toast）
    msg.value = 'OCR识别失败，请检查文件清晰度或稍后重试';
    setTimeout(()=> msg.value='', 2000);
  }finally{
    ocrLoading.value=false;
  }
}

// Step4
const agreeUser = ref(true); const agreePrivacy=ref(true); const agreeNotify=ref(true);
const msg = ref('');
async function submitAll(){
  // TODO: 调 /api/auth/register（mock），成功后跳到登录
  msg.value='注册成功（模拟），请用微信或短信登录';
  setTimeout(()=> router.push('/login'), 800);
}
</script>

<style scoped>
.register-layout{ min-height:100vh; display:flex; align-items:center; justify-content:center; background: radial-gradient(1200px 600px at 20% -10%, #e0e7ff 10%, transparent 60%), radial-gradient(900px 500px at 110% 10%, #cffafe 10%, transparent 60%), linear-gradient(180deg,#f7fbff,#edf2f7); padding:24px; }
.card{ width:min(980px,94%); border-radius:18px; padding:28px; }
.glass{ background:rgba(255,255,255,.6); backdrop-filter: blur(16px); border:1px solid rgba(255,255,255,.6); box-shadow:0 30px 80px rgba(15,23,42,.18); }
.role-row{ display:flex; align-items:center; gap:12px; margin:6px 0 14px; }
.role-row select{ height:40px; padding:0 12px; border:1px solid #e2e8f0; border-radius:10px; background:#fff; }
.hint{ color:#64748b; font-size:12px; }
.steps{ display:flex; gap:8px; margin-bottom:16px; }
.steps button{ height:34px; padding:0 12px; border:1px solid #e2e8f0; background:#fff; border-radius:999px; cursor:pointer; }
.steps button.on{ background:#2563eb; color:#fff; border-color:#2563eb; }
.grid{ display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:18px 26px; }
.form, .grid{ align-items:stretch; }
.form h2{ margin:6px 0 8px; font-size:18px; }
.form input, .form select, .grid input, .grid select{ height:44px; padding:0 12px; border:1px solid #d7e0f0; border-radius:10px; background:#fff; transition:border-color .15s, box-shadow .15s; }
.form input:focus, .form select:focus, .grid input:focus, .grid select:focus{ outline:none; border-color:#2563eb; box-shadow:0 0 0 3px rgba(37,99,235,.15); }
.grid .block{ display:flex; flex-direction:column; gap:10px; }
.grid .block-title{ font-weight:800; color:#0f172a; margin-bottom:4px; }
.pane{ padding:16px; background:rgba(255,255,255,.65); border:1px solid rgba(226,232,240,.7); border-radius:14px; }
.grid .full{ grid-column:1/-1; }
.inline{ display:flex; gap:8px; }
.actions{ display:flex; gap:10px; margin-top:8px; }
.actions button{ height:44px; border:none; border-radius:12px; background:#2563eb; color:#fff; font-weight:700; cursor:pointer; transition:transform .08s ease; }
.actions button:hover{ transform: translateY(-1px); }
.actions .primary{ background:#2563eb; }
.actions .pill{ border-radius:999px; padding:0 20px; box-shadow:0 10px 20px rgba(37,99,235,.18); }
.actions .ghost{ background:#f1f5f9; color:#0f172a; }
.msg{ margin-top:8px; color:#16a34a; }
.agree{ color:#475569; }
/* 预览小图与放大层 */
.preview .thumb{ max-width:180px; max-height:120px; border:1px solid #e2e8f0; border-radius:8px; cursor:zoom-in; background:#fff; }
.preview-mask{ position:fixed; inset:0; background:rgba(15,23,42,.7); display:flex; align-items:center; justify-content:center; z-index:1000; }
.preview-large{ max-width:92vw; max-height:92vh; border-radius:10px; box-shadow:0 24px 54px rgba(0,0,0,.35); cursor:zoom-out; }

/* 椭圆小按钮（可爱风格） */
.chip{ height:36px; padding:0 14px; border:none; border-radius:999px; background:#f3f4f6; color:#0f172a; font-weight:600; cursor:pointer; box-shadow:0 6px 12px rgba(2,6,23,.06); }
.chip:hover{ filter:brightness(0.98); }
.chip.primary{ background:#2563eb; color:#fff; box-shadow:0 8px 18px rgba(37,99,235,.18); }
.small-row .small{ color:#475569; font-size:12px; display:flex; align-items:center; gap:6px; }
</style>


