<template>
  <div class="page">
    <div class="head">
      <h2>仓单详情</h2>
      <div class="spacer"></div>
      <template v-if="caps.receipts?.submit && receipt">
        <button @click="submit">提交审核</button>
      </template>
      <template v-if="caps.audit?.review && receipt">
        <button @click="approve">通过</button>
        <button class="ghost" @click="reject">驳回</button>
      </template>
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else>
      <section class="card">
        <div class="row"><label>仓单号</label><div>{{ receipt?.receipt_number || receipt?.receipt_no || '-' }}</div></div>
        <div class="row"><label>预约单号</label><div>{{ receipt?.reservation_number || '-' }}</div></div>
        <div class="row"><label>货主</label><div>{{ receipt?.owner_name || '-' }}</div></div>
        <div class="row"><label>商品/规格</label><div>{{ (receipt?.commodity_name||'-') + (receipt?.spec?(' / '+receipt?.spec):'') }}</div></div>
        <div class="row"><label>审核状态</label><div><span class="tag" :class="auditColor(receipt?.audit_status)">{{ mapAudit(receipt?.audit_status) }}</span></div></div>
      </section>

      <section class="card">
        <h3>跺位卡</h3>
        <div class="rows mini">
          <div class="row"><label>跺位卡</label><div>{{ receipt?.location_code || '-' }}</div></div>
          <div class="row"><label>库容/占用/剩余</label><div>{{ fmt(receipt?.capacity) }}/{{ fmt(receipt?.occupied) }}/{{ remain(receipt) }}</div></div>
        </div>
        <div class="ops" v-if="caps.receipts?.addLocation || caps.receipts?.moveLocation || caps.receipts?.standardize">
          <button v-if="caps.receipts?.addLocation" class="link" @click="onAddLocation">新增跺位卡</button>
          <button v-if="caps.receipts?.moveLocation" class="link" @click="onMoveLocation">移跺</button>
          <button v-if="caps.receipts?.standardize" class="link" @click="onStandardize">标准化</button>
        </div>
      </section>

      <section class="card">
        <h3>来源明细（逐车）</h3>
        <div class="hint">演示数据：此处展示每辆车的称重/抓拍快照（后端接口对接后替换）。</div>
        <table class="table mini">
          <thead><tr><th>车牌</th><th>司机</th><th>毛/皮/净/扣/实际</th><th>时间</th></tr></thead>
          <tbody>
            <tr v-for="(s,i) in demoSources" :key="i">
              <td>{{ s.vehicle_plate }}</td>
              <td>{{ s.driver }}</td>
              <td>{{ s.gross }}/{{ s.tare }}/{{ s.net }}/{{ s.deductions }}/{{ s.actual }}</td>
              <td>{{ s.at }}</td>
            </tr>
            <tr v-if="!demoSources.length"><td colspan="4" class="empty">暂无数据</td></tr>
          </tbody>
        </table>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { listWarehouseReceipts } from '@/api/depositor';
import { capabilities } from '@/store/capabilities';

const route = useRoute();
const id = computed(()=> String(route.params.id||''));
const caps = computed(()=> capabilities.value || {});
const loading = ref(false);
const receipt = ref<any>(null);
const demoSources = ref<any[]>([]);

async function load(){
  loading.value = true;
  try{
    const resp:any = await listWarehouseReceipts({ page:1, pageSize:50 });
    const arr:any[] = resp?.data?.list || [];
    receipt.value = arr.find((x:any)=> String(x.id||x.receipt_no||x.receipt_number)===id.value) || arr[0] || null;
    demoSources.value = receipt.value? [
      { vehicle_plate:'津A12345', driver:'张三', gross:30, tare:10, net:20, deductions:0.2, actual:19.8, at:'2025-10-01 10:00' },
      { vehicle_plate:'沪B56789', driver:'李四', gross:26, tare:9.5, net:16.5, deductions:0.1, actual:16.4, at:'2025-10-01 15:10' }
    ]: [];
  }catch{ receipt.value=null; demoSources.value=[]; }
  loading.value = false;
}
onMounted(load);

function submit(){ alert('提交审核（仓库）'); }
function approve(){ alert('平台通过'); }
function reject(){ alert('平台驳回'); }
function onAddLocation(){ alert('新增跺位卡（仓库）'); }
function onMoveLocation(){ alert('移跺（仓库）'); }
function onStandardize(){ alert('标准化（仓库）'); }

function fmt(v:any){ return (v==null||v==='')?'-':v; }
function remain(r:any){ const a=Number(r?.capacity||0), b=Number(r?.occupied||0); return (a||b)? (a-b) : '-'; }
function auditColor(s:string){ const m:any={draft:'gray',submitted:'indigo',platform_approved:'green',platform_rejected:'rose'}; return m[s]||'gray'; }
function mapAudit(s:string){ const m:any={draft:'草稿',submitted:'已提交',platform_approved:'平台通过',platform_rejected:'平台驳回'}; return m[s]||'-'; }
</script>

<style scoped>
.page{ padding:16px; }
.head{ display:flex; align-items:center; gap:8px; }
.spacer{ flex:1; }
.loading{ color:#6b7280; }
.card{ border:1px solid #e5e7eb; background:#fff; border-radius:12px; padding:12px; margin:12px 0; box-shadow:0 6px 16px rgba(2,6,23,.06); }
.row{ display:flex; align-items:center; gap:8px; padding:6px 0; }
.row label{ width:120px; color:#475569; }
.ops .link{ background:transparent; color:#2563eb; padding:0 6px; }
.table{ width:100%; border-collapse:separate; border-spacing:0; }
.table thead th{ background:#f8fafc; }
.table th,.table td{ border-bottom:1px solid #eef2f7; padding:8px 10px; text-align:left; }
.table.mini{ box-shadow:none; }
.empty{ text-align:center; color:#6b7280; }
.tag{ display:inline-block; padding:3px 10px; border-radius:999px; font-size:12px; font-weight:600; }
.gray{ background:#e2e8f0; color:#334155; }
.green{ background:#dcfce7; color:#166534; }
.rose{ background:#ffe4e6; color:#9f1239; }
.ghost{ background:#eef2f7; color:#0f172a; }
</style>


