<template>
  <div class="product-price-page">
    <el-card shadow="never">
      <template #header>
        <div class="toolbar">
          <el-input v-model="keyword" placeholder="搜索 商品ID/品种/品牌" clearable style="width:260px" @keyup.enter="load"/>
          <el-button @click="load">查询</el-button>
        </div>
      </template>

      <el-table :data="rows" border style="width:100%">
        <el-table-column type="index" label="序号" width="70"/>
        <el-table-column prop="product_id" label="商品ID" width="160"/>
        <el-table-column prop="species" label="品种"/>
        <el-table-column prop="brand" label="品牌"/>
        <el-table-column prop="latest_price" label="最新基准价" width="120"/>
        <el-table-column prop="price_source" label="价格来源" width="120"/>
        <el-table-column prop="updated_by" label="修改人" width="120"/>
        <el-table-column prop="updated_at" label="修改时间" width="180"/>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="openEdit(row)">修改价格</el-button>
            <el-button size="small" @click="openHistory(row)">历史记录</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pager">
        <el-pagination
          background layout="prev, pager, next, jumper, total"
          :total="total" :page-size="pageSize" :current-page="page"
          @current-change="(p)=>{page=p;load();}"/>
      </div>
    </el-card>

    <!-- 修改价格对话框 -->
    <el-dialog v-model="priceVisible" title="修改价格" width="520px">
      <div v-if="current">
        <div style="margin-bottom:8px;color:#64748b">商品：{{ current.product_id }} / {{ current.species }} {{ current.brand || '' }}</div>
        <el-form :model="priceForm" label-width="120px">
          <el-form-item label="最新基准价" required><el-input v-model.number="priceForm.latest_price" /></el-form-item>
          <el-form-item label="价格来源">
            <el-select v-model="priceForm.price_source">
              <el-option label="SMM" value="SMM"/>
              <el-option label="Mysteel" value="Mysteel"/>
              <el-option label="自定义" value="Custom"/>
            </el-select>
          </el-form-item>
          <el-form-item label="修改原因"><el-input v-model="priceForm.reason" /></el-form-item>
          <el-form-item>
            <el-button @click="fetchFromSource('SMM')">从SMM获取</el-button>
            <el-button @click="fetchFromSource('Mysteel')">从Mysteel获取</el-button>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="priceVisible=false">取消</el-button>
        <el-button type="primary" :disabled="!isRiskAdmin" @click="onSavePrice">保存</el-button>
      </template>
    </el-dialog>

    <!-- 历史记录对话框 -->
    <el-dialog v-model="historyVisible" title="价格历史" width="680px">
      <el-table :data="historyRows" border>
        <el-table-column type="index" label="序号" width="70"/>
        <el-table-column prop="old_price" label="旧价" width="120"/>
        <el-table-column prop="new_price" label="新价" width="120"/>
        <el-table-column prop="price_source" label="来源" width="120"/>
        <el-table-column prop="reason" label="原因"/>
        <el-table-column prop="operator" label="操作人" width="120"/>
        <el-table-column prop="operated_at" label="时间" width="180"/>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import axios from 'axios';

const page = ref(1); const pageSize = ref(10); const total = ref(0);
const rows = ref<any[]>([]); const keyword = ref('');
const current = ref<any>(null);
const priceVisible = ref(false); const historyVisible = ref(false);
const priceForm = reactive<any>({ latest_price: null, price_source: 'Custom', reason: '' });
const historyRows = ref<any[]>([]);
const isRiskAdmin = computed(()=> (localStorage.getItem('currentRole')||'') === 'risk_admin');

async function load(){
  // 这里演示：从产品基础接口拉取，再并行拉价格表（也可后端join返回）
  const { data } = await axios.get('/api/products', { params: { page: page.value, pageSize: pageSize.value, keyword: keyword.value } });
  const list = data?.data?.list || []; total.value = data?.data?.total || 0;
  const enriched = await Promise.all(list.map(async (it:any)=>{
    const pr = await axios.get(`/api/product-prices/${it.product_id}`).catch(()=>({ data:{ data:null }}));
    return { ...it, ...(pr.data?.data||{}) };
  }));
  rows.value = enriched;
}
function openEdit(row:any){ current.value=row; priceForm.latest_price=row.latest_price||null; priceForm.price_source=row.price_source||'Custom'; priceForm.reason=''; priceVisible.value=true; }
async function fetchFromSource(src:string){
  const { data } = await axios.get('/api/price-fetch', { params: { source: src, keyword: current.value?.species || current.value?.product_id } });
  priceForm.latest_price = data?.data?.price || null; priceForm.price_source = src;
}
async function onSavePrice(){
  const pid = current.value?.product_id;
  await axios.put(`/api/product-prices/${pid}`, priceForm, { headers: { 'x-role':'risk_admin', 'x-operator':'admin' } });
  priceVisible.value=false; load();
}
async function openHistory(row:any){
  current.value=row; const pid=row.product_id;
  const { data } = await axios.get(`/api/price-history/${pid}`);
  historyRows.value = data?.data || []; historyVisible.value=true;
}

onMounted(load);
</script>

<style scoped>
.toolbar{ display:flex; gap:8px; align-items:center; }
.pager{ display:flex; justify-content:flex-end; margin-top:10px; }
</style>








