<template>
  <div class="page">
    <h2>{{ pageTitle }}</h2>
    <div class="toolbar" :class="{office: routeOfficeMode}">
      <!-- 入库单列表不再新建预约，入口前移至门岗核验 -->
      <button class="ghost" @click="load">刷新</button>
      <button v-if="routeOfficeMode" class="ghost" @click="downloadTemplate">下载模板</button>
      <label v-if="routeOfficeMode" class="upload-btn">
        批量导入
        <input type="file" accept=".csv" @change="onImportCsv" />
      </label>
      <button v-if="routeOfficeMode" class="ghost" @click="exportCsv">批量导出</button>
      <div class="spacer"></div>
        <button v-if="routeOfficeMode" class="ghost" @click="toggleFilter">高级筛选</button>
        <button v-if="routeOfficeMode" class="ghost" @click="toggleCols">列显示设置</button>
    </div>
    <!-- 顶部总览条（办公室模式） -->
    <div v-if="routeOfficeMode" class="summary-bar">
      <div class="stat">
        <div class="num">{{ totalPlanned }}</div>
        <div class="lbl">预约量合计（{{ unitHint }}）</div>
      </div>
      <div class="stat">
        <div class="num">{{ totalActual }}</div>
        <div class="lbl">已入库量合计（{{ unitHint }}）</div>
      </div>
      <div class="stat">
        <div class="num">{{ pendingReview }}</div>
        <div class="lbl">待审核</div>
      </div>
      <div class="stat warn">
        <div class="num">{{ abnormalCount }}</div>
        <div class="lbl">异常</div>
      </div>
      <div class="flex1"></div>
      <label class="abn-toggle"><input type="checkbox" v-model="showAbnormalOnly" /> 仅看异常</label>
    </div>
    <div v-if="showFilter" class="filter-panel">
      <div class="filter-row">
        <label>预约方</label>
        <select v-model="filters.party">
          <option value="">全部</option>
          <option value="存货人">存货人</option>
          <option value="物流方">物流方</option>
          <option value="仓库方">仓库方</option>
        </select>
        <label class="ml">状态</label>
        <div class="status-group">
          <label v-for="s in statusOptions" :key="s.value" class="status-item">
            <input type="checkbox" :value="s.value" v-model="filters.statuses" />
            <span>{{ s.label }}</span>
          </label>
        </div>
      </div>
      <div class="filter-row">
        <label>时间范围</label>
        <input type="datetime-local" v-model="filters.start" />
        <span>至</span>
        <input type="datetime-local" v-model="filters.end" />
        <label class="ml">仓库</label>
        <input type="text" v-model="filters.warehouse" placeholder="仓库名/地址" />
        <label class="ml">承运商</label>
        <input type="text" v-model="filters.carrier" placeholder="物流承运商" />
      </div>
      <div class="filter-actions">
        <button class="ghost" @click="resetFilter">重置</button>
        <button @click="applyFilter">应用筛选</button>
      </div>
    </div>
    <div v-if="showCols" class="col-panel">
      <div class="hint">按住条目可拖拽排序，勾选控制显隐</div>
      <div class="col-grid">
        <label
          v-for="(c,i) in columns"
          :key="c.key"
          class="col-item"
          :draggable="!c.locked"
          @dragstart="dragStart(i)"
          @dragover.prevent
          @drop="dropOn(i)"
        >
          <span class="drag-handle" :class="{disabled:c.locked}" title="拖拽排序">☰</span>
          <input type="checkbox" v-model="c.visible" :disabled="c.locked" />
          <span :class="{locked:c.locked}">{{ c.label }}</span>
        </label>
      </div>
      <div class="col-actions">
        <button class="ghost" @click="resetCols">重置</button>
        <button @click="saveCols">保存</button>
      </div>
    </div>
    <!-- 入库单列表无创建弹窗：保留占位以免大改动，默认不显示 -->
    <el-dialog v-model="showCreate" title="新建入库预约" width="760px">
      <el-form :model="createForm" label-width="100px" class="pretty-form">
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="仓库">
              <el-select v-model="createForm.warehouse_id" placeholder="请选择仓库" filterable>
                <el-option v-for="w in warehouses" :key="w.id" :label="`${w.name}（${w.address}）`" :value="w.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="商品">
              <el-select v-model="createForm.commodity_id" placeholder="请选择商品" filterable>
                <el-option v-for="p in products" :key="p.id" :label="p.name + (p.spec?(' / '+p.spec):'')" :value="p.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="运输方式">
              <el-select v-model="createForm.transport_mode" placeholder="请选择">
                <el-option label="车运" value="car" />
                <el-option label="航运" value="ship" />
                <el-option label="空运" value="air" />
                <el-option label="火车" value="train" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="入库方式">
              <el-select v-model="createForm.weigh_mode">
                <el-option label="按规格重量计算" value="by_pack" />
                <el-option label="磅重计算" value="by_weight" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row v-if="createForm.weigh_mode==='by_pack'" :gutter="12">
          <el-col :span="12">
            <el-form-item label="件数">
              <el-input-number v-model="createForm.pack_count" :min="0" :step="1" controls-position="right" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="规格(吨/件)">
              <el-input-number v-model="createForm.convert_ratio" :min="0" :step="0.0001" :precision="4" controls-position="right" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row v-if="createForm.weigh_mode==='by_pack'" :gutter="12">
          <el-col :span="12">
            <el-form-item label="规格重量(吨)">
              <el-input-number :model-value="Number(settlementWeight) || 0" :min="0" :step="0.01" :precision="4" controls-position="right" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <div class="note">预计结算重量：{{ settlementWeight }} 吨（按 件数 × 规格(吨/件) 计算；仓单仍按吨管理）</div>
          </el-col>
        </el-row>
        <el-row v-else :gutter="12">
          <el-col :span="24">
            <div class="note">结算依据：磅重（入库与出库均需过磅单；过磅单由门岗/仓库上传）</div>
            <el-checkbox v-model="createForm.require_weighing" disabled>必须过磅</el-checkbox>
          </el-col>
        </el-row>

        <el-row :gutter="12">
          <el-col :span="6">
            <el-form-item :label="createForm.weigh_mode==='by_pack' ? '规格重量(吨)' : '计划数量'">
              <el-input-number v-model="createForm.total_planned_quantity" :min="0" :step="0.01" :precision="2" controls-position="right" :disabled="createForm.weigh_mode==='by_pack'" />
            </el-form-item>
          </el-col>
          <el-col :span="6" v-if="createForm.weigh_mode!=='by_pack'">
            <el-form-item label="计量单位">
              <el-input v-model="createForm.measurement_unit" placeholder="吨" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="预约窗口(≤10天)">
              <el-date-picker size="large" style="width:100%" v-model="createForm.expected_arrival_range" type="datetimerange" start-placeholder="开始" end-placeholder="结束" value-format="YYYY-MM-DD HH:mm" :disabled-date="limitRange10Days" :editable="false" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="磅重费用(元)">
              <el-input-number v-model="createForm.weighing_fee" :min="0" :step="0.01" :precision="2" controls-position="right" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="12">
          <el-col :span="6">
            <el-form-item label="承运商">
              <el-input v-model="createForm.logistics_carrier" placeholder="物流公司" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="车牌">
              <el-input v-model="createForm.vehicle_plate" placeholder="车牌号" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="司机姓名">
              <el-input v-model="createForm.driver_name" placeholder="司机姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="司机电话">
              <el-input v-model="createForm.driver_phone" placeholder="手机号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="司机身份证号">
              <el-input v-model="createForm.driver_id_no" placeholder="身份证号码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="备注">
              <el-input v-model="createForm.remarks" placeholder="备注" clearable />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <button class="ghost" @click="showCreate=false">取消</button>
        <button @click="createReservationSubmit">提交预约</button>
      </template>
    </el-dialog>

    <div v-if="loading">加载中...</div>
    <FixedTable v-else :columns="ftColumns" :rows="visibleRows" :default-fix="true">
      <template #cell-reservation_number="{row}">
        <span class="resv-link" :title="'跳转入库单详情'" @click="viewDetail(row)">{{ row.reservation_number || row.order_no }}</span>
        <div class="subops">
          <img v-if="row.doc_url" :src="row.doc_url" alt="doc" class="doc-thumb" @click="uploadPdf(row)"/>
          <button v-else class="link mini" @click="uploadPdf(row)">上传PDF</button>
        </div>
      </template>
      <template #cell-order_no="{row}">
        <span class="resv-link" :title="'跳转入库单详情'" @click="viewDetail(row)">{{ row.order_no || row.reservation_number }}</span>
      </template>
      <template #cell-transport_no="{row}">{{ row.transport_no || '-' }}</template>
      <template #cell-unique_reservation_code="{row}">{{ row.unique_reservation_code || '-' }}</template>
      <template #cell-owner_name="{row}">{{ row.owner_name || '-' }}</template>
      <template #cell-warehouse="{row}">{{ (row.warehouse_name||'-') + ' ' + (row.warehouse_address||'') }}</template>
      <template #cell-commodity="{row}">{{ (row.commodity_name||'-') + (row.commodity_spec?(' / '+row.commodity_spec):'') }}</template>
      <template #cell-planned_quantity="{row}">{{ row.total_planned_quantity || row.planned_quantity }} {{ row.measurement_unit || row.unit || '' }}</template>
      <template #cell-actual_in_weight="{row}">{{ row.actual || row.calc_weight || '-' }} {{ row.measurement_unit || row.unit || '' }}</template>
      <template #cell-weigh_mode="{row}">{{ row.weigh_mode==='by_pack'?'按规格':'按磅重' }}</template>
      <template #cell-inbound_status="{row}"><span :class="['tag', inboundStatusColor(row)]">{{ inboundStatus(row) }}</span></template>
      <template #cell-goods_source="{row}">{{ row.goods_source || '司机上传磅单' }}</template>
      <template #cell-source_addr="{row}">{{ row.source_address || row.factory_batch_no || '-' }}</template>
      <template #cell-driver="{row}">{{ (row.vehicle_plate||'-') + ' / ' + maskDriver(row.driver_name, row.driver_phone) }}</template>
      <template #cell-driver_id_card="{row}">{{ row.driver_id_card || row.driver_id_no || '-' }}</template>
      <template #cell-driver_license_img="{row}">
        <img v-if="row.driver_license_url" :src="row.driver_license_url" class="doc-thumb" @click="uploadDriverLicense(row)" />
        <button v-else class="link mini" @click="uploadDriverLicense(row)">上传</button>
      </template>
      <template #cell-status="{row}"><span :class="['tag', statusColor(row.status)]">{{ mapStatus(row.status) }}</span></template>
      <template #cell-actions="{row}">
        <div class="ops compact">
          <button class="op" title="撤回" @click="withdraw(row)">撤回</button>
          <span class="dot">|</span>
          <button class="op" title="垛位卡" @click="addStackCard(row)">垛位卡</button>
          <span class="dot">|</span>
          <button class="op" title="台账" @click="addLedger(row)">台账</button>
          <span class="dot">|</span>
          <button class="op primary" title="注册仓单" @click="registerWarehouseReceipt(row)">注册</button>
        </div>
      </template>
    </FixedTable>

  

    <div v-if="importPreview.length" class="import-panel">
      <div class="import-head">
        <b>导入预览</b>
        <span>共 {{ importPreview.length }} 条</span>
        <span v-if="precheckResult.items?.length">｜通过 {{ passCount }} 条｜错误 {{ failCount }} 条</span>
        <div class="spacer"></div>
        <button class="ghost" @click="clearImport">清空</button>
        <button class="ghost" @click="precheckImport" :disabled="prechecking">{{ prechecking? '预检中...' : '预检' }}</button>
        <button @click="mergeImport" :disabled="!precheckResult.items?.length">导入通过项</button>
        <button class="ghost" @click="exportErrorCsv" :disabled="!failCount">导出错误行</button>
      </div>
      <table class="table mini">
        <thead>
          <tr>
            <th v-for="c in visibleColumns" :key="c.key">{{ c.label }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row,ri) in importPreview" :key="row.order_no" :class="{bad: hasRowError(ri), warn: hasRowWarn(ri) && !hasRowError(ri)}">
            <td v-for="c in visibleColumns" :key="c.key">
              <template v-if="c.key==='reservation_number'">{{ row.reservation_number || row.order_no }}</template>
              <template v-else-if="c.key==='reservation_party'">{{ row.reservation_party || '-' }}</template>
              <template v-else-if="c.key==='unique_reservation_code'">{{ row.unique_reservation_code || '-' }}</template>
              <template v-else-if="c.key==='owner_name'">{{ row.owner_name || '-' }}</template>
              <template v-else-if="c.key==='warehouse'">{{ (row.warehouse_name||'-') + ' ' + (row.warehouse_address||'') }}</template>
              <template v-else-if="c.key==='commodity'">{{ (row.commodity_name||'-') + (row.commodity_spec?(' / '+row.commodity_spec):'') }}</template>
              <template v-else-if="c.key==='planned_quantity'">{{ row.planned_quantity }} {{ row.measurement_unit || row.unit || '' }}</template>
              <template v-else-if="c.key==='goods_source'">{{ row.goods_source || '-' }}</template>
              <template v-else-if="c.key==='logistics_carrier'">{{ row.logistics_carrier || '-' }}</template>
              <template v-else-if="c.key==='driver'">{{ (row.vehicle_plate||'-') + ' / ' + maskDriver(row.driver_name, row.driver_phone) }}</template>
              <template v-else-if="c.key==='eta'">{{ row.eta || '-' }}</template>
              <template v-else-if="c.key==='status'">{{ mapStatus(row.status) }}</template>
              <template v-else-if="c.key==='created_at'">{{ row.created_at || '-' }}</template>
              <template v-else-if="c.key==='warehouse_handled_at'">{{ row.warehouse_handled_at || '-' }}</template>
              <template v-else-if="c.key==='platform_audited_at'">{{ row.platform_audited_at || '-' }}</template>
              <template v-else-if="c.key==='actions'">-</template>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="precheckResult.items?.length" class="precheck-summary">
        <span>通过：{{ passCount }}</span>
        <span>错误：{{ failCount }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import FixedTable from '@/components/FixedTable.vue';
import { useRouter } from 'vue-router';
import http from '@/api/http';
import { listInboundOrders, uploadReservationPdf, approveInboundOrder } from '@/api/depositor';
// import { capabilities } from '@/store/capabilities';

const router = useRouter();
const pageTitle = computed(()=> (router.currentRoute.value.meta as any)?.title || '入库单列表');
const routeOfficeMode = computed(()=> Boolean((router.currentRoute.value.meta as any)?.office) || router.currentRoute.value.path.includes('/inbound/office/list'));
const loading = ref(false);
const list = ref<any[]>([]);

const ftColumns = computed(()=>{
  // 根据可见列生成 FixedTable 需要的列定义，并设置固定与宽度
  return visibleColumns.value.map(c=>{
    const col:any = { key:c.key, label:c.label };
    if(c.key==='reservation_number') { col.fixed='left'; col.width=180; }
    if(c.key==='transport_no') { col.fixed='left'; col.width=160; }
    if(c.key==='actions') { col.fixed='right'; col.width=200; }
    return col;
  });
});
// const caps = computed(()=> (capabilities as any).value || {});
const showCreate = ref(false);
const showCols = ref(false);
const showFilter = ref(false);
const importPreview = ref<any[]>([]);
const prechecking = ref(false);
const precheckResult = ref<any>({ items: [] });
// const precheckOk = computed(()=> (precheckResult.value.items||[]).every((x:any)=>x.ok) && (precheckResult.value.items||[]).length>0);
const passCount = computed(()=> (precheckResult.value.items||[]).filter((x:any)=>x.ok).length);
const failCount = computed(()=> (precheckResult.value.items||[]).filter((x:any)=>!x.ok).length);
// 总览条数据（基于当前可见或全量？采用可见列表统计，和视图一致）
const unitHint = computed(()=> '吨');
const totalPlanned = computed(()=> visibleRows.value.reduce((s:any, r:any)=> s + Number(r.total_planned_quantity || r.planned_quantity || 0), 0));
const totalActual = computed(()=> visibleRows.value.reduce((s:any, r:any)=> s + Number(r.actual || r.calc_weight || 0), 0));
const pendingReview = computed(()=> visibleRows.value.filter((r:any)=> !['platform_approved','platform_rejected','cancelled'].includes(r.status||'')).length);
const showAbnormalOnly = ref(false);
function isAbnormal(row:any){
  // 简易规则：被驳回 或 缺少关键证据（驾驶证/预约单PDF）
  if ((row.status||'')==='platform_rejected') return true;
  if (!row.driver_license_url) return true;
  if (!row.doc_url) return true;
  return false;
}
const abnormalCount = computed(()=> visibleRows.value.filter((r:any)=> isAbnormal(r)).length);
// 顶部新建入库预约（简版）
const createForm = ref<any>({
  warehouse_id:'', commodity_id:'',
  transport_mode:'',
  weigh_mode:'by_pack', pack_count: null, convert_ratio: null,
  total_planned_quantity:100, measurement_unit:'吨', expected_arrival_date:'',
  expected_arrival_range: null,
  weighing_fee: null,
  require_weighing: false,
  remarks:''
});
const warehouses = ref<any[]>([]);
const products = ref<any[]>([]);
const settlementWeight = computed(()=>{
  if(createForm.value.weigh_mode==='by_pack' && createForm.value.pack_count && createForm.value.convert_ratio){
    const w = Number(createForm.value.pack_count) * Number(createForm.value.convert_ratio);
    return (Math.round(w*10000)/10000).toFixed(4);
  }
  return '—';
});
// 行内展开相关
// 展开功能暂时取消点击触发，仅保留函数以便后续启用
// 展开功能后续启用时再恢复；当前列表以列汇聚为主

watch(()=>createForm.value.weigh_mode, (m)=>{
  if(m==='by_weight'){
    createForm.value.require_weighing = true;
  }else{
    createForm.value.require_weighing = false;
  }
});

function limitRange10Days(date: Date){
  try{
    const range:any = createForm.value.expected_arrival_range;
    if(!range || !range[0]) return false;
    const start = new Date(range[0]).getTime();
    const d = new Date(date).getTime();
    const ten = 10 * 24 * 60 * 60 * 1000;
    return d > (start + ten) || d < (start - ten);
  }catch{ return false; }
}
async function loadOptions(){
  try{ const w:any = await http.get('/api/warehouses'); warehouses.value = w?.data || []; }catch{ warehouses.value=[]; }
  try{ const p:any = await http.get('/api/products'); products.value = p?.data || []; }catch{ products.value=[]; }
}
// function resetCreate(){ createForm.value = { warehouse_id:'', commodity_id:'', transport_mode:'', weigh_mode:'by_pack', pack_count:null, convert_ratio:null, total_planned_quantity:100, measurement_unit:'吨', expected_arrival_date:'', expected_arrival_range:null, weighing_fee:null, remarks:'' }; }
async function createReservationSubmit(){
  if(!createForm.value.warehouse_id || !createForm.value.commodity_id){ return alert('请选择仓库与商品'); }
  try{
    alert('入库单列表不支持新增，门岗核验完成后自动生成');
  }catch(e:any){ alert('提交失败：'+(e?.message||e)); }
}

type Col = { key:string; label:string; visible:boolean; locked?:boolean };
const STORAGE_KEY = 'inboundOrderList.columns.v1';
const FILTER_KEY = 'inboundOrderList.filters.v1';
const defaultColumns: Col[] = [
  { key:'order_no', label:'入库单号', visible:true },
  { key:'reservation_number', label:'预约单号', visible:true, locked:true },
  { key:'unique_reservation_code', label:'预约单号', visible:false },
  { key:'transport_no', label:'运输单号', visible:false },
  { key:'owner_name', label:'货主名称', visible:true },
  { key:'warehouse', label:'目标仓库', visible:false },
  { key:'commodity', label:'商品名称', visible:true },
  { key:'planned_quantity', label:'预约量', visible:true },
  { key:'actual_in_weight', label:'已入库量', visible:true },
  { key:'weigh_mode', label:'入库方式', visible:true },
  { key:'inbound_status', label:'入库状态', visible:true },
  { key:'gross', label:'毛重', visible:false },
  { key:'tare', label:'皮重', visible:false },
  { key:'net', label:'净重', visible:false },
  { key:'deductions', label:'扣重', visible:false },
  { key:'goods_source', label:'货物来源', visible:false },
  { key:'source_addr', label:'来源地址/厂家批次', visible:false },
  { key:'logistics_carrier', label:'物流承运商', visible:false },
  { key:'driver', label:'车牌/司机', visible:false },
  { key:'driver_id_card', label:'司机身份证号', visible:false },
  { key:'driver_license_img', label:'司机驾照', visible:false },
  { key:'entry_photos', label:'入场抓拍', visible:false },
  { key:'exit_photos', label:'出场抓拍', visible:false },
  { key:'weigh_ticket', label:'磅单', visible:false },
  { key:'eta', label:'预计到库', visible:false },
  { key:'qc_result', label:'质检', visible:false },
  { key:'status', label:'审核状态', visible:false },
  { key:'created_at', label:'申请入库时间', visible:true },
  { key:'warehouse_handled_at', label:'仓库处理时间', visible:false },
  { key:'platform_audited_at', label:'平台审核时间', visible:false },
  { key:'actions', label:'操作', visible:true, locked:true },
];

const columns = ref<Col[]>(loadCols());
function loadCols(): Col[]{
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return defaultColumns.map(c=>({...c}));
    const saved = JSON.parse(raw);
    // merge with defaults by key, keep order of defaults
    const map:Record<string, Col> = {};
    for(const s of (saved||[])) map[s.key]=s;
    const merged = defaultColumns.map(d => ({...d, ...(map[d.key]||{})}));
    // 强制保证操作列存在且可见并锁定在右侧
    const idx = merged.findIndex(c => c.key==='actions');
    if(idx>=0){ merged[idx].visible = true; merged[idx].locked = true; }
    else { merged.push({ key:'actions', label:'操作', visible:true, locked:true }); }
    return merged;
  }catch{ return defaultColumns.map(c=>({...c})); }
}
function saveCols(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(columns.value)); showCols.value=false; }
function resetCols(){ columns.value = defaultColumns.map(c=>({...c})); }
function toggleCols(){ showCols.value = !showCols.value; }
const visibleColumns = computed(()=> {
  const arr = columns.value.filter(c=>c.visible);
  // 确保左侧两列顺序固定：预约单号、运输单号
  const desiredLeft = ['reservation_number','transport_no'];
  const leftFixed: any[] = [];
  for(const k of desiredLeft){ const idx = arr.findIndex(c=>c.key===k); if(idx>=0){ leftFixed.push(arr.splice(idx,1)[0]); } }
  // 确保 actions 列在末尾
  const i = arr.findIndex(c=>c.key==='actions');
  let act: any | null = null;
  if(i>=0){ act = arr.splice(i,1)[0]; }
  const result = [...leftFixed, ...arr];
  if(act) result.push(act);
  return result;
});
// Filter state
type Filters = { party:string; statuses:string[]; start:string; end:string; warehouse:string; carrier:string };
const defaultFilters: Filters = { party:'', statuses:[], start:'', end:'', warehouse:'', carrier:'' };
const filters = ref<Filters>(loadFilter());
const statusOptions = [
  { value:'draft', label:'草稿' },
  { value:'created', label:'已创建' },
  { value:'submitted', label:'已提交' },
  { value:'warehouse_confirmed', label:'仓库已确认' },
  { value:'warehouse_rejected', label:'仓库已拒绝' },
  { value:'receiving', label:'收货中' },
  { value:'partially_delivered', label:'部分到货' },
  { value:'completed', label:'全部到货' },
  { value:'cancelled', label:'已取消' },
  { value:'platform_approved', label:'平台已审核' },
  { value:'platform_rejected', label:'平台已拒绝' },
];
function loadFilter(): Filters{
  try{ const raw = localStorage.getItem(FILTER_KEY); return raw? JSON.parse(raw) : { ...defaultFilters }; }
  catch{ return { ...defaultFilters }; }
}
function saveFilter(){ localStorage.setItem(FILTER_KEY, JSON.stringify(filters.value)); }
function toggleFilter(){ showFilter.value = !showFilter.value; }
function resetFilter(){ filters.value = { ...defaultFilters }; saveFilter(); }
function applyFilter(){ saveFilter(); }

