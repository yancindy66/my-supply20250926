<template>
  <div class="page-wrap">
    <h2>续期申请列表</h2>
    <div class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th class="idx">序号</th>
            <th>仓单号</th>
            <th>客户名称</th>
            <th>原到期日</th>
            <th>申请续期至</th>
            <th>申请时间</th>
            <th>状态</th>
            <th class="op">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="rows.length===0"><td class="center" colspan="8">暂无数据</td></tr>
          <tr v-for="(row, idx) in rows" :key="row.id">
            <td class="idx">{{ idx + 1 }}</td>
            <td>{{ row.receiptNo }}</td>
            <td>{{ row.customer }}</td>
            <td>{{ row.expireAt }}</td>
            <td>{{ row.applyTo }}</td>
            <td>{{ row.applyTime }}</td>
            <td>{{ row.status }}</td>
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();
const rows = ref<any[]>([]);
function goDetail(id:number){ router.push(`/warehouse/renewal/detail/${id}`); }
function goReview(id:number){ router.push(`/warehouse/renewal/review/${id}`); }
</script>

<style scoped>
.page-wrap{ font-size:13px; }
.table-wrapper{ overflow:auto; background:#fff; border:1px solid #eef2f6; border-radius:8px; }
table{ width:max-content; border-collapse:collapse; }
th,td{ padding:8px 10px; border-bottom:1px solid #eef2f6; white-space:nowrap; }
thead th{ position:sticky; top:0; background:#f7f9fc; z-index:1; }
.idx{ width:64px; text-align:center; }
.op{ min-width:140px; }
.center{ text-align:center; color:#6b7280; }
.btn{ height:24px; padding:0 8px; border:1px solid #e5e7eb; background:#fff; border-radius:6px; cursor:pointer; }
.btn.xs{ height:22px; padding:0 8px; font-size:12px; }
.btn.primary{ background:#2563eb; border-color:#2563eb; color:#fff; }
</style>


