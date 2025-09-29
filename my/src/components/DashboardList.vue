<template>
  <div class="dashboard-list">
    <div v-for="item in list" :key="item.id" class="card">
      <div class="card-title">{{ item.name }}</div>
      <div class="card-value">{{ item.value }}</div>
      <div class="card-badge">
        <span :class="['badge', badgeColor(item.status)]">{{ item.status }}</span>
        <span class="expire">到期日：{{ item.expire }}</span>
      </div>
      <button class="detail-btn" @click="goDetail(item.id)">查看详情</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
const router = useRouter();

function goDetail(id: number) {
  router.push(`/receivable/${id}`);
}
interface DashboardItem {
  id: number;
  name: string;
  value: number;
  status: string;
  expire: string;
}
const props = defineProps<{ list: DashboardItem[] }>();

function badgeColor(status: string) {
  if (status === '正常') return 'badge-normal';
  if (status === '警告') return 'badge-warning';
  if (status === '过期') return 'badge-expired';
  return 'badge-normal';
}
</script>

<style scoped>
.dashboard-list {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  justify-content: center;
}
.card {
  width: 160px;
  height: 100px;
  background: linear-gradient(135deg, #42b983 0%, #67c23a 100%);
  color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: transform 0.2s;
}
.card:hover {
  transform: translateY(-4px) scale(1.04);
}
.detail-btn {
  margin-top: 8px;
  padding: 4px 16px;
  background: #fff;
  color: #42b983;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  transition: background 0.2s;
}
.detail-btn:hover {
  background: #e1f3d8;
}
.card-title {
  font-weight: bold;
  font-size: 20px;
  margin-bottom: 8px;
}
.card-value {
  font-size: 28px;
  letter-spacing: 2px;
}
.card-badge {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.badge {
  display: inline-block;
  padding: 2px 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 4px;
}
.badge-normal {
  background: #e1f3d8;
  color: #67c23a;
}
.badge-warning {
  background: #fff3cd;
  color: #e6a23c;
}
.badge-expired {
  background: #fde2e2;
  color: #f56c6c;
}
.expire {
  font-size: 12px;
  color: #f0f0f0;
}
</style>
