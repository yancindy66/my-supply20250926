<template>
  <div class="page">
    <el-card shadow="never">
      <template #header>
        <div class="toolbar">
          <span>{{ isEdit? '编辑仓库' : '新增仓库' }}</span>
        </div>
      </template>

      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px" scroll-to-error>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="仓库名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入仓库名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属公司" prop="owner_company">
              <el-input v-model="form.owner_company" placeholder="请输入所属公司" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="省市区" required>
              <div style="display:flex; gap:8px; width:100%">
                <el-input v-model="form.province" placeholder="省" style="width:33%"/>
                <el-input v-model="form.city" placeholder="市" style="width:33%"/>
                <el-input v-model="form.district" placeholder="区/县" style="width:33%"/>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="详细地址" prop="address">
              <el-input v-model="form.address" placeholder="请输入详细地址" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系人" prop="contact">
              <el-input v-model="form.contact" placeholder="联系人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电话" prop="phone">
              <el-input v-model="form.phone" placeholder="电话" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="容量(吨)" prop="capacity_ton">
              <el-input-number v-model="form.capacity_ton" :min="0" :step="10" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="面积(m²)" prop="area_m2">
              <el-input-number v-model="form.area_m2" :min="0" :step="10" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="资质等级" prop="level">
              <el-select v-model="form.level" placeholder="请选择资质等级">
                <el-option label="A" value="A"/>
                <el-option label="B" value="B"/>
                <el-option label="C" value="C"/>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="支持品类" prop="support_commodities">
              <el-input v-model="form.support_commodities" placeholder="例如：棉花, 红枣" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="许可证号" prop="license_no">
              <el-input v-model="form.license_no" placeholder="许可证号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="许可证到期" prop="license_expire">
              <el-date-picker v-model="form.license_expire" type="date" placeholder="到期日期" style="width:100%"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="启用">
              <el-switch v-model="form.enabled" :active-value="1" :inactive-value="0" />
            </el-form-item>
          </el-col>
        </el-row>
        <div style="margin-top:12px; display:flex; gap:8px;">
          <el-button @click="goBack">取消</el-button>
          <el-button type="primary" @click="onSubmit">保存</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';

const isEdit = computed(() => /\/edit\//.test(location.pathname));
const formRef = ref();
const form = ref<any>({
  name:'', owner_company:'', province:'', city:'', district:'', address:'',
  contact:'', phone:'', capacity_ton:0, area_m2:0, level:'', support_commodities:'',
  license_no:'', license_expire:'', enabled:1
});
const rules = {
  name: [{ required: true, message: '请输入仓库名称', trigger: 'blur' }],
  owner_company: [{ required: true, message: '请输入所属公司', trigger: 'blur' }],
  address: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
} as any;

async function load(){
  if (!isEdit.value) return;
  const id = location.pathname.split('/').pop();
  const { data } = await axios.get(`/api/warehouses/${id}`);
  const w = data?.data?.warehouse || data?.data || {};
  form.value = { ...form.value, ...w };
}
async function onSubmit(){
  await formRef.value?.validate?.();
  try{
    if (isEdit.value){
      const id = location.pathname.split('/').pop();
      await axios.put(`/api/warehouses/${id}`, form.value);
    } else {
      await axios.post('/api/warehouses', form.value);
    }
    ElMessage.success('保存成功');
    // 返回列表
    window.location.href = '/operation/warehouse/list';
  }catch{
    ElMessage.error('保存失败');
  }
}
function goBack(){ history.back(); }
onMounted(load);
</script>

<style scoped>
.toolbar{ display:flex; gap:8px; align-items:center; }
</style>


