<template>
  <div class="page">
    <h2>门岗核验（办公室）</h2>
    <div class="panel">
      <div class="row">
        <label>搜索</label>
        <input v-model="kw" class="flex1" placeholder="预约号/客户/车牌/司机" />
        <button @click="load">刷新</button>
      </div>
      <table class="table">
        <thead>
          <tr>
            <th>预约单号</th>
            <th>客户</th>
            <th>商品</th>
            <th>预计入库时间</th>
            <th>车牌</th>
            <th>司机手机</th>
            <th>司机身份证</th>
            <th>入场抓拍</th>
            <th>入场时间</th>
            <th>出场抓拍</th>
            <th>出场时间</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="b in rows" :key="b.reservation_number">
            <td>{{ b.reservation_number }}</td>
            <td>{{ b.owner_name || '-' }}</td>
            <td>{{ b.commodity_id }}</td>
            <td>{{ b.expected_arrival_start || '-' }}</td>
            <td>{{ b.vehicle_plate || '-' }}</td>
            <td>{{ b.driver_phone || '-' }}</td>
            <td>{{ b.driver_id_card || '-' }}</td>
            <td>{{ b.entry_capture || '-' }}</td>
            <td>{{ b.entry_time || '-' }}</td>
            <td>{{ b.exit_capture || '-' }}</td>
            <td>{{ b.exit_time || '-' }}</td>
            <td>{{ b.status }}</td>
          </tr>
          <tr v-if="!rows.length"><td colspan="6" class="empty">暂无数据</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { apiGetOfficeList } from '@/api/gate';

const list = ref<any[]>([]);
const kw = ref('');
let timer: any = null;

async function load(){
  try{ const resp:any = await apiGetOfficeList({ page:1, pageSize:100 }); list.value = resp?.data?.list || []; }
  catch{ list.value = []; }
}
onMounted(load);
onMounted(()=>{ timer = setInterval(load, 5000); });
onUnmounted(()=>{ if(timer) clearInterval(timer); });

const rows = computed(()=>{
  const k = kw.value.trim(); if(!k) return list.value;
  return list.value.filter((b:any)=>`${b.reservation_number||''} ${b.owner_name||''} ${b.vehicle_plate||''}`.includes(k));
});
</script>

<style scoped>
.page{ padding:16px; }
.panel{ background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:12px; }
.row{ display:flex; gap:8px; align-items:center; margin-bottom:10px; }
.flex1{ flex:1; }
.table{ width:100%; border-collapse:collapse; }
.table th,.table td{ border-bottom:1px solid #eef2f7; padding:8px; text-align:left; }
</style>