// rows after filter
const visibleRows = computed(()=>{
  const f = filters.value;
  return (list.value||[]).filter((row:any)=>{
    if (f.party && row.reservation_party !== f.party) return false;
    if (f.statuses?.length && !f.statuses.includes(row.status)) return false;
    if (f.warehouse){
      const text = `${row.warehouse_name||''} ${row.warehouse_address||''}`;
      if (!text.includes(f.warehouse)) return false;
    }
    if (f.carrier && String(row.logistics_carrier||'').indexOf(f.carrier)===-1) return false;
    if (f.start){ const ct = new Date(row.created_at || row.eta || 0).getTime(); if (isFinite(ct) && ct < new Date(f.start).getTime()) return false; }
    if (f.end){ const ct = new Date(row.created_at || row.eta || 0).getTime(); if (isFinite(ct) && ct > new Date(f.end).getTime()) return false; }
    if (showAbnormalOnly.value && !isAbnormal(row)) return false;
    return true;
  });
});

// CSV import/export helpers
const CSV_HEADERS = [
  'reservation_number','reservation_party','unique_reservation_code','owner_name',
  'warehouse_name','warehouse_address','commodity_name','commodity_spec',
  'planned_quantity','measurement_unit','goods_source','logistics_carrier',
  'vehicle_plate','driver_name','driver_phone','driver_id_card','driver_license_url','eta','status','created_at',
  'warehouse_handled_at','platform_audited_at'
];

