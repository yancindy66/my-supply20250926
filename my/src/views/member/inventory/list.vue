<template>
  <div class="owner-list-container" :class="['density-' + density]">
    <h2>存货人管理</h2>
    <div v-if="errorMsg" class="alert-bar">
      <span class="msg">{{ errorMsg }}</span>
      <button class="btn-retry" @click="retryFetch">重试</button>
      <button class="btn-close" @click="errorMsg=''" aria-label="关闭">×</button>
    </div>
    <div class="header-row">
      <div class="left-actions">
        <button class="op-btn primary sm" title="新增" @click="goAdd">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19 11H13V5h-2v6H5v2h6v6h2v-6h6z"/></svg>
          <span>新增存货人</span>
        </button>
        <button class="op-btn info sm" title="批量导入" @click="onImportClick">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z"/></svg>
          <span>批量导入</span>
        </button>
        <button class="op-btn danger sm" title="批量删除" :disabled="selectedIds.length===0" @click="openBatchConfirm">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16 9v10H8V9h8m-1.5-4h-5l-1 1H6v2h12V6h-2.5l-1-1z"/></svg>
          <span>批量删除</span>
        </button>
        <input ref="importFileRef" type="file" accept=".csv" @change="onImportFile" style="display:none;" />
      </div>
      <div class="search-area">
        <div class="search-wrap">
          <svg class="icon clickable" @click="onSearch" viewBox="0 0 24 24"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5z"/></svg>
          <input v-model="queryName" placeholder="输入任意关键词（年份、城市、人名、号码等）" @keyup.enter="onSearch" />
        </div>
        <button class="op-btn sm refresh-btn" title="刷新" @click="onReset">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.65 6.35A7.95 7.95 0 0012 4V1L7 6l5 5V7c2.76 0 5 2.24 5 5a5 5 0 11-1.35-3.65l1.42-1.42z"/></svg>
          <span class="more-text">刷新</span>
        </button>
      </div>
      <div class="right-actions">
        <button class="op-btn sm" title="更多" @click.stop="toggleMore">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12,16A2,2 0 1,1 12,12A2,2 0 0,1 12,16M12,10A2,2 0 1,1 12,6A2,2 0 0,1 12,10M12,22A2,2 0 1,1 12,18A2,2 0 0,1 12,22Z"/></svg>
          <span class="more-text">更多</span>
        </button>
      </div>
    </div>
    <div class="more-panel" v-if="moreOpen">
      <div class="panel-row">
        <button class="btn btn-danger" @click="exportClient">导出 Excel（客户端）</button>
        <a class="btn btn-danger" :href="exportUrl" target="_blank" rel="noopener">导出（服务端）</a>
        <button class="btn btn-danger" @click="printPage">打印</button>
        <button class="btn btn-danger" @click="goExcel">Excel 编辑</button>
        <button class="btn btn-danger" @click="triggerAi">AI 识别</button>
        <input id="ai-file" ref="aiFileRef" class="ai-file" type="file" accept=".jpg,.jpeg,.png,.pdf" @change="onAiFile" style="display:none;" />
        <button class="btn btn-danger" @click="onReset">重置筛选</button>
        <button class="btn btn-danger" @click="toggleDensity">切换密度（{{ densityLabel }}）</button>
        <div class="group-title" style="margin-left:6px;">每页：</div>
        <div class="size-row">
          <button class="size-btn jelly" :class="{active: pageSize===10}" @click="setPageSize(10, $event)">10</button>
          <button class="size-btn jelly" :class="{active: pageSize===20}" @click="setPageSize(20, $event)">20</button>
          <button class="size-btn jelly" :class="{active: pageSize===50}" @click="setPageSize(50, $event)">50</button>
          <button class="size-btn jelly" :class="{active: pageSize===100}" @click="setPageSize(100, $event)">100</button>
        </div>
      </div>
    </div>

    <div class="table-wrapper">
      <table class="owner-table">
        <thead>
          <tr>
            <th class="index-col" @click="toggleSort('id')">
              <input class="mini-check" type="checkbox" :checked="allSelected" @change="toggleSelectAll($event)" @click.stop />
              <span class="idx-label">序号</span> <span class="sort" :data-k="'id'"></span>
            </th>
            <th class="name-col" v-if="visibleMap.company" @click="toggleSort('company')">公司名称 <span class="sort" :data-k="'company'"></span></th>
            <th v-if="visibleMap.code" @click="toggleSort('code')">存货人编码 <span class="sort" :data-k="'code'"></span></th>
            <th v-if="visibleMap.creditCode" @click="toggleSort('creditCode')">统一社会信用代码 <span class="sort" :data-k="'creditCode'"></span></th>
            <th v-if="visibleMap.regAddress">企业注册地址</th>
            <th>法定代表人姓名</th>
            <th>法定代表人身份证号</th>
            <th>成立日期</th>
            <th>注册资本</th>
            <th>经营范围</th>
            <th>对公账户开户行</th>
            <th>对公账户号</th>
            <th>企业常用邮箱</th>
            <th>企业联系电话</th>
            <th>年营业额范围</th>
            <th>主营业务范围</th>
            <th>常用合作方</th>
            <th>管理员姓名</th>
            <th>部门</th>
            <th>职位</th>
            <th>管理员手机号</th>
            <th v-if="visibleMap.contact">联系人</th>
            <th v-if="visibleMap.phone">电话</th>
            <th v-if="visibleMap.address">地址</th>
            <th>营业执照</th>
            <th>身份证正面</th>
            <th>身份证反面</th>
            <th>开户许可证</th>
            <th>授权委托书</th>
            <th>法人公章</th>
            <th class="sticky-right op-col">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="31" class="center">加载中...</td>
          </tr>
          <tr v-else-if="!loading && list.length === 0">
            <td colspan="31" class="center">暂无数据，点击“新增存货人”开始创建</td>
          </tr>
          <tr v-for="(row, idx) in list" :key="row.id">
            <td class="index-col">
              <input class="mini-check" type="checkbox" :checked="selectedIdsSet.has(row.id as number)" @change="(e:any)=>{const s=new Set(selectedIds.value); if(e.target.checked) s.add(row.id as number); else s.delete(row.id as number); selectedIds.value=[...s];}" />
              <span class="idx-label">{{ (page - 1) * pageSize + idx + 1 }}</span>
            </td>
            <td class="name-col" v-if="visibleMap.company">{{ row.company }}</td>
            <td v-if="visibleMap.code">{{ row.code }}</td>
            <td v-if="visibleMap.creditCode">{{ row.creditCode }}</td>
            <td v-if="visibleMap.regAddress">{{ row.regAddress }}</td>
            <td>{{ row.legalRepName }}</td>
            <td>{{ row.legalRepId }}</td>
            <td>{{ row.establishDate }}</td>
            <td>{{ row.registeredCapital }}</td>
            <td class="text-ellipsis" :title="row.businessScope">{{ row.businessScope }}</td>
            <td>{{ row.bankName }}</td>
            <td>{{ row.bankAccount }}</td>
            <td>{{ row.companyEmail }}</td>
            <td>{{ row.companyPhone }}</td>
            <td>{{ row.annualRevenueRange }}</td>
            <td class="text-ellipsis" :title="row.mainBusiness">{{ row.mainBusiness }}</td>
            <td class="text-ellipsis" :title="row.partners">{{ row.partners }}</td>
            <td>{{ row.adminName }}</td>
            <td>{{ row.adminDept }}</td>
            <td>{{ row.adminTitle }}</td>
            <td>{{ row.adminPhone }}</td>
            <td v-if="visibleMap.contact">{{ row.contact }}</td>
            <td v-if="visibleMap.phone">{{ row.phone }}</td>
            <td v-if="visibleMap.address" class="text-ellipsis" :title="row.address">{{ row.address }}</td>
            <td>
              <img v-if="imageSrc(row,'license')" :src="imageSrc(row,'license')" class="thumb" @click="openPreview(imageSrc(row,'license'))" />
            </td>
            <td>
              <img v-if="imageSrc(row,'legalIdFront')" :src="imageSrc(row,'legalIdFront')" class="thumb" @click="openPreview(imageSrc(row,'legalIdFront'))" />
            </td>
            <td>
              <img v-if="imageSrc(row,'legalIdBack')" :src="imageSrc(row,'legalIdBack')" class="thumb" @click="openPreview(imageSrc(row,'legalIdBack'))" />
            </td>
            <td>
              <img v-if="imageSrc(row,'bankPermit')" :src="imageSrc(row,'bankPermit')" class="thumb" @click="openPreview(imageSrc(row,'bankPermit'))" />
            </td>
            <td>
              <img v-if="imageSrc(row,'authLetter')" :src="imageSrc(row,'authLetter')" class="thumb" @click="openPreview(imageSrc(row,'authLetter'))" />
            </td>
            <td>
              <img v-if="imageSrc(row,'seal')" :src="imageSrc(row,'seal')" class="thumb" @click="openPreview(imageSrc(row,'seal'))" />
            </td>
            <td class="op-col sticky-right">
              <button class="op-btn info" title="查看" @click="goDetail(row.id)">
                <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path fill="currentColor" d="M12 7a2 2 0 110 4 2 2 0 010-4zm0 6c-2.21 0-4 1.12-4 2.5V17h8v-1.5c0-1.38-1.79-2.5-4-2.5z"/></svg>
              </button>
              <button class="op-btn primary" title="编辑" @click="goEdit(row.id)">
                <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
              </button>
              <button class="op-btn print" title="打印" @click="printRow(row)">
                <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path fill="currentColor" d="M19 8H5a3 3 0 00-3 3v4h4v4h12v-4h4v-4a3 3 0 00-3-3zm-3 10H8v-4h8v4zm3-7a1 1 0 110-2 1 1 0 010 2zM17 3H7v3h10V3z"/></svg>
              </button>
              <button class="op-btn danger" title="删除" @click="confirmDelete(row.id)">
                <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path fill="currentColor" d="M16 9v10H8V9h8m-1.5-4h-5l-1 1H6v2h12V6h-2.5l-1-1z"/></svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination" v-if="total > 0">
      <button :disabled="page === 1" @click="toPrev">上一页</button>
      <span>第 {{ page }} / {{ totalPages }} 页</span>
      <button :disabled="page === totalPages" @click="toNext">下一页</button>
      <span class="total">当前显示 {{ pageStart }} - {{ pageEnd }} 条，共 {{ total }} 条</span>
      <label class="form-item" style="margin-left:8px;"><span class="label">跳转到</span>
        <input type="number" v-model.number="jumpPage" min="1" :max="totalPages" style="width:72px;" />
      </label>
      <button class="btn" @click="goPage">跳转</button>
    </div>
  </div>

  <!-- 删除确认弹框 -->
  <div v-if="showConfirm" class="confirm-overlay" @click.self="showConfirm=false">
    <div class="confirm-dialog">
      <div class="confirm-title">删除存货人</div>
      <div class="confirm-message">确定要删除"{{ confirmName }}"吗？此操作不可撤销。</div>
      <div class="confirm-actions">
        <button class="btn btn-danger" @click="deleteOne(confirmId!)">确定</button>
        <button class="btn btn-ghost" @click="showConfirm=false">取消</button>
      </div>
    </div>
  </div>
  <div v-if="showBatchConfirm" class="confirm-overlay" @click.self="showBatchConfirm=false">
    <div class="confirm-dialog">
      <div class="confirm-title">批量删除存货人</div>
      <div class="confirm-message">确定要删除所选 {{ selectedIds.length }} 条记录吗？此操作不可撤销。</div>
      <div class="confirm-actions">
        <button class="btn btn-danger" @click="confirmBatchDelete">确定</button>
        <button class="btn btn-ghost" @click="showBatchConfirm=false">取消</button>
      </div>
    </div>
  </div>
  
  <div v-if="previewVisible" class="img-modal" @click="closePreview">
    <img :src="previewSrc" alt="预览" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onBeforeUnmount, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { listOwners, deleteOwner, ownerFileUrl, createOwner, getOwnerDetail } from '../../../api/inventoryOwner';
