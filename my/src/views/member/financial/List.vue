<template>
  <div class="owner-list-container" :class="['density-'+density]">
    <h2>金融机构管理</h2>
    <div class="progress" v-show="loading"><div class="progress-bar"></div></div>
    <div class="header-row">
      <div class="left-actions">
        <button class="op-btn sm primary" @click="goCreate" title="新增">
          <svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 11H13V5h-2v6H5v2h6v6h2v-6h6z"/></svg>
          <span>新增金融机构</span>
        </button>
        <button class="op-btn sm info" @click="()=>importRef?.click()" title="批量导入">
          <svg viewBox="0 0 24 24"><path fill="currentColor" d="M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z"/></svg>
          <span>批量导入</span>
        </button>
        <input ref="importRef" type="file" accept=".csv" style="display:none;" />
        <button class="op-btn sm danger" :disabled="selectedIds.length===0" @click="openBatchConfirm" title="批量删除">
          <svg viewBox="0 0 24 24"><path fill="currentColor" d="M16 9v10H8V9h8m-1.5-4h-5l-1 1H6v2h12V6h-2.5l-1-1z"/></svg>
          <span>批量删除</span>
        </button>
      </div>
      <div class="search-area">
        <div class="search-wrap">
          <svg class="icon clickable" @click="onSearch" viewBox="0 0 24 24"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5z"/></svg>
          <input v-model="keyword" placeholder="输入任意关键词（年份、城市、人名、号码等）" @keyup.enter="onSearch" />
        </div>
        <button class="op-btn sm refresh-btn" @click="onReset" title="刷新">
          <svg viewBox="0 0 24 24"><path fill="currentColor" d="M17.65 6.35A7.95 7.95 0 0012 4V1L7 6l5 5V7c2.76 0 5 2.24 5 5a5 5 0 11-1.35-3.65l1.42-1.42z"/></svg>
          <span class="more-text">刷新</span>
        </button>
      </div>
      <div class="right-actions">
        <button class="op-btn sm" title="更多" @click.stop="toggleMore">
          <svg viewBox="0 0 24 24"><path fill="currentColor" d="M12,16A2,2 0 1,1 12,12A2,2 0 0,1 12,16M12,10A2,2 0 1,1 12,6A2,2 0 0,1 12,10M12,22A2,2 0 1,1 12,18A2,2 0 0,1 12,22Z"/></svg>
          <span class="more-text">更多</span>
        </button>
      </div>
    </div>
    <div class="more-panel" v-if="moreOpen">
      <div class="panel-row">
        <button class="btn" @click="exportCsv">导出 Excel（客户端）</button>
        <button class="btn" @click="exportCsvServer">导出（服务端）</button>
        <button class="btn" @click="printPage">打印</button>
        <button class="btn" @click="goExcel">Excel 编辑</button>
        <button class="btn" @click="triggerAi">AI 识别</button>
        <input id="ai-file" ref="aiFileRef" class="ai-file" type="file" accept=".jpg,.jpeg,.png,.pdf" @change="onAiFile" style="display:none;" />
        <div class="group-title" style="margin-left:6px;">每页：</div>
        <div class="size-row">
          <button class="size-btn jelly" :class="{active: pageSize===10}" @click="pageSize=10; onPageSizeChange()">10</button>
          <button class="size-btn jelly" :class="{active: pageSize===20}" @click="pageSize=20; onPageSizeChange()">20</button>
          <button class="size-btn jelly" :class="{active: pageSize===50}" @click="pageSize=50; onPageSizeChange()">50</button>
          <button class="size-btn jelly" :class="{active: pageSize===100}" @click="pageSize=100; onPageSizeChange()">100</button>
        </div>
      </div>
    </div>

    <div class="table-wrapper">
      <table class="owner-table">
        <thead>
          <tr>
            <th class="sticky-left index-col"><input type="checkbox" :checked="allSelected" @change="toggleSelectAll($event)" /></th>
            <th class="sticky-left seq-col">序号</th>
            <th class="sortable sticky-left name-col" @click="toggleSort('name')">机构名称 {{ sortIndicator('name') }}</th>
            <th>统一社会信用代码</th>
            <th class="sortable" @click="toggleSort('license_number')">许可证编号 {{ sortIndicator('license_number') }}</th>
            <th>机构类型</th>
            <th>注册地址</th>
            <th>经营地址</th>
            <th>官方网址</th>
            <th>客服电话</th>
            <th>业务联系人</th>
            <th>联系人部门及职务</th>
            <th>联系人手机</th>
            <th>联系人邮箱</th>
            <th>核心业务类型</th>
            <th>合作起始日期</th>
            <th>合作状态</th>
            <th class="num">授信额度</th>
            <th>风险评级</th>
            <th>准入审核状态</th>
            <th>管理员账号</th>
            <th>API信息</th>
            <th>备注</th>
            <th class="sticky-right op-col">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, idx) in rows" :key="row.id">
            <td class="sticky-left index-col"><input type="checkbox" :checked="selectedIdsSet.has(row.id)" @change="toggleRow(row.id, $event)" /></td>
            <td class="sticky-left seq-col">{{ (page-1)*pageSize + idx + 1 }}</td>
            <td class="sticky-left name-col">{{ row.name }}</td>
            <td>{{ row.creditCode }}</td>
            <td>{{ row.license_number }}</td>
            <td>{{ row.type }}</td>
            <td class="text-ellipsis" :title="row.regAddress">{{ row.regAddress }}</td>
            <td class="text-ellipsis" :title="row.bizAddress">{{ row.bizAddress }}</td>
            <td class="text-ellipsis" :title="row.website">{{ row.website }}</td>
            <td>{{ row.servicePhone }}</td>
            <td>{{ row.contact_person }}</td>
            <td class="text-ellipsis" :title="row.contact_title">{{ row.contact_title }}</td>
            <td>{{ row.contact_phone }}</td>
            <td class="text-ellipsis" :title="row.contact_email">{{ row.contact_email }}</td>
            <td class="text-ellipsis" :title="row.core_business_types">{{ row.core_business_types }}</td>
            <td>{{ row.coop_start_date }}</td>
            <td><span class="tag" :class="statusClass(row.coop_status)">{{ row.coop_status }}</span></td>
            <td class="num">{{ row.credit_limit }}</td>
            <td>{{ row.risk_rating }}</td>
            <td><span class="tag" :class="statusClass(row.admission_status)">{{ row.admission_status }}</span></td>
            <td>{{ row.admin_account }}</td>
            <td class="text-ellipsis" :title="row.api_info">{{ row.api_info }}</td>
            <td class="text-ellipsis" :title="row.remark">{{ row.remark }}</td>
            <td class="op-cell sticky-right op-col">
              <button class="op-btn info sm" title="查看" @click="()=> router.push(`/operation/member/financial-institutions/detail/${row.id}`)">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 7a2 2 0 110 4 2 2 0 010-4zm0 6c-2.21 0-4 1.12-4 2.5V17h8v-1.5c0-1.38-1.79-2.5-4-2.5z"/></svg>
              </button>
              <button class="op-btn primary sm" title="编辑" @click="goEdit(row.id)">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
              </button>
              <button class="op-btn print sm" title="打印" @click="printRow(row)">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19 8H5a3 3 0 00-3 3v4h4v4h12v-4h4v-4a3 3 0 00-3-3zm-3 10H8v-4h8v4zm3-7a1 1 0 110-2 1 1 0 010 2zM17 3H7v3h10V3z"/></svg>
              </button>
              <button class="op-btn danger sm" title="删除" @click="confirmDelete(row.id)">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16 9v10H8V9h8m-1.5-4h-5l-1 1H6v2h12V6h-2.5l-1-1z"/></svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <button :disabled="page<=1" @click="goPrev">上一页</button>
      <span>第 {{ page }} / {{ totalPages }} 页</span>
      <button :disabled="page>=totalPages" @click="goNext">下一页</button>
      <span class="total">当前显示 {{ pageStart }} - {{ pageEnd }} 条，共 {{ total }} 条</span>
      <label class="form-item" style="margin-left:8px;">
        <span class="label">跳转到</span>
        <input type="number" v-model.number="jumpPage" :min="1" :max="totalPages" style="width:72px;" />
      </label>
      <button class="btn" @click="goPage">跳转</button>
    </div>

    <div v-if="showConfirm" class="confirm-overlay" @click.self="showConfirm=false">
      <div class="confirm-dialog">
        <div class="confirm-title">删除机构</div>
        <div class="confirm-message">确定要删除“{{ confirmName }}”吗？此操作不可撤销。</div>
        <div class="confirm-actions">
          <button class="btn btn-danger" @click="deleteOne(confirmId!)">确定</button>
          <button class="btn btn-ghost" @click="showConfirm=false">取消</button>
        </div>
      </div>
    </div>
    <div v-if="showBatchConfirm" class="confirm-overlay" @click.self="showBatchConfirm=false">
      <div class="confirm-dialog">
        <div class="confirm-title">批量删除机构</div>
        <div class="confirm-message">确定要删除所选 {{ selectedIds.length }} 条记录吗？此操作不可撤销。</div>
        <div class="confirm-actions">
          <button class="btn btn-danger" @click="confirmBatchDelete">确定</button>
          <button class="btn btn-ghost" @click="showBatchConfirm=false">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { financialApi } from '../../../api/memberModules';

