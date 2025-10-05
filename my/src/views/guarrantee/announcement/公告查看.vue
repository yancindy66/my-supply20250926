<template>
  <div class="page-wrap">
    <h2>公告信息查看</h2>
    <article class="article">
      <h3 class="title">{{ detail.title }}</h3>
      <div class="meta">{{ detail.type }} · {{ detail.author }} · {{ detail.publishTime }}</div>
      <div class="content" v-html="detail.content"></div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const detail = ref<any>({ title: '', type: '', author: '', publishTime: '', content: '' });
</script>

<style scoped>
.page-wrap{ font-size:13px; }
.article{ background:#fff; border:1px solid #eef2f6; border-radius:8px; padding:16px; max-width:860px; }
.title{ margin:0 0 6px; font-size:18px; }
.meta{ color:#64748b; font-size:12px; margin-bottom:12px; }
.content :deep(p){ line-height:1.7; margin:8px 0; }
.content :deep(img){ max-width:100%; border-radius:8px; }
</style>