function downloadTemplate(){
  const rows = [CSV_HEADERS.join(',')];
  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'inbound_orders_template.csv';
  a.click();
  URL.revokeObjectURL(a.href);
}

function parseCsv(text:string){
  const lines = text.split(/\r?\n/).filter(Boolean);
  if(!lines.length) return [] as any[];
  const header = lines[0].split(',');
  const idx:Record<string,number> = {};
  for(let i=0;i<header.length;i++) idx[header[i]] = i;
  const arr:any[] = [];
  for(let i=1;i<lines.length;i++){
    const cols = lines[i].split(',');
    const row:any = {};
    for(const key of CSV_HEADERS){ row[key] = cols[idx[key]] || ''; }
    arr.push(row);
  }
  return arr;
}

function onImportCsv(e: Event){
  const input = e.target as HTMLInputElement;
  const file = input.files && input.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const text = String(reader.result||'');
    importPreview.value = parseCsv(text);
    input.value = '';
  };
  reader.readAsText(file, 'utf-8');
}

function clearImport(){ importPreview.value = []; }
function mergeImport(){
  // 简单合并：按 reservation_number 不重复插入，前插以便可见
  const exist = new Set((list.value||[]).map((x:any)=>x.reservation_number||x.order_no));
  // 仅导入预检通过的行
  const items = precheckResult.value.items || [];
  const add = importPreview.value.filter((r:any, i:number)=> items[i]?.ok && !exist.has(r.reservation_number));
  list.value = [...add, ...list.value];
  clearImport();
}

