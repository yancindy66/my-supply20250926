<template>
  <div class="product-base-page">
    <el-card class="zce-card" shadow="never">
      <template #header>
        <div class="toolbar zce-toolbar">
          <el-button type="primary" @click="openForm()">{{ t('product.add') }}</el-button>
          <el-button @click="onExport">{{ t('common.export') }}</el-button>
          <el-upload action="" :auto-upload="false" :on-change="onImportExcel" :show-file-list="false" accept=".xlsx">
            <el-button>{{ t('common.importBatch') }}</el-button>
          </el-upload>
          <el-button text type="primary" @click="downloadTemplateXlsx">{{ t('common.downloadTemplate') }}</el-button>
          
          <el-input v-model="keyword" :placeholder="t('common.placeholderSearchProducts')" clearable style="width:300px" @keyup.enter="load"/>
          <el-button @click="load">{{ t('common.search') }}</el-button>
          <el-button type="danger" plain :disabled="selectedIds.length===0" @click="batchDelete">{{ t('common.batchDelete') }}</el-button>
          <el-button type="danger" :disabled="selectedIds.length===0" @click="batchDisable">禁用</el-button>
        </div>
      </template>

      <div v-if="selectedIds.length" class="selection-bar">
        <span>已选择 {{ selectedIds.length }} 项</span>
        <el-button type="danger" size="small" @click="batchDelete">批量删除</el-button>
        <el-button type="danger" size="small" @click="batchDisable">禁用</el-button>
        <el-button size="small" text @click="clearSelection">清空选择</el-button>
      </div>

      <el-table
        ref="tableRef"
        :data="displayRows"
        :row-key="rowKey"
        border
        style="width:100%"
        size="small"
        stripe
        header-cell-class-name="zce-th"
        row-class-name="zce-tr"
        @sort-change="onSortChange"
        @selection-change="onSelectionChange"
      >
        <el-table-column type="selection" width="48"/>
        <el-table-column type="index" label="序号" width="70"/>
        <el-table-column label="状态" width="72" align="center">
          <template #default="{ row }">
            <el-switch
              :model-value="row.status==='上架'"
              size="small"
              class="status-switch"
              @change="(val: boolean) => toggleEnable(row, val)"
            />
          </template>
        </el-table-column>
        <el-table-column label="商品品类" width="110">
          <template #default="{ row }">{{ row.commodity_type || row.species || '-' }}</template>
        </el-table-column>
        <el-table-column label="商品ID" width="140">
          <template #default="{ row }">
            {{ displayProductId(row) }}
          </template>
        </el-table-column>
        <el-table-column prop="platform_standard_grade_name" label="平台标准等级" width="130"/>
        <el-table-column prop="product_name" label="商品名称（客户品牌名）" min-width="160"/>
        <el-table-column prop="custom_premium" label="升贴水" width="100">
          <template #default="{ row }">{{ row.custom_premium ?? row.platform_base_premium ?? 0 }}</template>
        </el-table-column>
        <el-table-column prop="production_year" label="生产年度" width="100"/>
        <el-table-column label="包装图片" width="120">
          <template #default="{ row }">
            <el-image v-if="row.packaging_image" :src="row.packaging_image" :preview-src-list="[row.packaging_image]" :preview-teleported="true" fit="cover" class="thumb"/>
            <span v-else style="color:#909399;">无</span>
          </template>
        </el-table-column>
        <el-table-column prop="current_price" label="当前价格" width="120">
          <template #default="{ row }">{{ row.current_price ?? '-' }}</template>
        </el-table-column>
        <el-table-column prop="package_spec" label="包装规格" min-width="120"/>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="openForm(row)">编辑</el-button>
            <el-button size="small" type="primary" plain @click="openPrice(row)">修改价格</el-button>
            <el-dropdown>
              <el-button size="small" text>更多</el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="upRow(row)">启用</el-dropdown-item>
                  <el-dropdown-item @click="downRow(row)">禁用</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <div class="pager">
        <el-pagination
          background
          layout="prev, pager, next, jumper, total"
          :total="total"
          :page-size="pageSize"
          v-model:current-page="page"
          @current-change="onPageChange"/>
      </div>
    </el-card>

    <el-dialog v-model="formVisible" :title="form.id ? t('product.dialog.edit') : t('product.dialog.create')" width="720px" :append-to-body="true">
      <el-form :model="form" label-width="120px">
        <el-alert title="平台标准映射（选择平台标准→生成客户品牌）" type="success" show-icon style="margin-bottom:12px;"/>
        <el-form-item label="商品品类">
          <el-select v-model="platformCommodity" placeholder="请选择品类" @change="loadPlatformStandards">
            <el-option label="棉花" value="棉花"/>
            <el-option label="红枣" value="红枣"/>
          </el-select>
        </el-form-item>
        <el-form-item label="平台标准等级">
          <el-select v-model="selectedPlatformStandardId" placeholder="请选择等级" :disabled="!platformCommodity" @change="onSelectPlatformStandard">
            <el-option v-for="s in platformStandards" :key="s.id" :label="s.grade_name" :value="s.id"/>
          </el-select>
        </el-form-item>
        <el-card v-if="selectedPlatformStandard" shadow="never" class="spec-card">
          <template #header>
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <div>平台标准：{{ selectedPlatformStandard.grade_name }}（品类：{{ selectedPlatformStandard.commodity_type }}）</div>
              <div style="color:#909399;">标准升贴水：{{ selectedPlatformStandard.base_premium }} 元</div>
            </div>
          </template>
          <el-descriptions :column="2" size="small" border>
            <el-descriptions-item v-for="(v,k) in selectedPlatformStandard.specifications" :key="String(k)" :label="String(k)">
              {{ formatSpecValue(v) }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
        <el-form-item label="客户品牌名">
          <el-input v-model="brandName" placeholder="如：丰汇牌 一级棉"/>
        </el-form-item>
        <el-form-item label="微调升贴水">
          <div style="display:flex;align-items:center;gap:8px;">
            <el-input-number v-model="customPremium" :precision="2" :step="1" />
            <span style="color:#909399;">可在标准升贴水 [{{ selectedPlatformStandard?.base_premium ?? 0 }} 元] 基础上微调 ±5%</span>
          </div>
        </el-form-item>
        
        
        <el-card v-if="qcRows.length" shadow="never" class="qc-card">
          <template #header>
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <div>质检报告对标结果</div>
              <el-tag :type="qcPass? 'success':'danger'">{{ qcPass? '符合标准（可上架）':'不符合标准（不可上架）' }}</el-tag>
            </div>
          </template>
          <el-table :data="qcRows" size="small" border>
            <el-table-column prop="metric" label="指标" width="220"/>
            <el-table-column prop="expected" label="标准要求"/>
            <el-table-column prop="measured" label="报告数据" width="150"/>
            <el-table-column label="结果" width="100">
              <template #default="{ row }">
                <el-tag :type="row.ok? 'success':'danger'">{{ row.ok? '通过':'不通过' }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
          <el-divider content-position="left">报告详细</el-divider>
          <el-descriptions :column="3" border size="small">
            <el-descriptions-item label="加工单位">{{ qcProfile.processor_name }}</el-descriptions-item>
            <el-descriptions-item label="加工单位地址">{{ qcProfile.processor_address }}</el-descriptions-item>
            <el-descriptions-item label="联系人">{{ qcProfile.contact_person }}</el-descriptions-item>
            <el-descriptions-item label="棉花长度(mm)">{{ qcProfile.fiber_length }}</el-descriptions-item>
            <el-descriptions-item label="断裂比强度(cN/tex)">{{ qcProfile.break_strength }}</el-descriptions-item>
            <el-descriptions-item label="马克隆值">{{ qcProfile.micronaire }}</el-descriptions-item>
            <el-descriptions-item label="长度整齐度(%)">{{ qcProfile.uniformity_index }}</el-descriptions-item>
            <el-descriptions-item label="异性纤维">{{ qcProfile.no_foreign_fiber? '无三丝':'可能含异纤' }}</el-descriptions-item>
            <el-descriptions-item label="颜色级占比(%)">
              <div class="pct-row">
                <span v-for="(v,k) in qcProfile.color_grade_pct" :key="String(k)">{{ k }}: {{ v }}%</span>
              </div>
            </el-descriptions-item>
            <el-descriptions-item label="轧工质量占比(%)" :span="2">
              <div class="pct-row">
                <span>P1: {{ qcProfile.ginning_quality_pct?.P1||0 }}%</span>
                <span>P2: {{ qcProfile.ginning_quality_pct?.P2||0 }}%</span>
                <span>P3: {{ qcProfile.ginning_quality_pct?.P3||0 }}%</span>
              </div>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
        
        
        <!-- 棉花专属：上下两栏布局（基本信息 / 质量指标） -->
        <template v-if="form.species==='棉花'">
          <el-divider content-position="left">基本信息</el-divider>
          <el-form-item label="商品名称" required>
            <el-input v-model="form.product_name" :placeholder="brandName? '默认使用品牌名作为商品名称' : '如 2024新疆兵团一级棉'"/>
          </el-form-item>
          <el-form-item label="商品简码">
            <el-input v-model="form.short_code" readonly placeholder="例如 2129A，根据颜色级+长度+马克隆等级自动生成"/>
          </el-form-item>
          <el-alert title="执行标准：GB 1103.1-2012《棉花 第1部分：锯齿加工细绒棉》" type="info" show-icon style="margin-bottom:8px;"/>
          <el-form-item label="产地大区" required>
            <el-select v-model="form.origin_area" placeholder="请选择">
              <el-option v-for="opt in cottonOrigins" :key="opt" :label="opt" :value="opt"/>
            </el-select>
          </el-form-item>
          <el-form-item label="检验证书编号">
            <el-input v-model="form.certificate_no"/>
          </el-form-item>
          <el-form-item label="异性纤维">
            <el-switch v-model="form.no_foreign_fiber" active-text="无三丝" inactive-text="可能含少量异纤"/>
          </el-form-item>
          <el-form-item label="证书照片">
            <el-upload ref="certUpload" drag action="" :auto-upload="false" accept="image/*" :on-change="onCertImageChange" :show-file-list="false">
              <i class="el-icon--upload"></i>
              <div class="el-upload__text">拖拽图片到此处，或点击上传</div>
            </el-upload>
            <img v-if="form.certificate_image" :src="form.certificate_image" alt="证书预览" style="max-width:160px; margin-left:12px; border-radius:4px;"/>
          </el-form-item>
          <el-divider content-position="left">质量指标</el-divider>
          <el-form-item label="颜色级" required>
            <el-select v-model="form.color_grade" placeholder="请选择">
              <el-option v-for="o in colorGrades" :key="o.value" :label="o.label" :value="o.value"/>
            </el-select>
          </el-form-item>
          <el-form-item label="轧工质量" required>
            <el-select v-model="form.ginning_quality" placeholder="请选择">
              <el-option label="P1 (好)" value="P1"/>
              <el-option label="P2 (中)" value="P2"/>
              <el-option label="P3 (差)" value="P3"/>
            </el-select>
          </el-form-item>
          <el-form-item label="纤维长度(mm)" required>
            <el-input-number v-model="form.fiber_length" :precision="1" :step="0.5" :min="10" />
          </el-form-item>
          <el-form-item label="马克隆值" required>
            <div style="display:flex; align-items:center; gap:8px;">
              <el-input-number v-model="form.micronaire" :precision="1" :step="0.1" :min="2.0" :max="6.0" />
              <span style="color:#909399;">等级：{{ micronGradeText }}</span>
            </div>
          </el-form-item>
          <el-form-item label="断裂比强度(cN/tex)">
            <el-input-number v-model="form.break_strength" :precision="1" :step="0.1" :min="0" />
          </el-form-item>
          <el-form-item label="长度整齐度(%)">
            <el-input-number v-model="form.uniformity_index" :precision="1" :step="0.1" :min="0" :max="100" />
          </el-form-item>
        </template>
        <!-- 白糖专属：上下两栏布局（基本信息 / 质量指标） -->
        <template v-else-if="form.species==='白糖'">
          <el-divider content-position="left">基本信息</el-divider>
          <el-form-item label="糖种类型" required>
            <el-select v-model="form.sugar_type" placeholder="请选择">
              <el-option v-for="t in sugarTypes" :key="t" :label="t" :value="t"/>
            </el-select>
          </el-form-item>
          <el-form-item label="执行标准">
            <el-input v-model="form.sugar_standard_code" placeholder="如 GB/T 317"/>
          </el-form-item>
          <el-form-item label="产地"><el-autocomplete v-model="form.origin_area" :fetch-suggestions="queryOriginSuggest" placeholder="请输入产地，可选历史"/></el-form-item>
          <el-divider content-position="left">质量指标</el-divider>
          <el-form-item label="极化度 Pol(%)" required>
            <el-input-number v-model="form.sugar_pol" :precision="2" :step="0.01" :min="90" :max="100" />
          </el-form-item>
          <el-form-item label="颜色 ICUMSA" required>
            <el-input-number v-model="form.sugar_icumsa" :precision="0" :step="1" :min="0" />
          </el-form-item>
          <el-form-item label="水分(%)" required>
            <el-input-number v-model="form.sugar_moisture_percent" :precision="2" :step="0.01" :min="0" :max="2" />
          </el-form-item>
          <el-form-item label="灰分(%)">
            <el-input-number v-model="form.sugar_ash_percent" :precision="2" :step="0.01" :min="0" :max="1" />
          </el-form-item>
          <el-form-item label="粒度(目)">
            <el-input-number v-model="form.sugar_particle_mesh" :precision="0" :step="5" :min="10" :max="200" />
          </el-form-item>
          <el-form-item label="硫残留(mg/kg)">
            <el-input-number v-model="form.sugar_sulfur_residue_mgkg" :precision="0" :step="1" :min="0" />
          </el-form-item>
          <el-form-item label="质量评定">
            <el-tag :type="sugarGradeTagType">{{ sugarGradeText }}</el-tag>
          </el-form-item>
        </template>
        <!-- 红枣专属：上下两栏布局（基本信息 / 质量指标） -->
        <template v-else-if="form.species==='红枣'">
          <el-divider content-position="left">基本信息</el-divider>
          <el-form-item label="品类" required>
            <el-select v-model="form.date_variety" placeholder="请选择">
              <el-option v-for="t in dateVarieties" :key="t" :label="t" :value="t"/>
            </el-select>
          </el-form-item>
          <el-form-item label="产地"><el-autocomplete v-model="form.origin_area" :fetch-suggestions="queryOriginSuggest" placeholder="请输入产地，可选历史"/></el-form-item>
          <el-divider content-position="left">质量指标</el-divider>
          <el-form-item label="果径(mm)">
            <el-input-number v-model="form.date_fruit_diameter_mm" :precision="1" :step="0.5" :min="5" />
          </el-form-item>
          <el-form-item label="果长(mm)">
            <el-input-number v-model="form.date_fruit_length_mm" :precision="1" :step="0.5" :min="5" />
          </el-form-item>
          <el-form-item label="糖度 Brix(%)" required>
            <el-input-number v-model="form.date_brix" :precision="1" :step="0.1" :min="0" :max="100" />
          </el-form-item>
          <el-form-item label="含水率(%)" required>
            <el-input-number v-model="form.date_moisture_percent" :precision="1" :step="0.1" :min="0" :max="100" />
          </el-form-item>
          <el-form-item label="霉变率(%)">
            <el-input-number v-model="form.date_mildew_percent" :precision="1" :step="0.1" :min="0" :max="100" />
          </el-form-item>
          <el-form-item label="破损率(%)">
            <el-input-number v-model="form.date_breakage_percent" :precision="1" :step="0.1" :min="0" :max="100" />
          </el-form-item>
          <el-form-item label="每公斤颗粒数" required>
            <el-input-number v-model="form.date_pieces_per_kg" :precision="0" :step="10" :min="10" />
          </el-form-item>
          <el-form-item label="等级评定">
            <el-tag :type="dateLevelTagType">{{ dateLevelText }}</el-tag>
          </el-form-item>
        </template>
        <!-- 通用：包装图片 -->
        <el-form-item label="包装图片">
          <div style="display:flex; align-items:center; gap:12px;">
            <el-upload ref="packUpload" drag action="" :auto-upload="false" accept="image/*" :on-change="onPackImageChange" :show-file-list="false">
              <i class="el-icon--upload"></i>
              <div class="el-upload__text">拖拽图片到此处，或点击上传</div>
            </el-upload>
            <img v-if="form.packaging_image" :src="form.packaging_image" alt="包装图片" style="max-width:120px; border-radius:4px;"/>
            <el-button v-if="form.packaging_image" type="danger" text @click="clearPackImage">移除</el-button>
          </div>
        </el-form-item>
        
        <el-form-item label="生产年度"><el-input v-model.number="form.production_year" /></el-form-item>
        <el-form-item label="包装规格"><el-input v-model="form.package_spec"/></el-form-item>
        
      </el-form>
      <template #footer>
        <el-button @click="formVisible=false">{{ t('common.cancel') }}</el-button>
        <el-button :loading="isCreating" @click="saveDraft">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="priceDialog" title="修改价格" width="420px" :append-to-body="true">
      <div style="display:flex; align-items:center; gap:12px;">
        <span>新价格</span>
        <el-input-number v-model="newPrice" :precision="2" :step="1" :min="0" />
      </div>
      <template #footer>
        <el-button @click="priceDialog=false">取消</el-button>
        <el-button type="primary" @click="savePrice">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage, ElMessageBox } from 'element-plus';
import axios from 'axios';
import * as XLSX from 'xlsx';

const page = ref(1); const pageSize = ref(20); const total = ref(0);
const rows = ref<any[]>([]); const keyword = ref('');
// 始终保证前端显示为 id 倒序（新数据置顶）
const displayRows = computed(()=> {
  try {
    return [...rows.value].sort((a:any,b:any)=> {
      const ca = Number(b?.created_at||0) - Number(a?.created_at||0);
      if (ca!==0) return ca;
      return Number(b?.id||0) - Number(a?.id||0);
    });
  } catch { return rows.value; }
});
const statusFilter = ref<string>('');
const selectedIds = ref<number[]>([]);
const selectedRows = ref<any[]>([]);
const brandCodeFilter = ref<string>('');
const sortState = reactive<{ prop?: string; order?: 'asc'|'desc' } >({});
const formVisible = ref(false); const form = reactive<any>({});
// 占位：质检流程已移出主流程，但保留变量以兼容现有代码路径
let qualityReportFile: File | null = null;
const qcRows = ref<any[]>([]);
const qcPass = ref<boolean>(false);
const qcProfile = reactive<any>({});
// 平台标准映射 UI 状态
const platformCommodity = ref<string>('');
const platformStandards = ref<any[]>([]);
const selectedPlatformStandardId = ref<number|undefined>(undefined);
const selectedPlatformStandard = computed(()=> platformStandards.value.find(s=> String(s.id)===String(selectedPlatformStandardId.value)));
const brandName = ref('');
const customPremium = ref<number>(0);
// 质检流程已移出主流程
const isCreating = ref<boolean>(false);
  const priceDialog = ref(false);
  const priceRow = ref<any>(null);
  const newPrice = ref<number|null>(null);
// 上传组件 refs
const qualityUpload = ref<any>(null);
const certUpload = ref<any>(null);
const packUpload = ref<any>(null);
const { t } = useI18n();
// 已移除审核/驳回
const tableRef = ref<any>(null);

// 郑商所 品种->代码 映射
const ZCE_CODE_MAP: Record<string, string> = {
  '棉花': 'CF', '白砂糖': 'SR', '白糖': 'SR', '红枣': 'CJ', '锰硅': 'SM', '硅铁': 'SF', '纯碱': 'SA', '甲醇': 'MA', '玻璃': 'FG', '尿素': 'UR', '苹果': 'AP', '花生': 'PK'
};
function getZceCodeBySpecies(species?: string){
  if (!species) return 'CF';
  return ZCE_CODE_MAP[species] || ZCE_CODE_MAP[(species||'').trim()] || 'CF';
}
function generateZceProductId(species?: string, date?: Date){
  const d = date || new Date();
  const yy = String(d.getFullYear()).slice(-2);
  const mm = pad2(d.getMonth()+1);
  const code = getZceCodeBySpecies(species||'');
  return `${code}${yy}${mm}`; // 例：CF2509
}
function displayProductId(row:any){
  return row.product_id || generateZceProductId(row.species || row.commodity_type);
}
function displayProductionDate(row:any){
  if (row.production_date) return row.production_date;
  // 模拟：如无生产日期，给出近180天内的稳定日期
  const seed = Number(row.id||0) || (row.platform_brand_code? row.platform_brand_code.length:0) || 7;
  const d = new Date(Date.now() - ((seed%180)+1)*24*3600*1000);
  const y = d.getFullYear(); const m = pad2(d.getMonth()+1); const day = pad2(d.getDate());
  return `${y}-${m}-${day}`;
}

// 历史产地建议（可从接口或本地存储加载），初始用常见项
const originHistory = ref<string[]>(['新疆','黄河流域','长江流域','内蒙古','甘肃','河北']);
const cottonOrigins = ['新疆','黄河流域','长江流域'];
const colorGrades = [
  { label:'11 (白棉一级)', value:'11' },
  { label:'21 (白棉二级)', value:'21' },
  { label:'31 (白棉三级)', value:'31' },
  { label:'12 (黄棉一级)', value:'12' },
  { label:'22 (黄棉二级)', value:'22' },
  { label:'32 (黄棉三级)', value:'32' },
  { label:'13 (灰棉一级)', value:'13' },
  { label:'23 (灰棉二级)', value:'23' }
];
// 白糖字典
const sugarTypes = ['白砂糖','精制白砂糖','绵白糖','冰糖'];
// 红枣字典
const dateVarieties = ['灰枣','骏枣','口感枣','若羌枣'];

function onPageChange(p: number) {
  page.value = p;
  load();
}

function onCertImageChange(file: any){
  const reader = new FileReader();
  reader.onload = ()=>{ form.certificate_image = String(reader.result||''); };
  reader.readAsDataURL(file.raw);
}
function onPackImageChange(file: any){
  const reader = new FileReader();
  reader.onload = ()=>{ form.packaging_image = String(reader.result||''); };
  reader.readAsDataURL(file.raw);
}
function clearPackImage(){ form.packaging_image = ''; }
async function loadPlatformStandards(){
  selectedPlatformStandardId.value = undefined;
  platformStandards.value = [];
  if (!platformCommodity.value) return;
  const { data } = await axios.get('/api/platform_standard', { params: { commodity_type: platformCommodity.value }});
  platformStandards.value = data?.data || [];
}
function onSelectPlatformStandard(){}
function formatSpecValue(v:any){
  if (Array.isArray(v)) return v.join(' ~ ');
  if (typeof v === 'object' && v) return JSON.stringify(v);
  return String(v);
}
async function createPlatformBrand(){
  if (!selectedPlatformStandardId.value){ ElMessage.warning(t('product.dialog.selectStandard')); return; }
  if (!brandName.value?.trim()){ ElMessage.warning(t('product.dialog.enterBrandName')); return; }
  if (qcRows.value.length>0 && !qcPass.value){ ElMessage.warning(t('product.dialog.reportNotPass')); return; }
  isCreating.value = true;
  if (!platformCommodity.value || !selectedPlatformStandardId.value) { return alert(t('product.dialog.selectCommodityAndStandard')); }
  if (!brandName.value?.trim()) { return alert(t('product.dialog.enterBrandName')); }
  if (qcRows.value.length>0 && !qcPass.value) { return alert(t('product.dialog.reportNotPass')); }
  // 若是新建，不再先保存；由上架流程生成备案号并刷新列表
  const formData:any = {
    brand_name: brandName.value.trim(),
    platform_standard_id: selectedPlatformStandardId.value,
    custom_premium: customPremium.value||0,
    supplier_id: 1,
    product_id: form.id || undefined
  };
  if (qualityReportFile) {
    const reader = new FileReader();
    const p = new Promise<string>(resolve=>{ reader.onload = ()=> resolve(String(reader.result||'')); });
    reader.readAsDataURL(qualityReportFile);
    const base64 = await p;
    formData.quality_report_base64 = base64;
    formData.quality_report_name = qualityReportFile.name;
  }
  const { data } = await axios.post('/api/supplier_brand', formData);
  if (data?.code===0) {
    const code = data.data.platform_brand_code;
    // 上架成功后优先通过备案号精确查询，确保用户即刻看到新记录
    try {
      statusFilter.value = '';
      brandCodeFilter.value = code || '';
      page.value = 1;
      const rs = await axios.get('/api/products', { params: { page: 1, pageSize: pageSize.value, brandCode: brandCodeFilter.value } });
      const list = rs?.data?.data?.list || [];
      if (list.length > 0) {
        rows.value = list;
        total.value = rs?.data?.data?.total || list.length;
      } else {
        // 兜底：直接把创建结果拼成一条行插入到顶部
        const newRow:any = {
          id: data.data.product_db_id || Date.now(),
          product_id: data.data.product_id || generateZceProductId(selectedPlatformStandard.value?.commodity_type||platformCommodity.value),
          product_name: brandName.value || form.product_name || '新商品',
          commodity_type: selectedPlatformStandard.value?.commodity_type || platformCommodity.value || form.species,
          platform_standard_grade_name: selectedPlatformStandard.value?.grade_name || '',
          platform_base_premium: selectedPlatformStandard.value?.base_premium || 0,
          custom_premium: customPremium.value||0,
          platform_brand_code: code,
          processor_name: form.processor_name,
          processor_address: form.processor_address,
          contact_person: form.contact_person,
          quality_report_preview: qualityReportFile ? formData.quality_report_base64 : '',
          packaging_image: form.packaging_image,
          production_date: qcProfile.production_date || displayProductionDate({ id: Date.now() }),
          package_spec: form.package_spec,
          reviewer: '待审核',
          status: '上架'
        };
        rows.value = [newRow, ...rows.value];
        total.value = (total.value||0) + 1;
      }
    } catch {
      // 网络异常时也做行插入兜底
      const newRow:any = {
        id: data.data.product_db_id || Date.now(),
        product_id: data.data.product_id || generateZceProductId(selectedPlatformStandard.value?.commodity_type||platformCommodity.value),
        product_name: brandName.value || form.product_name || '新商品',
        commodity_type: selectedPlatformStandard.value?.commodity_type || platformCommodity.value || form.species,
        platform_standard_grade_name: selectedPlatformStandard.value?.grade_name || '',
        platform_base_premium: selectedPlatformStandard.value?.base_premium || 0,
        custom_premium: customPremium.value||0,
        platform_brand_code: code,
        processor_name: form.processor_name,
        processor_address: form.processor_address,
        contact_person: form.contact_person,
        quality_report_preview: qualityReportFile ? formData.quality_report_base64 : '',
        packaging_image: form.packaging_image,
        production_date: qcProfile.production_date || displayProductionDate({ id: Date.now() }),
        package_spec: form.package_spec,
        reviewer: '待审核',
        status: '上架'
      };
      rows.value = [newRow, ...rows.value]; total.value = (total.value||0)+1;
    }
    formVisible.value = false;
    ElMessage.success(`已上架，备案号：${code}`);
  } else {
    alert(`创建失败：${data?.msg||'未知错误'}`);
  }
  isCreating.value = false;
}

// 质检比对移除

// 产地自动补全（基于历史 + 当前数据去重）
function queryOriginSuggest(queryString: string, cb: (arr: Array<{ value: string }>)=>void){
  const pool = new Set<string>(originHistory.value);
  rows.value.forEach(r=>{ if (r?.origin_region) pool.add(String(r.origin_region)); if (r?.origin_area) pool.add(String(r.origin_area)); });
  const all = Array.from(pool).filter(Boolean);
  const list = !queryString ? all : all.filter(s=> s.includes(queryString));
  cb(list.map(s=>({ value: s })));
}

function computeMicronGrade(v?: number): 'A'|'B'|'C'|'D' {
  const x = Number(v);
  if (!Number.isFinite(x)) return 'D';
  // 参考：A级 3.7-4.2；其余区间粗略映射为 B/C，其他为 D
  if (x >= 3.7 && x <= 4.2) return 'A';
  if ((x >= 3.5 && x < 3.7) || (x > 4.2 && x <= 4.9)) return 'B';
  if ((x >= 3.0 && x < 3.5) || (x > 4.9 && x <= 5.5)) return 'C';
  return 'D';
}

const micronGradeText = computed(()=>{
  const g = computeMicronGrade(form.micronaire);
  if (g==='A') return t('product.micronaireGrade.A');
  if (g==='B') return t('product.micronaireGrade.B');
  if (g==='C') return t('product.micronaireGrade.C');
  return t('product.micronaireGrade.D');
});

// 白糖质量评定（示例规则）：Pol>=99.7 且 ICUMSA<=150 且 水分<=0.08 => 优；其次为良；其余为一般
const sugarGradeText = computed(()=>{
  const pol = Number(form.sugar_pol||0);
  const icu = Number(form.sugar_icumsa||1e9);
  const moist = Number(form.sugar_moisture_percent||1e9);
  if (pol>=99.7 && icu<=150 && moist<=0.08) return t('product.sugarGrade.excellent');
  if (pol>=99.5 && icu<=300 && moist<=0.1) return t('product.sugarGrade.good');
  return t('product.sugarGrade.general');
});
const sugarGradeTagType = computed(()=> sugarGradeText.value===t('product.sugarGrade.excellent') ? 'success' : (sugarGradeText.value===t('product.sugarGrade.good') ? 'warning' : 'info'));

// 红枣等级评定（示例规则）：糖度>=70 且 含水率<=25 且 霉变<=1 且 破损<=3 且 颗粒数介于 150~400 => 优；其次为良；其余一般
const dateLevelText = computed(()=>{
  const brix = Number(form.date_brix||0);
  const moist = Number(form.date_moisture_percent||1000);
  const mildew = Number(form.date_mildew_percent||1000);
  const breakage = Number(form.date_breakage_percent||1000);
  const pieces = Number(form.date_pieces_per_kg||0);
  if (brix>=70 && moist<=25 && mildew<=1 && breakage<=3 && pieces>=150 && pieces<=400) return t('product.dateLevel.excellent');
  if (brix>=60 && moist<=28 && mildew<=2 && breakage<=5 && pieces>=120 && pieces<=500) return t('product.dateLevel.good');
  return t('product.dateLevel.general');
});
const dateLevelTagType = computed(()=> dateLevelText.value===t('product.dateLevel.excellent') ? 'success' : (dateLevelText.value===t('product.dateLevel.good') ? 'warning' : 'info'));

function pad2(n: number){ const s = String(Math.round(n)); return s.length>=2? s : ('0'+s); }
function regenerateShortCode(){
  if (form.species !== '棉花') { form.short_code=''; return; }
  const cg = String(form.color_grade||'').trim();
  const fl = Number(form.fiber_length);
  const mg = computeMicronGrade(form.micronaire);
  if (!cg || !Number.isFinite(fl)) { form.short_code=''; return; }
  form.short_code = `${cg}${pad2(fl)}${mg}`; // 例: 21 + 29 + A => 2129A
}

watch(()=>[form.species, form.color_grade, form.fiber_length, form.micronaire], regenerateShortCode, { deep:false });

function mapApiProductToRow(p:any){
  if (!p) return p;
  return {
    id: p.id,
    product_id: p.product_id,
    product_name: p.name,
    commodity_type: p.category,
    custom_premium: p.premium_discount,
    production_year: p.production_year,
    packaging_image: (p.packaging_image && p.packaging_image !== 'NULL') ? p.packaging_image : '',
    current_price: p.price,
    package_spec: p.package_spec || ''
  };
}

async function load() {
  const sort = (sortState.prop === 'id' ? 'id' : 'created_at');
  const order = (sortState.order || 'desc');
  const enabledParam = statusFilter.value === '' ? undefined : (statusFilter.value === '上架' ? 1 : 0);
  const { data } = await axios.get('/api/products', { params: { page: page.value, page_size: pageSize.value, keyword: keyword.value, enabled: enabledParam, sort, order } });

  const items = data?.items || data?.data?.items || [];
  rows.value = items.map(mapApiProductToRow);
  total.value = data?.total ?? data?.data?.total ?? 0;

  if ((rows.value.length === 0) && (statusFilter.value || brandCodeFilter.value || keyword.value || sortState.prop)){
    const hadFilter = !!(statusFilter.value || brandCodeFilter.value || keyword.value || sortState.prop);
    statusFilter.value = '';
    brandCodeFilter.value = '';
    keyword.value = '';
    sortState.prop = undefined; sortState.order = undefined;
    if (hadFilter) {
      const { data: d2 } = await axios.get('/api/products', { params: { page: 1, page_size: pageSize.value, sort: 'created_at', order: 'desc' } });
      const items2 = d2?.items || d2?.data?.items || [];
      rows.value = items2.map(mapApiProductToRow);
      total.value = d2?.total ?? d2?.data?.total ?? 0;
    }
  }
}
function resetUploads(){
  try { qualityUpload.value?.clearFiles?.(); } catch{}
  try { certUpload.value?.clearFiles?.(); } catch{}
  try { packUpload.value?.clearFiles?.(); } catch{}
}
function openForm(row?: any){
  // 基础默认表单（避免上一次打开留下的字段残留导致品类判断错误）
  const defaults:any = {
    id:null,
    product_type:'', species:'', brand:'', grade:'', production_year:'', package_spec:'', processor_code:'', processor_name:'', origin_region:'', origin_address:'',
    product_name:'', short_code:'', origin_area:'', certificate_no:'', certificate_image:'', packaging_image:'', no_foreign_fiber: true,
    color_grade:'', ginning_quality:'', fiber_length:'', micronaire:'', break_strength:'', uniformity_index:''
  };
  // 彻底重置表单对象，防止残留键值影响 v-if 分支
  Object.keys(form).forEach(k=> { delete (form as any)[k]; });
  Object.assign(form, defaults);

  if (row) {
    const mapped:any = { ...row };
    // 行数据可能只有 commodity_type，没有 species，这里做映射保证分支正确
    if (!mapped.species && mapped.commodity_type) mapped.species = mapped.commodity_type;
    Object.assign(form, mapped);
    // 编辑时将微调升贴水带入输入框
    customPremium.value = Number(row.custom_premium ?? row.platform_base_premium ?? 0);
    // 编辑时清空上传队列，避免显示上次选择但未保存的文件
    resetUploads();
  } else {
    // 新增：清空上传与解析状态
    brandName.value = '';
    customPremium.value = 0;
    platformCommodity.value = '';
    selectedPlatformStandardId.value = undefined;
    platformStandards.value = [];
    qualityReportFile = null;
    qcRows.value = [];
    qcPass.value = false;
    Object.keys(qcProfile).forEach(k=> delete (qcProfile as any)[k]);
    form.certificate_image = '';
    form.packaging_image = '';
    resetUploads();
  }
  formVisible.value = true;
}
async function onSubmit(){
  if(!form.id){
    // 保存时附带“已选平台标准”的草稿信息到产品，便于列表可见
    const payload:any = { ...form };
    if (selectedPlatformStandard.value){
      payload.platform_standard_id = selectedPlatformStandard.value.id;
      payload.platform_standard_grade_name = selectedPlatformStandard.value.grade_name;
      payload.platform_base_premium = selectedPlatformStandard.value.base_premium;
    }
    const { data } = await axios.post('/api/products', payload);
    if(data.code===0) { formVisible.value=false; load(); }
  } else {
    const payload:any = { ...form };
    if (selectedPlatformStandard.value){
      payload.platform_standard_id = selectedPlatformStandard.value.id;
      payload.platform_standard_grade_name = selectedPlatformStandard.value.grade_name;
      payload.platform_base_premium = selectedPlatformStandard.value.base_premium;
    }
    const { data } = await axios.put(`/api/products/${form.id}`, payload);
    if(data.code===0) { formVisible.value=false; load(); }
  }
}
// 保存草稿（新增/编辑共用）
async function saveDraft(){
  const payload:any = { ...form };
  // 规范化基础字段：名称/品类
  if (!payload.product_name && brandName.value) payload.product_name = brandName.value.trim();
  // 品类优先：已选标准 > 选择框 > 表单原值
  const chosenSpecies = selectedPlatformStandard.value?.commodity_type || platformCommodity.value || payload.species || payload.commodity_type;
  payload.species = chosenSpecies || '';
  payload.commodity_type = chosenSpecies || '';
  // 设置商品ID（按规则：品种代码+年后二位+月两位）
  const pidSpecies = selectedPlatformStandard.value?.commodity_type || platformCommodity.value || payload.species;
  if (!payload.product_id && pidSpecies) payload.product_id = generateZceProductId(pidSpecies);

  // 带上微调升贴水
  payload.custom_premium = Number(customPremium.value ?? payload.custom_premium ?? 0);
  // 保存即启用：直接设置状态为上架，避免二次请求的竞态
  payload.status = '上架';
  // 前端也补上创建时间，确保本地插入与显示排序正确
  if (!payload.created_at) payload.created_at = Date.now();

  // 若选择了平台标准，带上便于列表展示
  if (selectedPlatformStandard.value){
    payload.platform_standard_id = selectedPlatformStandard.value.id;
    payload.platform_standard_grade_name = selectedPlatformStandard.value.grade_name;
    payload.platform_base_premium = selectedPlatformStandard.value.base_premium;
  }
  if (!form.id){
    const { data } = await axios.post('/api/products', payload);
    if(data?.code===0){
      const newId = data?.data?.id;
      try{ if (newId!=null) await axios.post(`/api/products/${newId}/up`); }catch{}
      ElMessage.success('已保存并启用');
      formVisible.value=false;
      page.value = 1; // 回到第一页，确保新数据可见
      sortState.prop = 'id'; sortState.order = 'desc';
      await load();
    }
  } else {
    const { data } = await axios.put(`/api/products/${form.id}`, payload);
    if(data?.code===0){
      try{ await axios.post(`/api/products/${form.id}/up`); }catch{}
      ElMessage.success('已保存并启用');
      formVisible.value=false;
      page.value = 1;
      sortState.prop = 'id'; sortState.order = 'desc';
      await load();
    }
  }
}
async function onDelete(row:any){
  await axios.delete(`/api/products/${row.id}`); load();
}
// 审核/驳回功能已移除
async function toggleEnable(row:any, val:boolean){
  try{
    if (val) await axios.post(`/api/products/${row.id}/up`);
    else await axios.post(`/api/products/${row.id}/down`);
    load();
  }catch{ ElMessage.error('操作失败'); }
}
async function batchDisable(){
  if (selectedIds.value.length===0) return;
  try{
    await ElMessageBox.confirm(`确认禁用已选择的 ${selectedIds.value.length} 项？`, '提示', {
      type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消', distinguishCancelAndClose: true
    });
  }catch{ return; }
  await Promise.all(selectedIds.value.map(id=> axios.post(`/api/products/${id}/down`)));
  ElMessage.success('已禁用');
  clearSelection();
  load();
}
function onSelectionChange(sel:any[]){ selectedIds.value = sel.map(s=> s.id); selectedRows.value = sel; }
async function batchDelete(){
  if (selectedIds.value.length===0) return;
  try{
    await ElMessageBox.confirm(`确认删除已选择的 ${selectedIds.value.length} 项？此操作不可撤销`, '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      distinguishCancelAndClose: true
    });
  }catch{ return; }
  try{
    await axios.post('/api/products/batch/delete', { ids: selectedIds.value });
  }catch{
    // 兜底：逐条删除
    await Promise.all(selectedIds.value.map(id=> axios.delete(`/api/products/${id}`)));
  }
  ElMessage.success('删除成功');
  clearSelection();
  load();
}
function clearSelection(){
  try{ tableRef.value?.clearSelection?.(); }catch{}
  selectedIds.value = [];
}
function onSortChange(e:any){
  // 固定采用 id 倒序展示，忽略表头点击排序，统一回到第一页
  sortState.prop = 'id';
  sortState.order = 'desc';
  page.value = 1;
  load();
}
function buildListHeaders(): string[]{
  // 简化导出列，与当前表格一致（除序号/状态）
  return [
    '商品ID','平台标准等级','商品名称（客户品牌名）','商品品类','升贴水','生产年度','包装图片','当前价格','包装规格'
  ];
}
function mapRowToExport(r:any): any[]{
  return [
    displayProductId(r),
    r.platform_standard_grade_name || '',
    r.product_name || r.brand_name || '',
    r.commodity_type || r.species || '',
    (r.custom_premium ?? r.platform_base_premium ?? 0),
    r.production_year ?? '',
    r.packaging_image || '',
    r.current_price ?? '',
    r.package_spec || ''
  ];
}
function formatNow(){
  const d=new Date(); const p=(n:number)=> String(n).padStart(2,'0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}${p(d.getMinutes())}`;
}
async function onExport(){
  // 拉取当前筛选下的所有数据（大页）
  const { data } = await axios.get('/api/products', { params: { page: 1, pageSize: 999999, keyword: keyword.value, status: statusFilter.value, brandCode: brandCodeFilter.value, sortProp: sortState.prop, sortOrder: sortState.order } });
  const list:any[] = data?.data?.list || [];
  const ws = XLSX.utils.aoa_to_sheet([buildListHeaders(), ...list.map(mapRowToExport)]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '商品列表');
  XLSX.writeFile(wb, `商品列表_${formatNow()}.xlsx`);
}
function downloadTemplateXlsx(){
  const ws = XLSX.utils.aoa_to_sheet([buildListHeaders()]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '模板');
  XLSX.writeFile(wb, '商品列表_模板.xlsx');
}
async function onImportExcel(file:any){
  const reader = new FileReader();
  reader.onload = async () => {
    try{
      const data = new Uint8Array(reader.result as ArrayBuffer);
      const wb = XLSX.read(data, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows:any[] = XLSX.utils.sheet_to_json(ws, { header: 1 });
      if (!rows || rows.length<=1) { ElMessage.warning('空文件或无数据'); return; }
      const header = rows[0] as string[];
      const body = rows.slice(1);
      const headerExpect = buildListHeaders();
      // 简单校验：表头需包含我们定义的全部列（顺序也建议一致）
      const ok = headerExpect.every((h,i)=> header[i]===h);
      if (!ok) { ElMessage.error('表头不匹配，请使用模板'); return; }
      let okCount=0, failCount=0;
      for (const arr of body){
        if (!arr || arr.length===0) continue;
        const obj:any = {
          product_id: arr[0] || undefined,
          product_name: arr[1] || '',
          commodity_type: arr[2] || '',
          platform_standard_grade_name: arr[3] || '',
          custom_premium: Number(arr[4]||0),
          quality_report_preview: arr[5] || '',
          processor_name: arr[6] || '',
          processor_address: arr[7] || '',
          contact_person: arr[8] || '',
          packaging_image: arr[9] || '',
          production_date: arr[10] || '',
          package_spec: arr[11] || '',
          reviewer: arr[12] || '待审核',
          status: arr[13] || '未上架'
        };
        try { await axios.post('/api/products', obj); okCount++; } catch { failCount++; }
      }
      ElMessage.success(`导入完成：成功 ${okCount} 条，失败 ${failCount} 条`);
      load();
    } catch(e){
      ElMessage.error('导入失败，请检查文件');
    }
  };
  reader.readAsArrayBuffer(file.raw);
}

async function upRow(row:any){ await axios.post(`/api/products/${row.id}/up`); load(); }
async function downRow(row:any){ await axios.post(`/api/products/${row.id}/down`); load(); }

function openPrice(row:any){ priceRow.value = row; newPrice.value = row.current_price || null; priceDialog.value = true; }
async function savePrice(){
  if (!priceRow.value?.id) return; const v = Number(newPrice.value);
  if (!Number.isFinite(v) || v<0){ ElMessage.warning('请输入合法价格'); return; }
  await axios.post(`/api/products/${priceRow.value.id}/price`, { price: v });
  priceDialog.value = false; priceRow.value=null; newPrice.value=null; load();
}

function rowKey(row: any){ return row.id; }

onMounted(load);
</script>

<style scoped>
.toolbar{ display:flex; gap:8px; align-items:center; }
.pager{ display:flex; justify-content:flex-end; margin-top:10px; }
.page-font-unified, .page-font-unified * { font-family: var(--app-font) !important; }
.selection-bar{ display:flex; align-items:center; gap:12px; margin:8px 0; padding:6px 10px; background: rgba(16,24,40,0.03); border: 1px solid rgba(16,24,40,0.06); border-radius: 6px; }
/* 弹窗内容滚动，保证底部按钮可见 */
:deep(.el-dialog__body){ max-height: calc(100vh - 220px); overflow-y: auto; }

/* 优化卡片与工具栏 */
.zce-card { border: 1px solid rgba(17,24,39,0.06); box-shadow: 0 6px 18px rgba(2,6,23,0.06); border-radius: 12px; }
.zce-toolbar { display:flex; flex-wrap: wrap; gap:8px; align-items:center; }
.zce-toolbar :deep(.el-input), .zce-toolbar :deep(.el-select) { --el-input-height: 32px; }
.zce-toolbar :deep(.el-button) { height: 32px; }

/* 表头与行态样式 */
:deep(.zce-th){ background: #f8fafc; color:#334155; font-weight: 600; }
:deep(.zce-tr:hover>td){ background: #f1f5f9 !important; }

/* 缩略图统一尺寸与圆角阴影 */
.thumb{ width:72px; height:48px; border-radius:6px; box-shadow: 0 1px 3px rgba(2,6,23,0.15); }
/* 状态开关：禁用为红色，启用为绿色 */
:deep(.status-switch:not(.is-checked) .el-switch__core){ background-color:#ef4444; border-color:#ef4444; }
:deep(.status-switch.is-checked .el-switch__core){ background-color:#16a34a; border-color:#16a34a; }
</style>


