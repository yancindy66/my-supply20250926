<template>
  <div class="owner-list-container" :class="['density-'+density]">
    <h2>质检机构管理</h2>
    <div class="progress" v-show="loading"><div class="progress-bar"></div></div>
    <div class="header-row">
      <div class="left-actions">
        <button class="op-btn sm primary" @click="goCreate" title="新增">
          <svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 11H13V5h-2v6H5v2h6v6h2v-6h6z"/></svg>
          <span>新增质检机构</span>
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
        </div>
        <div class="group-title">密度：</div>
        <div class="size-row">
          <button class="size-btn jelly" :class="{active: density==='compact'}" @click="density='compact'; toggleDensity()">紧凑</button>
          <button class="size-btn jelly" :class="{active: density==='comfortable'}" @click="density='comfortable'; toggleDensity()">宽松</button>
        </div>
      </div>
    </div>

    <div class="table-wrapper">
      <table class="owner-table">
        <thead>
          <tr>
            <th class="index-col"><input class="mini-check" type="checkbox" :checked="allSelected" @change="toggleSelectAll($event)" /><span class="idx-label">序号</span></th>
            <th class="sortable name-col" @click="toggleSort('name')">机构名称 {{ sortIndicator('name') }}</th>
            <th>统一社会信用代码</th>
            <th>资质认证类型</th>
            <th>资质证书编号</th>
            <th>资质有效期</th>
            <th>可检测的货物品类</th>
            <th>检测能力描述</th>
            <th>注册地址</th>
            <th>经营地址</th>
            <th>官方网址</th>
            <th>客服电话</th>
            <th>报告查询链接</th>
            <th>业务联系人</th>
            <th>联系人部门及职务</th>
            <th>联系人手机</th>
            <th>联系人邮箱</th>
            <th>合作起始日期</th>
            <th>合作状态</th>
            <th>准入审核状态</th>
            <th>资质文件数</th>
            <th>管理员账号</th>
            <th>备注</th>
            <th class="sticky-right">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, idx) in rows" :key="row.id">
            <td class="index-col"><input class="mini-check" type="checkbox" :checked="selectedIdsSet.has(row.id)" @change="toggleRow(row.id, $event)" /><span class="idx-label">{{ (page-1)*pageSize + idx + 1 }}</span></td>
            <td class="name-col">{{ row.name }}</td>
            <td>{{ row.creditCode }}</td>
            <td class="text-ellipsis" :title="(row.qualification_type||[]).join(', ')">{{ (row.qualification_type||[]).join(', ') }}</td>
            <td>{{ row.qualCertNo }}</td>
            <td>{{ row.qualValidTo }}</td>
            <td class="text-ellipsis" :title="formatCategories(row.testing_categories)">{{ formatCategories(row.testing_categories) }}</td>
            <td class="text-ellipsis" :title="row.capabilityDesc">{{ row.capabilityDesc }}</td>
            <td class="text-ellipsis" :title="row.regAddress">{{ row.regAddress }}</td>
            <td class="text-ellipsis" :title="row.bizAddress">{{ row.bizAddress }}</td>
            <td class="text-ellipsis" :title="row.website">{{ row.website }}</td>
            <td>{{ row.servicePhone }}</td>
            <td class="text-ellipsis" :title="row.reportVerifyUrl">{{ row.reportVerifyUrl }}</td>
            <td>{{ row.contact }}</td>
            <td class="text-ellipsis" :title="row.contactTitle">{{ row.contactTitle }}</td>
            <td>{{ row.contactPhone }}</td>
            <td class="text-ellipsis" :title="row.contactEmail">{{ row.contactEmail }}</td>
            <td>{{ row.coop_start_date }}</td>
            <td><span class="tag" :class="statusClass(row.coop_status)">{{ row.coop_status }}</span></td>
            <td><span class="tag" :class="statusClass(row.admission_status)">{{ row.admission_status }}</span></td>
            <td>{{ Array.isArray(row.qualification_files)? row.qualification_files.length : 0 }}</td>
            <td>{{ row.admin_account }}</td>
            <td class="text-ellipsis" :title="row.remark">{{ row.remark }}</td>
            <td class="op-cell sticky-right">
              <button class="op-btn info" title="查看" @click="goDetail(row.id)">
                <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M12 7a2 2 0 110 4 2 2 0 010-4zm0 6c-2.21 0-4 1.12-4 2.5V17h8v-1.5c0-1.38-1.79-2.5-4-2.5z"/></svg>
              </button>
              <button class="op-btn primary" title="编辑" @click="goEdit(row.id)">
                <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
              </button>
              <button class="op-btn print" title="打印" @click="printRow(row)">
                <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M19 8H5a3 3 0 00-3 3v4h4v4h12v-4h4v-4a3 3 0 00-3-3zm-3 10H8v-4h8v4zm3-7a1 1 0 110-2 1 1 0 010 2zM17 3H7v3h10V3z"/></svg>
              </button>
              <button class="op-btn danger" title="删除" @click="confirmDelete(row.id)">
                <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M16 9v10H8V9h8m-1.5-4h-5l-1 1H6v2h12V6h-2.5l-1-1z"/></svg>
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
      <span class="total">共 {{ total }} 条</span>
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
import { qualityApi } from '../../../api/memberModules';

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
const templateUrl = '/templates/quality-agencies-template.csv';
const importRef = ref<HTMLInputElement|null>(null);
const moreOpen = ref(false);
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)));
// 密度设置（与其它列表一致）
const density = ref<'compact'|'comfortable'>((localStorage.getItem('qa_density') as any) || (window.innerWidth >= 1920 ? 'comfortable' : 'compact'));
const densityLabel = computed(()=> density.value==='compact' ? '紧凑' : '宽松');
function toggleDensity(){ density.value = density.value==='compact' ? 'comfortable' : 'compact'; localStorage.setItem('qa_density', density.value); }

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
    const res:any = await qualityApi.list({ keyword: keyword.value, page: page.value, pageSize: pageSize.value, sortBy: sortBy.value, sortOrder: sortOrder.value });
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
function onPageSizeChange(){ page.value=1; load(); }
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
function formatCategories(cats:any){
  try{ if(Array.isArray(cats)) return cats.map((x:any)=> typeof x==='string'?x: (x?.label||x?.value||'')).join(' / ');
    return ''; }catch{ return ''; }
}

