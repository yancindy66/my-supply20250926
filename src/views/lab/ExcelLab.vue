<template>
  <div class="lab-wrap">
    <header class="lab-topbar">
      <button class="back" @click="goBack">返回</button>
      <div class="title">AI × Excel 实验</div>
      <div class="actions">
        <button class="ghost" title="导入 XLSX" @click="triggerFile">导入 XLSX</button>
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
        <div class="desc">解析预留：将使用 SheetJS 读取并展示工作表</div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
function goBack(){ router.push('/login'); }

const fileRef = ref<HTMLInputElement|null>(null);
const fileName = ref('');

function triggerFile(){ fileRef.value?.click(); }

function onFile(e: Event){
  const input = e.target as HTMLInputElement;
  const f = input.files && input.files[0];
  if(!f) return;
  fileName.value = f.name;
  // 预留：后续使用 SheetJS 解析 f
}

function onDrop(e: DragEvent){
  const f = e.dataTransfer?.files && e.dataTransfer.files[0];
  if(!f) return;
  fileName.value = f.name;
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
</style>


