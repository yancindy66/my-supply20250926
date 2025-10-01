<template>
  <div class="page">
    <h2>入库申请列表</h2>
    <div class="toolbar">
      <button @click="goApply">新建入库申请</button>
      <button class="ghost" @click="load">刷新</button>
    </div>
    <div v-if="loading">加载中...</div>
    <table v-else class="table">
      <thead>
        <tr>
          <th>预约单号</th>
          <th>预约方</th>
          <th>货主名称</th>
          <th>目标仓库</th>
          <th>商品名称</th>
          <th>计划数量</th>
          <th>货物来源</th>
          <th>物流承运商</th>
          <th>车牌/司机</th>
          <th>预计到库</th>
          <th>当前状态</th>
          <th>申请时间</th>
          <th>仓库处理时间</th>
          <th>平台审核时间</th>
          <th>预约码</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in list" :key="row.order_no">
          <td>
            <a href="javascript:;" @click="view(row)">{{ row.reservation_number || row.order_no }}</a>
          </td>
          <td><span :class="['tag', partyColor(row.reservation_party)]">{{ row.reservation_party || '-' }}</span></td>
          <td>{{ row.owner_name || '-' }}</td>
          <td>{{ (row.warehouse_name||'-') + ' ' + (row.warehouse_address||'') }}</td>
          <td>{{ (row.commodity_name||'-') + (row.commodity_spec?(' / '+row.commodity_spec):'') }}</td>
          <td>{{ row.planned_quantity }} {{ row.measurement_unit || row.unit || '' }}</td>
          <td>{{ row.goods_source || '-' }}</td>
          <td>{{ row.logistics_carrier || '-' }}</td>
          <td>{{ (row.vehicle_plate||'-') + ' / ' + maskDriver(row.driver_name, row.driver_phone) }}</td>
          <td>{{ row.eta || '-' }}</td>
          <td><span :class="['tag', statusColor(row.status)]">{{ mapStatus(row.status) }}</span></td>
          <td>{{ row.created_at || '-' }}</td>
          <td>{{ row.warehouse_handled_at || '-' }}</td>
          <td>{{ row.platform_audited_at || '-' }}</td>
          <td>{{ row.unique_reservation_code || '-' }}</td>
          <td>
            <button class="link" @click="view(row)">详情</button>
            <button class="link" @click="edit(row)">编辑</button>
            <button class="link" @click="withdraw(row)">撤回</button>
            <button class="link danger" @click="remove(row)">删除</button>
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