import type { InventoryOwner } from '../../../types/inventoryOwner';

const router = useRouter();

const queryName = ref<string>('');
const queryStatus = ref<string>('');

const page = ref<number>(1);
const pageSize = ref<number>(10);
const total = ref<number>(0);
const list = ref<InventoryOwner[]>([]);
const selectedIds = ref<number[]>([]);
const selectedIdsSet = computed(()=> new Set(selectedIds.value));
const allSelected = computed(() => list.value.length>0 && list.value.every(r=> selectedIdsSet.value.has(r.id as number)));
const loading = ref<boolean>(false);
const previewVisible = ref(false);
const previewSrc = ref('');
const errorMsg = ref('');
const sortBy = ref<string>('');
const sortOrder = ref<'asc' | 'desc'>('asc');
const importFileRef = ref<HTMLInputElement|null>(null);

// 删除确认相关
const showConfirm = ref(false);
const confirmId = ref<number|null>(null);
const confirmName = computed(()=>{ const o = list.value.find(x=>x.id===confirmId.value); return o?.company || ''; });
const showBatchConfirm = ref(false);

// 列显示开关（可扩展更多字段）
const visibleMap = ref<Record<string, boolean>>({
  company: true,
  code: true,
  creditCode: true,
  regAddress: true,
  contact: true,
  phone: true,
  address: true
});
const labels: Record<string, string> = {
  company: '公司名称',
  code: '存货人编码',
  creditCode: '统一社会信用代码',
  regAddress: '企业注册地址',
  contact: '联系人',
  phone: '电话',
  address: '地址'
};
const showCols = ref(false);
// 密度：compact/comfortable
const density = ref<'compact' | 'comfortable'>(
  (localStorage.getItem('inv_density') as any) || (window.innerWidth >= 1920 ? 'comfortable' : 'compact')
);
const densityLabel = computed(() => density.value === 'compact' ? '紧凑' : '宽松');
function toggleDensity(){ density.value = density.value === 'compact' ? 'comfortable' : 'compact'; localStorage.setItem('inv_density', density.value); }
// 自动刷新
const autoRefreshEnabled = ref(false);
const autoInterval = ref<number>(30);
let autoTimer: any = null;
const exportOpen = ref(false);
const moreOpen = ref(false);

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(total.value / pageSize.value));
});

