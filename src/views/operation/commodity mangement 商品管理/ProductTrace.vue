<template>
  <div class="product-trace-page">
    <el-card shadow="never">
      <template #header>
        <div class="toolbar">
          <el-button type="primary" @click="openForm()">新增溯源信息</el-button>
          <el-input v-model="keyword" placeholder="搜索 商品ID/溯源码/质检报告编号" clearable style="width:260px" @keyup.enter="load"/>
          <el-button @click="load">查询</el-button>
        </div>
      </template>

      <el-table :data="rows" border>
        <el-table-column type="index" label="序号" width="70"/>
        <el-table-column prop="product_id" label="商品ID" width="160"/>
        <el-table-column prop="trace_code" label="溯源编码"/>
        <el-table-column prop="report_no" label="质检报告编号"/>
        <el-table-column prop="agency" label="质检机构"/>
        <el-table-column prop="produce_date" label="生产日期" width="120"/>
        <el-table-column prop="inbound_time" label="入库时间" width="160"/>
        <el-table-column prop="logistics" label="物流信息"/>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="openForm(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="onDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pager">
        <el-pagination background layout="prev, pager, next, jumper, total" :total="total" :page-size="pageSize" :current-page="page" @current-change="(p)=>{page=p;load();}"/>
      </div>
    </el-card>

    <el-dialog v-model="formVisible" :title="form.id?'编辑溯源信息':'新增溯源信息'" width="720px">
      <el-form :model="form" label-width="140px">
        <el-form-item label="商品ID" required><el-input v-model="form.product_id"/></el-form-item>
        <el-form-item label="溯源编码"><el-input v-model="form.trace_code"/></el-form-item>
        <el-form-item label="质检报告编号"><el-input v-model="form.report_no"/></el-form-item>
        <el-form-item label="质检机构"><el-input v-model="form.agency"/></el-form-item>
        <el-form-item label="生产日期"><el-date-picker v-model="form.produce_date" type="date" value-format="YYYY-MM-DD"/></el-form-item>
        <el-form-item label="入库时间"><el-date-picker v-model="form.inbound_time" type="datetime" value-format="YYYY-MM-DD HH:mm:ss"/></el-form-item>
        <el-form-item label="运输物流信息"><el-input v-model="form.logistics"/></el-form-item>
        <el-form-item label="相关证书"><el-upload action="" :auto-upload="false"><el-button>上传附件</el-button></el-upload></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible=false">取消</el-button>
        <el-button type="primary" @click="onSubmit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import axios from 'axios';

const page = ref(1); const pageSize = ref(10); const total = ref(0);
const rows = ref<any[]>([]); const keyword = ref('');
const formVisible = ref(false); const form = reactive<any>({});

async function load(){
  const { data } = await axios.get('/api/product-trace', { params: { page: page.value, pageSize: pageSize.value, keyword: keyword.value } });
  rows.value = data?.data?.list || []; total.value = data?.data?.total || 0;
}
function openForm(row?:any){ Object.assign(form, row? row : { id:null, product_id:'', trace_code:'', report_no:'', agency:'', produce_date:'', inbound_time:'', logistics:'' }); formVisible.value=true; }
async function onSubmit(){ if(!form.id){ await axios.post('/api/product-trace', form); } else { await axios.put(`/api/product-trace/${form.id}`, form); } formVisible.value=false; load(); }
async function onDelete(row:any){ await axios.delete(`/api/product-trace/${row.id}`); load(); }
onMounted(load);
</script>

<style scoped>
.toolbar{ display:flex; gap:8px; align-items:center; }
.pager{ display:flex; justify-content:flex-end; margin-top:10px; }
</style>








