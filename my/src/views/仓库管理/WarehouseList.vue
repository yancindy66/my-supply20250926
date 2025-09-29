<template>
  <div class="page">
    <el-card shadow="never">
      <template #header>
        <div class="toolbar">
          <el-input v-model="keyword" placeholder="搜索 名称/编码/公司/地址" clearable style="width:280px" @keyup.enter="load" />
          <el-select v-model="status" placeholder="状态" clearable style="width:140px">
            <el-option label="草稿" value="draft"/>
            <el-option label="待审核" value="pending"/>
            <el-option label="已通过" value="approved"/>
            <el-option label="已驳回" value="rejected"/>
          </el-select>
          <el-select v-model="enabled" placeholder="启用" clearable style="width:120px">
            <el-option label="启用" :value="1"/>
            <el-option label="禁用" :value="0"/>
          </el-select>
          <el-button type="primary" @click="load">查询</el-button>
          <el-button type="success" @click="toCreate">新增仓库</el-button>
          <el-button type="danger" :disabled="ids.length===0" @click="batchDisable">批量禁用</el-button>
          <el-button :disabled="ids.length===0" @click="batchEnable">批量启用</el-button>
          <el-button type="danger" plain :disabled="ids.length===0" @click="batchDelete">批量删除</el-button>
        </div>
      </template>

      <el-table :data="rows" ref="tableRef" stripe size="small" :row-key="r=>r.id" @selection-change="onSel">
        <el-table-column type="selection" width="48"/>
        <el-table-column type="index" label="序号" width="60"/>
        <el-table-column label="启用" width="72">
          <template #default="{ row }">
            <el-switch :model-value="row.enabled===1" size="small" @change="(v)=>toggleEnable(row,v)"/>
          </template>
        </el-table-column>
        <el-table-column prop="code" label="仓库编码" width="120"/>
        <el-table-column prop="name" label="仓库名称" min-width="160"/>
        <el-table-column prop="owner_company" label="所属公司" min-width="160"/>
        <el-table-column prop="province" label="省" width="80"/>
        <el-table-column prop="city" label="市" width="80"/>
        <el-table-column prop="capacity_ton" label="容量(吨)" width="100"/>
        <el-table-column prop="area_m2" label="面积(m²)" width="100"/>
        <el-table-column prop="status" label="状态" width="90"/>
        <el-table-column fixed="right" label="操作" width="260">
          <template #default="{ row }">
            <el-button size="small" @click="toDetail(row)">查看</el-button>
            <el-button size="small" type="primary" @click="toEdit(row)">编辑</el-button>
            <el-button size="small" v-if="row.status==='pending'" type="primary" plain @click="toReview(row)">审核</el-button>
            <el-dropdown>
              <el-button size="small" text>更多</el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="toggleEnable(row,true)">启用</el-dropdown-item>
                  <el-dropdown-item @click="toggleEnable(row,false)">禁用</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <div class="pager">
        <el-pagination background layout="prev, pager, next, jumper, total"
          :total="total" :page-size="pageSize" v-model:current-page="page" @current-change="load" />
      </div>
    </el-card>
  </div>
  </template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';

const page = ref(1); const pageSize = ref(20); const total = ref(0);
const rows = ref<any[]>([]);
const keyword = ref(''); const status = ref<string|undefined>(); const enabled = ref<number|undefined>();
const ids = ref<number[]>([]);
const tableRef = ref();

async function load(){
  const { data } = await axios.get('/api/warehouses', { params: { page: page.value, page_size: pageSize.value, keyword: keyword.value, status: status.value, enabled: enabled.value } });
  rows.value = data?.data?.list || []; total.value = data?.data?.total || 0;
}
function onSel(sel:any[]){ ids.value = sel.map(s=> s.id); }

async function toggleEnable(row:any, val:boolean){
  try{
    if (val) await axios.post(`/api/warehouses/${row.id}/enable`); else await axios.post(`/api/warehouses/${row.id}/disable`);
    load();
  }catch{ ElMessage.error('操作失败'); }
}
async function batchDisable(){
  if (ids.value.length===0) return; await ElMessageBox.confirm(`确认禁用 ${ids.value.length} 条？`,'提示', { confirmButtonText:'确定', cancelButtonText:'取消' });
  await axios.post('/api/warehouses/batch/disable',{ ids: ids.value }); load(); ids.value=[]; tableRef.value?.clearSelection?.();
}
async function batchEnable(){
  if (ids.value.length===0) return; await axios.post('/api/warehouses/batch/enable',{ ids: ids.value }); load(); ids.value=[]; tableRef.value?.clearSelection?.();
}
async function batchDelete(){
  if (ids.value.length===0) return; await ElMessageBox.confirm('仅禁用数据可删，确认删除？','提示', { confirmButtonText:'确定', cancelButtonText:'取消' });
  await axios.post('/api/warehouses/batch/delete',{ ids: ids.value }); load(); ids.value=[]; tableRef.value?.clearSelection?.();
}
function toDetail(row:any){ window.location.href = `/operation/warehouse/detail/${row.id}`; }
function toReview(row:any){ window.location.href = `/operation/warehouse/review/${row.id}`; }
function toCreate(){ window.location.href = `/operation/warehouse/create`; }
function toEdit(row:any){ window.location.href = `/operation/warehouse/edit/${row.id}`; }

onMounted(load);
</script>

<style scoped>
.toolbar{ display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
.pager{ display:flex; justify-content:flex-end; margin-top:12px; }
</style>



