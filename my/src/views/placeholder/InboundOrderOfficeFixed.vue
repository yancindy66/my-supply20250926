<template>
  <div class="page">
    <h2>车辆入库（修正·Handsontable）</h2>
    <div class="toolbar">
      <button class="ghost" @click="load">刷新</button>
    <button class="ghost" @click="mock10">生成10条MOCK</button>
    </div>
    <div class="grid-wrap">
      <hot-table
        class="grid"
        :data="rows"
        :colHeaders="colHeaders"
        :columns="hotColumns"
        :fixedColumnsLeft="2"
        :stretchH="'all'"
        :licenseKey="'non-commercial-and-evaluation'"
        :rowHeights="40"
        :height="'70vh'"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { HotTable } from '@handsontable/vue3';
import 'handsontable/dist/handsontable.full.min.css';
import { listInboundOrders } from '@/api/depositor';
const rows = ref<any[]>([]);
const colHeaders = ['预约单号','运输单号','入库单号','入库状态','入库凭证+','客户','商品','车牌号','预约量','已经入库量','磅重（入库方式）','毛重','皮重','净重','扣重','入场抓拍','入场抓拍时间','出场抓拍','出场抓拍时间','质检URL','司机姓名','司机手机','司机身份证','司机驾驶证','操作'];
const hotColumns = [
  { data:'reservation_number' },
  { data:'transport_no' },
  { data:'order_no' },
  { data:'status' },
  { data:'inbound_proof' },
  { data:'owner_name' },
  { data:'commodity' },
  { data:'vehicle_plate' },
  { data:'planned_quantity' },
  { data:'actual_in_weight' },
  { data:'weigh_mode_text' },
  { data:'gross' },
  { data:'tare' },
  { data:'net' },
  { data:'deductions' },
  { data:'entry_photos_count' },
  { data:'entry_time' },
  { data:'exit_photos_count' },
  { data:'exit_time' },
  { data:'qc_url' },
  { data:'driver_name' },
  { data:'driver_phone' },
  { data:'driver_id_card' },
  { data:'driver_license_url' },
  { data:'_act' }
];

function mapStatus(s: string){ const m:Record<string,string>={ created:'已创建', receiving:'收货中', completed:'已完成', cancelled:'已取消' }; return m[s]||s||'-'; }

async function load(){
  const resp:any = await listInboundOrders({ page:1, pageSize:100 });
  const api = resp?.data?.list || [];
  let mock:any[] = [];
  try{ mock = JSON.parse(localStorage.getItem('mockInboundOrders')||'[]')||[]; }catch{}
  const data = [...mock, ...api].map((r:any)=>({
    reservation_number: r.reservation_number || r.order_no,
    transport_no: r.transport_no || '-',
    order_no: r.order_no || '-',
    status: mapStatus(r.status),
    owner_name: r.owner_name || '-',
    commodity: (r.commodity_name||'-') + (r.commodity_spec?(' / '+r.commodity_spec):''),
    vehicle_plate: r.vehicle_plate || '-',
    planned_quantity: r.total_planned_quantity || r.planned_quantity || '-',
    actual_in_weight: r.actual || r.calc_weight || '-',
    weigh_mode_text: r.weigh_mode==='by_pack' ? '按规格' : (r.weigh_mode==='by_weight'?'按磅重': (r.weigh_mode || '-')),
    gross: r.gross ?? '-',
    tare: r.tare ?? '-',
    net: (r.gross!=null && r.tare!=null)? (Number(r.gross)-Number(r.tare)) : (r.net ?? '-'),
    deductions: r.deductions ?? '-',
    entry_photos_count: Array.isArray(r.entry_photos)? `${r.entry_photos.length} 张` : (r.entry_capture_count ?? '-'),
    entry_time: r.entry_time || '-',
    exit_photos_count: Array.isArray(r.exit_photos)? `${r.exit_photos.length} 张` : (r.exit_capture_count ?? '-'),
    exit_time: r.exit_time || '-',
    qc_url: r.qc_url || '-',
    driver_name: r.driver_name || '-',
    driver_phone: r.driver_phone || '-',
    driver_id_card: r.driver_id_card || r.driver_id_no || '-',
    driver_license_url: r.driver_license_url || '-',
    inbound_proof: (r.weigh_ticket_urls && r.weigh_ticket_urls.length) ? `磅单${r.weigh_ticket_urls.length}张` : (r.weigh_ticket_url||r.doc_url? '磅单1张':'-'),
    _act: '编辑 删除'
  }));
  rows.value = data;
}

onMounted(load);

function randomPlate(){
  const letters = 'ABCDEFGHJKLmnopqrstu'.toUpperCase();
  const prov = ['京','津','沪','渝','冀','豫','云','辽','黑','湘','皖','鲁','新','苏','浙','赣','鄂','桂','甘','晋','蒙','陕','吉','闽','贵','粤','青','藏','川','宁','琼'];
  const tail = Math.random().toString().slice(2,6) + letters[Math.floor(Math.random()*letters.length)];
  return prov[Math.floor(Math.random()*prov.length)] + 'A' + tail;
}

function mock10(){
  const now = Date.now();
  const data = Array.from({ length:10 }).map((_,i)=>{
    const gross = 30000 + Math.floor(Math.random()*10000);
    const tare = 12000 + Math.floor(Math.random()*4000);
    const net = gross - tare;
    return {
      reservation_number: 'YY'+(now+i),
      transport_no: 'T'+(now+i).toString().slice(-6),
      order_no: 'RK'+(now+i),
      status: ['created','receiving','completed'][i%3],
      inbound_proof: i%2===0? '磅单1张' : '-',
      owner_name: '某客户'+(i+1),
      commodity_name: ['铁矿','煤炭','玉米','大豆'][i%4],
      commodity_spec: ['散装','袋装','30kg','50kg'][i%4],
      vehicle_plate: randomPlate(),
      planned_quantity: 32000 + i*500,
      actual: net,
      weigh_mode: 'by_weight',
      gross, tare, net,
      deductions: i%3===0? 20: 0,
      entry_photos: new Array(i%4).fill(0),
      entry_time: new Date(now - i*3600_000).toISOString().slice(0,19).replace('T',' '),
      exit_photos: new Array((i+1)%4).fill(0),
      exit_time: new Date(now - i*1800_000).toISOString().slice(0,19).replace('T',' '),
      qc_url: 'https://example.com/qc/'+(now+i),
      driver_name: '司机'+(i+1),
      driver_phone: '1'+(3000000000 + Math.floor(Math.random()*999999999)).toString().slice(0,10),
      driver_id_no: '4401011990010'+String(100+i),
      driver_license_url: 'https://example.com/license/'+(now+i)
    };
  });
  localStorage.setItem('mockInboundOrders', JSON.stringify(data));
  load();
}
</script>

<style scoped>
.page{ padding:16px; }
.toolbar{ margin:12px 0; display:flex; gap:8px; }
.ghost{ background:#eef2f7; color:#0f172a; height:36px; padding:0 12px; border:none; border-radius:10px; }
.grid-wrap{ border:1px solid #e5e7eb; border-radius:12px; overflow:auto; box-shadow:0 10px 24px rgba(2,6,23,.06); height:70vh; }
.grid{ width:100%; height:100%; min-width:1400px; }
.link{ color:#2563eb; }
.danger{ color:#ef4444; margin-left:8px; }
.ag-theme-alpine{ --ag-font-size:12px; --ag-row-height:40px; }

/* 显式启用底边滚动条（部分浏览器在容器高度=视窗高度时不展示滚动条） */
.grid-wrap{ scrollbar-gutter: stable both-edges; }
</style>


