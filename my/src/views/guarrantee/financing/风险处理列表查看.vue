<template>
  <div class="page-wrap">
    <h2>风险处理列表查看</h2>
    <div class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th class="idx">序号</th>
            <th>处理编号</th>
            <th>处理措施</th>
            <th>责任人</th>
            <th>处理时间</th>
            <th>处理结果</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="rows.length===0">
            <td class="center" colspan="6">暂无数据</td>
          </tr>
          <tr v-for="(row, idx) in rows" :key="row.id">
            <td class="idx">{{ idx + 1 }}</td>
            <td>{{ row.handleNo }}</td>
            <td class="text-ellipsis" :title="row.measure">{{ row.measure }}</td>
            <td>{{ row.owner }}</td>
            <td>{{ row.time }}</td>
            <td>{{ row.result }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const rows = ref<any[]>([]);
</script>

<style scoped>
.page-wrap{ font-size:13px; }
.table-wrapper{ overflow:auto; background:#fff; border:1px solid #eef2f6; border-radius:8px; }
table{ width:max-content; border-collapse:collapse; }
th,td{ padding:8px 10px; border-bottom:1px solid #eef2f6; white-space:nowrap; }
thead th{ position:sticky; top:0; background:#f7f9fc; z-index:1; }
.idx{ width:64px; text-align:center; }
.text-ellipsis{ max-width:360px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; display:inline-block; vertical-align:bottom; }
.center{ text-align:center; color:#6b7280; }
</style>


