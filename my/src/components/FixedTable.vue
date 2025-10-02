<template>
  <div class="ft-wrap">
    <table class="ft-table">
      <thead>
        <tr>
          <th v-for="(col,ci) in columns" :key="col.key"
              :style="thStyle(col)"
              :class="cellClass(col)">{{ col.label }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row,ri) in rows" :key="ri">
          <td v-for="(col,ci) in columns" :key="col.key"
              :style="tdStyle(col)"
              :class="cellClass(col)">
            <slot :name="`cell-${col.key}`" :row="row" :col="col">
              {{ safe(row[col.key]) }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type Col = { key:string; label:string; width?:number; fixed?: 'left'|'right' };
const props = defineProps<{ columns: Col[]; rows: any[] }>();

function safe(v:any){ return v==null || v==='' ? '-' : v; }

const leftOffsets = computed(()=>{
  const map: Record<string, number> = {};
  let acc = 0;
  for(const c of props.columns){
    if(c.fixed==='left'){
      map[c.key] = acc;
      acc += (c.width || 160);
    }
  }
  return map;
});
const rightOffsets = computed(()=>{
  const map: Record<string, number> = {};
  let acc = 0;
  for(let i=props.columns.length-1;i>=0;i--){
    const c = props.columns[i];
    if(c.fixed==='right'){
      map[c.key] = acc;
      acc += (c.width || 160);
    }
  }
  return map;
});

function thStyle(col: Col){
  const w = `${col.width || 160}px`;
  const base:any = { minWidth:w, width:w, maxWidth:w, whiteSpace:'nowrap', background:'#f8fafc' };
  if(col.fixed==='left'){ base.position='sticky'; base.left = `${leftOffsets.value[col.key]||0}px`; base.zIndex=3; base.boxShadow='2px 0 0 rgba(0,0,0,0.06)'; }
  if(col.fixed==='right'){ base.position='sticky'; base.right = `${rightOffsets.value[col.key]||0}px`; base.zIndex=4; base.boxShadow='-2px 0 0 rgba(0,0,0,0.06)'; }
  return base;
}
function tdStyle(col: Col){
  const w = `${col.width || 160}px`;
  const base:any = { minWidth:w, width:w, maxWidth:w, whiteSpace:'nowrap', background:'#fff' };
  if(col.fixed==='left'){ base.position='sticky'; base.left = `${leftOffsets.value[col.key]||0}px`; base.zIndex=2; base.background='#fff'; base.boxShadow='2px 0 0 rgba(0,0,0,0.03)'; }
  if(col.fixed==='right'){ base.position='sticky'; base.right = `${rightOffsets.value[col.key]||0}px`; base.zIndex=3; base.background='#fff'; base.boxShadow='-2px 0 0 rgba(0,0,0,0.03)'; }
  return base;
}
function cellClass(col: Col){
  return [ col.fixed?`fixed-${col.fixed}`:'' ];
}
</script>

<style scoped>
.ft-wrap{ width:100%; overflow-x:auto; }
.ft-table{ width:100%; min-width: 1400px; border-collapse: separate; border-spacing:0; box-shadow:0 10px 24px rgba(2,6,23,.06); border-radius:12px; overflow:hidden; }
.ft-table thead th{ position:relative; top:0; background:#f8fafc; color:#0f172a; font-weight:600; text-align:left; padding:10px 12px; border-bottom:1px solid #eef2f7; }
.ft-table td{ padding:10px 12px; border-bottom:1px solid #eef2f7; }
.ft-table tbody tr:nth-child(odd){ background:#fcfdff; }
.ft-table tbody tr:hover td:not(.fixed-left):not(.fixed-right){ background:#f8fafc; }
</style>


