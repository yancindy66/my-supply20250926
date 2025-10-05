<template>
  <div class="owner-detail-container" v-if="!loading && detail">
    <div class="detail-header">
      <button class="btn-back" @click="goBack">返回</button>
      <h2>存货人详情</h2>
    </div>

    <div class="group">
      <div class="group-title">1. 企业信息</div>
      <div class="grid">
        <div><label>企业名称</label><span>{{ detail.company }}</span></div>
        <div><label>存货人编码</label><span>{{ detail.code }}</span></div>
        <div><label>统一社会信用代码</label><span>{{ detail.creditCode }}</span></div>
        <div><label>企业注册地址</label><span>{{ detail.regAddress }}</span></div>
        <div><label>法定代表人姓名</label><span>{{ detail.legalRepName }}</span></div>
        <div><label>法定代表人身份证号</label><span>{{ detail.legalRepId }}</span></div>
        <div><label>成立日期</label><span>{{ detail.establishDate }}</span></div>
        <div><label>注册资本</label><span>{{ detail.registeredCapital }}</span></div>
        <div class="col-2"><label>经营范围</label><span>{{ detail.businessScope }}</span></div>
      </div>
    </div>

    <div class="group">
      <div class="group-title">2. 企业联系信息</div>
      <div class="grid">
        <div><label>对公账户开户行</label><span>{{ detail.bankName }}</span></div>
        <div><label>对公账户号</label><span>{{ detail.bankAccount }}</span></div>
        <div><label>企业常用邮箱</label><span>{{ detail.companyEmail }}</span></div>
        <div><label>企业联系电话</label><span>{{ detail.companyPhone }}</span></div>
      </div>
    </div>

    <div class="group">
      <div class="group-title">3. 经营信息（初步风控）</div>
      <div class="grid">
        <div><label>年营业额范围</label><span>{{ detail.annualRevenueRange }}</span></div>
        <div><label>主营业务范围</label><span>{{ detail.mainBusiness }}</span></div>
        <div class="col-2"><label>常用合作方</label><span>{{ detail.partners }}</span></div>
      </div>
    </div>

    <div class="group">
      <div class="group-title">4. 账号管理员信息（操作员）</div>
      <div class="grid">
        <div><label>管理员姓名</label><span>{{ detail.adminName }}</span></div>
        <div><label>部门</label><span>{{ detail.adminDept }}</span></div>
        <div><label>职位</label><span>{{ detail.adminTitle }}</span></div>
        <div><label>管理员手机号</label><span>{{ detail.adminPhone }}</span></div>
      </div>
    </div>

    <div class="group">
      <div class="group-title">5. 联系人与地址</div>
      <div class="grid">
        <div><label>联系人</label><span>{{ detail.contact }}</span></div>
        <div><label>电话</label><span>{{ detail.phone }}</span></div>
        <div class="col-2"><label>地址</label><span>{{ detail.address }}</span></div>
      </div>
    </div>

    <div class="group">
      <div class="group-title">6. 资质图片</div>
      <div class="images">
        <div>
          <label>营业执照</label>
          <img v-if="detail.license || detail.licenseDataUrl" :src="imageSrc('license')" class="thumb" @click="openPreview(imageSrc('license'))" />
          <span v-else>—</span>
        </div>
        <div>
          <label>身份证正面</label>
          <img v-if="detail.legalIdFront || detail.legalIdFrontDataUrl" :src="imageSrc('legalIdFront')" class="thumb" @click="openPreview(imageSrc('legalIdFront'))" />
          <span v-else>—</span>
        </div>
        <div>
          <label>身份证反面</label>
          <img v-if="detail.legalIdBack || detail.legalIdBackDataUrl" :src="imageSrc('legalIdBack')" class="thumb" @click="openPreview(imageSrc('legalIdBack'))" />
          <span v-else>—</span>
        </div>
        <div>
          <label>开户许可证</label>
          <img v-if="detail.bankPermit || detail.bankPermitDataUrl" :src="imageSrc('bankPermit')" class="thumb" @click="openPreview(imageSrc('bankPermit'))" />
          <span v-else>—</span>
        </div>
        <div>
          <label>授权委托书</label>
          <img v-if="detail.authLetter || detail.authLetterDataUrl" :src="imageSrc('authLetter')" class="thumb" @click="openPreview(imageSrc('authLetter'))" />
          <span v-else>—</span>
        </div>
        <div>
          <label>法人公章</label>
          <img v-if="detail.seal || detail.sealDataUrl" :src="imageSrc('seal')" class="thumb" @click="openPreview(imageSrc('seal'))" />
          <span v-else>—</span>
        </div>
      </div>
    </div>

    <div v-if="previewVisible" class="img-modal" @click="closePreview">
      <img :src="previewSrc" alt="预览" />
    </div>
  </div>
  <div v-else-if="loading" class="loading">加载中...</div>
  <div v-else class="error">未找到数据</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ownerFileUrl, getOwnerDetail } from '../../../api/inventoryOwner';

