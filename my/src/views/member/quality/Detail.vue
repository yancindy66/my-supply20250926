<template>
  <div class="detail-container" v-if="detail">
    <div class="detail-header">
      <button class="btn-back" @click="goBack">返回</button>
      <h2>{{ detail.name || '质检机构详情' }}</h2>
    </div>
    <div class="group">
      <div class="group-title">基础信息</div>
      <div class="grid">
        <div><label>机构名称</label><span>{{ detail.name || '—' }}</span></div>
        <div><label>统一社会信用代码</label><span>{{ detail.creditCode || '—' }}</span></div>
        <div><label>资质证书编号</label><span>{{ detail.qualCertNo || '—' }}</span></div>
        <div><label>资质有效期</label><span>{{ detail.qualValidTo || '—' }}</span></div>
        <div class="col-2"><label>资质认证类型</label><span class="ellipsis" :title="(detail.qualification_type||[]).join(', ')">{{ (detail.qualification_type||[]).join(', ') || '—' }}</span></div>
      </div>
    </div>
    <div class="group">
      <div class="group-title">技术能力</div>
      <div class="grid">
        <div class="col-2"><label>可检测的货物品类</label><span class="ellipsis" :title="formatCats(detail.testing_categories)">{{ formatCats(detail.testing_categories) || '—' }}</span></div>
        <div class="col-2"><label>检测能力描述</label><span class="ellipsis" :title="detail.capabilityDesc">{{ detail.capabilityDesc || '—' }}</span></div>
      </div>
    </div>
    <div class="group">
      <div class="group-title">联系信息</div>
      <div class="grid">
        <div><label>注册地址</label><span class="ellipsis" :title="detail.regAddress">{{ detail.regAddress || '—' }}</span></div>
        <div><label>经营地址</label><span class="ellipsis" :title="detail.bizAddress">{{ detail.bizAddress || '—' }}</span></div>
        <div><label>官方网址</label><span class="ellipsis" :title="detail.website">{{ detail.website || '—' }}</span></div>
        <div><label>客服电话</label><span>{{ detail.servicePhone || '—' }}</span></div>
        <div class="col-2"><label>报告查询链接</label><span class="ellipsis" :title="detail.reportVerifyUrl">{{ detail.reportVerifyUrl || '—' }}</span></div>
      </div>
    </div>
    <div class="group">
      <div class="group-title">业务与审核</div>
      <div class="grid">
        <div><label>合作起始日期</label><span>{{ detail.coop_start_date || '—' }}</span></div>
        <div><label>合作状态</label><span>{{ detail.coop_status || '—' }}</span></div>
        <div><label>准入审核状态</label><span>{{ detail.admission_status || '—' }}</span></div>
      </div>
    </div>
    <div class="group">
      <div class="group-title">联系人与系统</div>
      <div class="grid">
        <div><label>业务联系人</label><span>{{ detail.contact || '—' }}</span></div>
        <div><label>联系人部门及职务</label><span class="ellipsis" :title="detail.contactTitle">{{ detail.contactTitle || '—' }}</span></div>
        <div><label>联系人手机</label><span>{{ detail.contactPhone || '—' }}</span></div>
        <div><label>联系人邮箱</label><span class="ellipsis" :title="detail.contactEmail">{{ detail.contactEmail || '—' }}</span></div>
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
import { qualityApi } from '../../../api/memberModules';

const route = useRoute();
const router = useRouter();
const detail = ref<any>(null);

onMounted(async ()=>{
  const id = Number(route.params.id);
  const res:any = await qualityApi.detail(id);
  detail.value = res?.data || res || null;
});

function formatCats(cats:any){
  try{ if(Array.isArray(cats)) return cats.map((x:any)=> typeof x==='string'?x: (x?.label||x?.value||'' )).join(' / '); return ''; }catch{ return ''; }
}
function goBack(){ router.push('/operation/member/quality-agencies'); }
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