const router = useRouter();

const rows = ref<any[]>([]);
const keyword = ref('');
const page = ref(1);
const pageSize = ref(10);
const total = ref(0);
const sortBy = ref('');
const sortOrder = ref<'asc'|'desc'>('asc');
const loading = ref(false);
const aiFileRef = ref<HTMLInputElement|null>(null);
const templateUrl = '/templates/financial-institutions-template.csv';
const importRef = ref<HTMLInputElement|null>(null);
const moreOpen = ref(false);
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)));
// 密度：compact/comfortable，按屏幕宽度默认，并持久化
const density = ref<'compact'|'comfortable'>((localStorage.getItem('fi_density') as any) || (window.innerWidth >= 1920 ? 'comfortable' : 'compact'));
const densityLabel = computed(()=> density.value==='compact' ? '紧凑' : '宽松');
function toggleDensity(){ density.value = density.value==='compact' ? 'comfortable' : 'compact'; localStorage.setItem('fi_density', density.value); }

const pageStart = computed(() => (total.value===0?0:(page.value-1)*pageSize.value+1));
const pageEnd = computed(() => Math.min(page.value*pageSize.value, total.value));
const jumpPage = ref<number>(1);
function goPage(){ const p=Math.max(1, Math.min(totalPages.value, jumpPage.value||1)); if(p!==page.value){ page.value=p; load(); } }
function onPageSizeChange(){ page.value=1; load(); }

