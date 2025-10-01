<template>
  <div class="page">
    <h2>门岗核验（微信扫码 + 手机号）</h2>
    <div class="panel">
      <div class="row">
        <label>预约码</label>
        <input v-model="code" placeholder="6位预约码" maxlength="6" />
        <button @click="fetchByCode" :disabled="loading">查询</button>
      </div>
      <div class="row">
        <label>司机手机号</label>
        <input v-model="phone" placeholder="用于核验与联系" />
        <label>车牌</label>
        <input v-model="plate" placeholder="车牌号" />
        <button @click="verify" :disabled="!code || !phone || loading">核验</button>
      </div>
      <div class="hint" v-if="reservation">
        <div>预约单号：{{ reservation.reservation_number }}｜货主：{{ reservation.owner_name }}</div>
        <div>目标仓库：{{ warehouseText }}</div>
        <div>商品：{{ productText }}</div>
      </div>
      <div v-if="result" class="result" :class="{warn: !result.phoneMatched}">
        <div>车单号：{{ result.inbound_order_no }}</div>
        <div>手机号一致：{{ result.phoneMatched ? '是' : '否（已告警仓库负责人）' }}</div>
      </div>
    </div>

    <div v-if="inboundOrderNo" class="panel">
      <h3>入场抓拍</h3>
      <div class="row">
        <input v-model="entryUrl" placeholder="图片URL" class="flex1" />
        <button @click="addEntryUrl" :disabled="!entryUrl">添加</button>
        <input type="file" accept="image/*" capture="environment" multiple @change="onEntryFiles" />
        <button class="ghost" @click="saveEntryPhotos" :disabled="!entryPhotos.length">保存入场抓拍</button>
      </div>
      <div class="thumbs">
        <img v-for="u in entryPhotos" :key="u" :src="u" />
      </div>
    </div>

    <div v-if="inboundOrderNo" class="panel">
      <h3>称重（毛/皮/扣 → 实际入库）</h3>
      <div class="row">
        <label>毛重</label><input v-model.number="gross" type="number" placeholder="吨" />
        <label>皮重</label><input v-model.number="tare" type="number" placeholder="吨" />
        <label>扣重</label><input v-model.number="deductions" type="number" placeholder="吨" />
        <button @click="saveWeigh" :disabled="loading">保存称重</button>
      </div>
      <div class="row">
        <label>磅单URL</label><input v-model="weighTicketUrl" class="flex1" placeholder="图片或PDF URL" />
        <button class="ghost" @click="uploadWeighTicket" :disabled="!weighTicketUrl">上传磅单</button>
      </div>
      <div class="calc">实际入库重量：<b>{{ actualComputed }}</b> 吨</div>
    </div>

    <div v-if="inboundOrderNo" class="panel">
      <h3>出场抓拍</h3>
      <div class="row">
        <input v-model="exitUrl" placeholder="图片URL" class="flex1" />
        <button @click="addExitUrl" :disabled="!exitUrl">添加</button>
        <input type="file" accept="image/*" capture="environment" multiple @change="onExitFiles" />
        <button class="ghost" @click="saveExitPhotos" :disabled="!exitPhotos.length">保存出场抓拍</button>
      </div>
      <div class="thumbs">
        <img v-for="u in exitPhotos" :key="u" :src="u" />
      </div>
    </div>

    <div class="panel">
      <h3>今日车辆（示例）</h3>
      <table class="table">
        <thead>
          <tr><th>车单号</th><th>预约单号</th><th>车牌</th><th>状态</th><th>创建时间</th></tr>
        </thead>
        <tbody>
          <tr v-for="o in orders" :key="o.order_no">
            <td>{{ o.order_no }}</td>
            <td>{{ o.reservation_number }}</td>
            <td>{{ o.vehicle_plate || '-' }}</td>
            <td>{{ o.status }}</td>
            <td>{{ o.created_at }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import http from '@/api/http';
import { getReservationByCode, gateVerifyWechat } from '@/api/depositor';

const code = ref('');
const phone = ref('');
const plate = ref('');
const loading = ref(false);
const reservation = ref<any>(null);
const result = ref<any>(null);
const warehouses = ref<any[]>([]);
const products = ref<any[]>([]);
const orders = ref<any[]>([]);

async function loadMaster(){
  try{ const w:any = await http.get('/api/warehouses'); warehouses.value = w?.data || []; }catch{}
  try{ const p:any = await http.get('/api/products'); products.value = p?.data || []; }catch{}
}
loadMaster();
onMounted(loadOrders);

const warehouseText = computed(()=>{
  const w = warehouses.value.find((x:any)=> String(x.id)===String(reservation.value?.target_warehouse_id));
  return w? `${w.name}（${w.address||''}）` : '-';
});
const productText = computed(()=>{
  const p = products.value.find((x:any)=> String(x.id)===String(reservation.value?.commodity_id));
  return p? `${p.name}${p.spec?(' / '+p.spec):''}` : '-';
});

async function fetchByCode(){
  if(!code.value) return;
  loading.value = true;
  try{
    const resp:any = await getReservationByCode(code.value);
    reservation.value = resp?.data || null;
  }catch{ reservation.value = null; }
  loading.value = false;
}

async function verify(){
  if(!code.value || !phone.value) return;
  loading.value = true;
  try{
    const resp:any = await gateVerifyWechat({ reservation_code: code.value, driver_phone: phone.value, vehicle_plate: plate.value, wechat_openid: 'demo-openid' });
    result.value = resp?.data || null;
    if(resp?.data?.reservation) reservation.value = resp.data.reservation;
    inboundOrderNo.value = resp?.data?.inbound_order_no || '';
    await loadOrders();
    alert(resp?.data?.phoneMatched ? '核验通过' : '手机号不一致，已告警仓库负责人');
  }catch(e:any){ alert('核验失败：'+(e?.message||e)); }
  loading.value = false;
}

// 车辆列表
async function loadOrders(){
  try{ const resp:any = await http.get('/v1/inbound/orders', { params:{ page:1, pageSize:10 } }); orders.value = resp?.data?.list || []; }catch{ orders.value = []; }
}

// 抓拍与称重
const inboundOrderNo = ref('');
const entryUrl = ref('');
const entryPhotos = ref<string[]>([]);
const exitUrl = ref('');
const exitPhotos = ref<string[]>([]);
const gross = ref<number|null>(null);
const tare = ref<number|null>(null);
const deductions = ref<number|null>(0);
const weighTicketUrl = ref('');

function addEntryUrl(){ if(entryUrl.value){ entryPhotos.value.push(entryUrl.value); entryUrl.value=''; } }
function addExitUrl(){ if(exitUrl.value){ exitPhotos.value.push(exitUrl.value); exitUrl.value=''; } }

async function compressImage(file: File, maxW = 1280): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxW / bitmap.width);
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return await fileToDataUrl(file);
  ctx.drawImage(bitmap, 0, 0, w, h);
  return canvas.toDataURL('image/jpeg', 0.82);
}
function fileToDataUrl(file: File): Promise<string>{
  return new Promise((resolve,reject)=>{ const r = new FileReader(); r.onload=()=>resolve(String(r.result||'')); r.onerror=reject; r.readAsDataURL(file); });
}
async function onEntryFiles(e: Event){
  const input = e.target as HTMLInputElement; const files = input.files; if(!files) return;
  for(const f of Array.from(files)){ try{ const data = await compressImage(f); entryPhotos.value.push(data);}catch{} }
  input.value='';
}
async function onExitFiles(e: Event){
  const input = (e.target as HTMLInputElement); const files = input.files; if(!files) return;
  for(const f of Array.from(files)){ try{ const data = await compressImage(f); exitPhotos.value.push(data);}catch{} }
  input.value='';
}

