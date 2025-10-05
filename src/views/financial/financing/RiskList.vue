<template>
  <div class="page">
    <div class="toolbar">
      <el-select v-model="filter.level" placeholder="风险等级" clearable style="width:140px">
        <el-option label="低" value="low"/>
        <el-option label="中" value="mid"/>
        <el-option label="高" value="high"/>
        <el-option label="极高" value="extreme"/>
      </el-select>
      <el-select v-model="filter.type" placeholder="风险类型" clearable style="width:160px">
        <el-option label="逾期" value="overdue"/>
        <el-option label="信用" value="credit"/>
        <el-option label="市场" value="market"/>
        <el-option label="操作" value="operation"/>
        <el-option label="流动性" value="liquidity"/>
      </el-select>
      <el-select v-model="filter.alert" placeholder="预警状态" clearable style="width:160px">
        <el-option label="正常" value="normal"/>
        <el-option label="关注" value="watch"/>
        <el-option label="预警" value="warn"/>
        <el-option label="风险" value="risk"/>
      </el-select>
      <el-button @click="load">筛选</el-button>
    </div>

    <el-table :data="rows" border stripe size="small">
      <el-table-column type="index" width="60"/>
      <el-table-column prop="company" label="企业" min-width="160"/>
      <el-table-column prop="riskType" label="风险类型" width="120"/>
      <el-table-column prop="levelText" label="等级" width="90"/>
      <el-table-column label="评分" width="140">
        <template #default="{ row }">
          <el-progress :percentage="row.score" :color="row.color" :stroke-width="14"/>
        </template>
      </el-table-column>
      <el-table-column prop="alertText" label="预警状态" width="100"/>
      <el-table-column fixed="right" label="处置" width="360">
        <template #default>
          <el-button size="small">预警设置</el-button>
          <el-button size="small">风险缓释</el-button>
          <el-button size="small">催收管理</el-button>
          <el-button size="small">计提拨备</el-button>
          <el-button size="small" type="danger" plain>核销处理</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';

type Row = { id:string; company:string; riskType:string; level:string; score:number; color:string; alert:string };
const rows = ref<Row[]>([]);
const filter = reactive({ level:'', type:'', alert:'' });

function genMock(n=28): Row[]{
  const list:Row[]=[]; const colors:any={low:'#22c55e',mid:'#eab308',high:'#f97316',extreme:'#ef4444'};
  for(let i=0;i<n;i++){
    const level=['low','mid','high','extreme'][i%4]; const score=[35,55,75,90][i%4];
    list.push({ id:String(Date.now()+i), company:'企业'+(i+1), riskType:['overdue','credit','market','operation','liquidity'][i%5], level, score, color:colors[level], alert:['normal','watch','warn','risk'][i%4] });
  } return list;
}
function load(){ rows.value = genMock().filter(r=> (!filter.level||r.level===filter.level) && (!filter.type||r.riskType===filter.type) && (!filter.alert||r.alert===filter.alert)); }
onMounted(load);
</script>

<style scoped>
.page{ padding:16px; }
.toolbar{ display:flex; gap:8px; margin-bottom:10px; align-items:center; }
</style>

