<template>
  <div class="page">
    <div class="cards">
      <el-card class="kpi" shadow="never"><div class="num">{{ stats.total }}</div><div class="label">在贷总数</div></el-card>
      <el-card class="kpi" shadow="never"><div class="num">{{ stats.normal }}</div><div class="label">正常</div></el-card>
      <el-card class="kpi" shadow="never"><div class="num danger">{{ stats.overdue }}</div><div class="label">逾期</div></el-card>
      <el-card class="kpi" shadow="never"><div class="num">{{ toWan(stats.totalAmount) }}万</div><div class="label">融资总额</div></el-card>
      <el-card class="kpi" shadow="never"><div class="num">{{ toWan(stats.toRepay) }}万</div><div class="label">待还金额</div></el-card>
      <el-card class="kpi" shadow="never"><div class="num">{{ toWan(stats.interest) }}万</div><div class="label">利息收入</div></el-card>
    </div>

    <div class="toolbar">
      <el-select v-model="filter.risk" placeholder="风险状态" clearable style="width:140px">
        <el-option label="正常" value="normal"/>
        <el-option label="关注" value="watch"/>
        <el-option label="预警" value="warn"/>
        <el-option label="风险" value="risk"/>
      </el-select>
      <el-select v-model="filter.type" placeholder="类型" clearable style="width:140px">
        <el-option label="质押融资" value="pledge"/>
        <el-option label="流动融资" value="working"/>
      </el-select>
      <el-button @click="load">筛选</el-button>
    </div>

    <el-table :data="rows" border stripe size="small">
      <el-table-column type="index" width="60"/>
      <el-table-column prop="contractNo" label="合同号" width="140"/>
      <el-table-column prop="company" label="企业" min-width="160"/>
      <el-table-column prop="type" label="类型" width="100"/>
      <el-table-column prop="amount" label="金额(万)" width="120"/>
      <el-table-column prop="remain" label="待还(万)" width="120"/>
      <el-table-column prop="daysLeft" label="剩余天数" width="100"/>
      <el-table-column prop="riskText" label="风险状态" width="100"/>
      <el-table-column fixed="right" label="操作" width="360">
        <template #default="{ row }">
          <el-button size="small">合同管理</el-button>
          <el-button size="small">抵押物管理</el-button>
          <el-button size="small">展期申请</el-button>
          <el-button size="small">提前还款</el-button>
          <el-button size="small" type="danger" plain>风险预警</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';

type Row = { id:string; contractNo:string; company:string; type:string; amount:number; remain:number; daysLeft:number; risk:string };
const rows = ref<Row[]>([]);
const stats = reactive({ total:0, normal:0, overdue:0, totalAmount:0, toRepay:0, interest:0 });
const filter = reactive({ risk:'', type:'' });

function genMock(n=30):Row[]{
  const list:Row[]=[]; for(let i=0;i<n;i++){
    list.push({ id:String(Date.now()+i), contractNo:'CT'+(Date.now()+i).toString().slice(-6), company:'企业'+(i+1), type: i%2?'质押融资':'流动融资', amount: 200+i*10, remain: 150+i*8, daysLeft: 180-i*3, risk: ['normal','watch','warn','risk'][i%4] });
  } return list;
}
function toWan(v:number){ return Math.round((v||0)*100)/100 }
function recalc(){
  stats.total = rows.value.length;
  stats.normal = rows.value.filter(r=>r.risk==='normal').length;
  stats.overdue = rows.value.filter(r=>r.daysLeft<0).length;
  stats.totalAmount = rows.value.reduce((s,r)=> s+r.amount, 0);
  stats.toRepay = rows.value.reduce((s,r)=> s+r.remain, 0);
  stats.interest = Math.round(stats.totalAmount * 0.05);
}
function load(){ rows.value = genMock().filter(r=> (!filter.risk||r.risk===filter.risk) && (!filter.type||r.type===filter.type)); recalc(); }
onMounted(load);
</script>

<style scoped>
.page{ padding:16px; }
.cards{ display:grid; grid-template-columns: repeat(6, minmax(120px,1fr)); gap:10px; margin-bottom:12px; }
.kpi{ text-align:center; }
.kpi .num{ font-size:20px; font-weight:800; color:#111827; }
.kpi .label{ color:#6b7280; font-size:12px; margin-top:2px; }
.danger{ color:#dc2626; }
.toolbar{ display:flex; gap:8px; align-items:center; margin-bottom:10px; }
</style>


