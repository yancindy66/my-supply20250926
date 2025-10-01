<template>
  <div class="page">
    <div class="head">
      <h2>入库单详情</h2>
      <div class="spacer"></div>
      <template v-if="caps.inbound?.edit"><button @click="edit">编辑</button></template>
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else>
      <section class="card">
        <div class="row"><label>入库单号</label><div>{{ order?.order_no || '-' }}</div></div>
        <div class="row"><label>预约单号</label><div>{{ order?.reservation_number || '-' }}</div></div>
        <div class="row"><label>货主</label><div>{{ order?.owner_name || '-' }}</div></div>
        <div class="row"><label>商品/规格</label><div>{{ (order?.commodity_name||'-') + (order?.commodity_spec?(' / '+order?.commodity_spec):'') }}</div></div>
        <div class="row"><label>状态</label><div><span class="tag gray">{{ order?.status || '-' }}</span></div></div>
      </section>

      <section class="card">
        <h3>抓拍/视频</h3>
        <div class="hint">演示占位：此处展示门岗抓拍与入跺回放链接。</div>
        <div class="gallery">
          <div class="shot" v-for="i in 3" :key="i">抓拍{{ i }}</div>
        </div>
      </section>

      <section class="card">
        <h3>称重</h3>
        <div class="row"><label>入库方式</label><div>{{ order?.weigh_mode==='by_pack'?'按件数':'按重量' }}</div></n></div>
        <div class="row"><label>毛/皮/净/扣</label><div>{{ order?.gross }}/{{ order?.tare }}/{{ net }}/{{ order?.deductions||0 }}</div></div>
        <div class="row"><label>实际重量</label><div>{{ actual }}</div></div>
        <div class="row" v-if="order?.weigh_mode==='by_pack'"><label>件数/换算</label><div>{{ order?.pack_count }} × {{ order?.convert_ratio }} = {{ order?.calc_weight }}</div></div>
      </section>

      <section class="card">
        <h3>单据</h3>
        <div class="docs">
          <div>存货人凭证：<a href="javascript:;">查看</a> <button v-if="caps.inbound?.uploadDocs" class="link" @click="upload('owner_proof')">上传</button></div>
          <div>工厂磅单：<a href="javascript:;">查看</a> <button v-if="caps.inbound?.uploadDocs" class="link" @click="upload('factory_scale')">上传</button></div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { listInboundOrders } from '@/api/depositor';
import { capabilities } from '@/store/capabilities';

const route = useRoute();
const id = computed(()=> String(route.params.id||''));
const caps = computed(()=> capabilities.value || {});
const loading = ref(false);
const order = ref<any>(null);

const net = computed(()=> (order.value && order.value.gross!=null && order.value.tare!=null) ? (Number(order.value.gross)-Number(order.value.tare)) : null);
const actual = computed(()=> order.value?.actual ?? (net.value!=null ? (net.value - Number(order.value?.deductions||0)) : order.value?.calc_weight) );

async function load(){
  loading.value = true;
  try{
    const resp:any = await listInboundOrders({ page:1, pageSize:50 });
    const arr:any[] = resp?.data?.list || [];
    order.value = arr.find((x:any)=> String(x.order_no)===id.value) || arr[0] || null;
  }catch{ order.value=null; }
  loading.value = false;
}
onMounted(load);

function edit(){ alert('编辑入库单（仓库角色）'); }
function upload(_type:string){ alert('上传单据（演示）'); }
</script>

<style scoped>
.page{ padding:16px; }
.head{ display:flex; align-items:center; gap:8px; }
.spacer{ flex:1; }
.card{ border:1px solid #e5e7eb; background:#fff; border-radius:12px; padding:12px; margin:12px 0; box-shadow:0 6px 16px rgba(2,6,23,.06); }
.row{ display:flex; align-items:center; gap:8px; padding:6px 0; }
.row label{ width:120px; color:#475569; }
.tag{ display:inline-block; padding:3px 10px; border-radius:999px; font-size:12px; font-weight:600; }
.gray{ background:#e2e8f0; color:#334155; }
.gallery{ display:flex; gap:8px; }
.shot{ width:120px; height:80px; background:#f1f5f9; border:1px dashed #cbd5e1; display:flex; align-items:center; justify-content:center; color:#64748b; border-radius:8px; }
.docs .link{ background:transparent; color:#2563eb; padding:0 6px; }
</style>