const selectedIds = ref<number[]>([]);
const selectedIdsSet = computed(() => new Set(selectedIds.value));
const allSelected = computed(() => rows.value.length>0 && rows.value.every(r=>selectedIdsSet.value.has(r.id)));

const showConfirm = ref(false);
const confirmId = ref<number|null>(null);
const confirmName = computed(()=>{ const o = rows.value.find(x=>x.id===confirmId.value); return o?.name || ''; });
const showBatchConfirm = ref(false);

async function load(){
  loading.value = true;
  try{
    const res:any = await financialApi.list({ keyword: keyword.value, page: page.value, pageSize: pageSize.value, sortBy: sortBy.value, sortOrder: sortOrder.value });
    const d = res?.data || res;
    rows.value = d.list || [];
    total.value = d.total || 0;
  } finally { loading.value=false; }
}
onMounted(load);

function onSearch(){ page.value=1; load(); }
function onReset(){ keyword.value=''; sortBy.value=''; sortOrder.value='asc'; page.value=1; load(); }
function toggleMore(){
  moreOpen.value = !moreOpen.value;
  if (moreOpen.value) {
    nextTick(()=>{
      const p = document.querySelector('.more-panel');
      try{ (p as any)?.scrollIntoView?.({ behavior:'smooth', block:'nearest' }); }catch{}
    });
  }
}
function goPrev(){ if(page.value>1){ page.value--; load(); } }
function goNext(){ if(page.value<Math.max(1, Math.ceil(total.value/pageSize.value))){ page.value++; load(); } }
function toggleSort(field: string){ if (sortBy.value===field) sortOrder.value = sortOrder.value==='asc'?'desc':'asc'; else { sortBy.value=field; sortOrder.value='asc'; } page.value=1; load(); }
function sortIndicator(field: string){ return sortBy.value===field ? (sortOrder.value==='asc'?'↑':'↓') : ''; }