async function fetchData() {
  loading.value = true;
  try {
    const params: any = {
      keyword: queryName.value,
      page: page.value,
      pageSize: pageSize.value,
      sortBy: sortBy.value,
      sortOrder: sortOrder.value
    };
    if (queryStatus.value) params.status = queryStatus.value;
    const res = await listOwners(params as any);
    list.value = res?.list || [];
    total.value = res?.total || 0;
    errorMsg.value = '';
  } catch (err) {
    // 接口失败时：不抛错，显示空列表并给出轻提示
    list.value = [];
    total.value = 0;
    errorMsg.value = '加载失败（暂时显示空列表），请稍后重试';
  } finally {
    loading.value = false;
  }
}

function onSearch() {
  page.value = 1;
  fetchData();
}

function onReset() {
  queryName.value = '';
  queryStatus.value = '';
  page.value = 1;
  sortBy.value = '';
  sortOrder.value = 'asc';
  fetchData();
}

function toPrev() {
  if (page.value > 1) {
    page.value -= 1;
    fetchData();
  }
}

function onPageSizeChange() {
  page.value = 1;
  fetchData();
}

function toNext() {
  if (page.value < totalPages.value) {
    page.value += 1;
    fetchData();
  }
}

function goAdd() {
  router.push('/member/inventory/add');
}