async function precheckImport(){
  if(!importPreview.value.length) return;
  prechecking.value = true;
  try{
    const resp:any = await http.post('/v1/inbound/orders/batch/precheck', importPreview.value);
    precheckResult.value = resp?.data || { items: [] };
  }catch{
    precheckResult.value = { items: [] };
  }
  prechecking.value = false;
}
function hasRowError(i:number){ const it = (precheckResult.value.items||[])[i]; return it ? (it.errors||[]).length>0 : false; }
function hasRowWarn(i:number){ const it = (precheckResult.value.items||[])[i]; return it ? (it.warnings||[]).length>0 : false; }

function exportErrorCsv(){
  const items = precheckResult.value.items||[];
  const rows = [CSV_HEADERS.join(',')];
  importPreview.value.forEach((r:any, i:number)=>{
    if(items[i] && !items[i].ok){
      const obj:any = {
        reservation_number: r.reservation_number || r.order_no,
        reservation_party: r.reservation_party||'',
        unique_reservation_code: r.unique_reservation_code||'',
        owner_name: r.owner_name||'',
        warehouse_name: r.warehouse_name||'',
        warehouse_address: r.warehouse_address||'',
        commodity_name: r.commodity_name||'',
        commodity_spec: r.commodity_spec||'',
        planned_quantity: r.planned_quantity||'',
        measurement_unit: r.measurement_unit||'',
        goods_source: r.goods_source||'',
        logistics_carrier: r.logistics_carrier||'',
        vehicle_plate: r.vehicle_plate||'',
        driver_name: r.driver_name||'',
        driver_phone: r.driver_phone||'',
        eta: r.eta||'',
        status: r.status||'',
        created_at: r.created_at||'',
        warehouse_handled_at: r.warehouse_handled_at||'',
        platform_audited_at: r.platform_audited_at||'',
      };
      rows.push(CSV_HEADERS.map(k=>String(obj[k]??'')).join(','));
    }
  });
  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'inbound_orders_errors.csv';
  a.click();
  URL.revokeObjectURL(a.href);
}

