<template>
  <el-dialog v-model="open" title="仓库审核" width="720px" :append-to-body="true">
    <el-descriptions :column="2" border size="small">
      <el-descriptions-item label="仓库编码">{{row.code}}</el-descriptions-item>
      <el-descriptions-item label="仓库名称">{{row.name}}</el-descriptions-item>
      <el-descriptions-item label="所属公司">{{row.owner_company}}</el-descriptions-item>
      <el-descriptions-item label="地址" :span="2">{{row.province}} {{row.city}} {{row.address}}</el-descriptions-item>
    </el-descriptions>
    <div style="margin:12px 0; display:flex; gap:8px; flex-wrap:wrap;">
      <el-image v-for="f in files" :key="f.id" class="thumb" :src="f.url" :preview-src-list="[f.url]" :preview-teleported="true" hide-on-click-modal fit="cover"/>
      <span v-if="!files.length" style="color:#909399">暂无附件</span>
    </div>
    <el-input v-model="reason" type="textarea" :rows="3" placeholder="驳回原因（仅在驳回时必填）"/>
    <template #footer>
      <el-button @click="open=false; goBack()">取消</el-button>
      <el-button type="danger" plain @click="reject">驳回</el-button>
      <el-button type="primary" @click="approve">通过</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';
const open = ref(true);
const row = ref<any>({});
const files = ref<any[]>([]);
const reason = ref('');

async function load(){
  const id = location.pathname.split('/').pop();
  const { data } = await axios.get(`/api/warehouses/${id}`);
  row.value = data?.data?.warehouse || data?.data || {}; files.value = data?.data?.files || [];
}
async function approve(){
  const id = row.value.id; await axios.post(`/api/warehouses/${id}/approve`); ElMessage.success('已通过'); goBack();
}
async function reject(){
  if (!reason.value.trim()) return ElMessage.warning('请填写驳回原因');
  const id = row.value.id; await axios.post(`/api/warehouses/${id}/reject`, { reason: reason.value }); ElMessage.success('已驳回'); goBack();
}
function goBack(){ history.back(); }
onMounted(load);
</script>

<style scoped>
.thumb{ width:100px; height:70px; border-radius:6px; box-shadow:0 1px 3px rgba(2,6,23,.15); }
</style>