function goEdit(id: number) {
  router.push(`/member/inventory/edit/${id}`);
}

function goDetail(id: number) {
  router.push(`/member/inventory/detail/${id}`);
}

function toggleSelectAll(e: Event){
  const checked = (e.target as HTMLInputElement).checked;
  if(checked){
    const s = new Set<number>(selectedIds.value);
    list.value.forEach(r=> s.add(r.id as number));
    selectedIds.value = Array.from(s);
  }else{
    const cur = new Set<number>(list.value.map(r=> r.id as number));
    selectedIds.value = selectedIds.value.filter(id => !cur.has(id));
  }
}

function onImportClick(){ importFileRef.value?.click(); }
function parseCSV(text: string): any[] {
  const lines = text.split(/\r?\n/).filter(l=>l.trim().length>0);
  if(lines.length===0) return [];
  const header = lines[0].split(',').map(h=>h.replace(/^"|"$/g,'').trim());
  const rows = lines.slice(1).map(line=>{
    const cols: string[] = [];
    let cur = '';
    let inQ = false;
    for (let i=0;i<line.length;i++){
      const ch=line[i];
      if(ch==='"'){
        if(inQ && line[i+1]==='"'){ cur += '"'; i++; }
        else inQ = !inQ;
      } else if(ch===',' && !inQ){ cols.push(cur); cur=''; }
      else cur += ch;
    }
    cols.push(cur);
    return header.reduce((acc:any, key:string, idx:number)=>{ acc[key]=cols[idx]?.trim?.() ?? ''; return acc; }, {});
  });
  return rows;
}
function onImportFile(e: Event){
  const files = (e.target as HTMLInputElement).files; if(!files||files.length===0) return;
  const file = files[0];
  const reader = new FileReader();
  reader.onload = async () => {
    try{
      const text = String(reader.result||'');
      const items = parseCSV(text);
      if(items.length===0) { alert('CSV 无数据'); return; }
      const map: Record<string,string> = {
        '企业名称':'company','存货人编码':'code','统一社会信用代码':'creditCode','企业注册地址':'regAddress','法定代表人姓名':'legalRepName','法定代表人身份证号':'legalRepId','成立日期':'establishDate','注册资本':'registeredCapital','经营范围':'businessScope','对公账户开户行':'bankName','对公账户号':'bankAccount','企业常用邮箱':'companyEmail','企业联系电话':'companyPhone','年营业额范围':'annualRevenueRange','主营业务范围':'mainBusiness','常用合作方':'partners','管理员姓名':'adminName','部门':'adminDept','职位':'adminTitle','管理员手机号':'adminPhone','联系人':'contact','电话':'phone','地址':'address'
      };
      let success=0, fail=0;
      for(const it of items){
        const payload:any = {};
        Object.keys(it).forEach(k=>{ const key = map[k] || k; payload[key] = it[k]; });
        try{ await createOwner(payload); success++; }catch{ fail++; }
      }
      alert(`导入完成：成功 ${success} 条，失败 ${fail} 条`);
      fetchData();
    }catch(err:any){ alert('导入失败：'+(err?.message||'未知错误')); }
    (e.target as HTMLInputElement).value = '';
  };
  reader.readAsText(file, 'utf-8');
}

