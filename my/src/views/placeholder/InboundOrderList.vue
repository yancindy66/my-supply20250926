<template>
  <div class="page">
    <h2>入库申请列表</h2>
    <div class="toolbar">
      <button @click="goApply">新建入库申请</button>
      <button class="ghost" @click="load">刷新</button>
      <div class="spacer"></div>
      <button class="ghost" @click="toggleCols">列显示设置</button>
    </div>
    <div v-if="showCols" class="col-panel">
      <div class="col-grid">
        <label v-for="c in columns" :key="c.key" class="col-item">
          <input type="checkbox" v-model="c.visible" :disabled="c.locked" />
          <span :class="{locked:c.locked}">{{ c.label }}</span>
        </label>
      </div>
      <div class="col-actions">
        <button class="ghost" @click="resetCols">重置</button>
        <button @click="saveCols">保存</button>
      </div>
    </div>
    <div v-if="loading">加载中...</div>
    <table v-else class="table">
      <thead>
        <tr>
          <th v-for="c in visibleColumns" :key="c.key">{{ c.label }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in list" :key="row.order_no">
          <td v-for="c in visibleColumns" :key="c.key">
            <template v-if="c.key==='reservation_number'">
              <a href="javascript:;" @click="view(row)">{{ row.reservation_number || row.order_no }}</a>
            </template>
            <template v-else-if="c.key==='reservation_party'">
              <span :class="['tag', partyColor(row.reservation_party)]">{{ row.reservation_party || '-' }}</span>
            </template>
            <template v-else-if="c.key==='unique_reservation_code'">
              {{ row.unique_reservation_code || '-' }}
            </template>
            <template v-else-if="c.key==='owner_name'">
              {{ row.owner_name || '-' }}
            </template>
            <template v-else-if="c.key==='warehouse'">
              {{ (row.warehouse_name||'-') + ' ' + (row.warehouse_address||'') }}
            </template>
            <template v-else-if="c.key==='commodity'">
              {{ (row.commodity_name||'-') + (row.commodity_spec?(' / '+row.commodity_spec):'') }}
            </template>
            <template v-else-if="c.key==='planned_quantity'">
              {{ row.planned_quantity }} {{ row.measurement_unit || row.unit || '' }}
            </template>
            <template v-else-if="c.key==='goods_source'">
              {{ row.goods_source || '-' }}
            </template>
            <template v-else-if="c.key==='logistics_carrier'">
              {{ row.logistics_carrier || '-' }}
            </template>
            <template v-else-if="c.key==='driver'">
              {{ (row.vehicle_plate||'-') + ' / ' + maskDriver(row.driver_name, row.driver_phone) }}
            </template>
            <template v-else-if="c.key==='eta'">
              {{ row.eta || '-' }}
            </template>
            <template v-else-if="c.key==='status'">
              <span :class="['tag', statusColor(row.status)]">{{ mapStatus(row.status) }}</span>
            </template>
            <template v-else-if="c.key==='created_at'">
              {{ row.created_at || '-' }}
            </template>
            <template v-else-if="c.key==='warehouse_handled_at'">
              {{ row.warehouse_handled_at || '-' }}
            </template>
            <template v-else-if="c.key==='platform_audited_at'">
              {{ row.platform_audited_at || '-' }}
            </template>
            <template v-else-if="c.key==='actions'">
              <button class="link" @click="view(row)">详情</button>
              <button class="link" @click="edit(row)">编辑</button>
              <button class="link" @click="withdraw(row)">撤回</button>
              <button class="link danger" @click="remove(row)">删除</button>
            </template>
          </td>
        </tr>
        <tr v-if="!list.length">
          <td colspan="8" class="empty">暂无数据</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { listInboundOrders } from '@/api/depositor';

const router = useRouter();
const loading = ref(false);
const list = ref<any[]>([]);
const showCols = ref(false);

type Col = { key:string; label:string; visible:boolean; locked?:boolean };
const STORAGE_KEY = 'inboundOrderList.columns.v1';
const defaultColumns: Col[] = [
  { key:'reservation_number', label:'预约单号', visible:true, locked:true },
  { key:'reservation_party', label:'预约方', visible:true },
  { key:'unique_reservation_code', label:'预约码', visible:true },
  { key:'owner_name', label:'货主名称', visible:true },
  { key:'warehouse', label:'目标仓库', visible:true },
  { key:'commodity', label:'商品名称', visible:true },
  { key:'planned_quantity', label:'计划数量', visible:true },
  { key:'goods_source', label:'货物来源', visible:true },
  { key:'logistics_carrier', label:'物流承运商', visible:true },
  { key:'driver', label:'车牌/司机', visible:true },
  { key:'eta', label:'预计到库', visible:true },
  { key:'status', label:'当前状态', visible:true },
  { key:'created_at', label:'申请时间', visible:true },
  { key:'warehouse_handled_at', label:'仓库处理时间', visible:true },
  { key:'platform_audited_at', label:'平台审核时间', visible:true },
  { key:'actions', label:'操作', visible:true, locked:true },
];

const columns = ref<Col[]>(loadCols());
function loadCols(): Col[]{
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return defaultColumns.map(c=>({...c}));
    const saved = JSON.parse(raw);
    // merge with defaults by key, keep order of defaults
    const map:Record<string, Col> = {};
    for(const s of (saved||[])) map[s.key]=s;
    return defaultColumns.map(d => ({...d, ...(map[d.key]||{})}));
  }catch{ return defaultColumns.map(c=>({...c})); }
}
function saveCols(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(columns.value)); showCols.value=false; }
function resetCols(){ columns.value = defaultColumns.map(c=>({...c})); }
function toggleCols(){ showCols.value = !showCols.value; }
const visibleColumns = computed(()=> columns.value.filter(c=>c.visible));

