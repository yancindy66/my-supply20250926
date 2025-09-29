<template>
  <div class="ms-wrap">
    <div class="ms-toolbar">
      <span>微软 Excel Online 嵌入</span>
      <div class="right">
        <input v-model="tempUrl" class="url-input" placeholder="粘贴 OneDrive/SharePoint 的嵌入编辑链接 (iframe src)" />
        <button class="btn" @click="saveUrl">保存链接</button>
        <button class="btn" @click="clearUrl">清除</button>
      </div>
    </div>
    <div v-if="!embedUrl" class="empty">
      <p>尚未配置嵌入地址。</p>
      <ol>
        <li>将 Excel 文件上传至 OneDrive/SharePoint；在 Excel Online 打开。</li>
        <li>文件 → 共享 → 嵌入（选择允许交互/编辑）→ 复制 iframe 的 src。</li>
        <li>粘贴到上方输入框并保存。</li>
      </ol>
    </div>
    <iframe v-else class="ms-frame" :src="embedUrl" frameborder="0" allowfullscreen></iframe>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const STORAGE_KEY = 'ms_excel_embed_url';
const embedUrl = ref<string>('');
const tempUrl = ref<string>('');

onMounted(() => {
  try {
    embedUrl.value = localStorage.getItem(STORAGE_KEY) || '';
    tempUrl.value = embedUrl.value;
  } catch {}
});

function saveUrl() {
  const url = (tempUrl.value || '').trim();
  if (!url) return;
  try { localStorage.setItem(STORAGE_KEY, url); } catch {}
  embedUrl.value = url;
}
function clearUrl() {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
  embedUrl.value = '';
  tempUrl.value = '';
}
</script>

<style scoped>
.ms-wrap { height: calc(100vh - 80px); display: flex; flex-direction: column; }
.ms-toolbar { position: sticky; top: 0; z-index: 5; background: #fff; border-bottom: 1px solid #e5e7eb; padding: 8px; display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.right { display: flex; gap: 8px; align-items: center; }
.url-input { width: 520px; max-width: 60vw; padding: 6px 10px; border: 1px solid #e5e7eb; border-radius: 8px; }
.btn { padding: 6px 10px; border: 1px solid #e5e7eb; border-radius: 8px; background: #f8fafc; cursor: pointer; }
.ms-frame { flex: 1; width: 100%; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; }
.empty { padding: 16px; color: #475569; }
.empty ol { margin: 8px 0 0 18px; }
</style>