function confirmDelete(id: number) {
  confirmId.value = id;
  showConfirm.value = true;
}

async function deleteOne(id: number) {
  try {
    await deleteOwner(id);
    showConfirm.value = false;
    confirmId.value = null;
    fetchData();
  } catch (e) {
    alert('删除失败');
  }
}

function openBatchConfirm() {
  if (selectedIds.value.length > 0) {
    showBatchConfirm.value = true;
  }
}

async function confirmBatchDelete() {
  const ids = [...selectedIds.value];
  for (const id of ids) {
    try {
      await deleteOwner(id);
    } catch {}
  }
  selectedIds.value = [];
  showBatchConfirm.value = false;
  fetchData();
}

onMounted(fetchData);

function imageSrc(row: any, field: string): string {
  const dataUrl = row?.[field + 'DataUrl'];
  if (dataUrl) return dataUrl as string;
  const name = row?.[field];
  if (!name) return '';
  return ownerFileUrl(Number(row.id), field as any, String(name));
}
function openPreview(src: string) { if (!src) return; previewSrc.value = src; previewVisible.value = true; }
function closePreview() { previewVisible.value = false; previewSrc.value = ''; }

function toggleSort(key: string) {
  if (sortBy.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = key;
    sortOrder.value = 'asc';
  }
  fetchData();
}

function retryFetch(){ errorMsg.value=''; fetchData(); }

// 导出
const exportUrl = computed(() => {
  const usp = new URLSearchParams({
    keyword: queryName.value || '',
    sortBy: sortBy.value || '',
    sortOrder: sortOrder.value || 'asc'
  });
  return `/api/inventory-owner/export?${usp.toString()}`;
});

