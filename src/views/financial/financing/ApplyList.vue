<template>
  <div class="page">
    <div class="toolbar">
      <el-input v-model="query.keyword" placeholder="申请编号/企业/类型" clearable style="width:260px" @keyup.enter="load" />
      <el-select v-model="query.status" placeholder="状态" clearable style="width:140px">
        <el-option label="待初审" value="pending_initial"/>
        <el-option label="待风控" value="pending_risk"/>
        <el-option label="待终审" value="pending_final"/>
        <el-option label="已通过" value="approved"/>
        <el-option label="已拒绝" value="rejected"/>
      </el-select>
      <el-select v-model="query.type" placeholder="类型" clearable style="width:140px">
        <el-option label="质押融资" value="pledge"/>
        <el-option label="流动融资" value="working"/>
      </el-select>
      <el-input v-model.number="query.minAmount" placeholder="最小金额(万)" clearable style="width:140px" />
      <el-input v-model.number="query.maxAmount" placeholder="最大金额(万)" clearable style="width:140px" />
      <el-date-picker v-model="query.range" type="daterange" start-placeholder="开始日期" end-placeholder="结束日期" style="width:280px" />
      <el-button type="primary" @click="load">搜索</el-button>
      <el-button @click="reset">重置</el-button>
    </div>

    <div class="cards">
      <el-card shadow="never" class="kpi"><div class="num">{{ stats.pending }}</div><div class="label">待处理</div></el-card>
      <el-card shadow="never" class="kpi"><div class="num">{{ stats.today }}</div><div class="label">今日申请</div></el-card>
      <el-card shadow="never" class="kpi"><div class="num">{{ stats.approved }}/{{ stats.rejected }}</div><div class="label">通过/拒绝</div></el-card>
      <el-card shadow="never" class="kpi"><div class="num">{{ toWan(stats.applyTotal) }}万</div><div class="label">申请总额</div></el-card>
      <el-card shadow="never" class="kpi"><div class="num">{{ toWan(stats.loanedTotal) }}万</div><div class="label">已放款</div></el-card>
    </div>

    <el-table :data="rows" border stripe size="small">
      <el-table-column type="index" label="#" width="60" />
      <el-table-column prop="applyNo" label="申请编号" width="140" />
      <el-table-column prop="company" label="企业" min-width="160" />
      <el-table-column prop="type" label="类型" width="100" />
      <el-table-column prop="amount" label="金额(万)" width="120" />
      <el-table-column prop="statusText" label="状态" width="110" />
      <el-table-column prop="createdAt" label="申请时间" width="170" />
      <el-table-column fixed="right" label="操作" width="260">
        <template #default="{ row }">
          <el-button size="small" type="primary" plain @click="openAudit(row, 'initial')">初审</el-button>
          <el-button size="small" type="warning" plain @click="openAudit(row, 'risk')">风控</el-button>
          <el-button size="small" type="success" plain @click="openAudit(row, 'final')">终审</el-button>
          <el-button size="small" type="primary" @click="openAudit(row, 'loan')">放款</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pager">
      <el-pagination background layout="prev, pager, next, jumper, total" :total="total" :page-size="pageSize" v-model:current-page="page" @current-change="load" />
    </div>

    <el-dialog v-model="audit.open" :title="auditTitle" width="560px">
      <el-form label-width="110px">
        <el-form-item label="环节"><el-tag>{{ stepName }}</el-tag></el-form-item>
        <el-form-item label="风险评分"><el-rate v-model="audit.score" :max="5" allow-half /></el-form-item>
        <el-form-item label="批准金额(万)"><el-input-number v-model="audit.approvedAmount" :min="0" :step="10" style="width:100%"/></el-form-item>
        <el-form-item label="审核意见"><el-input v-model="audit.comment" type="textarea" :rows="3" placeholder="填写审核意见"/></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="audit.open=false">取消</el-button>
        <el-button type="danger" plain @click="doReject">拒绝</el-button>
        <el-button type="primary" @click="doApprove">通过</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';

