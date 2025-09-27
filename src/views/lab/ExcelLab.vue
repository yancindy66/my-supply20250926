<template>
  <div class="lab-wrap">
    <header class="lab-topbar">
      <button class="back" @click="goBack">返回</button>
      <div class="title">AI × Excel 实验</div>
      <div class="actions">
        <button class="ghost" title="导入 XLSX" @click="triggerFile">导入 XLSX</button>
        <button class="ghost" title="新增一行" @click="addRow">新增一行</button>
        <button class="ghost" title="导出当前表" @click="exportSheet">导出 XLSX</button>
        <input ref="fileRef" type="file" accept=".xlsx,.xls" class="hidden" @change="onFile" />
      </div>
    </header>

    <section class="stage" @dragover.prevent @drop.prevent="onDrop">
      <div class="halo"></div>
      <div class="hint" v-if="!fileName">
        <div class="icon">📄</div>
        <div>拖拽 XLSX 到此处，或点击右上角“导入 XLSX”</div>
        <div class="sub">后续将接入 SheetJS 解析与渲染</div>
      </div>
      <div class="file-info" v-else>
        <div class="name">已选择：{{ fileName }}</div>
        <div class="desc" v-if="!rows.length">解析预留：将使用 SheetJS 读取并展示工作表</div>
        <div class="sheets" v-if="sheetNames.length">
          <button
            v-for="(sn, idx) in sheetNames"
            :key="sn+idx"
            :class="['tab', { active: idx===activeSheetIndex }]"
            @click="switchSheet(idx)"
          >{{ sn }}</button>
        </div>
        <div class="grid-wrap" v-if="rows.length">
          <table class="grid">
            <thead>
              <tr>
                <th v-for="(h, i) in rows[0]" :key="'h'+i">{{ typeof h==='string' ? h : ('C'+(i+1)) }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, ri) in rows.slice(1)" :key="'r'+ri">
                <td v-for="(c, ci) in r" :key="'c'+ri+'-'+ci">
                  <input class="cell" :value="display(c)" @change="e=>onEdit(ri+1, ci, (e.target as HTMLInputElement).value)" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import * as XLSX from 'xlsx';

const router = useRouter();
function goBack(){ router.push('/login'); }

const fileRef = ref<HTMLInputElement|null>(null);
const fileName = ref('');
const sheetNames = ref<string[]>([]);
const activeSheetIndex = ref(0);
const rows = ref<Array<Array<string | number | null>>>([]);
const workbookRef = ref<XLSX.WorkBook|null>(null);
const lastFileName = ref('export.xlsx');

function triggerFile(){ fileRef.value?.click(); }

function onFile(e: Event){
  const input = e.target as HTMLInputElement;
  const f = input.files && input.files[0];
  if(!f) return;
  handleFile(f);
}

function onDrop(e: DragEvent){
  const f = e.dataTransfer?.files && e.dataTransfer.files[0];
  if(!f) return;
  handleFile(f);
}

function handleFile(f: File){
  fileName.value = f.name;
  const reader = new FileReader();
  reader.onload = () => {
    try{
      const data = new Uint8Array(reader.result as ArrayBuffer);
      const wb = XLSX.read(data, { type: 'array' });
      workbookRef.value = wb;
      sheetNames.value = wb.SheetNames;
      activeSheetIndex.value = 0;
      loadActiveSheet();
    }catch(err){
      console.error(err);
    }
  };
  reader.readAsArrayBuffer(f);
}

function loadActiveSheet(){
  const wb = workbookRef.value;
  if(!wb) return;
  const sheetName = sheetNames.value[activeSheetIndex.value];
  const ws = wb.Sheets[sheetName];
  const aoa = XLSX.utils.sheet_to_json<Array<string|number|null>>(ws, { header: 1, raw: true });
  rows.value = aoa as any;
}

function switchSheet(idx: number){
  activeSheetIndex.value = idx;
  loadActiveSheet();
}

function display(v: any){ return v==null? '': String(v); }

function onEdit(r: number, c: number, v: string){
  if(!rows.value.length) return;
  const next = rows.value.map(row => row.slice());
  next[r][c] = v;
  rows.value = next;
}

