<template>
  <div class="page">
    <h2>仓单列表</h2>
    <div class="toolbar">
      <button class="ghost" @click="load">刷新</button>
      <div class="spacer"></div>
      <template v-if="caps.receipts?.submit">
        <button @click="submitSelected" :disabled="!selection.length">提交审核</button>
      </template>
      <template v-if="caps.audit?.review">
        <button @click="approveSelected" :disabled="!selection.length">审核通过</button>
        <button class="ghost" @click="rejectSelected" :disabled="!selection.length">驳回</button>
      </template>
    </div>

    <div v-if="loading">加载中...</div>
    <FixedTable v-else :default-fix="true" :columns="ftColumns" :rows="list">
      <template #cell-receipt_number="{row}"><a href="javascript:;" @click="view(row)">{{ row.receipt_number || row.receipt_no || '-' }}</a></template>
      <template #cell-capacityMix="{row}">{{ fmtCap(row.capacity) }}/{{ fmtCap(row.occupied) }}/{{ fmtCap(remain(row)) }}</template>
      <template #cell-audit_status="{row}"><span class="tag" :class="auditColor(row.audit_status)">{{ mapAudit(row.audit_status) }}</span></template>
      <template #cell-actions="{row}">
        <template v-if="caps.receipts?.addLocation"><button class="link" @click="addLocation(row)">新增跺位卡</button></template>
        <template v-if="caps.receipts?.moveLocation"><button class="link" @click="moveLocation(row)">移跺</button></template>
        <template v-if="caps.receipts?.standardize"><button class="link" @click="standardize(row)">标准化</button></template>
        <button class="link" @click="sources(row)">来源</button>
      </template>
    </FixedTable>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import FixedTable from '@/components/FixedTable.vue';
import { listWarehouseReceipts } from '@/api/depositor';
import { capabilities } from '@/store/capabilities';
const loading = ref(false);
const list = ref<any[]>([]);
const caps = computed(()=> capabilities.value || {});
const ftColumns = computed(()=>[
  { key:'receipt_number', label:'仓单号', width:180 },
  { key:'reservation_number', label:'预约单号', width:160 },
  { key:'owner_name', label:'货主', width:160 },
  { key:'commodity', label:'商品/规格', width:220 },
  { key:'location_code', label:'跺位卡', width:140 },
  { key:'capacityMix', label:'库容/占用/剩余', width:200 },
  { key:'status', label:'状态', width:120 },
  { key:'audit_status', label:'审核状态', width:140 },
  { key:'created_at', label:'创建时间', width:180 },
  { key:'actions', label:'操作', width:200 },
]);
const selection = ref<any[]>([]);
const allChecked = ref(false);
async function load(){
  loading.value=true;
  try{ const resp = await listWarehouseReceipts({ page:1, pageSize:10 }); list.value = (resp as any)?.data?.list || []; }catch{ list.value=[]; }
  loading.value=false;
}
load();
function view(row:any){ const id = row.id || row.receipt_no || row.receipt_number || ''; try{ (window as any).$router? (window as any).$router.push(`/warehouse-receipt/detail/${id}`) : location.assign(`#//warehouse-receipt/detail/${id}`); }catch{}}
function addLocation(_row:any){ alert('新增跺位卡（仓库权限）'); }
function moveLocation(_row:any){ alert('移跺（仓库权限）'); }
function standardize(_row:any){ alert('标准化（仓库权限）'); }
function sources(_row:any){ alert('来源明细（占位）'); }
function syncSelection(){ selection.value = list.value.filter((x:any)=>x.__checked); allChecked.value = selection.value.length === list.value.length && list.value.length>0; }
function toggleAll(){ list.value.forEach((x:any)=> x.__checked = allChecked.value); syncSelection(); }
function submitSelected(){ alert(`提交审核 ${selection.value.length} 条`); }
function approveSelected(){ alert(`审核通过 ${selection.value.length} 条`); }
function rejectSelected(){ alert(`审核驳回 ${selection.value.length} 条`); }
function fmtCap(v:any){ return (v==null||v==='')?'-':v; }
function remain(row:any){ const a=Number(row.capacity||0), b=Number(row.occupied||0); return (a||b)? (a-b) : '-'; }
function auditColor(s:string){ const m:any={draft:'gray',submitted:'indigo',platform_approved:'green',platform_rejected:'rose'}; return m[s]||'gray'; }
function mapAudit(s:string){ const m:any={draft:'草稿',submitted:'已提交',platform_approved:'平台通过',platform_rejected:'平台驳回'}; return m[s]||'-'; }
</script>

<style scoped>
.page{ padding:16px; }
.toolbar{ margin:12px 0; display:flex; gap:8px; align-items:center; }
.spacer{ flex:1; }
.table{ width:100%; border-collapse:separate; border-spacing:0; box-shadow:0 10px 24px rgba(2,6,23,.06); border-radius:12px; overflow:hidden; }
.table thead th{ position:sticky; top:0; background:#f8fafc; color:#0f172a; font-weight:600; }
.table th,.table td{ border-bottom:1px solid #eef2f7; padding:10px 12px; text-align:left; }
.empty{ text-align:center; color:#6b7280; }
.tag{ display:inline-block; padding:3px 10px; border-radius:999px; font-size:12px; font-weight:600; }
.gray{ background:#e2e8f0; color:#334155; }
.green{ background:#dcfce7; color:#166534; }
.rose{ background:#ffe4e6; color:#9f1239; }
.ops .link{ background:transparent; color:#2563eb; padding:0 6px; }
.ghost{ background:#eef2f7; color:#0f172a; }
</style>


