<template>
  <div class="stub">
    <h2>{{ title }}</h2>
    <p class="desc">占位页面（功能待接入）：{{ $route.path }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
const route = useRoute();
const title = computed(() => (route.meta?.title as string) || '功能页面');
</script>

<style scoped>
.stub{ background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:16px; }
.desc{ color:#64748b; margin-top:8px; }
</style>


