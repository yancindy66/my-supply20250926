<template>
  <div style="padding:16px">
    <h3>库存列表（仓单管理）</h3>
    <div style="margin:12px 0; display:flex; gap:8px; align-items:center">
      <el-select v-model="filters.warehouseId" placeholder="仓库" clearable style="width:220px">
        <el-option v-for="w in warehouses" :key="w.id" :label="w.name" :value="w.id" />
      </el-select>
      <el-select v-model="filters.productId" placeholder="商品" clearable style="width:260px">
        <el-option v-for="p in products" :key="p.id" :label="p.name" :value="p.id" />
      </el-select>
      <el-input v-model="filters.lot" placeholder="批次（可模糊）" clearable style="width:220px" />
      <el-button type="primary" @click="load">查询</el-button>
      <el-button @click="reset">重置</el-button>
      <el-button @click="exportCsv">导出CSV</el-button>
    </div>
    <el-table :data="pagedRows" size="small" border :loading="loading">
      <el-table-column prop="warehouse_id" label="仓库" :formatter="fmtWarehouse" min-width="180" />
      <el-table-column prop="product_id" label="商品" :formatter="fmtProduct" min-width="200" />
      <el-table-column prop="lot_no" label="批次" min-width="140" />
      <el-table-column prop="quantity" label="数量" min-width="120" />
      <el-table-column prop="unit" label="单位" min-width="100" />
    </el-table>
    <div style="margin-top:12px; display:flex; justify-content:flex-end">
      <el-pagination
        background
        layout="prev, pager, next, sizes, total"
        :total="rows.length"
        :current-page="page"
        :page-size="pageSize"
        :page-sizes="[10,20,50,100]"
        @update:current-page="(v:number)=>{page=v}"
        @update:page-size="(v:number)=>{pageSize=v}"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, computed } from 'vue';

type Row = { warehouse_id:number; product_id:number; lot_no:string; quantity:number; unit:string };

const products = ref<Array<{id:number; name:string}>>([]);
const warehouses = ref<Array<{id:number; name:string}>>([]);
const allRows = ref<Row[]>([]);
const rows = ref<Row[]>([]);
const loading = ref(false);

const filters = reactive({ warehouseId: undefined as number|undefined, productId: undefined as number|undefined, lot: '' });

function applyFilters(){
  rows.value = allRows.value.filter(r =>
    (filters.warehouseId? r.warehouse_id===filters.warehouseId : true) &&
    (filters.productId? r.product_id===filters.productId : true) &&
    (filters.lot? String(r.lot_no||'').includes(filters.lot) : true)
  );
}

async function load(){
  loading.value = true;
  // 基于 Vite 代理，直接走 /api/*
  const [inv, ps, ws] = await Promise.all([
    fetch('/api/inventory').then(r=>r.json()).catch(()=>({data:{list:[]}})),
    fetch('/api/products').then(r=>r.json()).catch(()=>({data:[]})),
    fetch('/api/warehouses').then(r=>r.json()).catch(()=>({data:[]}))
  ]);
  products.value = ps.data||[];
  warehouses.value = ws.data||[];
  allRows.value = (inv.data?.list||[]) as Row[];
  applyFilters();
  loading.value = false;
}

function reset(){
  filters.warehouseId = undefined; filters.productId = undefined; filters.lot='';
  applyFilters();
}

function fmtWarehouse(_row:any,_col:any,cell:number){
  const w = warehouses.value.find(x=>x.id===cell); return w? w.name : String(cell||'');
}
function fmtProduct(_row:any,_col:any,cell:number){
  const p = products.value.find(x=>x.id===cell); return p? p.name : String(cell||'');
}

onMounted(load);

// 分页
const page = ref(1);
const pageSize = ref(20);
const pagedRows = computed(() => {
  const start = (page.value-1)*pageSize.value; return rows.value.slice(start, start+pageSize.value);
});

// 导出
function exportCsv(){
  const header = ['仓库','商品','批次','数量','单位'];
  const lines = rows.value.map(r => [fmtWarehouse(null,null,r.warehouse_id), fmtProduct(null,null,r.product_id), r.lot_no||'', r.quantity||0, r.unit||''].map(v => `"${String(v).replace(/"/g,'""')}"`).join(','));
  const csv = [header.join(','), ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '库存列表.csv';
  a.click();
  URL.revokeObjectURL(a.href);
}
</script>