function statusClass(s: string){
  const t = (s||'').toLowerCase();
  if (t.includes('通过')||t.includes('正常')||t.includes('合作中')) return 'ok';
  if (t.includes('暂停')||t.includes('处理中')||t.includes('审核中')) return 'warn';
  if (t.includes('终止')||t.includes('失败')||t.includes('拒绝')) return 'danger';
  return 'info';
}

function toggleRow(id:number, e: Event){ const checked=(e.target as HTMLInputElement).checked; const s=new Set(selectedIds.value); if(checked) s.add(id); else s.delete(id); selectedIds.value=Array.from(s); }
function toggleSelectAll(e: Event){ const checked=(e.target as HTMLInputElement).checked; if(checked){ const s=new Set(selectedIds.value); rows.value.forEach(r=>s.add(r.id)); selectedIds.value=Array.from(s);} else { const cur=new Set(rows.value.map(r=>r.id)); selectedIds.value = selectedIds.value.filter(id=>!cur.has(id)); } }

function goCreate(){ router.push('/operation/member/financial-institutions/create'); }
function goEdit(id:number){ router.push(`/operation/member/financial-institutions/edit/${id}`); }
function confirmDelete(id:number){ confirmId.value=id; showConfirm.value=true; }
async function deleteOne(id:number){
  try{
    const res:any = await financialApi.delete(id);
    if (res && typeof res.code !== 'undefined' && res.code !== 0) {
      throw new Error(res?.msg || '删除失败');
    }
  }catch(e:any){
    alert(e?.message || '删除失败');
    return;
  }
  showConfirm.value=false; confirmId.value=null; await load();
}

function openBatchConfirm(){ if(selectedIds.value.length>0) showBatchConfirm.value=true; }
async function confirmBatchDelete(){
  const ids=[...selectedIds.value];
  let failed:number[]=[];
  for(const id of ids){
    try{
      const res:any = await financialApi.delete(id);
      if (res && typeof res.code !== 'undefined' && res.code !== 0) throw new Error(res?.msg||'');
    }catch{ failed.push(id); }
  }
  if (failed.length){ alert(`以下ID删除失败：${failed.join(', ')}`); }
  selectedIds.value=[]; showBatchConfirm.value=false; await load();
}

