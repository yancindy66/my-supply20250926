<template>
  <div class="product-monitor-page">
    <el-card shadow="never">
      <template #header>
        <div class="toolbar">
          <el-input v-model="keyword" placeholder="搜索 商品ID/设备编号" clearable style="width:260px" @keyup.enter="load"/>
          <el-button @click="load">查询</el-button>
        </div>
      </template>

      <el-table :data="rows" border>
        <el-table-column type="index" label="序号" width="70"/>
        <el-table-column prop="product_id" label="商品ID" width="160"/>
        <el-table-column prop="metric_type" label="指标类型" width="120"/>
        <el-table-column prop="value" label="实时数值" width="120"/>
        <el-table-column prop="threshold" label="安全阈值" width="120"/>
        <el-table-column prop="alert" label="预警状态" width="120"/>
        <el-table-column prop="updated_at" label="数据更新时间" width="180"/>
        <el-table-column prop="device_no" label="监测设备编号" width="160"/>
      </el-table>

      <div class="pager">
        <el-pagination background layout="prev, pager, next, jumper, total" :total="total" :page-size="pageSize" :current-page="page" @current-change="(p)=>{page=p;load();}"/>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';

const page = ref(1); const pageSize = ref(10); const total = ref(0);
const rows = ref<any[]>([]); const keyword = ref('');

async function load(){
  const { data } = await axios.get('/api/product-monitor', { params: { page: page.value, pageSize: pageSize.value, keyword: keyword.value } });
  rows.value = data?.data?.list || []; total.value = data?.data?.total || 0;
}

onMounted(load);
</script>

<style scoped>
.toolbar{ display:flex; gap:8px; align-items:center; }
.pager{ display:flex; justify-content:flex-end; margin-top:10px; }
</style>