function exportCsv(){
  const rows = [CSV_HEADERS.join(',')];
  for(const r of visibleRows.value){
    const obj:any = {
      reservation_number: r.reservation_number || r.order_no,
      reservation_party: r.reservation_party||'',
      unique_reservation_code: r.unique_reservation_code||'',
      owner_name: r.owner_name||'',
      warehouse_name: r.warehouse_name||'',
      warehouse_address: r.warehouse_address||'',
      commodity_name: r.commodity_name||'',
      commodity_spec: r.commodity_spec||'',
      planned_quantity: r.planned_quantity||'',
      measurement_unit: r.measurement_unit||'',
      goods_source: r.goods_source||'',
      logistics_carrier: r.logistics_carrier||'',
      vehicle_plate: r.vehicle_plate||'',
      driver_name: r.driver_name||'',
      driver_phone: r.driver_phone||'',
      eta: r.eta||'',
      status: r.status||'',
      created_at: r.created_at||'',
      warehouse_handled_at: r.warehouse_handled_at||'',
      platform_audited_at: r.platform_audited_at||'',
    };
    rows.push(CSV_HEADERS.map(k=>String(obj[k]??'')).join(','));
  }
  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'inbound_orders_export.csv';
  a.click();
  URL.revokeObjectURL(a.href);
}