function toggleRow(id:number, e: Event){ const checked=(e.target as HTMLInputElement).checked; const s=new Set(selectedIds.value); if(checked) s.add(id); else s.delete(id); selectedIds.value=Array.from(s); }
function toggleSelectAll(e: Event){ const checked=(e.target as HTMLInputElement).checked; if(checked){ const s=new Set(selectedIds.value); rows.value.forEach(r=>s.add(r.id)); selectedIds.value=Array.from(s);} else { const cur=new Set(rows.value.map(r=>r.id)); selectedIds.value = selectedIds.value.filter(id=>!cur.has(id)); } }

function goCreate(){ router.push('/operation/member/quality-agencies/create'); }
function goEdit(id:number){ router.push(`/operation/member/quality-agencies/edit/${id}`); }
function goDetail(id:number){ router.push(`/operation/member/quality-agencies/detail/${id}`); }
function confirmDelete(id:number){ confirmId.value=id; showConfirm.value=true; }
async function deleteOne(id:number){ await qualityApi.delete(id); showConfirm.value=false; confirmId.value=null; await load(); }

function openBatchConfirm(){ if(selectedIds.value.length>0) showBatchConfirm.value=true; }
async function confirmBatchDelete(){ const ids=[...selectedIds.value]; for(const id of ids){ try{ await qualityApi.delete(id);} catch{} } selectedIds.value=[]; showBatchConfirm.value=false; await load(); }

function printPage(){ window.print(); }
function goExcel(){ router.push('/operation/excel'); }
function triggerAi(){ aiFileRef.value?.click(); }
function printRow(row:any){
  const w = window.open('', '_blank'); if(!w) return;
  w.document.write(`<pre style="font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; font-size:12px; white-space:pre-wrap;">${JSON.stringify(row, null, 2)}</pre>`);
  w.document.close(); w.focus(); w.print(); w.close();
}
function reviewRow(row:any){ alert('审核功能占位：\n\n'+ (row?.name||'记录')); }

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
      const key = text.split('\n').map(s=>s.trim()).filter(Boolean)[0] || '';
      keyword.value = key;
      alert(`识别文本：\n${text.slice(0,120)}...`);
    } catch(err:any){ alert('AI识别失败：'+(err?.message||'未知错误')); }
    (e.target as HTMLInputElement).value = '';
  })();
}