async function saveEntryPhotos(){
  if(!inboundOrderNo.value || !entryPhotos.value.length) return;
  try{
    await Promise.all(entryPhotos.value.map(u=> http.post('/v1/docs/upload', { scope:'gate', ref_id: inboundOrderNo.value, doc_type:'entry_photo', url:u, filename:'entry.jpg' })));
    alert('已保存入场抓拍'); entryPhotos.value=[];
  }catch(e:any){ alert('保存失败：'+(e?.message||e)); }
}
async function saveExitPhotos(){
  if(!inboundOrderNo.value || !exitPhotos.value.length) return;
  try{
    await Promise.all(exitPhotos.value.map(u=> http.post('/v1/docs/upload', { scope:'gate', ref_id: inboundOrderNo.value, doc_type:'exit_photo', url:u, filename:'exit.jpg' })));
    alert('已保存出场抓拍'); exitPhotos.value=[];
  }catch(e:any){ alert('保存失败：'+(e?.message||e)); }
}

const actualComputed = computed(()=>{
  const g = Number(gross.value||0), t = Number(tare.value||0), d = Number(deductions.value||0);
  const net = (isFinite(g) && isFinite(t)) ? (g - t) : 0;
  return (net - (isFinite(d)?d:0)).toFixed(3);
});
async function saveWeigh(){
  if(!inboundOrderNo.value) return;
  try{
    await http.post('/v1/scale/records', { ref_type:'inbound_order', ref_id: inboundOrderNo.value, gross: gross.value, tare: tare.value, deductions: deductions.value });
    alert('称重已保存');
  }catch(e:any){ alert('保存失败：'+(e?.message||e)); }
}
async function uploadWeighTicket(){
  if(!inboundOrderNo.value || !weighTicketUrl.value) return;
  try{ await http.post('/v1/docs/upload', { scope:'inbound', ref_id: inboundOrderNo.value, doc_type:'weigh_ticket', url:weighTicketUrl.value, filename:'weigh_ticket' }); weighTicketUrl.value=''; alert('已上传'); }catch(e:any){ alert('上传失败：'+(e?.message||e)); }
}
</script>

<style scoped>
.page{ padding:16px; }
.panel{ background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:12px; box-shadow:0 6px 16px rgba(2,6,23,.06); }
.row{ display:flex; gap:8px; align-items:center; margin-bottom:10px; flex-wrap:wrap; }
label{ color:#475569; min-width:80px; }
input{ height:36px; padding:0 10px; border:1px solid #e5e7eb; border-radius:8px; }
button{ height:36px; padding:0 12px; border:none; border-radius:10px; background:#2563eb; color:#fff; cursor:pointer; }
.hint{ color:#334155; font-size:13px; background:#f8fafc; border:1px dashed #e2e8f0; padding:8px; border-radius:8px; }
.result{ margin-top:10px; padding:8px; background:#ecfdf5; color:#065f46; border-radius:8px; border:1px solid #a7f3d0; }
.result.warn{ background:#fff7ed; color:#92400e; border-color:#fed7aa; }
.thumbs{ display:flex; gap:8px; flex-wrap:wrap; }
.thumbs img{ width:100px; height:66px; object-fit:cover; border-radius:6px; border:1px solid #e5e7eb; }
.flex1{ flex:1; min-width:240px; }
.table{ width:100%; border-collapse:collapse; margin-top:8px; }
.table th,.table td{ border-bottom:1px solid #eef2f7; padding:8px; text-align:left; }
.calc{ color:#0f172a; }
</style>


