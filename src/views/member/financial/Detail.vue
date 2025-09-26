<template>
  <div class="detail-container" v-if="detail">
    <div class="detail-header">
      <div class="head-left">
        <button class="btn-back" @click="goBack">返回</button>
        <div class="title-line">
          <h2>{{ detail.name || '—' }}</h2>
          <span class="badge">{{ detail.license_number || '—' }}</span>
          <span class="tag type">{{ detail.type || '—' }}</span>
          <span class="tag ok" v-if="isOk(detail.coop_status)">{{ detail.coop_status }}</span>
          <span class="tag warn" v-else-if="isWarn(detail.coop_status)">{{ detail.coop_status }}</span>
          <span class="tag danger" v-else-if="isDanger(detail.coop_status)">{{ detail.coop_status }}</span>
          <span class="tag info" v-else>{{ detail.coop_status || '—' }}</span>
        </div>
      </div>
    </div>

    <div class="group">
      <div class="group-title">基础信息</div>
      <div class="grid">
        <div><label>机构名称</label><span>{{ detail.name || '—' }}</span></div>
        <div><label>许可证编号</label><span>{{ detail.license_number || '—' }}</span></div>
        <div><label>机构类型</label><span>{{ detail.type || '—' }}</span></div>
        <div><label>统一社会信用代码</label><span>{{ detail.creditCode || '—' }}</span></div>
      </div>
    </div>

    <div class="group">
      <div class="group-title">联系与地址</div>
      <div class="grid">
        <div><label>注册地址</label><span class="ellipsis" :title="detail.regAddress">{{ detail.regAddress || '—' }}</span></div>
        <div><label>经营地址</label><span class="ellipsis" :title="detail.bizAddress">{{ detail.bizAddress || '—' }}</span></div>
        <div><label>官方网址</label><span class="ellipsis" :title="detail.website">{{ detail.website || '—' }}</span></div>
        <div><label>客服电话</label><span>{{ detail.servicePhone || '—' }}</span></div>
        <div><label>业务联系人</label><span>{{ detail.contact_person || '—' }}</span></div>
        <div><label>联系人部门及职务</label><span class="ellipsis" :title="detail.contact_title">{{ detail.contact_title || '—' }}</span></div>
        <div><label>联系人手机</label><span>{{ detail.contact_phone || '—' }}</span></div>
        <div><label>联系人邮箱</label><span class="ellipsis" :title="detail.contact_email">{{ detail.contact_email || '—' }}</span></div>
      </div>
    </div>

    <div class="group">
      <div class="group-title">业务信息</div>
      <div class="grid">
        <div class="col-2"><label>核心业务类型</label><span class="ellipsis" :title="detail.core_business_types">{{ detail.core_business_types || '—' }}</span></div>
        <div><label>合作起始日期</label><span>{{ detail.coop_start_date || '—' }}</span></div>
        <div><label>合作状态</label>
          <span class="tag ok" v-if="isOk(detail.coop_status)">{{ detail.coop_status }}</span>
          <span class="tag warn" v-else-if="isWarn(detail.coop_status)">{{ detail.coop_status }}</span>
          <span class="tag danger" v-else-if="isDanger(detail.coop_status)">{{ detail.coop_status }}</span>
          <span class="tag info" v-else>{{ detail.coop_status || '—' }}</span>
        </div>
      </div>
    </div>

    <div class="group">
      <div class="group-title">风控与资质</div>
      <div class="grid">
        <div><label>授信额度</label><span>{{ detail.credit_limit || '—' }}</span></div>
        <div><label>风险评级</label><span>{{ detail.risk_rating || '—' }}</span></div>
        <div><label>准入审核状态</label>
          <span class="tag ok" v-if="isOk(detail.admission_status)">{{ detail.admission_status }}</span>
          <span class="tag warn" v-else-if="isWarn(detail.admission_status)">{{ detail.admission_status }}</span>
          <span class="tag danger" v-else-if="isDanger(detail.admission_status)">{{ detail.admission_status }}</span>
          <span class="tag info" v-else>{{ detail.admission_status || '—' }}</span>
        </div>
      </div>
    </div>

    <div class="group">
      <div class="group-title">系统与管理</div>
      <div class="grid">
        <div><label>管理员账号</label><span>{{ detail.admin_account || '—' }}</span></div>
        <div class="col-2"><label>API信息</label><span class="ellipsis" :title="detail.api_info">{{ detail.api_info || '—' }}</span></div>
      </div>
    </div>

    <div class="group">
      <div class="group-title">备注</div>
      <div class="grid">
        <div class="col-2"><label>备注</label><span class="ellipsis" :title="detail.remark">{{ detail.remark || '—' }}</span></div>
      </div>
    </div>
  </div>
  <div v-else class="error">未找到数据</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { financialApi } from '../../../api/memberModules';

const route = useRoute();
const router = useRouter();
const detail = ref<any>(null);

onMounted(async ()=>{
  const id = Number(route.params.id);
  const res:any = await financialApi.detail(id);
  detail.value = res?.data || res || null;
});

function goBack(){ router.push('/operation/member/financial-institutions'); }

function isOk(s?: string){ const t=(s||'').toLowerCase(); return t.includes('通过')||t.includes('正常')||t.includes('合作中'); }
function isWarn(s?: string){ const t=(s||'').toLowerCase(); return t.includes('暂停')||t.includes('处理中')||t.includes('审核中'); }
function isDanger(s?: string){ const t=(s||'').toLowerCase(); return t.includes('终止')||t.includes('失败')||t.includes('拒绝'); }
</script>

<style scoped>
.detail-container { max-width: 1040px; margin: 24px auto; padding: 14px; border-radius: 16px; background: linear-gradient(180deg, rgba(255,255,255,.52), rgba(236,244,255,.48)); -webkit-backdrop-filter: blur(10px) saturate(1.05); backdrop-filter: blur(10px) saturate(1.05); box-shadow: 0 10px 24px rgba(15,23,42,.08), inset 0 1px 0 rgba(255,255,255,.6); }
.detail-header { display:flex; align-items:center; justify-content: space-between; margin-bottom: 6px; }
.btn-back { height: 28px; padding: 0 10px; border-radius: 999px; border: 1px solid rgba(148,163,184,.28); background: linear-gradient(180deg, rgba(255,255,255,.66), rgba(248,250,252,.72)); cursor:pointer; }
.title-line { display:flex; align-items:center; gap:8px; }
.title-line h2 { margin:0; font-size:18px; font-weight:600; color:#0f172a; }
.badge { display:inline-block; padding:2px 8px; border-radius:999px; background:#eef2ff; color:#1e3a8a; font-size:12px; border:1px solid #c7d2fe; }
.tag { display:inline-block; padding:2px 8px; border-radius:999px; font-size:12px; }
.tag.type { background:#f1f5f9; color:#334155; border:1px solid #e2e8f0; }
.tag.ok { background:#ecfdf5; color:#059669; border:1px solid #bbf7d0; }
.tag.warn { background:#fffbeb; color:#d97706; border:1px solid #fde68a; }
.tag.danger { background:#fef2f2; color:#dc2626; border:1px solid #fecaca; }
.tag.info { background:#eef2ff; color:#1e3a8a; border:1px solid #c7d2fe; }
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


