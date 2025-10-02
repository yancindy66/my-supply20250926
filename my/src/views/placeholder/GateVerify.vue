<template>
  <div class="page">
    <div class="split">
      <!-- 上部：主工作区 70% -->
      <div class="top">
        <h2>今日预约列表</h2>
        <div class="panel">
          <table class="table">
            <thead>
              <tr>
                <th>预约单号</th>
                <th>运输单号</th>
                <th>客户</th>
                <th>商品</th>
                <th>预计入库时间</th>
                <th>车牌</th>
                <th>司机</th>
                <th>司机手机</th>
                <th>司机身份证</th>
                <th>入场抓拍</th>
                <th>入场时间</th>
                <th>出场抓拍</th>
                <th>出场时间</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in topRows" :key="r.reservation_number || r.vehicle_plate" :class="{activeRow: isActive(r)}">
                <td>{{ r.reservation_number }}</td>
                <td>{{ r.transport_no }}</td>
                <td>{{ r.owner_name }}</td>
                <td>{{ r.product_name }}</td>
                <td>{{ r.expected_time }}</td>
                <td>{{ r.vehicle_plate }}</td>
                <td>{{ r.driver_name }}</td>
                <td>{{ r.driver_phone || '-' }}</td>
                <td>{{ r.driver_id_card || '-' }}</td>
                <td>{{ r.entry_capture || '-' }}</td>
                <td>{{ r.entry_time || '-' }}</td>
                <td>{{ r.exit_capture || '-' }}</td>
                <td>{{ r.exit_time || '-' }}</td>
                <td><span class="tag">{{ r.status }}</span></td>
                <td>
                  <button class="ghost" @click="editRow(r)">编辑</button>
                  <button class="danger" @click="deleteRow(r)">删除</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 下部：操作面板 30% -->
      <div class="bottom">
        <div class="ops">
          <!-- 左：实时视频面板 -->
          <div class="col">
            <h3>实时视频面板</h3>
            <div class="videoBox" @click="captureVehicle" title="点击抓拍并识别">摄像头实时画面</div>
            <div class="row"><button @click="captureVehicle">抓拍车辆</button></div>
          </div>
          <!-- 中：今日车辆队列 -->
          <div class="col wide">
            <h3>今日车辆队列</h3>
            <ul class="queue">
              <li v-for="q in queueRows" :key="q.plate">{{ q.plate }} ({{ q.status }})</li>
            </ul>
          </div>
          <!-- 右：无预约车辆快速登记 -->
          <div class="col">
            <h3>无预约车辆快速登记</h3>
            <div class="row">
              <label>车牌号</label>
              <input v-model="quickPlate" placeholder="如 沪A12345" class="flex1" />
            </div>
            <div class="row">
              <label>货物类型</label>
              <input v-model="quickGoods" placeholder="如 玉米/钢材 ..." class="flex1" />
            </div>
            <div class="row">
              <button @click="createQuickInbound" :disabled="!allowCreateQuick">创建入库单</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import http from '@/api/http';
import { apiCreateReservation, apiCreateInboundOrder, apiUpdateReservation, apiGetBookingList } from '@/api/gate';
import { getReservationByCode, gateVerifyWechat } from '@/api/depositor';

const code = ref('');
const phone = ref('');
const plate = ref('');
const loading = ref(false);
const reservation = ref<any>(null);
const result = ref<any>(null);
const warehouses = ref<any[]>([]);
const products = ref<any[]>([]);
const productMap = ref<Record<string, any>>({});
const orders = ref<any[]>([]);

