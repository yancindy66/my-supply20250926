<template>
  <div class="page-wrap">
    <h2>融资申请信息列表</h2>
    <div class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th class="idx">序号</th>
            <th class="name">客户名称</th>
            <th>申请单号</th>
            <th class="num">申请金额</th>
            <th>状态</th>
            <th>申请时间</th>
            <th class="op">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="rows.length===0"><td class="center" colspan="7">暂无数据</td></tr>
          <tr v-for="(row, idx) in rows" :key="row.id">
            <td class="idx">{{ (page-1)*pageSize + idx + 1 }}</td>
            <td class="name">{{ row.customerName }}</td>
            <td>{{ row.applyNo }}</td>
            <td class="num">{{ row.applyAmount }}</td>
            <td><span class="tag" :class="statusClass(row.status)">{{ row.status }}</span></td>
            <td>{{ row.applyTime }}</td>
            <td class="op">
              <button class="btn xs" @click="goDetail(row.id)">查看</button>
              <button class="btn xs primary" @click="goReview(row.id)">审核</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();
const rows = ref<any[]>([]);
const page = ref(1);
const pageSize = ref(10);
const total = ref(0);
const totalPages = computed(()=> Math.max(1, Math.ceil(total.value / pageSize.value)));
function goDetail(id:number){ router.push(`/financial/financing/application/detail/${id}`); }
function goReview(id:number){ router.push(`/financial/financing/application/review/${id}`); }
function statusClass(s: string){ const t=(s||'').toLowerCase(); if(t.includes('通过')||t.includes('已放款')||t.includes('成功')) return 'ok'; if(t.includes('审核')||t.includes('处理中')||t.includes('待')) return 'warn'; if(t.includes('拒绝')||t.includes('失败')||t.includes('关闭')) return 'danger'; return 'info'; }
</script>

<style scoped>
.page-wrap{ font-size:13px; }
.table-wrapper{ overflow:auto; background:#fff; border:1px solid #eef2f6; border-radius:8px; }
table{ width:max-content; border-collapse:collapse; }
th,td{ padding:8px 10px; border-bottom:1px solid #eef2f6; white-space:nowrap; }
thead th{ position:sticky; top:0; background:#f7f9fc; z-index:1; }
.idx{ width:64px; text-align:center; }
.name{ min-width:220px; }
.num{ text-align:right; }
.op{ min-width:120px; }
.center{ text-align:center; color:#6b7280; }
.tag{ display:inline-block; padding:2px 8px; border-radius:999px; font-size:12px; }
.tag.ok{ background:#ecfdf5; color:#059669; }
.tag.warn{ background:#fffbeb; color:#d97706; }
.tag.danger{ background:#fef2f2; color:#dc2626; }
.tag.info{ background:#eef2ff; color:#334155; }
.btn{ height:24px; padding:0 8px; border:1px solid #e5e7eb; background:#fff; border-radius:6px; cursor:pointer; }
.btn.xs{ height:22px; padding:0 8px; font-size:12px; }
</style>


