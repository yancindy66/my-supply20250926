<template>
  <div class="owner-list-container">
    <h2>存货人管理</h2>
    <button class="add-btn" @click="goCreate">新增存货人</button>
    <table class="owner-table">
      <thead>
        <tr>
          <th>公司名称</th>
          <th>联系人</th>
          <th>电话</th>
          <th>地址</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="owner in owners" :key="owner.id">
          <td>{{ owner.company }}</td>
          <td>{{ owner.contact }}</td>
          <td>{{ owner.phone }}</td>
          <td>{{ owner.address }}</td>
          <td>
            <button @click="goDetail(owner.id)">详情</button>
            <button @click="goEdit(owner.id)">编辑</button>
            <button @click="confirmDelete(owner.id)">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="showConfirm" class="confirm-modal">
      <div class="confirm-box">
        <p>确定要删除该存货人吗？</p>
        <button @click="deleteOwner(confirmId!)">确定</button>
        <button @click="showConfirm=false">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();
const owners = ref<any[]>([]);
const showConfirm = ref(false);
const confirmId = ref<number|null>(null);

async function fetchOwners() {
  const res = await fetch('/api/inventory-owner/list');
  const data = await res.json();
  if (data.code === 0) {
    owners.value = data.data || [];
  }
}

onMounted(fetchOwners);

function goCreate() {
  router.push('/member/inventory-owner/create');
}
function goDetail(id: number) {
  router.push(`/member/inventory-owner/detail/${id}`);
}
function goEdit(id: number) {
  router.push(`/member/inventory-owner/edit/${id}`);
}
function confirmDelete(id: number) {
  showConfirm.value = true;
  confirmId.value = id;
}
async function deleteOwner(id: number) {
  await fetch('/api/inventory-owner/delete', {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  });
  showConfirm.value = false;
  confirmId.value = null;
  await fetchOwners();
}
</script>

<style scoped>
.owner-list-container {
  max-width: 800px;
  margin: 40px auto;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.owner-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
}
.owner-table th, .owner-table td {
  border: 1px solid #eee;
  padding: 8px 12px;
  text-align: left;
}
.add-btn {
  margin-bottom: 16px;
}
.confirm-modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}
.confirm-box {
  background: #fff;
  padding: 32px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
</style>