// 上部：静态预约Mock（待核验）
const topRows = ref<any[]>([
  { reservation_number:'RSV-M1', transport_no:'T-2025100101', owner_name:'演示客户A', product_name:'玉米 2024', expected_time:'2025-10-02 09:00', vehicle_plate:'沪A12345', driver_name:'张三', status:'车辆未入库' },
  { reservation_number:'RSV-M2', transport_no:'T-2025100102', owner_name:'演示客户B', product_name:'小麦 2024', expected_time:'2025-10-02 10:00', vehicle_plate:'沪B67890', driver_name:'李四', status:'车辆未入库' },
  { reservation_number:'RSV-M3', transport_no:'T-2025100103', owner_name:'演示客户C', product_name:'钢材 HRB400', expected_time:'2025-10-02 10:30', vehicle_plate:'沪C00123', driver_name:'王五', status:'车辆未入库' },
  { reservation_number:'RSV-M4', transport_no:'T-2025100104', owner_name:'演示客户D', product_name:'铜锭 1#', expected_time:'2025-10-02 11:00', vehicle_plate:'沪D33445', driver_name:'赵六', status:'车辆未入库' }
]);
function startVerify(row:any){ row.status = '车辆未入库'; const idx = queueRows.value.findIndex(x=>x.plate===row.vehicle_plate); if(idx>=0){ queueRows.value[idx].status='车辆未入库'; } else { queueRows.value.unshift({ plate: row.vehicle_plate, status:'车辆未入库' }); } }

// 下部：队列与快速登记
const queueRows = ref<{plate:string,status:string}[]>([
  { plate:'沪A12345', status:'车辆未入库' },
  { plate:'沪B67890', status:'车辆入库' }
]);
const quickPlate = ref('');
const quickGoods = ref('');
const allowCreateQuick = ref(false);
const activeReservationNo = ref('');
function isActive(row:any){ return row.reservation_number === activeReservationNo.value; }
async function captureVehicle(){
  // 模拟摄像头抓拍：随机选择队列或上部表格中的一个车牌
  const candidates = [
    ...queueRows.value.map(x=>x.plate),
    ...topRows.value.map(x=>x.vehicle_plate)
  ].filter(Boolean);
  const plate = candidates.length ? candidates[Math.floor(Math.random()*candidates.length)] : '沪Z99999';
  await handleCapturedPlate(plate);
}

/**
 * 处理抓拍车牌与预约列表比对
 * @param {string} capturedPlateNumber 抓拍到的车牌号
 */
async function handleCapturedPlate(capturedPlateNumber: string){
  const plateNow = String(capturedPlateNumber).trim();
  // 1) 遍历预约数据源（bookingRows/bookings）判断是否存在
  const existsInBookings = bookingRows.value.some((b:any)=> String(b.vehicle_plate||'')===plateNow)
    || bookings.value.some((b:any)=> String(b.vehicle_plate||'')===plateNow);
  const existsInTop = topRows.value.some(x=> String(x.vehicle_plate||'')===plateNow);
  if(existsInBookings || existsInTop){
    // 2) 已预约：提示并高亮（若在上部mock表中）
    alert('车辆已预约，高亮后自动同步到门岗核验（办公室列表）');
    const target = topRows.value.find(x=> String(x.vehicle_plate)===plateNow);
    if(target){ activeReservationNo.value = target.reservation_number; startVerify(target); }
    allowCreateQuick.value = false;
    return;
  }
  // 3) 未预约：自动创建流程，提示并延时模拟
  alert(`正在为车牌${plateNow}创建入库流程...`);
  await new Promise(r=> setTimeout(r, 2000 + Math.floor(Math.random()*1000)));
  try{
    const now = new Date();
    const payload:any = {
      owner_name: '临时入场',
      reservation_party: 'driver',
      target_warehouse_id: warehouses.value[0]?.id,
      commodity_id: products.value[0]?.id,
      expected_arrival_start: now.toISOString().slice(0,16).replace('T',' '),
      vehicle_plate: plateNow,
      driver_phone: '',
      driver_id_no: '',
      goods_source: '无预约',
      status: 'submitted'
    };
    const rsvResp:any = await apiCreateReservation(payload);
    const createdId = rsvResp?.data?.id;
    let rsvDetail:any = null;
    if(createdId){ const d:any = await http.get(`/v1/inbound/reservations/${createdId}`); rsvDetail = d?.data?.data || null; }
    const rsvNo = rsvDetail?.reservation_number || null;
    await apiCreateInboundOrder({ reservation_number: rsvNo, vehicle_plate: plateNow, goods_name: '', status:'submitted', source:'gate-unreserved' });
    if(createdId){ try{ await apiUpdateReservation(createdId, { status: 'warehouse_confirmed' }); }catch{} }
    // 更新UI
    topRows.value.unshift({ reservation_number: rsvNo, transport_no: '-', owner_name: rsvDetail?.owner_name || '临时入场', product_name: '-', expected_time: payload.expected_arrival_start, vehicle_plate: plateNow, driver_name: rsvDetail?.driver_name || '-', driver_phone: rsvDetail?.driver_phone || '-', driver_id_card: rsvDetail?.driver_id_no || '-', entry_capture:'-', entry_time: payload.expected_arrival_start, exit_capture:'-', exit_time:'-', status: '车辆入库' });
    queueRows.value.unshift({ plate: plateNow, status:'车辆入库' });
    try{ await loadBookings(); }catch{}
    try{ await loadOrders(); }catch{}
    alert(`已自动为未预约车辆${plateNow}创建入库单`);
  }catch(e:any){ alert('自动创建失败：'+(e?.message||e)); }
}

