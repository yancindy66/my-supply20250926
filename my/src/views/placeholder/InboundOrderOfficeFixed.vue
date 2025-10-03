<template>
  <div class="page">
    <h2>车辆入库（修正·Handsontable）</h2>
    <div id="luckysheet" class="ls-wrap"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import 'luckysheet/dist/plugins/css/plugins.css';
import 'luckysheet/dist/css/luckysheet.css';
import 'luckysheet/dist/assets/iconfont/iconfont.css';
import luckysheet from 'luckysheet';
import { listInboundOrders } from '@/api/depositor';
const allRecords = ref<any[]>([]);
const colHeaders = ['预约单号','运输单号','入库单号','入库状态','入库凭证+','客户','商品','车牌号','预约量','已经入库量','磅重（入库方式）','毛重','皮重','净重','扣重','入场抓拍','入场抓拍时间','出场抓拍','出场抓拍时间','质检URL','司机姓名','司机手机','司机身份证','司机驾驶证','操作'];
// Handsontable 配置已移除，改用 Luckysheet 渲染

function mapStatus(s: string){ const m:Record<string,string>={ created:'已创建', receiving:'收货中', completed:'已完成', cancelled:'已取消' }; return m[s]||s||'-'; }

async function load(){
  // 先读本地 mock，再尝试请求接口；接口异常不影响展示
  let mock:any[] = [];
  try{ mock = JSON.parse(localStorage.getItem('mockInboundOrders')||'[]')||[]; }catch{}
  let api:any[] = [];
  try{
    const resp:any = await listInboundOrders({ page:1, pageSize:100 });
    api = resp?.data?.list || [];
  }catch(e){ /* ignore */ }
  // 若两端都无数据，自动生成10条本地Mock并落盘，避免空白
  if((mock?.length||0)===0 && (api?.length||0)===0){
    mock = genFullMock(10);
    try{ localStorage.setItem('mockInboundOrders', JSON.stringify(mock)); }catch{}
  }
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
  allRecords.value = data;
  renderLuckysheet(data);
}

onMounted(load);

function randomPlate(){
  const letters = 'ABCDEFGHJKLmnopqrstu'.toUpperCase();
  const prov = ['京','津','沪','渝','冀','豫','云','辽','黑','湘','皖','鲁','新','苏','浙','赣','鄂','桂','甘','晋','蒙','陕','吉','闽','贵','粤','青','藏','川','宁','琼'];
  const tail = Math.random().toString().slice(2,6) + letters[Math.floor(Math.random()*letters.length)];
  return prov[Math.floor(Math.random()*prov.length)] + 'A' + tail;
}



function genFullMock(n:number){
  const now = Date.now();
  const arr:any[] = [];
  for(let i=0;i<n;i++){
    const gross = 30000 + Math.floor(Math.random()*10000);
    const tare = 12000 + Math.floor(Math.random()*4000);
    const net = gross - tare;
    arr.push({
      reservation_number: 'YY'+(now+i),
      transport_no: 'T'+(now+i).toString().slice(-6),
      order_no: 'RK'+(now+i),
      status: ['created','receiving','completed'][i%3],
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
    });
  }
  return arr;
}

function renderLuckysheet(rows:any[]){
  const columns = [
    '预约单号','运输单号','入库单号','入库状态','入库凭证+','客户','商品','车牌号','预约量','已经入库量','磅重（入库方式）','毛重','皮重','净重','扣重','入场抓拍','入场抓拍时间','出场抓拍','出场抓拍时间','质检URL','司机姓名','司机手机','司机身份证','司机驾驶证'
  ];
  const keys = [
    'reservation_number','transport_no','order_no','status','inbound_proof','owner_name','commodity','vehicle_plate','planned_quantity','actual_in_weight','weigh_mode_text','gross','tare','net','deductions','entry_photos_count','entry_time','exit_photos_count','exit_time','qc_url','driver_name','driver_phone','driver_id_card','driver_license_url'
  ];
  const celldata:any[] = [];
  columns.forEach((name, ci)=>{ celldata.push({ r:0, c:ci, v:{ v:name, ct:{ fa:'@'} } }); });
  rows.forEach((r, ri)=>{
    keys.forEach((k, ci)=>{ celldata.push({ r:ri+1, c:ci, v:{ v: r[k] ?? '' } }); });
  });
  try{ (luckysheet as any).destroy?.(); }catch{}
  luckysheet.create({
    container:'luckysheet',
    lang:'zh',
    showtoolbar:true,
    showinfobar:false,
    showsheetbar:false,
    row: rows.length + 1,
    column: columns.length,
    data:[{
      name:'入库列表',
      celldata,
      config:{ frozen:{ type:'rangeBoth', range:{ row_focus:0, column_focus:2 } } }
    }]
  });
}
</script>

<style scoped>
.page{ padding:16px; }
.toolbar{ margin:12px 0; display:flex; gap:8px; }
.ghost{ background:#eef2f7; color:#0f172a; height:36px; padding:0 12px; border:none; border-radius:10px; }
.ghost-select{ background:#eef2f7; color:#0f172a; height:36px; padding:0 8px; border:none; border-radius:10px; }
.cols-panel{ display:flex; flex-wrap:wrap; gap:12px; padding:8px 12px; background:#f8fafc; border:1px dashed #e2e8f0; border-radius:12px; margin-bottom:12px; }
.col-item{ font-size:12px; color:#0f172a; }
.grid-wrap{ border:1px solid #e5e7eb; border-radius:12px; overflow:auto; box-shadow:0 10px 24px rgba(2,6,23,.06); height:70vh; }
.grid{ width:100%; height:100%; min-width:1400px; }
.link{ color:#2563eb; }
.danger{ color:#ef4444; margin-left:8px; }
.ag-theme-alpine{ --ag-font-size:12px; --ag-row-height:40px; }

/* 显式启用底边滚动条（部分浏览器在容器高度=视窗高度时不展示滚动条） */
.grid-wrap{ scrollbar-gutter: stable both-edges; }

/* 高亮当前行列 */
.current-row{ background: #f8fafc; }
.current-col{ background: #f1f5f9; }

/* 标签色系 */
.tag{ display:inline-block; padding:2px 8px; border-radius:999px; font-size:12px; line-height:18px; }
.tag.tag-blue{ background:#e0f2fe; color:#075985; }
.tag.tag-amber{ background:#fef3c7; color:#92400e; }
.tag.tag-green{ background:#dcfce7; color:#166534; }
.tag.tag-gray{ background:#e5e7eb; color:#374151; }
.tag.tag-purple{ background:#ede9fe; color:#5b21b6; }
.tag.tag-cyan{ background:#cffafe; color:#155e75; }

.basic-wrap{ border:1px solid #e5e7eb; border-radius:12px; overflow:auto; box-shadow:0 10px 24px rgba(2,6,23,.06); margin-top:8px; }
.ls-wrap{ border:1px solid #e5e7eb; border-radius:12px; height:70vh; box-shadow:0 10px 24px rgba(2,6,23,.06); overflow:hidden; }
</style>