const route = useRoute();
const router = useRouter();
const detail = ref<any>(null);
const loading = ref<boolean>(true);
const previewVisible = ref(false);
const previewSrc = ref('');

onMounted(async () => {
  const id = Number(route.params.id);
  try {
    const data = await getOwnerDetail(id);
    detail.value = data as any;
  } catch {
    detail.value = null;
  } finally {
    loading.value = false;
  }
});

function imageSrc(field: string) {
  const dataUrl = detail.value?.[field + 'DataUrl'];
  if (dataUrl) return dataUrl as string;
  const name = detail.value?.[field];
  if (!name) return '';
  return ownerFileUrl(Number(route.params.id), field as any, String(name));
}
function openPreview(src: string) { if (!src) return; previewSrc.value = src; previewVisible.value = true; }
function closePreview() { previewVisible.value = false; previewSrc.value = ''; }
function goBack() { router.push('/operation/member/inventory/list'); }
</script>

<style scoped>
.owner-detail-container { max-width: 960px; margin: 24px auto; padding: 12px; border: none; border-radius: 14px; box-shadow: 0 10px 24px rgba(15,23,42,.08), inset 0 1px 0 rgba(255,255,255,.5); background: linear-gradient(180deg, rgba(255,255,255,.22), rgba(236,244,255,.20)); backdrop-filter: saturate(1.1) blur(12px); }
.detail-header { display:flex; align-items:center; gap:12px; margin-bottom: 8px; }
.btn-back { height: 28px; padding: 0 10px; border-radius: 999px; border: 1px solid rgba(148,163,184,.28); background: linear-gradient(180deg, rgba(255,255,255,.66), rgba(248,250,252,.72)); cursor: pointer; font-size: 12px; color:#334155; transition: transform .12s ease, box-shadow .12s ease, border-color .12s ease; box-shadow: inset 0 1px 0 rgba(255,255,255,.6), 0 3px 8px rgba(15,23,42,.06); }
.btn-back:hover { transform: translateY(-1px); box-shadow: inset 0 1px 0 rgba(255,255,255,.7), 0 8px 16px rgba(15,23,42,.10); border-color: rgba(59,130,246,.45); }
.owner-detail-container h2 { margin: 0 0 8px; font-size: 20px; font-weight: 600; color:#0f172a; }
.group { margin-top: 14px; }
.group-title { position: relative; margin: 0 0 10px; padding-left: 12px; font-size: 14px; color:#1e40af; }
.group-title::before { content:''; position:absolute; left:0; top:50%; transform:translateY(-50%); width:4px; height:14px; border-radius:2px; background: linear-gradient(180deg,#60a5fa,#2563eb); }
.grid { display:grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; }
.grid .col-2 { grid-column: span 2; }
.grid label { display:block; color:#64748b; font-size:12px; margin-bottom: 4px; }
.grid span { display:block; color:#0f172a; font-size:13px; }
.images { display:grid; grid-template-columns: repeat(3,1fr); gap: 10px 16px; }
.images label { display:block; color:#64748b; font-size:12px; margin-bottom: 4px; }
.thumb { height: 72px; border:1px solid #e5e7eb; border-radius:8px; cursor: zoom-in; display:block; }
.img-modal { position: fixed; inset: 0; background: rgba(15,23,42,0.6); display:flex; align-items:center; justify-content:center; z-index: 50; }
.img-modal img { max-width: 92vw; max-height: 92vh; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.35); }
.loading { text-align:center; color:#6b7280; padding: 60px 0; font-size: 13px; }
.error { color: red; text-align: center; margin-top: 80px; }
</style>


