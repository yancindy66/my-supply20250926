<template>
  <div class="page-wrap">
    <h2>融资信息列表</h2>
    <div class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th class="idx">序号</th>
            <th class="name">客户名称</th>
            <th>融资单号</th>
            <th class="num">本金</th>
            <th class="num">利息</th>
            <th>状态</th>
            <th>放款时间</th>
            <th class="op">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="rows.length===0"><td class="center" colspan="8">暂无数据</td></tr>
          <tr v-for="(row, idx) in rows" :key="row.id">
            <td class="idx">{{ (page-1)*pageSize + idx + 1 }}</td>
            <td class="name">{{ row.customerName }}</td>
            <td>{{ row.financeNo }}</td>
            <td class="num">{{ row.principal }}</td>
            <td class="num">{{ row.interest }}</td>
            <td>{{ row.status }}</td>
            <td>{{ row.loanTime }}</td>
            <td class="op">
              <button class="btn xs" @click="goDetail(row.id)">查看</button>
              <button class="btn xs primary" @click="repay(row.id)">还款</button>
              <button class="btn xs" @click="repayPartial(row.id)">部分还款</button>
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
function goDetail(id:number){ router.push(`/financial/financing/info/detail/${id}`); }
function repay(id:number){ router.push(`/financial/financing/info/repay/${id}`); }
function repayPartial(id:number){ router.push(`/financial/financing/info/repay-partial/${id}`); }
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
.op{ min-width:200px; }
.center{ text-align:center; color:#6b7280; }
.btn{ height:24px; padding:0 8px; border:1px solid #e5e7eb; background:#fff; border-radius:6px; cursor:pointer; }
.btn.xs{ height:22px; padding:0 8px; font-size:12px; }
.btn.primary{ background:#2563eb; border-color:#2563eb; color:#fff; }
</style>


