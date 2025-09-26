<template>
  <div class="detail-container" v-if="detail">
    <div class="detail-header">
      <button class="btn-back" @click="goBack">返回</button>
      <h2>{{ detail.name || '监管仓库详情' }}</h2>
    </div>
    <div class="group">
      <div class="group-title">基础信息</div>
      <div class="grid">
        <div><label>仓库名称</label><span>{{ detail.name || '—' }}</span></div>
        <div><label>统一社会信用代码</label><span>{{ detail.creditCode || '—' }}</span></div>
        <div><label>仓库类型</label><span>{{ detail.warehouseType || '—' }}</span></div>
        <div class="col-2"><label>仓库地址</label><span class="ellipsis" :title="detail.address">{{ detail.address || '—' }}</span></div>
        <div><label>仓库面积(㎡)</label><span>{{ detail.area || '—' }}</span></div>
        <div><label>可用容积(m³)</label><span>{{ detail.capacity || '—' }}</span></div>
        <div><label>最大承重(吨/㎡)</label><span>{{ detail.maxLoad || '—' }}</span></div>
      </div>
    </div>
    <div class="group">
      <div class="group-title">监控安防</div>
      <div class="grid">
        <div class="col-2"><label>安保措施描述</label><span class="ellipsis" :title="detail.securityDesc">{{ detail.securityDesc || '—' }}</span></div>
        <div><label>主要监控服务商</label><span class="ellipsis" :title="detail.securityVendor">{{ detail.securityVendor || '—' }}</span></div>
        <div><label>物联网接入</label><span>{{ detail.iotAccess || '—' }}</span></div>
      </div>
    </div>
    <div class="group">
      <div class="group-title">合作与人员</div>
      <div class="grid">
        <div><label>合作起始日期</label><span>{{ detail.coop_start_date || '—' }}</span></div>
        <div><label>合作状态</label><span>{{ detail.coop_status || '—' }}</span></div>
        <div><label>负责人姓名</label><span>{{ detail.headName || '—' }}</span></div>
        <div><label>负责人手机</label><span>{{ detail.headPhone || '—' }}</span></div>
        <div class="col-2"><label>负责人邮箱</label><span class="ellipsis" :title="detail.headEmail">{{ detail.headEmail || '—' }}</span></div>
      </div>
    </div>
    <div class="group">
      <div class="group-title">风控与系统</div>
      <div class="grid">
        <div><label>风险评级</label><span>{{ detail.risk_rating || '—' }}</span></div>
        <div><label>准入审核状态</label><span>{{ detail.admission_status || '—' }}</span></div>
        <div><label>管理员账号</label><span>{{ detail.admin_account || '—' }}</span></div>
        <div class="col-2"><label>备注</label><span class="ellipsis" :title="detail.remark">{{ detail.remark || '—' }}</span></div>
      </div>
    </div>
  </div>
  <div v-else class="error">未找到数据</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { warehouseApi } from '../../../api/memberModules';

const route = useRoute();
const router = useRouter();
const detail = ref<any>(null);

onMounted(async ()=>{
  const id = Number(route.params.id);
  const res:any = await warehouseApi.detail(id);
  detail.value = res?.data || res || null;
});

function goBack(){ router.push('/operation/member/supervised-warehouses'); }
</script>

<style scoped>
.detail-container { max-width: 1040px; margin: 24px auto; padding: 14px; border-radius: 16px; background: linear-gradient(180deg, rgba(255,255,255,.52), rgba(236,244,255,.48)); -webkit-backdrop-filter: blur(10px) saturate(1.05); backdrop-filter: blur(10px) saturate(1.05); box-shadow: 0 10px 24px rgba(15,23,42,.08), inset 0 1px 0 rgba(255,255,255,.6); }
.detail-header { display:flex; align-items:center; gap:12px; margin-bottom: 8px; }
.btn-back { height: 28px; padding: 0 10px; border-radius: 999px; border: 1px solid rgba(148,163,184,.28); background: linear-gradient(180deg, rgba(255,255,255,.66), rgba(248,250,252,.72)); cursor:pointer; }
.group { margin-top: 12px; }
.group-title { position: relative; margin: 0 0 8px; padding-left: 10px; font-size: 13px; color:#1e40af; font-weight:600; }
.group-title::before { content:''; position:absolute; left:0; top:50%; transform:translateY(-50%); width:4px; height:12px; border-radius:2px; background: linear-gradient(180deg,#60a5fa,#2563eb); }
.grid { display:grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; }
.grid .col-2 { grid-column: span 2; }
label { display:block; color:#64748b; font-size:12px; margin-bottom: 4px; }
span { display:block; color:#0f172a; font-size:13px; }
.ellipsis { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.error { color:#ef4444; text-align:center; margin-top: 40px; }
</style>