// Drag & drop sort for columns
const draggingIndex = ref<number | null>(null);
function dragStart(i:number){ draggingIndex.value = i; }
function dropOn(i:number){
  const from = draggingIndex.value;
  draggingIndex.value = null;
  if(from===null || from===i) return;
  const arr = columns.value.slice();
  const moving = arr[from];
  // 不允许越过固定的首尾锁定列（如 reservation_number/actions）
  if(moving?.locked) return;
  arr.splice(from,1);
  arr.splice(i,0,moving);
  columns.value = arr;
}

function mapStatus(s: string){
  const m: Record<string,string> = { created: '已创建', receiving: '收货中', completed: '已完成', cancelled: '已取消', platform_approved:'已审核', platform_rejected:'已驳回' };
  return m[s] || s || '-';
}
function inboundStatus(row:any){
  const s = String(row.status||'');
  if(['completed','fully_delivered','platform_approved'].includes(s)) return '入库完成';
  return '在途';
}
function inboundStatusColor(row:any){
  return inboundStatus(row)==='入库完成' ? 'green' : 'orange';
}
function statusColor(s:string){
  const map:Record<string,string>={
    draft:'slate', created:'blue', submitted:'indigo',
    warehouse_confirmed:'cyan', receiving:'orange',
    partially_delivered:'amber', completed:'green', fully_delivered:'green',
    platform_approved:'teal', platform_rejected:'rose', warehouse_rejected:'rose',
    cancelled:'gray'
  };
  return map[s]||'gray';
}
// 预留：party颜色，如需展示可再启用
function maskDriver(name?:string, phone?:string){
  const p = phone? String(phone).replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '';
  return (name||'-') + (p?(' '+p):'');
}