function exportClient() {
  const header = [
    '企业名称','存货人编码','统一社会信用代码','企业注册地址','法定代表人姓名','法定代表人身份证号','成立日期','注册资本','经营范围',
    '对公账户开户行','对公账户号','企业常用邮箱','企业联系电话','年营业额范围','主营业务范围','常用合作方',
    '管理员姓名','部门','职位','管理员手机号','联系人','电话','地址'
  ];
  const rows = list.value.map(r => [
    r.company, r.code, r.creditCode, r.regAddress, r.legalRepName, r.legalRepId, r.establishDate, r.registeredCapital, r.businessScope,
    r.bankName, r.bankAccount, r.companyEmail, r.companyPhone, r.annualRevenueRange, r.mainBusiness, r.partners,
    r.adminName, r.adminDept, r.adminTitle, r.adminPhone, r.contact, r.phone, r.address
  ]);
  const lines = [header, ...rows].map(arr => arr.map(v => {
    const s = String(v ?? '').replace(/"/g, '""');
    return /[",\n]/.test(s) ? '"' + s + '"' : s;
  }).join(',')).join('\n');
  const csv = '\ufeff' + lines;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `inventory-owners-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// 分页信息与跳转
const pageStart = computed(() => (total.value === 0 ? 0 : (page.value - 1) * pageSize.value + 1));
const pageEnd = computed(() => Math.min(page.value * pageSize.value, total.value));
const jumpPage = ref<number>(1);
function goPage() {
  if (!jumpPage.value) return;
  const p = Math.max(1, Math.min(totalPages.value, jumpPage.value));
  if (p !== page.value) { page.value = p; fetchData(); }
}

// 自动刷新实现
watch([autoRefreshEnabled, autoInterval], () => {
  if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  if (autoRefreshEnabled.value) {
    autoTimer = setInterval(() => fetchData(), Math.max(5, autoInterval.value) * 1000);
  }
});
onBeforeUnmount(() => { if (autoTimer) clearInterval(autoTimer); autoTimer = null; });

function toggleExport(){ exportOpen.value = !exportOpen.value; moreOpen.value = false; }
function toggleMore(){
  moreOpen.value = !moreOpen.value; exportOpen.value = false;
  if (moreOpen.value) {
    nextTick(()=>{
      const p = document.querySelector('.more-panel');
      if (p && 'scrollIntoView' in p) {
        try { (p as any).scrollIntoView({ behavior:'smooth', block:'nearest' }); } catch {}
      }
    });
  }
}
function printPage(){ window.print(); }
async function printRow(row:any){
  try{
    const id = row?.id;
    const d:any = await getOwnerDetail(Number(id));
    const html = `<!doctype html>
<html lang="zh-CN"><head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>存货人详情 - 打印</title>
  <style>
    body{ font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,'PingFang SC','Microsoft YaHei',sans-serif; color:#0f172a; }
    .wrap{ max-width:900px; margin:20px auto; padding:16px; }
    h1{ font-size:18px; margin:0 0 10px; }
    .grid{ display:grid; grid-template-columns: 1fr 1fr; gap:10px 16px; }
    .cell label{ display:block; font-size:12px; color:#64748b; margin-bottom:4px; }
    .cell span{ display:block; font-size:13px; }
    .group{ margin-top:12px; }
    .title{ font-weight:600; color:#1e40af; font-size:13px; margin:8px 0; }
  </style>
</head><body>
  <div class="wrap">
    <h1>${d.company || '存货人详情'}</h1>
    <div class="group">
      <div class="title">基础信息</div>
      <div class="grid">
        <div class="cell"><label>企业名称</label><span>${d.company||'—'}</span></div>
        <div class="cell"><label>存货人编码</label><span>${d.code||'—'}</span></div>
        <div class="cell"><label>统一社会信用代码</label><span>${d.creditCode||'—'}</span></div>
        <div class="cell"><label>企业注册地址</label><span>${d.regAddress||'—'}</span></div>
        <div class="cell"><label>联系人</label><span>${d.contact||'—'}</span></div>
        <div class="cell"><label>电话</label><span>${d.phone||'—'}</span></div>
        <div class="cell"><label>地址</label><span>${d.address||'—'}</span></div>
      </div>
    </div>
    <div class="group">
      <div class="title">法人与注册</div>
      <div class="grid">
        <div class="cell"><label>法定代表人姓名</label><span>${d.legalRepName||'—'}</span></div>
        <div class="cell"><label>法定代表人身份证号</label><span>${d.legalRepId||'—'}</span></div>
        <div class="cell"><label>成立日期</label><span>${d.establishDate||'—'}</span></div>
        <div class="cell"><label>注册资本</label><span>${d.registeredCapital||'—'}</span></div>
      </div>
    </div>
    <div class="group">
      <div class="title">业务与财务</div>
      <div class="grid">
        <div class="cell"><label>经营范围</label><span>${d.businessScope||'—'}</span></div>
        <div class="cell"><label>对公账户开户行</label><span>${d.bankName||'—'}</span></div>
        <div class="cell"><label>对公账户号</label><span>${d.bankAccount||'—'}</span></div>
        <div class="cell"><label>企业常用邮箱</label><span>${d.companyEmail||'—'}</span></div>
        <div class="cell"><label>企业联系电话</label><span>${d.companyPhone||'—'}</span></div>
        <div class="cell"><label>年营业额范围</label><span>${d.annualRevenueRange||'—'}</span></div>
        <div class="cell"><label>主营业务范围</label><span>${d.mainBusiness||'—'}</span></div>
        <div class="cell"><label>常用合作方</label><span>${d.partners||'—'}</span></div>
      </div>
    </div>
    <div class="group">
      <div class="title">管理员</div>
      <div class="grid">
        <div class="cell"><label>管理员姓名</label><span>${d.adminName||'—'}</span></div>
        <div class="cell"><label>部门</label><span>${d.adminDept||'—'}</span></div>
        <div class="cell"><label>职位</label><span>${d.adminTitle||'—'}</span></div>
        <div class="cell"><label>管理员手机号</label><span>${d.adminPhone||'—'}</span></div>
      </div>
    </div>
  </div>
  <script>window.onload = function(){ setTimeout(function(){ window.print(); window.close(); }, 50); }<\/script>
</body></html>`;
    const w = window.open('', '_blank'); if(!w) return;
    w.document.open('text/html;charset=utf-8');
    w.document.write(html);
    w.document.close();
  }catch(e:any){ alert('打印失败'); }
}
function setPageSize(n:number, e?: Event){
  if(e){ const el = e.currentTarget as HTMLElement; el.classList.add('pulse'); setTimeout(()=> el.classList.remove('pulse'), 320); }
  pageSize.value=n; page.value=1; fetchData(); }
</script>

<style scoped>
@import '../list-shared.css';
.alert-bar { display:flex; align-items:center; gap:8px; padding:8px 10px; margin:8px 0 12px; border-radius: 10px; background: #fff7ed; border:1px solid #fed7aa; color:#b45309; }
.alert-bar .btn-retry { height:24px; padding:0 10px; border-radius: 999px; border:1px solid #fbbf24; background: #fffbeb; cursor:pointer; font-size:12px; color:#92400e; }
.alert-bar .btn-close { margin-left:auto; width:22px; height:22px; line-height:22px; text-align:center; border:none; background: transparent; color:#b45309; border-radius:6px; cursor:pointer; }
.header-row { display:flex; align-items:center; justify-content: space-between; gap:8px; margin-bottom: 16px; }
.left-actions { display:flex; align-items:center; gap:6px; }
.search-area { display:flex; align-items:center; gap:8px; }
.search-wrap { display:flex; align-items:center; height: 26px; width: 220px; border-radius: 999px; border: 1px solid rgba(148,163,184,.28); background: #ffffff; }
.search-wrap .icon { width:14px; height:14px; margin: 0 8px 0 10px; color:#64748b; flex: 0 0 auto; }
.search-wrap .icon.clickable { cursor: pointer; }
.search-wrap input { flex:1 1 auto; height:100%; border:none; outline:none; background: transparent; font-size:12px; padding-right:10px; }
.refresh-btn { margin-left: 2px; }
.toolbar .search-input,
.toolbar select { height: 28px; padding: 0 12px; border-radius: 999px; border: 1px solid rgba(148,163,184,.28); background: #ffffff; }
.toolbar .search-input { width: 280px; }
.toolbar { border: none; background: transparent; box-shadow: none; }
.search-group { display:flex; align-items:center; gap:6px; }
.icon-btn { width: 28px; height: 28px; border-radius: 999px; border: 1px solid rgba(148,163,184,.28); background: linear-gradient(180deg, rgba(255,255,255,.66), rgba(248,250,252,.72)); display:grid; place-items:center; cursor:pointer; }
.icon-btn svg { width:14px; height:14px; }
.dropdown { position: relative; }
.dropdown .menu { display:none; position:absolute; right:0; top:34px; min-width: 200px; background:#fff; border:1px solid #e5e7eb; border-radius:10px; box-shadow:0 10px 24px rgba(15,23,42,0.10); padding:6px; z-index: 1000; }
.dropdown.open .menu { display:block; }
.menu-item { display:block; width:100%; text-align:left; padding:8px 10px; background:#fff; border:none; border-radius:8px; cursor:pointer; font-size:12px; }
.menu-item:hover { background:#f2f6ff; }
.selection-bar { display:flex; align-items:center; gap:8px; padding:8px 10px; border-radius:12px; background: #ffffff; box-shadow: 0 6px 18px rgba(15,23,42,0.05); margin-bottom:10px; }
.toolbar .search-input,
.toolbar select { height: 28px; padding: 0 12px; border-radius: 999px; border: 1px solid rgba(148,163,184,.28); background: #ffffff; }
.table-wrapper { overflow: auto; -webkit-overflow-scrolling: touch; border: none; background: #ffffff; box-shadow: 0 6px 18px rgba(15,23,42,0.05); border-radius: 12px; }
.more-panel { position: sticky; top: 0; z-index: 12; margin: 6px 0 14px; border-radius: 12px; padding: 8px 10px; background: #ffffff; box-shadow: 0 6px 16px rgba(15,23,42,.06); border: 1px solid rgba(148,163,184,.18); }
.more-panel .panel-row { display:flex; flex-wrap: wrap; align-items:center; gap:8px; }
.more-panel .btn { height: 24px; padding: 0 10px; border-radius: 999px; border: 1px solid rgba(148,163,184,.28); background: #ffffff; font-size: 12px; }
.more-panel .btn.btn-danger { border-color: rgba(148,163,184,.28); background: #ffffff; color:#0f172a; }
.size-row { display:flex; gap:6px; }
.size-btn { position:relative; height: 26px; padding: 0 10px; border-radius: 999px; border:1px solid rgba(203,213,225,.6); background: #ffffff; cursor:pointer; transition: transform .16s ease, box-shadow .16s ease; box-shadow: 0 3px 8px rgba(15,23,42,.06); }
.size-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 16px rgba(15,23,42,.10); }
.size-btn.active { border-color: rgba(59,130,246,.6); background: #f8fbff; }
@keyframes pulsePop { 0% { transform: scale(1); } 40% { transform: scale(1.12); } 100% { transform: scale(1); } }
.pulse { animation: pulsePop .32s ease; }
.op-col { width: 96px; min-width: 96px; }
.op-col .op-btn { height: 18px; padding: 0 6px; }
.op-col .op-btn svg { width: 12px; height: 12px; }
.more-text { font-size: 12px; }
.op-btn.sm { height: 18px; padding: 0 8px; }
.op-btn.sm svg { width: 12px; height: 12px; }
.op-btn.sm span { font-size: 12px; }
.index-col { width: 88px; min-width: 88px; white-space: nowrap; }
.mini-check { width: 12px; height: 12px; vertical-align: middle; margin-right: 6px; }
.idx-label { display: inline-block; width: 36px; text-align: center; margin-left: 0; }
.center { text-align: center; color: #6b7785; }
.thumb { display: inline-block; height: 42px; border: 1px solid #e5e7eb; border-radius: 6px; background: #fff; cursor: zoom-in; }
.img-modal { position: fixed; inset: 0; background: rgba(15,23,42,0.6); display:flex; align-items:center; justify-content:center; z-index: 99; }
.img-modal img { max-width: 92vw; max-height: 92vh; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.35); }

/* 确认弹框样式 */
.confirm-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.confirm-dialog { background: #fff; border-radius: 12px; padding: 24px; min-width: 320px; box-shadow: 0 20px 40px rgba(15,23,42,0.25); }
.confirm-title { font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 8px; }
.confirm-message { color: #64748b; font-size: 14px; margin-bottom: 20px; line-height: 1.5; }
.confirm-actions { display: flex; gap: 8px; justify-content: flex-end; }
.confirm-actions .btn { height: 32px; padding: 0 16px; border-radius: 8px; font-size: 13px; cursor: pointer; }
.confirm-actions .btn-danger { background: #ef4444; color: #fff; border: none; }
.confirm-actions .btn-danger:hover { background: #dc2626; }
.confirm-actions .btn-ghost { background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0; }
.confirm-actions .btn-ghost:hover { background: #f1f5f9; }
</style>


