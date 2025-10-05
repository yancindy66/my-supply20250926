<template>
  <el-drawer v-model="open" title="仓库详情" size="60%" :append-to-body="true" @closed="goBack">
    <el-descriptions :column="2" border size="small">
      <el-descriptions-item label="仓库编码">{{row.code}}</el-descriptions-item>
      <el-descriptions-item label="仓库名称">{{row.name}}</el-descriptions-item>
      <el-descriptions-item label="所属公司">{{row.owner_company}}</el-descriptions-item>
      <el-descriptions-item label="类型">{{row.type}}</el-descriptions-item>
      <el-descriptions-item label="区域">{{row.province}} {{row.city}} {{row.district}}</el-descriptions-item>
      <el-descriptions-item label="地址" :span="2">{{row.address}}</el-descriptions-item>
      <el-descriptions-item label="联系人">{{row.contact}}</el-descriptions-item>
      <el-descriptions-item label="电话">{{row.phone}}</el-descriptions-item>
      <el-descriptions-item label="容量(吨)">{{row.capacity_ton}}</el-descriptions-item>
      <el-descriptions-item label="面积(m²)">{{row.area_m2}}</el-descriptions-item>
      <el-descriptions-item label="资质等级">{{row.level}}</el-descriptions-item>
      <el-descriptions-item label="支持品类">{{row.support_commodities}}</el-descriptions-item>
      <el-descriptions-item label="许可证号">{{row.license_no}}</el-descriptions-item>
      <el-descriptions-item label="许可证到期">{{row.license_expire}}</el-descriptions-item>
      <el-descriptions-item label="状态">{{row.status}}</el-descriptions-item>
      <el-descriptions-item label="启用">{{row.enabled? '是':'否'}}</el-descriptions-item>
    </el-descriptions>

    <h4 style="margin:16px 0 8px;">证照与图片</h4>
    <div class="photos">
      <el-image v-for="f in files" :key="f.id" class="thumb" :src="f.url" :preview-src-list="[f.url]" :preview-teleported="true" hide-on-click-modal fit="cover" />
      <span v-if="!files.length" style="color:#909399">暂无</span>
    </div>

    <h4 style="margin:16px 0 8px;">操作日志</h4>
    <el-timeline>
      <el-timeline-item v-for="a in audits" :key="a.id" :timestamp="a.created_at" placement="top">{{a.action}} {{a.note||''}}</el-timeline-item>
    </el-timeline>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
const open = ref(true);
const row = ref<any>({});
const files = ref<any[]>([]);
const audits = ref<any[]>([]);

async function load(){
  const id = location.pathname.split('/').pop();
  const { data } = await axios.get(`/api/warehouses/${id}`);
  row.value = data?.data?.warehouse || data?.data || {};
  files.value = data?.data?.files || [];
  audits.value = data?.data?.audits || [];
}
function goBack(){ history.back(); }
onMounted(load);
</script>

<style scoped>
.thumb{ width:100px; height:70px; margin-right:8px; border-radius:6px; box-shadow:0 1px 3px rgba(2,6,23,.15); }
.photos{ display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
</style>



