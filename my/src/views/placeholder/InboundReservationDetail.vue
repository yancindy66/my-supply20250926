<template>
  <div class="page">
    <div class="head">
      <h2>入库预约详情</h2>
      <div class="spacer"></div>
      <button class="ghost" @click="goBack">返回列表</button>
      <button class="ghost" @click="onEdit">编辑</button>
      <button class="ghost" @click="onUpload">上传PDF</button>
      <button @click="onPrint">打印</button>
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="!detail">未找到数据</div>
    <div v-else>
      <section class="card">
        <div class="grid">
          <div class="row"><label>预约单号</label><div>{{ detail.reservation_number }}</div></div>
          <div class="row"><label>预约码</label><div>{{ detail.unique_reservation_code || '-' }}</div></div>
          <div class="row"><label>当前状态</label><div><span class="tag" :class="statusColor(detail.status)">{{ mapStatus(detail.status) }}</span></div></div>
          <div class="row"><label>货主名称</label><div>{{ detail.owner_name || '-' }}</div></div>
          <div class="row"><label>目标仓库</label><div>{{ warehouseText }}</div></div>
          <div class="row"><label>商品/规格</label><div>{{ commodityText }}</div></div>
          <div class="row"><label>入库方式</label><div>{{ detail.weigh_mode==='by_pack' ? '按规格重量计算' : '磅重计算' }}</div></div>
          <div class="row" v-if="detail.weigh_mode==='by_pack'"><label>件数×规格</label><div>{{ (detail.pack_count||0) }} × {{ (detail.convert_ratio||0) }} 吨/件</div></div>
          <div class="row"><label>计划数量</label><div>{{ plannedQuantityText }}</div></div>
          <div class="row"><label>预约窗口</label><div>{{ dateRangeText }}</div></div>
          <div class="row"><label>磅重费用</label><div>{{ detail.weighing_fee ?? '-' }}</div></div>
          <div class="row full"><label>备注</label><div>{{ detail.remarks || '-' }}</div></div>
        </div>
      </section>

      <section class="card">
        <h3>物流与司机</h3>
        <div class="grid">
          <div class="row"><label>物流承运商</label><div>{{ detail.logistics_carrier || '-' }}</div></div>
          <div class="row"><label>车牌</label><div>{{ detail.vehicle_plate || '-' }}</div></div>
          <div class="row"><label>司机姓名</label><div>{{ detail.driver_name || '-' }}</div></div>
          <div class="row"><label>司机电话</label><div>{{ detail.driver_phone || '-' }}</div></div>
          <div class="row"><label>司机身份证</label><div>{{ detail.driver_id_card || detail.driver_id_no || '-' }}</div></div>
          <div class="row"><label>预计到库</label><div>{{ detail.expected_arrival_start || detail.expected_arrival_date || '-' }}</div></div>
          <div class="row full"><label>货物来源/地址</label><div>{{ (detail.goods_source||'司机上传磅单') + ' / ' + (detail.source_address||detail.factory_batch_no||'-') }}</div></div>
        </div>
      </section>

      <section class="card">
        <h3>单据</h3>
        <div class="docs">
          <div class="doc-item">
            <div class="thumb-wrap" v-if="detail.doc_url">
              <img :src="detail.doc_url" alt="reservation-pdf" class="thumb" />
            </div>
            <div class="thumb-wrap empty" v-else>未上传</div>
            <div class="ops">
              <button class="link" @click="onUpload">{{ detail.doc_url? '替换' : '上传' }}</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import http from '@/api/http';
import { getReservation, updateReservation, uploadReservationPdf } from '@/api/depositor';

const route = useRoute();
const router = useRouter();
const rid = computed(()=> String(route.params.id||''));
const loading = ref(false);
const detail = ref<any>(null);
const warehouses = ref<any[]>([]);
const products = ref<any[]>([]);

const warehouseText = computed(()=>{
  const w = warehouses.value.find((x:any)=> String(x.id)===String(detail.value?.target_warehouse_id));
  return w? `${w.name}（${w.address||''}）` : '-';
});
const commodityText = computed(()=>{
  const p = products.value.find((x:any)=> String(x.id)===String(detail.value?.commodity_id));
  if(!p) return '-';
  return p.name + (p.spec? (' / '+p.spec) : '');
});
const dateRangeText = computed(()=>{
  const s = detail.value?.expected_arrival_start || detail.value?.expected_arrival_date || '';
  const e = detail.value?.expected_arrival_end || '';
  return e ? `${s} ~ ${e}` : s || '-';
});
const plannedQuantityText = computed(()=>{
  const n = detail.value?.total_planned_quantity;
  const u = detail.value?.measurement_unit || '吨';
  return (n!=null ? n : '-') + ' ' + u;
});

