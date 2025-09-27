<template>
  <div class="page">
    <header class="bar">
      <div class="title">产品列表</div>
      <div class="actions">
        <button @click="reload">刷新</button>
      </div>
    </header>
    <section class="wrap">
      <table class="grid" v-if="items.length">
        <thead>
          <tr>
            <th>product_id</th>
            <th>名称</th>
            <th>分类</th>
            <th>价格</th>
            <th>折扣</th>
            <th>年份</th>
            <th>启用</th>
            <th>更新时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="it in items" :key="it.product_id">
            <td>{{ it.product_id }}</td>
            <td>{{ it.name }}</td>
            <td>{{ it.category }}</td>
            <td>{{ it.price }}</td>
            <td>{{ it.premium_discount }}</td>
            <td>{{ it.production_year }}</td>
            <td>{{ it.enabled ? '是':'否' }}</td>
            <td>{{ it.updated_at }}</td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty">暂无数据</div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

type Item = {
  product_id: string;
  name: string;
  category: string;
  price: number;
  premium_discount: number | null;
  production_year: number | null;
  enabled: boolean;
  updated_at: string;
};

const items = ref<Item[]>([]);

async function reload(){
  const res = await fetch('/api/products');
  const data = await res.json();
  items.value = data.items || [];
}

onMounted(reload);
</script>

<style scoped>
.page{ padding:16px; }
.bar{ display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
.title{ font-weight:700; }
.wrap{ background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:12px; }
table.grid{ width:100%; border-collapse:collapse; }
table.grid th, table.grid td{ border:1px solid #e5e7eb; padding:8px 10px; font-size:14px; }
.empty{ color:#64748b; text-align:center; padding:40px 0; }
</style>