async function exportCsv(){
  const params = new URLSearchParams({ keyword: keyword.value, page: '1', pageSize: '99999', sortBy: sortBy.value, sortOrder: sortOrder.value });
  const res = await fetch(`/api/member/quality/list?${params.toString()}`);
  if(!res.ok) return alert('导出失败');
  const data = await res.json();
  const rows:any[] = data?.data?.list || [];
  const header = ['机构名称','统一社会信用代码','资质认证类型','资质证书编号','资质有效期','可检测的货物品类','检测能力描述','注册地址','经营地址','官方网址','客服电话','报告查询链接','业务联系人','联系人部门及职务','联系人手机','联系人邮箱','合作起始日期','合作状态','准入审核状态','资质文件数','管理员账号','备注'];
  const toCell = (v:any)=>{ const s=String(v??''); return /[",\n]/.test(s)? '"'+s.replace(/"/g,'""')+'"' : s; };
  const fmtCats = (cats:any)=>{ try{ if(Array.isArray(cats)) return cats.map((x:any)=> typeof x==='string'?x: (x?.label||x?.value||'')).join(' / '); return ''; }catch{ return ''; } };
  const lines = [header.join(',')].concat(rows.map(r=>[
    r.name,
    r.creditCode,
    (r.qualification_type||[]).join(' / '),
    r.qualCertNo,
    r.qualValidTo,
    fmtCats(r.testing_categories),
    r.capabilityDesc,
    r.regAddress,
    r.bizAddress,
    r.website,
    r.servicePhone,
    r.reportVerifyUrl,
    r.contact,
    r.contactTitle,
    r.contactPhone,
    r.contactEmail,
    r.coop_start_date,
    r.coop_status,
    r.admission_status,
    Array.isArray(r.qualification_files)? r.qualification_files.length : 0,
    r.admin_account,
    r.remark
  ].map(toCell).join(',')));
  const csv='\ufeff'+lines.join('\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'}); const url=URL.createObjectURL(blob);
  const link=document.createElement('a'); link.href=url; link.download=`quality-agencies-${Date.now()}.csv`; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
}

async function exportCsvServer(){
  const usp = new URLSearchParams({ keyword: keyword.value, sortBy: sortBy.value, sortOrder: sortOrder.value });
  const url = `/api/member/quality/export?${usp.toString()}`;
  const a=document.createElement('a'); a.href=url; a.download=''; document.body.appendChild(a); a.click(); document.body.removeChild(a);
}
</script>

<style scoped>@import '../list-shared.css';
.progress { height: 2px; background: #eef2ff; margin-bottom: 6px; }
.header-row { display:flex; align-items:center; justify-content: space-between; gap:8px; margin-bottom: 8px; }
.left-actions { display:flex; align-items:center; gap:6px; }
.search-area { display:flex; align-items:center; gap:8px; }
.search-wrap { display:flex; align-items:center; height: 26px; width: 220px; border-radius: 999px; border: 1px solid rgba(148,163,184,.28); background: linear-gradient(180deg, rgba(255,255,255,.66), rgba(248,250,252,.72)); }
.search-wrap .icon { width:12px; height:12px; margin: 0 6px 0 8px; color:#64748b; flex: 0 0 auto; cursor:pointer; }
.search-wrap input { flex:1 1 auto; height:100%; border:none; outline:none; background: transparent; font-size:12px; padding-right:10px; }
.right-actions { display:flex; align-items:center; gap:6px; }
.more-panel { position: sticky; top: 0; z-index: 12; margin-bottom: 8px; padding: 8px 10px; border-radius: 12px; background: linear-gradient(180deg, rgba(255,255,255,.52), rgba(236,244,255,.48)); -webkit-backdrop-filter: blur(10px) saturate(1.05); backdrop-filter: blur(10px) saturate(1.05); box-shadow: 0 6px 18px rgba(15,23,42,.08), inset 0 1px 0 rgba(255,255,255,.6); }
.panel-row { display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
.panel-row .btn { height: 24px; padding: 0 8px; border-radius: 999px; border: 1px solid rgba(148,163,184,.28); background: linear-gradient(180deg, rgba(255,255,255,.66), rgba(248,250,252,.72)); color:#334155; cursor:pointer; font-size:11px; }
.panel-row .btn:hover { background: linear-gradient(180deg, rgba(255,255,255,.78), rgba(240,245,255,.88)); }
.group-title { font-size:11px; color:#64748b; margin-right:4px; }
.size-row { display:flex; align-items:center; gap:4px; }
.size-btn { height: 20px; padding: 0 6px; border-radius: 999px; border: 1px solid rgba(148,163,184,.28); background: linear-gradient(180deg, rgba(255,255,255,.66), rgba(248,250,252,.72)); color:#334155; cursor:pointer; font-size:11px; transition: all .12s ease; }
.size-btn:hover { transform: translateY(-1px); background: linear-gradient(180deg, rgba(255,255,255,.78), rgba(240,245,255,.88)); }
.size-btn.jelly { background: linear-gradient(180deg, rgba(255,255,255,.66), rgba(248,250,252,.72)); box-shadow: inset 0 1px 0 rgba(255,255,255,.6), 0 2px 4px rgba(15,23,42,.06); }
.size-btn.jelly:hover { transform: translateY(-1px) scale(1.05); box-shadow: inset 0 1px 0 rgba(255,255,255,.7), 0 4px 8px rgba(15,23,42,.10); }
.size-btn.jelly.active { background: linear-gradient(180deg, rgba(59,130,246,.18), rgba(37,99,235,.16)); border-color: rgba(37,99,235,.35); color:#0f172a; }
.table-wrapper { overflow: auto; -webkit-overflow-scrolling: touch; border: none; background: linear-gradient(180deg, #ffffff, #fbfdff); box-shadow: 0 6px 18px rgba(15,23,42,0.05); border-radius: 12px; }
.progress-bar { width: 100%; height: 100%; background: linear-gradient(90deg, #60a5fa, #2563eb); animation: p 1s linear infinite; }
@keyframes p { from { transform: translateX(-100%);} to { transform: translateX(100%);} }

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

/* 首列对齐（复选框 + 序号） */
.index-col { width: 88px; min-width: 88px; white-space: nowrap; }
.mini-check { width: 12px; height: 12px; vertical-align: middle; margin-right: 6px; }
.idx-label { display: inline-block; width: 36px; text-align: center; margin-left: 0; }
</style>