function mapStatus(s: string){
  const m: Record<string,string> = { created: '已创建', receiving: '收货中', completed: '已完成', cancelled: '已取消' };
  return m[s] || s || '-';
}
function statusColor(s:string){
  const map:Record<string,string>={
    draft:'slate', created:'blue', submitted:'indigo',
    warehouse_confirmed:'cyan', receiving:'orange',
    partially_delivered:'amber', completed:'green', fully_delivered:'green',
    platform_approved:'teal', platform_rejected:'rose', warehouse_rejected:'rose',
    cancelled:'gray'
  };
  return map[s]||'gray';
}
function partyColor(s:string){
  const map:Record<string,string>={ '存货人':'green','物流方':'blue','仓库方':'purple' };
  return map[s]||'gray';
}
function maskDriver(name?:string, phone?:string){
  const p = phone? String(phone).replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '';
  return (name||'-') + (p?(' '+p):'');
}

async function load(){
  loading.value = true;
  try{
    const resp: any = await listInboundOrders({ page:1, pageSize:10 });
    list.value = resp?.data?.list || [];
  }catch{ list.value = []; }
  loading.value = false;
}

function goApply(){ router.push('/inbound/order/apply'); }
function view(_row:any){ alert('查看详情（占位）'); }
function edit(_row:any){ alert('编辑（占位）'); }
function withdraw(_row:any){ alert('撤回（占位）'); }
function remove(_row:any){ alert('删除（占位）'); }

load();
</script>

<style scoped>
.page{ padding:16px; }
.toolbar{ margin:12px 0; display:flex; gap:8px; }
.toolbar .ghost{ background:#f1f5f9; }
.spacer{ flex:1; }
.col-panel{ border:1px solid #e5e7eb; background:#fff; padding:10px; border-radius:10px; margin:8px 0; box-shadow:0 6px 16px rgba(2,6,23,.06); }
.col-grid{ display:grid; grid-template-columns: repeat(4, minmax(120px, 1fr)); gap:8px; }
.col-item{ display:flex; align-items:center; gap:8px; font-size:14px; }
.col-item .locked{ color:#6b7280; }
.col-actions{ display:flex; gap:8px; justify-content:flex-end; margin-top:8px; }
button{ height:36px; padding:0 12px; border:none; border-radius:10px; background:#2563eb; color:#fff; cursor:pointer; box-shadow:0 6px 14px rgba(37,99,235,.18); }
.ghost{ background:#eef2f7; color:#0f172a; }
.table{ width:100%; border-collapse: separate; border-spacing:0; box-shadow:0 10px 24px rgba(2,6,23,.06); border-radius:12px; overflow:hidden; }
.table thead th{ position:sticky; top:0; background:#f8fafc; color:#0f172a; font-weight:600; }
.table th,.table td{ border-bottom:1px solid #eef2f7; padding:10px 12px; text-align:left; }
.table tbody tr:nth-child(odd){ background:#fcfdff; }
.table tbody tr:hover{ background:#f1f5f9; }
.empty{ text-align:center; color:#6b7280; }
.link{ background:transparent; color:#2563eb; padding:0 6px; }
.danger{ color:#ef4444; }
.tag{ display:inline-block; padding:3px 10px; border-radius:999px; font-size:12px; font-weight:600; letter-spacing:.02em; }
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
.purple{ background:#ede9fe; color:#5b21b6; }
</style>