type Row = { id: string; applyNo: string; company: string; type: string; amount: number; status: string; createdAt: string };

const page = ref(1); const pageSize = ref(20); const total = ref(0);
const rows = ref<Row[]>([]);
const query = reactive({ keyword: '', status: '', type: '', minAmount: undefined as any, maxAmount: undefined as any, range: [] as any[] });
const stats = reactive({ pending: 0, today: 0, approved: 0, rejected: 0, applyTotal: 0, loanedTotal: 0 });

function genMock(n=25): Row[]{
  const arr: Row[] = [];
  for(let i=0;i<n;i++){
    arr.push({ id: String(Date.now()+i), applyNo: 'AP'+(Date.now()+i).toString().slice(-6), company: '企业'+(i+1), type: i%2?'质押融资':'流动融资', amount: 100+ i*5, status: ['pending_initial','pending_risk','pending_final','approved','rejected'][i%5], createdAt: new Date(Date.now()-i*3600_000).toLocaleString() });
  }
  return arr;
}

function toWan(v:number){ return Math.round((v||0)*100)/100 }

function recalc(){
  stats.pending = rows.value.filter(r=> r.status.startsWith('pending')).length;
  stats.today = rows.value.filter(r=> /\d{2}:\d{2}:\d{2}$/.test(r.createdAt)).length;
  stats.approved = rows.value.filter(r=> r.status==='approved').length;
  stats.rejected = rows.value.filter(r=> r.status==='rejected').length;
  stats.applyTotal = rows.value.reduce((s,r)=> s + r.amount, 0);
  stats.loanedTotal = Math.round(stats.applyTotal*0.6);
}

function reset(){ Object.assign(query, { keyword:'', status:'', type:'', minAmount:undefined, maxAmount:undefined, range:[] }); load(); }

function load(){
  const base = genMock(35);
  // 简单前端筛选示例
  let list = base.filter(r=>!query.keyword|| r.applyNo.includes(query.keyword)|| r.company.includes(query.keyword)|| r.type.includes(query.keyword));
  if(query.status) list = list.filter(r=> r.status===query.status);
  if(query.type) list = list.filter(r=> r.type===query.type);
  if(query.minAmount!=null) list = list.filter(r=> r.amount >= Number(query.minAmount));
  if(query.maxAmount!=null) list = list.filter(r=> r.amount <= Number(query.maxAmount));
  total.value = list.length;
  const start = (page.value-1)*pageSize.value;
  rows.value = list.slice(start, start+pageSize.value);
  recalc();
}

const audit = reactive({ open:false, step:'initial' as 'initial'|'risk'|'final'|'loan', row:null as Row|null, comment:'', score:3, approvedAmount:100 });
const stepName = computed(()=> audit.step==='initial'?'初审': audit.step==='risk'?'风控': audit.step==='final'?'终审':'放款');
const auditTitle = computed(()=> `融资${stepName.value}`);
function openAudit(row: Row, step: typeof audit.step){ Object.assign(audit, { open:true, row, step, comment:'', score:3, approvedAmount: row.amount }); }
function doApprove(){ audit.open=false; ElMessage.success(`${stepName.value}通过`); }
function doReject(){ audit.open=false; ElMessage.error(`${stepName.value}拒绝`); }

onMounted(load);
</script>

<style scoped>
.page{ padding:16px; }
.toolbar{ display:flex; gap:8px; flex-wrap:wrap; align-items:center; margin-bottom:12px; }
.cards{ display:grid; grid-template-columns: repeat(5, minmax(140px,1fr)); gap:10px; margin-bottom:12px; }
.kpi{ text-align:center; }
.kpi .num{ font-size:22px; font-weight:800; color:#111827; }
.kpi .label{ color:#6b7280; font-size:12px; margin-top:2px; }
.pager{ display:flex; justify-content:flex-end; margin-top:10px; }
</style>