function printPage(){ window.print(); }
async function printRow(row:any){
  try{
    const id = row?.id;
    const res:any = await financialApi.detail(id);
    const d:any = res?.data || res || row || {};
    const html = `<!doctype html>
<html lang="zh-CN"><head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>金融机构详情 - 打印</title>
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
    <h1>${d.name || '金融机构详情'}</h1>
    <div class="group">
      <div class="title">基础信息</div>
      <div class="grid">
        <div class="cell"><label>机构名称</label><span>${d.name||'—'}</span></div>
        <div class="cell"><label>许可证编号</label><span>${d.license_number||'—'}</span></div>
        <div class="cell"><label>机构类型</label><span>${d.type||'—'}</span></div>
        <div class="cell"><label>统一社会信用代码</label><span>${d.creditCode||'—'}</span></div>
      </div>
    </div>
    <div class="group">
      <div class="title">联系与地址</div>
      <div class="grid">
        <div class="cell"><label>注册地址</label><span>${d.regAddress||'—'}</span></div>
        <div class="cell"><label>经营地址</label><span>${d.bizAddress||'—'}</span></div>
        <div class="cell"><label>官方网址</label><span>${d.website||'—'}</span></div>
        <div class="cell"><label>客服电话</label><span>${d.servicePhone||'—'}</span></div>
        <div class="cell"><label>业务联系人</label><span>${d.contact_person||'—'}</span></div>
        <div class="cell"><label>联系人部门及职务</label><span>${d.contact_title||'—'}</span></div>
        <div class="cell"><label>联系人手机</label><span>${d.contact_phone||'—'}</span></div>
        <div class="cell"><label>联系人邮箱</label><span>${d.contact_email||'—'}</span></div>
      </div>
    </div>
    <div class="group">
      <div class="title">业务与资质</div>
      <div class="grid">
        <div class="cell"><label>核心业务类型</label><span>${d.core_business_types||'—'}</span></div>
        <div class="cell"><label>合作起始日期</label><span>${d.coop_start_date||'—'}</span></div>
        <div class="cell"><label>合作状态</label><span>${d.coop_status||'—'}</span></div>
        <div class="cell"><label>授信额度</label><span>${d.credit_limit||'—'}</span></div>
        <div class="cell"><label>风险评级</label><span>${d.risk_rating||'—'}</span></div>
        <div class="cell"><label>准入审核状态</label><span>${d.admission_status||'—'}</span></div>
      </div>
    </div>
    <div class="group">
      <div class="title">系统与管理</div>
      <div class="grid">
        <div class="cell"><label>管理员账号</label><span>${d.admin_account||'—'}</span></div>
        <div class="cell"><label>备注</label><span>${d.remark||'—'}</span></div>
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
function goExcel(){ router.push('/operation/excel'); }
function triggerAi(){ aiFileRef.value?.click(); }

async function ensureTesseract(): Promise<any> {
  // @ts-ignore
  if ((window as any).Tesseract) return (window as any).Tesseract;
  await new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Tesseract.js 加载失败'));
    document.head.appendChild(s);
  });
  // @ts-ignore
  return (window as any).Tesseract;
}
function onAiFile(e: Event){
  const files = (e.target as HTMLInputElement).files; if(!files||files.length===0) return;
  (async()=>{
    try{
      const T = await ensureTesseract(); const file = files[0];
      const { data } = await T.recognize(file, 'chi_sim+eng');
      const text: string = data?.text || '';
      const lic = (text.replace(/\s/g,'').match(/[0-9A-Z]{6,}/) || [])[0] || '';
      keyword.value = lic || text.split('\n').map(s=>s.trim()).filter(Boolean)[0] || '';
      alert(lic ? `识别许可证编号：${lic}` : `识别文本：\n${text.slice(0,120)}...`);
    } catch(err:any){ alert('AI识别失败：'+(err?.message||'未知错误')); }
    (e.target as HTMLInputElement).value = '';
  })();
}

async function exportCsv(){
  const params = new URLSearchParams({ keyword: keyword.value, page: '1', pageSize: '99999', sortBy: sortBy.value, sortOrder: sortOrder.value });
  const res = await fetch(`/api/member/financial/list?${params.toString()}`);
  if(!res.ok) return alert('导出失败');
  const data = await res.json();
  const rows:any[] = data?.data?.list || [];
  const header = ['机构名称','金融机构许可证编号','机构类型','状态','业务联系人','联系人电话','地址'];
  const toCell = (v:any)=>{ const s=String(v??''); return /[",\n]/.test(s)? '"'+s.replace(/"/g,'""')+'"' : s; };
  const lines = [header.join(',')].concat(rows.map(r=>[
    r.name, r.license_number, r.type, r.status, r.contact_person, r.contact_phone, r.address
  ].map(toCell).join(',')));
  const csv='\ufeff'+lines.join('\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'}); const url=URL.createObjectURL(blob);
  const link=document.createElement('a'); link.href=url; link.download=`financial-institutions-${Date.now()}.csv`; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
}

async function exportCsvServer(){
  const usp = new URLSearchParams({ keyword: keyword.value, sortBy: sortBy.value, sortOrder: sortOrder.value });
  const url = `/api/member/financial/export?${usp.toString()}`;
  const a=document.createElement('a'); a.href=url; a.download=''; document.body.appendChild(a); a.click(); document.body.removeChild(a);
}
</script>

<style scoped>@import '../list-shared.css';
.header-row { display:flex; align-items:center; justify-content: space-between; gap:8px; margin-bottom: 8px; }
.left-actions { display:flex; align-items:center; gap:6px; }
.search-area { display:flex; align-items:center; gap:8px; }
.search-wrap { display:flex; align-items:center; height: 26px; width: 220px; border-radius: 999px; border: 1px solid rgba(148,163,184,.28); background: linear-gradient(180deg, rgba(255,255,255,.66), rgba(248,250,252,.72)); }
.search-wrap .icon { width:12px; height:12px; margin: 0 6px 0 8px; color:#64748b; flex: 0 0 auto; cursor:pointer; }
.search-wrap input { flex:1 1 auto; height:100%; border:none; outline:none; background: transparent; font-size:12px; padding-right:10px; }
.right-actions { display:flex; align-items:center; }
.more-text { font-size: 12px; }
.more-panel { position: sticky; top: 0; z-index: 12; margin: 4px 0 10px; border-radius: 12px; padding: 8px 10px; background: linear-gradient(180deg, rgba(255,255,255,.52), rgba(236,244,255,.48)); -webkit-backdrop-filter: blur(10px) saturate(1.05); backdrop-filter: blur(10px) saturate(1.05); box-shadow: 0 6px 16px rgba(15,23,42,.06); border: 1px solid rgba(148,163,184,.18); }
.more-panel .panel-row { display:flex; flex-wrap: wrap; align-items:center; gap:8px; }
.size-row { display:flex; gap:6px; }
.size-btn { position:relative; height: 24px; padding: 0 10px; border-radius: 999px; border:1px solid rgba(148,163,184,.28); background: linear-gradient(180deg, rgba(255,255,255,.86), rgba(240,245,255,.86)); cursor:pointer; font-size:12px; }
.op-btn.sm { height: 18px; padding: 0 8px; }
.op-btn.sm svg { width: 12px; height: 12px; }
.op-btn.sm span { font-size: 12px; }
.owner-list-container { font-size: 13px; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif; }
.toolbar { border: none; background: transparent; box-shadow: none; }
.table-wrapper { overflow: auto; -webkit-overflow-scrolling: touch; border: none; background: linear-gradient(180deg, #ffffff, #fbfdff); box-shadow: 0 6px 18px rgba(15,23,42,0.05); border-radius: 12px; }
.owner-table { width: max-content; }
.owner-table.compact thead th { background:#f3f6fb; font-weight:600; padding:8px 10px; white-space:nowrap; }
.owner-table.compact thead th { position: sticky; top: 0; z-index: 2; }
.owner-table.compact thead th.name-col, .owner-table.compact thead th.index-col { z-index: 4; }
.owner-table.compact tbody td { padding:8px 10px; white-space:nowrap; border-bottom:1px solid #eef2f6; }
.owner-table.compact tbody tr:nth-child(odd){ background:#fcfdff; }
.owner-table.compact tbody tr:hover{ background:#f5f9ff; }
.index-col { position: sticky; left: 0; background:#fff; z-index:3; width: 60px; min-width: 60px; }
.seq-col { position: sticky; left: 60px; background:#fff; z-index:3; width: 60px; min-width: 60px; }
.name-col { position: sticky; left: 120px; background:#fff; z-index:3; min-width: 260px; }
.op-col { position: sticky; right: 0; background:#fff; box-shadow:-8px 0 8px rgba(0,0,0,0.03); z-index:1; }
.tag { display:inline-block; padding:2px 8px; border-radius:999px; font-size:12px; }
.tag.ok { background:#ecfdf5; color:#059669; }
.tag.warn { background:#fffbeb; color:#d97706; }
.tag.danger { background:#fef2f2; color:#dc2626; }
.tag.info { background:#eef2ff; color:#444; }
.op-btn { display:inline-flex; align-items:center; gap:6px; height:26px; padding:0 10px; border-radius:999px; border:1px solid rgba(99,102,241,.25); background: linear-gradient(180deg, rgba(99,102,241,.10), rgba(59,130,246,.10)); color:#0f172a; cursor:pointer; margin-right:8px; transition: transform .12s ease, box-shadow .12s ease, border-color .12s ease; }
.op-btn:hover { transform: translateZ(4px); box-shadow: 0 8px 18px rgba(2,6,23,.08); border-color: rgba(59,130,246,.45); }
.op-btn.info { border-color: rgba(56,189,248,.35); background: linear-gradient(180deg, rgba(56,189,248,.14), rgba(99,102,241,.08)); }
.op-btn.danger { border-color: rgba(239,68,68,.35); background: linear-gradient(180deg, rgba(239,68,68,.12), rgba(244,63,94,.10)); color:#7f1d1d; }
.divider { width:1px; height:18px; background:#e5e7eb; margin:0 6px; }
.col-chooser { position: relative; }
.col-panel { position:absolute; right:0; top:36px; background:#fff; border:1px solid #e5e7eb; border-radius:8px; padding:10px; box-shadow:0 8px 20px rgba(2,6,23,.08); display:grid; grid-template-columns: repeat(2, 160px); gap:6px 12px; }
.filter-group { display:flex; flex-direction:column; gap:6px; margin-bottom:8px; }
.filter-title { font-weight:600; color:#334155; }
.num { text-align: right; }

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