async function load(){
  loading.value = true;
  try{
    const resp: any = await listInboundOrders({ page:1, pageSize:10 });
    const rows:any[] = resp?.data?.list || [];
    // 合并本地“车辆入库”Mock（门岗抓拍推送）
    let mock:any[] = [];
    try{ mock = JSON.parse(localStorage.getItem('mockInboundOrders')||'[]') || []; }catch{ mock = []; }
    list.value = [...mock, ...rows.map(r=>({ ...r }))];
  }catch{ list.value = []; }
  loading.value = false;
}
 
loadOptions();
// function goApply(){ router.push('/inbound/order/apply'); }
// function openCreate(){ showCreate.value = false; }
// 入库单不再跳详情，使用行内展开
// 二级菜单中进入门岗核验，此处不再提供快捷入口
// 详情页内提供编辑/打印，此处不再暴露
async function uploadPdf(row:any){
  try{
    // demo：假设前端已生成PDF并有一个可访问URL，这里用占位URL
    const url = 'https://example.com/reservations/demo.pdf';
    await uploadReservationPdf(row.reservation_number||row.order_no||'', url, 'reservation.pdf');
    alert('已上传PDF到仓库（demo）');
  }catch(e:any){ alert('上传失败：'+(e?.message||e)); }
}
async function uploadDriverLicense(row:any){
  try{
    const url = 'https://example.com/images/driver-license-demo.png';
    // 复用上传接口，标注类型
    await http.post('/v1/docs/upload', { scope:'reservation', ref_id:String(row.reservation_number||row.order_no||''), doc_type:'driver_license_image', url, filename:'driver_license.png' });
    alert('已上传驾驶证图片（demo）');
  }catch(e:any){ alert('上传失败：'+(e?.message||e)); }
}
function viewDetail(row:any){
  const id = row.order_no || row.reservation_number || row.id;
  if(!id) return alert('缺少入库单标识');
  router.push(`/inbound/detail/${encodeURIComponent(id)}`);
}
function withdraw(_row:any){ alert('撤回（占位）'); }
function addStackCard(_row:any){ alert('添加垛位卡（占位）'); }
function addLedger(_row:any){ alert('添加台账（占位）'); }
async function registerWarehouseReceipt(row:any){
  try{
    await approveInboundOrder(row.order_no || row.reservation_number || row.id);
    await load();
    alert('已注册仓单（demo）');
  }catch(e:any){ alert('操作失败：'+(e?.message||e)); }
}
// 占位编辑入口已不在列表展示，保留需求时再启用
// 精简：删除、审核、驳回、取消预约等方法移除，按新操作栏逻辑保留“注册仓单”演示

load();
</script>

