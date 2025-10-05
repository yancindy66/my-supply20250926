<template>
  <div class="page-wrap">
    <h2>公告信息列表</h2>
    <div class="toolbar">
      <input v-model="keyword" class="ipt" placeholder="搜索标题/内容" @keyup.enter="onSearch" />
      <button class="btn" @click="onSearch">搜索</button>
      <button class="btn ghost" @click="onReset">重置</button>
    </div>
    <div class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th class="idx">序号</th>
            <th class="title">标题</th>
            <th>类型</th>
            <th>发布人</th>
            <th>发布时间</th>
            <th class="op">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="rows.length===0">
            <td class="center" colspan="6">暂无数据</td>
          </tr>
          <tr v-for="(row, idx) in rows" :key="row.id">
            <td class="idx">{{ (page-1)*pageSize + idx + 1 }}</td>
            <td class="title">{{ row.title }}</td>
            <td>{{ row.type }}</td>
            <td>{{ row.author }}</td>
            <td>{{ row.publishTime }}</td>
            <td class="op">
              <button class="btn xs" @click="goDetail(row.id)">查看</button>
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
const keyword = ref('');
const rows = ref<any[]>([]);
const page = ref(1);
const pageSize = ref(10);
const total = ref(0);
const totalPages = computed(()=> Math.max(1, Math.ceil(total.value / pageSize.value)));
function onSearch(){ page.value=1; /* TODO: 加载数据 */ }
function onReset(){ keyword.value=''; page.value=1; /* TODO: 重置并加载 */ }
function goDetail(id:number){ router.push(`/guarrantee/announcement/detail/${id}`); }
</script>

<style scoped>
.page-wrap{ font-size:13px; }
.toolbar{ display:flex; gap:6px; margin:8px 0; }
.ipt{ height:28px; padding:0 10px; border:1px solid #e5e7eb; border-radius:6px; }
.btn{ height:28px; padding:0 10px; border:1px solid #e5e7eb; background:#fff; border-radius:6px; cursor:pointer; }
.btn.ghost{ background:#f8fafc; }
.btn.xs{ height:22px; padding:0 8px; font-size:12px; }
.table-wrapper{ overflow:auto; background:#fff; border:1px solid #eef2f6; border-radius:8px; }
table{ width:max-content; border-collapse:collapse; }
th,td{ padding:8px 10px; border-bottom:1px solid #eef2f6; white-space:nowrap; }
thead th{ position:sticky; top:0; background:#f7f9fc; z-index:1; }
.idx{ width:64px; text-align:center; }
.title{ min-width:260px; }
.op{ min-width:120px; }
.center{ text-align:center; color:#6b7280; }
</style>