function addRow(){
  if(!rows.value.length){ rows.value = [["A","B","C"],["", "", ""]]; return; }
  const cols = rows.value[0]?.length || 1;
  rows.value = [...rows.value, Array.from({length: cols}, ()=>"")];
}

function exportSheet(){
  const wb = workbookRef.value || XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows.value as any);
  const name = sheetNames.value[activeSheetIndex.value] || 'Sheet1';
  if(wb.Sheets && wb.Sheets[name]){
    // 覆盖当前活动表
    wb.Sheets[name] = ws;
  }else{
    XLSX.utils.book_append_sheet(wb, ws, name);
  }
  const outName = (fileName.value ? fileName.value.replace(/\.(xlsx|xls)$/i,'') : 'export') + '.xlsx';
  lastFileName.value = outName;
  XLSX.writeFile(wb, outName);
}
</script>

<style scoped>
.lab-wrap{ min-height:100vh; display:flex; flex-direction:column; background:linear-gradient(140deg,#0b1226 0%,#0f1d3a 45%,#162a59 100%); color:#e6eeff; }
.lab-topbar{ height:56px; display:grid; grid-template-columns:120px 1fr 200px; align-items:center; padding:0 16px; border-bottom:1px solid rgba(255,255,255,.06); backdrop-filter: blur(6px); }
.lab-topbar .title{ text-align:center; font-weight:700; letter-spacing:.12em; color:#c7d2fe; }
.lab-topbar .back{ height:34px; border:none; border-radius:8px; padding:0 12px; background:#1f2a44; color:#e6eeff; cursor:pointer; }
.lab-topbar .actions{ display:flex; justify-content:flex-end; gap:8px; }
.lab-topbar .actions .ghost{ height:34px; border:1px solid rgba(255,255,255,.16); border-radius:8px; padding:0 12px; background:rgba(255,255,255,.08); color:#e6eeff; cursor:pointer; }
.lab-topbar .hidden{ position:absolute; width:1px; height:1px; opacity:0; pointer-events:none; }

.stage{ position:relative; flex:1; display:flex; align-items:center; justify-content:center; overflow:hidden; }
.halo{ position:absolute; width:min(62%,720px); aspect-ratio:1/1; border-radius:50%; box-shadow:0 0 140px 40px rgba(32,123,255,.25) inset, 0 0 160px 20px rgba(32,123,255,.25); background:
  radial-gradient(closest-side, rgba(30,144,255,.45) 0%, rgba(30,144,255,.15) 55%, rgba(30,144,255,0) 60%),
  radial-gradient(closest-side, transparent 64%, rgba(135,206,255,.35) 66%, transparent 68%);
  filter: blur(0.4px);
}
.hint{ position:relative; z-index:1; text-align:center; color:#dbeafe; }
.hint .icon{ font-size:44px; margin-bottom:8px; }
.hint .sub{ margin-top:6px; font-size:12px; opacity:.8 }

.file-info{ position:relative; z-index:1; display:flex; flex-direction:column; align-items:center; gap:8px; background: rgba(10,18,44,.35); border:1px solid rgba(255,255,255,.12); border-radius:14px; padding:18px 20px; backdrop-filter: blur(8px) saturate(140%); }
.file-info .name{ font-weight:600; }
.file-info .desc{ font-size:12px; color:#c7d2fe; }

/* 简易表格渲染 */
:deep(table.grid){
  margin-top:14px; width: min(92vw, 1100px); border-collapse: collapse; background: rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.14); border-radius:10px; overflow:hidden;
}
:deep(table.grid th), :deep(table.grid td){
  border:1px solid rgba(255,255,255,.12); padding:8px 10px; font-size:13px; color:#e6eeff;
}
:deep(table.grid thead th){ background: rgba(37,99,235,.25); font-weight:700; }
:deep(.cell){ width:100%; background:transparent; border:none; outline:none; color:#e6eeff; font-size:13px; }
:deep(.cell):focus{ background: rgba(255,255,255,.08); border-radius:6px; }
</style>


