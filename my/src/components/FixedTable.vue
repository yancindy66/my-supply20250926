<template>
  <div class="ft-scroll-top" ref="topRef"><div :style="{ width: ftWidth + 'px', height: '1px' }"></div></div>
  <div class="ft-wrap" ref="wrapRef">
    <table class="ft-table" :style="{ width: ftWidth + 'px' }">
      <thead>
        <tr>
          <th v-for="(col,ci) in normColumns" :key="col.key"
              :style="thStyle(col)"
              :class="cellClass(col)">{{ col.label }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row,ri) in rows" :key="ri">
          <td v-for="(col,ci) in normColumns" :key="col.key"
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
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';

type Col = { key:string; label:string; width?:number; fixed?: 'left'|'right' };
const props = defineProps<{ columns: Col[]; rows: any[]; defaultFix?: boolean }>();
const ftWidth = computed(()=>{
  let sum = 0;
  for(const c of normColumns.value){ sum += (c.width || 160); }
  // 保障最小宽度
  return Math.max(sum, 1400);
});

function safe(v:any){ return v==null || v==='' ? '-' : v; }

const normColumns = computed(()=>{
  if(props.defaultFix && props.columns.length>=3){
    const cols = props.columns.slice();
    cols[0] = { ...cols[0], fixed:'left' } as Col;
    cols[1] = { ...cols[1], fixed:'left' } as Col;
    cols[cols.length-1] = { ...cols[cols.length-1], fixed:'right' } as Col;
    return cols;
  }
  return props.columns;
});

const leftOffsets = computed(()=>{
  const map: Record<string, number> = {};
  let acc = 0;
  for(const c of normColumns.value){
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
  for(let i=normColumns.value.length-1;i>=0;i--){
    const c = normColumns.value[i];
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
  if(col.fixed==='left'){ base.position='sticky'; base.left = `${leftOffsets.value[col.key]||0}px`; base.zIndex=4; base.boxShadow='2px 0 0 rgba(0,0,0,0.08)'; }
  if(col.fixed==='right'){ base.position='sticky'; base.right = `${rightOffsets.value[col.key]||0}px`; base.zIndex=5; base.boxShadow='-2px 0 0 rgba(0,0,0,0.08)'; }
  return base;
}
function tdStyle(col: Col){
  const w = `${col.width || 160}px`;
  const base:any = { minWidth:w, width:w, maxWidth:w, whiteSpace:'nowrap', background:'#fff' };
  if(col.fixed==='left'){ base.position='sticky'; base.left = `${leftOffsets.value[col.key]||0}px`; base.zIndex=3; base.background='#fff'; base.boxShadow='2px 0 0 rgba(0,0,0,0.04)'; }
  if(col.fixed==='right'){ base.position='sticky'; base.right = `${rightOffsets.value[col.key]||0}px`; base.zIndex=4; base.background='#fff'; base.boxShadow='-2px 0 0 rgba(0,0,0,0.04)'; }
  return base;
}
function cellClass(col: Col){
  return [ col.fixed?`fixed-${col.fixed}`:'' ];
}

// 顶部与底部横向滚动同步
const topRef = ref<HTMLDivElement|null>(null);
const wrapRef = ref<HTMLDivElement|null>(null);
let syncing = false;
function onTopScroll(){
  if(syncing) return; syncing = true;
  try{ if(wrapRef.value) wrapRef.value.scrollLeft = topRef.value?.scrollLeft || 0; }finally{ syncing = false; }
}
function onWrapScroll(){
  if(syncing) return; syncing = true;
  try{ if(topRef.value) topRef.value.scrollLeft = wrapRef.value?.scrollLeft || 0; }finally{ syncing = false; }
}
onMounted(()=>{
  topRef.value?.addEventListener('scroll', onTopScroll, { passive:true } as any);
  wrapRef.value?.addEventListener('scroll', onWrapScroll, { passive:true } as any);
});
onBeforeUnmount(()=>{
  topRef.value?.removeEventListener('scroll', onTopScroll as any);
  wrapRef.value?.removeEventListener('scroll', onWrapScroll as any);
});
</script>

<style scoped>
.ft-scroll-top{ width:100%; overflow-x:auto; overflow-y:hidden; height:12px; margin-bottom:6px; }
.ft-wrap{ width:100%; overflow-x:auto; }
.ft-table{ width:100%; min-width: 1400px; border-collapse: separate; border-spacing:0; box-shadow:0 10px 24px rgba(2,6,23,.06); border-radius:12px; overflow:hidden; }
.ft-table thead th{ position:relative; top:0; background:#f8fafc; color:#0f172a; font-weight:600; text-align:left; padding:8px 10px; border-bottom:1px solid #eef2f7; }
.ft-table td{ padding:8px 10px; border-bottom:1px solid #eef2f7; }
.ft-table tbody tr:nth-child(odd){ background:#fcfdff; }
.ft-table tbody tr:hover td:not(.fixed-left):not(.fixed-right){ background:#f8fafc; }
</style>