function statusColor(s:string){
  const map:Record<string,string>={
    draft:'slate', created:'blue', submitted:'indigo', warehouse_confirmed:'cyan',
    partially_delivered:'amber', completed:'green', platform_approved:'teal',
    platform_rejected:'rose', warehouse_rejected:'rose', cancelled:'gray'
  };
  return map[s]||'gray';
}
function mapStatus(s:string){
  const m:Record<string,string>={ draft:'草稿', submitted:'预约中', warehouse_confirmed:'预约成功', platform_rejected:'被驳回' };
  return m[s] || s || '-';
}

async function loadOptions(){
  try{ const w:any = await http.get('/api/warehouses'); warehouses.value = w?.data || []; }catch{ warehouses.value = []; }
  try{ const p:any = await http.get('/api/products'); products.value = p?.data || []; }catch{ products.value = []; }
}
async function load(){
  loading.value = true;
  try{
    const resp:any = await getReservation(rid.value);
    detail.value = resp?.data || null;
  }catch{ detail.value = null; }
  loading.value = false;
}

function goBack(){ router.push('/inbound/order/list'); }
async function onEdit(){
  if(!detail.value) return;
  const qty = prompt('修改计划数量', String(detail.value.total_planned_quantity||''));
  if(qty==null) return;
  try{ await updateReservation(detail.value.id || detail.value.reservation_number, { total_planned_quantity: Number(qty) }); await load(); alert('已更新'); }catch(e:any){ alert('更新失败:'+ (e?.message||e)); }
}
async function onUpload(){
  if(!detail.value) return;
  try{
    const url = 'https://example.com/reservations/demo.pdf';
    await uploadReservationPdf(detail.value.reservation_number || rid.value, url, 'reservation.pdf');
    await load();
    alert('已上传/替换PDF（demo）');
  }catch(e:any){ alert('上传失败：'+(e?.message||e)); }
}
function onPrint(){
  if(!detail.value) return;
  const d = detail.value;
  const w = window.open('', '_blank');
  if(!w) return alert('请允许弹窗用于打印');
  const html = `<html><head><title>预约单打印</title></head><body>
    <h3>入库预约单</h3>
    <div>预约单号：${d.reservation_number||''}</div>
    <div>预约码：${d.unique_reservation_code||''}</div>
    <div>货主：${d.owner_name||''}</div>
    <div>仓库：${warehouseText.value}</div>
    <div>商品：${commodityText.value}</div>
    <div>计划数量：${plannedQuantityText.value}</div>
    <div>预约窗口：${dateRangeText.value}</div>
  </body></html>`;
  w.document.write(html); w.document.close(); w.focus(); w.print(); w.close();
}

onMounted(async()=>{ await loadOptions(); await load(); });
</script>

<style scoped>
.page{ padding:16px; }
.head{ display:flex; align-items:center; gap:8px; }
.spacer{ flex:1; }
.loading{ color:#475569; }
.card{ border:1px solid #e5e7eb; background:#fff; border-radius:12px; padding:12px; margin:12px 0; box-shadow:0 6px 16px rgba(2,6,23,.06); }
.grid{ display:grid; grid-template-columns: repeat(2, minmax(260px, 1fr)); gap:8px 16px; }
.row{ display:flex; gap:8px; align-items:center; padding:4px 0; }
.row.full{ grid-column: 1 / -1; }
.row label{ width:120px; color:#475569; }
.tag{ display:inline-block; padding:3px 10px; border-radius:999px; font-size:12px; font-weight:600; }
.blue{ background:#e0f2fe; color:#075985; }
.indigo{ background:#e0e7ff; color:#3730a3; }
.cyan{ background:#cffafe; color:#155e75; }
.orange{ background:#ffedd5; color:#9a3412; }
.amber{ background:#fef3c7; color:#92400e; }
.green{ background:#dcfce7; color:#166534; }
.teal{ background:#ccfbf1; color:#115e59; }
.rose{ background:#ffe4e6; color:#9f1239; }
.gray{ background:#e5e7eb; color:#374151; }
.slate{ background:#e2e8f0; color:#334155; }
button{ height:36px; padding:0 12px; border:none; border-radius:10px; background:#2563eb; color:#fff; cursor:pointer; box-shadow:0 6px 14px rgba(37,99,235,.18); }
.ghost{ background:#eef2f7; color:#0f172a; }
.docs{ display:flex; gap:16px; align-items:center; }
.doc-item{ display:flex; gap:12px; align-items:center; }
.thumb-wrap{ width:64px; height:64px; border:1px solid #e5e7eb; border-radius:8px; overflow:hidden; }
.thumb-wrap.empty{ display:flex; align-items:center; justify-content:center; color:#94a3b8; font-size:12px; }
.thumb{ width:100%; height:100%; object-fit:cover; }
.link{ background:transparent; color:#2563eb; padding:0 6px; }
</style>