<style scoped>
.page{ padding:16px; }
.toolbar{ margin:12px 0; display:flex; gap:8px; }
.toolbar .ghost{ background:#f1f5f9; }
.toolbar.office{ background:#f8fafc; padding:8px; border-radius:10px; }
.spacer{ flex:1; }
.pretty-form :deep(.el-form-item){ margin-bottom:10px; }
.pretty-form :deep(.el-input),
.pretty-form :deep(.el-input-number),
.pretty-form :deep(.el-select),
.pretty-form :deep(.el-date-editor){ width:100%; }
.note{ font-size:12px; color:#64748b; padding:4px 8px; background:#f8fafc; border:1px dashed #e2e8f0; border-radius:6px; }
.filter-panel{ border:1px solid #e5e7eb; background:#fff; padding:10px; border-radius:10px; margin:8px 0; box-shadow:0 6px 16px rgba(2,6,23,.06); display:flex; flex-direction:column; gap:8px; }
.filter-row{ display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.filter-row .ml{ margin-left:12px; }
.status-group{ display:flex; gap:10px; flex-wrap:wrap; }
.status-item{ display:flex; align-items:center; gap:6px; }
.col-panel{ border:1px solid #e5e7eb; background:#fff; padding:10px; border-radius:10px; margin:8px 0; box-shadow:0 6px 16px rgba(2,6,23,.06); }
.hint{ font-size:12px; color:#6b7280; margin-bottom:6px; }
.col-grid{ display:grid; grid-template-columns: repeat(4, minmax(120px, 1fr)); gap:8px; }
.col-item{ display:flex; align-items:center; gap:8px; font-size:14px; padding:6px 8px; border:1px dashed transparent; border-radius:8px; }
.col-item:active{ border-color:#c7d2fe; background:#eef2ff; }
.drag-handle{ cursor:grab; user-select:none; color:#6b7280; }
.drag-handle.disabled{ opacity:.4; cursor:not-allowed; }
.col-item .locked{ color:#6b7280; }
.col-actions{ display:flex; gap:8px; justify-content:flex-end; margin-top:8px; }
button{ height:36px; padding:0 12px; border:none; border-radius:10px; background:#2563eb; color:#fff; cursor:pointer; box-shadow:0 6px 14px rgba(37,99,235,.18); }
.ghost{ background:#eef2f7; color:#0f172a; }
.table{ width:100%; min-width:1200px; border-collapse: separate; border-spacing:0; box-shadow:0 10px 24px rgba(2,6,23,.06); border-radius:12px; overflow:hidden; }
.table-wrap{ width:100%; overflow-x:auto; }
.table thead th{ position:sticky; top:0; background:#f8fafc; color:#0f172a; font-weight:600; white-space:nowrap; text-overflow:ellipsis; overflow:hidden; }
.table th,.table td{ border-bottom:1px solid #eef2f7; padding:10px 12px; text-align:left; }
.table tbody tr:nth-child(odd){ background:#fcfdff; transition:background .2s ease; }
.table tbody tr:hover{ background:#f1f5f9; box-shadow:inset 0 0 0 9999px rgba(2,6,23,.02); }
.empty{ text-align:center; color:#6b7280; }
.link{ background:transparent; color:#2563eb; padding:0 6px; }
.danger{ color:#ef4444; }
.ops{ display:flex; align-items:center; gap:4px; }
.ops.compact{ gap:4px; }
.ops .op{ background:transparent; color:#2563eb; padding:0 4px; height:22px; line-height:22px; font-size:12px; border-radius:4px; }
.ops .op:hover{ background:#eef2ff; }
.ops .op.primary{ color:#0b5cff; font-weight:600; }
.ops .dot{ color:#94a3b8; }
.tag{ display:inline-block; padding:3px 10px; border-radius:999px; font-size:12px; font-weight:600; letter-spacing:.02em; box-shadow:0 4px 10px rgba(15,23,42,.08); }
.blue{ background:#e0f2fe; color:#075985; }
.indigo{ background:#e0e7ff; color:#3730a3; }
.cyan{ background:#cffafe; color:#155e75; }
.orange{ background:#ffedd5; color:#9a3412; }
.amber{ background:#fef3c7; color:#92400e; }
.green{ background:#dcfce7; color:#166534; }
.teal{ background:#ccfbf1; color:#115e59; }
.rose{ background:#ffe4e6; color:#9f1239; }
.gray{ background:#e5e7eb; color:#374151; }
.slate{ background:#e2e8f0; color:#334155; }
.purple{ background:#ede9fe; color:#5b21b6; }
.upload-btn{ position:relative; overflow:hidden; display:inline-flex; align-items:center; gap:6px; padding:0 12px; border-radius:10px; background:#eef2f7; color:#0f172a; cursor:pointer; }
.upload-btn input{ position:absolute; inset:0; opacity:0; cursor:pointer; }
.import-panel{ border:1px solid #e5e7eb; background:#fff; padding:10px; border-radius:10px; margin:12px 0; box-shadow:0 6px 16px rgba(2,6,23,.06); }
.import-head{ display:flex; align-items:center; gap:10px; margin-bottom:8px; }
.table.mini{ box-shadow:none; }
.table.mini tr.bad{ background:#fef2f2; }
.table.mini tr.warn{ background:#fff7ed; }
.precheck-summary{ display:flex; gap:12px; color:#334155; margin-top:6px; }
/* 固定首列与末列 */
.table thead th.col-reservation_number, .table tbody td.col-reservation_number{ position:sticky; left:0; z-index:3; background:#f8fafc; box-shadow:2px 0 0 rgba(0,0,0,0.06); min-width:160px; }
.table thead th.col-transport_no, .table tbody td.col-transport_no{ position:sticky; left:160px; z-index:2; background:#f8fafc; box-shadow:2px 0 0 rgba(0,0,0,0.04); min-width:160px; }
.table thead th.col-actions, .table tbody td.col-actions{ position:sticky; right:0; z-index:4; background:#f8fafc; box-shadow:-2px 0 0 rgba(0,0,0,0.03); min-width:140px; }
.doc-thumb{ width:40px; height:40px; object-fit:cover; border-radius:6px; border:1px solid #e5e7eb; }
/* 预约号样式：弱化但可点击 */
.resv-link{ color:#2563eb; text-decoration:underline; cursor:pointer; }
.resv-link:hover{ color:#1d4ed8; }
.subops{ margin-top:6px; }
.link.mini{ font-size:12px; color:#3b82f6; }
.footer-actions{ margin-top:12px; display:flex; justify-content:flex-end; }
.summary-bar{ display:flex; gap:12px; align-items:center; background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:8px 12px; box-shadow:0 6px 16px rgba(2,6,23,.06); margin:10px 0; }
.summary-bar .stat{ min-width:140px; }
.summary-bar .stat .num{ font-size:18px; font-weight:700; color:#0f172a; }
.summary-bar .stat .lbl{ font-size:12px; color:#64748b; }
.summary-bar .stat.warn .num{ color:#b91c1c; }
.abn-toggle{ font-size:13px; color:#0f172a; }
.expand{ background:#fff; border:1px solid #e5e7eb; border-radius:10px; padding:10px; box-shadow:0 6px 16px rgba(2,6,23,.06); }
.expand-title{ font-weight:600; color:#0f172a; margin-bottom:6px; }
.thumb-fig{ width:90px; }
.thumb-fig img{ width:90px; height:60px; border-radius:6px; border:1px solid #e5e7eb; object-fit:cover; display:block; }
.thumb-fig figcaption{ font-size:10px; color:#64748b; margin-top:4px; line-height:1.2; word-break:break-all; }
</style>