// 核验通过后：创建入库单 + 更新预约状态（同步办公室列表）
async function persistGatePass(row:any){
  // 优先在已加载的预约中按车牌或预约单号匹配
  let match = bookings.value.find((b:any)=> String(b.vehicle_plate||'')===String(row.vehicle_plate))
           || bookings.value.find((b:any)=> String(b.reservation_number||'')===String(row.reservation_number));
  if(!match){ await loadBookings();
    match = bookings.value.find((b:any)=> String(b.vehicle_plate||'')===String(row.vehicle_plate))
          || bookings.value.find((b:any)=> String(b.reservation_number||'')===String(row.reservation_number));
  }
  // 创建入库单
  await http.post('/v1/inbound/orders', {
    reservation_number: row.reservation_number,
    vehicle_plate: row.vehicle_plate,
    driver_name: row.driver_name,
    driver_phone: (match?.driver_phone)||'',
    status: 'submitted'
  });
  // 更新预约状态（办公室列表读同一数据源即可看到）
  if(match?.id){
    await http.put(`/v1/inbound/reservations/${match.id}`, { status: 'warehouse_confirmed' });
  }
}
async function createQuickInbound(){
  if(!quickPlate.value){ alert('请先抓拍识别车牌'); return; }
  try{
    // 若该车牌已存在预约/上部列表，则提示走核验流程，避免重复创建
    const plateNow = String(quickPlate.value).trim();
    const existsInTop = topRows.value.some(x=> String(x.vehicle_plate)===plateNow);
    const existsInBookings = bookings.value.some((b:any)=> String(b.vehicle_plate||'')===plateNow);
    if(existsInTop || existsInBookings){
      alert('该车已有预约记录，请在上部列表中执行“开始核验”。');
      return;
    }
    // 1) 为无预约车辆创建一条简易预约（便于办公室列表同步展示）
    const now = new Date();
    const payload:any = {
      owner_name: '临时入场',
      reservation_party: 'driver',
      target_warehouse_id: warehouses.value[0]?.id,
      commodity_id: products.value[0]?.id,
      expected_arrival_start: now.toISOString().slice(0,16).replace('T',' '),
      vehicle_plate: quickPlate.value,
      goods_source: '无预约',
      status: 'submitted'
    };
    const rsvResp:any = await apiCreateReservation(payload);
    const rsv = rsvResp?.data || {};

    // 2) 创建入库单并关联该预约
    await apiCreateInboundOrder({
      reservation_number: rsv.reservation_number || null,
      vehicle_plate: quickPlate.value,
      goods_name: quickGoods.value || '',
      status: 'submitted',
      source: 'gate-unreserved'
    });

    // 3) 更新队列与提示
    queueRows.value.unshift({ plate: quickPlate.value, status:'核验通过' });
    // 刷新办公室读取的数据源（预约/订单）
    try{ await loadBookings(); }catch{}
    try{ await loadOrders(); }catch{}
    alert('已创建入库单，并在办公室列表同步显示（以预约形式呈现）');
    quickPlate.value=''; quickGoods.value='';
  }catch(e:any){ alert('创建失败：'+(e?.message||e)); }
}

// API 已迁移至 @/api/gate

async function loadMaster(){
  try{ const w:any = await http.get('/api/warehouses'); warehouses.value = w?.data || []; }catch{}
  try{ const p:any = await http.get('/api/products'); products.value = p?.data || []; products.value.forEach((x:any)=> (productMap.value[String(x.id)]=x)); }catch{}
}
loadMaster();
onMounted(loadOrders);
onMounted(loadBookings);

