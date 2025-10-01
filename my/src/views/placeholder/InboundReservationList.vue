<template>
  <div class="page">
    <h2>入库预约列表</h2>
    <div class="filters">
      <div class="row">
        <label>状态</label>
        <select v-model="status">
          <option value="">全部</option>
          <option v-for="s in statuses" :key="s.value" :value="s.value">{{ s.label }}</option>
        </select>
        <label>仓库</label>
        <input v-model="warehouse" placeholder="仓库关键词" />
        <button class="ghost" @click="reset">重置</button>
        <button @click="load">筛选</button>
      </div>
      <div class="toolbar">
        <button @click="goApply">+ 新建入库预约</button>
        <button class="ghost" @click="load">刷新</button>
      </div>
    </div>

    <div v-if="loading">加载中...</div>
    <table v-else class="table">
      <thead>
        <tr>
          <th>预约单号</th>
          <th>预约方</th>
          <th>货主名称</th>
          <th>目标仓库</th>
          <th>商品</th>
          <th>计划数量</th>
          <th>预计到库</th>
          <th>当前状态</th>
          <th>申请时间</th>
          <th>动作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in list" :key="row.reservation_number">
          <td><a href="javascript:;" @click="view(row)">{{ row.reservation_number }}</a></td>
          <td><span class="tag green">{{ row.reservation_party || '存货人' }}</span></td>
          <td>{{ row.owner_name || '-' }}</td>
          <td>{{ (row.warehouse_name||'-') + ' ' + (row.warehouse_address||'') }}</td>
          <td>{{ (row.commodity_name||'-') + (row.commodity_spec?(' / '+row.commodity_spec):'') }}</td>
          <td>{{ row.total_planned_quantity }} {{ row.measurement_unit }}</td>
          <td>{{ row.expected_arrival_time || '-' }}</td>
          <td><span :class="['tag', statusColor(row.status)]">{{ mapStatus(row.status) }}</span></td>
          <td>{{ row.created_at || '-' }}</td>
          <td>
            <button v-if="row.status==='draft'" class="link" @click="submit(row)">提交</button>
            <button v-if="row.status==='submitted'" class="link" @click="withdraw(row)">撤回</button>
            <button v-if="row.status==='draft'" class="link danger" @click="remove(row)">删除</button>
          </td>
        </tr>
        <tr v-if="!list.length"><td class="empty" colspan="10">暂无数据</td></tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { listReservations } from '@/api/depositor';

const router = useRouter();
const loading = ref(false);
const list = ref<any[]>([]);
const status = ref('');
const warehouse = ref('');
const statuses = [
  { value:'draft', label:'草稿' },
  { value:'submitted', label:'已提交' },
  { value:'warehouse_confirmed', label:'仓库已确认' },
  { value:'warehouse_rejected', label:'仓库已拒绝' },
  { value:'platform_approved', label:'平台已审核' },
  { value:'platform_rejected', label:'平台已拒绝' },
  { value:'partially_arrived', label:'部分到货' },
  { value:'fully_arrived', label:'全部到货' },
  { value:'cancelled', label:'已取消' },
];

function mapStatus(s:string){
  const m:Record<string,string>={draft:'草稿',submitted:'已提交',warehouse_confirmed:'仓库已确认',warehouse_rejected:'仓库已拒绝',platform_approved:'平台已审核',platform_rejected:'平台已拒绝',partially_arrived:'部分到货',fully_arrived:'全部到货',cancelled:'已取消'};
  return m[s]||s||'-';
}
function statusColor(s:string){
  const map:Record<string,string>={draft:'slate',submitted:'indigo',warehouse_confirmed:'cyan',warehouse_rejected:'rose',platform_approved:'teal',platform_rejected:'rose',partially_arrived:'amber',fully_arrived:'green',cancelled:'gray'};
  return map[s]||'gray';
}

async function load(){
  loading.value=true;
  try{
    const resp:any = await listReservations({ page:1, pageSize:20 });
    let arr = resp?.data?.list || [];
    if(status.value) arr = arr.filter((r:any)=>r.status===status.value);
    if(warehouse.value) arr = arr.filter((r:any)=> String(r.warehouse_name||'').includes(warehouse.value));
    list.value = arr;
  }catch{ list.value=[]; }
  loading.value=false;
}
function reset(){ status.value=''; warehouse.value=''; load(); }
function goApply(){ router.push('/inbound/reservation/apply'); }
function view(_row:any){ alert('预约详情（占位）'); }
function submit(_row:any){ alert('提交（mock）'); }
function withdraw(_row:any){ alert('撤回（mock）'); }
function remove(_row:any){ alert('删除（mock）'); }
load();
</script>

<style scoped>
.page{ padding:16px; }
.filters{ display:flex; flex-direction:column; gap:8px; }
.row{ display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
.row label{ color:#475569; }
.toolbar{ display:flex; gap:8px; }
.table{ width:100%; border-collapse:separate; border-spacing:0; box-shadow:0 10px 24px rgba(2,6,23,.06); border-radius:12px; overflow:hidden; }
.table thead th{ background:#f8fafc; font-weight:600; }
.table th,.table td{ border-bottom:1px solid #eef2f7; padding:10px 12px; text-align:left; }
.tag{ display:inline-block; padding:3px 10px; border-radius:999px; font-size:12px; font-weight:600; letter-spacing:.02em; }
.green{ background:#dcfce7; color:#166534; }
.indigo{ background:#e0e7ff; color:#3730a3; }
.cyan{ background:#cffafe; color:#155e75; }
.rose{ background:#ffe4e6; color:#9f1239; }
.teal{ background:#ccfbf1; color:#115e59; }
.amber{ background:#fef3c7; color:#92400e; }
.gray{ background:#e5e7eb; color:#374151; }
.slate{ background:#e2e8f0; color:#334155; }
.empty{ text-align:center; color:#6b7280; }
.link{ background:transparent; color:#2563eb; padding:0 6px; }
.ghost{ background:#eef2f7; }
button{ height:36px; padding:0 12px; border:none; border-radius:10px; background:#2563eb; color:#fff; cursor:pointer; box-shadow:0 6px 14px rgba(37,99,235,.18); }
</style>