const warehouseText = computed(()=>{
  const w = warehouses.value.find((x:any)=> String(x.id)===String(reservation.value?.target_warehouse_id));
  return w? `${w.name}（${w.address||''}）` : '-';
});
const productText = computed(()=>{
  const p = products.value.find((x:any)=> String(x.id)===String(reservation.value?.commodity_id));
  return p? `${p.name}${p.spec?(' / '+p.spec):''}` : '-';
});
function productName(id:any){ const p = productMap.value[String(id)]; return p? `${p.name}${p.spec?(' / '+p.spec):''}` : '-'; }

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

// 预约列表 + Mock 回退
const bookings = ref<any[]>([]);
const bookSearch = ref('');
function buildMockBookings(){
  const names = ['张三','李四','王五','赵六','钱七','孙八','周九','吴十','郑一','冯二'];
  const plates = ['豫A12345','鲁B67890','苏C11223','浙D44556','皖E77889','湘F99001','京G22334','沪H55667','渝A88990','川B00112'];
  const phones = ['13800000001','13800000002','13800000003','13800000004','13800000005','13800000006','13800000007','13800000008','13800000009','13800000010'];
  const statuses = ['submitted','warehouse_confirmed','platform_approved','submitted','submitted','platform_rejected','cancelled','submitted','warehouse_confirmed','submitted'];
  const list:any[] = [];
  const now = Date.now();
  for(let i=0;i<10;i++){
    const ts = new Date(now + i*60*60*1000).toISOString().slice(0,16).replace('T',' ');
    list.push({
      reservation_number: `RSV-MOCK-${(i+1).toString().padStart(2,'0')}`,
      transport_no: `T-${20251001}${(100+i)}`,
      owner_name: `演示客户${i+1}`,
      commodity_id: (products.value[i % Math.max(1, products.value.length)]?.id) || 1,
      expected_arrival_start: ts,
      vehicle_plate: plates[i],
      driver_name: names[i],
      driver_phone: phones[i],
      driver_id_card: `4101********${(1000+i)}`,
      status: statuses[i]
    });
  }
  return list;
}
async function loadBookings(){
  try{
    const resp:any = await apiGetBookingList({ page:1, pageSize:100 });
    bookings.value = resp?.data?.list || [];
    if(!bookings.value.length){ bookings.value = buildMockBookings(); }
  }catch{ bookings.value = buildMockBookings(); }
}
const bookingRows = computed(()=>{
  const kw = (bookSearch.value||'').trim();
  if(!kw) return bookings.value;
  return bookings.value.filter((b:any)=>{
    const text = `${b.reservation_number||''} ${b.owner_name||''} ${b.vehicle_plate||''} ${b.driver_name||''} ${b.driver_phone||''}`;
    return text.includes(kw);
  });
});
function mapStatus(s:string){ const m:Record<string,string>={ draft:'草稿', submitted:'已提交', warehouse_confirmed:'已确认', platform_approved:'平台已核', platform_rejected:'平台驳回', cancelled:'已取消' }; return m[s]||s||'-'; }

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
.split{ display:flex; flex-direction:column; gap:12px; min-height:calc(100vh - 32px); }
.top{ flex:7; background:#f8fafc; border-radius:12px; padding:12px; }
.bottom{ flex:3; background:#f1f5f9; border-radius:12px; padding:12px; }
.ops{ display:grid; grid-template-columns: 1fr 1.6fr 1fr; gap:12px; height:100%; }
.col{ background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:12px; display:flex; flex-direction:column; }
.videoBox{ flex:1; min-height:140px; border:1px dashed #cbd5e1; background:#e5e7eb; color:#475569; border-radius:8px; display:flex; align-items:center; justify-content:center; margin-top:8px; }
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
.tag{ display:inline-block; padding:2px 8px; border-radius:999px; background:#eef2f7; color:#0f172a; font-size:12px; }
.activeRow{ background:#fff7ed; }
.queue{ list-style:none; margin:8px 0 0; padding:0; }
.queue li{ padding:6px 8px; border:1px solid #e5e7eb; border-radius:8px; background:#f8fafc; }
button.ghost{ background:#64748b; }
button.danger{ background:#ef4444; }
</style>


