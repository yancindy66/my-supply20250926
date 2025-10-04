<template>
  <div class="page">
    <el-form label-width="150px" :model="form" class="form">
      <h3>基础规则</h3>
      <el-form-item label="金额范围(万)">
        <div class="group"><el-input-number v-model="form.basic.min" :min="0" /> - <el-input-number v-model="form.basic.max" :min="0" /></div>
      </el-form-item>
      <el-form-item label="期限设置(月)"><el-input-number v-model="form.basic.term" :min="1" /></el-form-item>
      <el-form-item label="利率配置(%/年)"><el-input-number v-model="form.basic.rate" :min="0" :step="0.1" /></el-form-item>
      <el-form-item label="授信限额(万)"><el-input-number v-model="form.basic.credit" :min="0" /></el-form-item>

      <h3>质押率规则</h3>
      <el-form-item label="质押物类型">
        <el-select v-model="form.pledge.type" style="width:200px">
          <el-option label="钢材" value="steel"/>
          <el-option label="棉花" value="cotton"/>
          <el-option label="糖" value="sugar"/>
        </el-select>
      </el-form-item>
      <el-form-item label="质押率(%)"><el-input-number v-model="form.pledge.ratio" :min="0" :max="100" /></el-form-item>
      <el-form-item label="风险系数"><el-input-number v-model="form.pledge.risk" :min="0" :step="0.1" /></el-form-item>

      <h3>风险规则</h3>
      <el-form-item label="信用评分最低分"><el-input-number v-model="form.risk.creditScore" :min="0" :max="100" /></el-form-item>
      <el-form-item label="财务指标限制(资产负债率上限%)"><el-input-number v-model="form.risk.debtRatio" :min="0" :max="100" /></el-form-item>
      <el-form-item label="行业风险系数"><el-input-number v-model="form.risk.industry" :min="0" :step="0.1" /></el-form-item>

      <h3>审核规则</h3>
      <el-form-item label="审核流程"><el-select v-model="form.audit.flow" style="width:200px"><el-option label="三段式(初/风控/终)" value="3step"/><el-option label="两段式(风控/终)" value="2step"/></el-select></el-form-item>
      <el-form-item label="权限设置"><el-input v-model="form.audit.roles" placeholder="如：风控经理, 业务经理"/></el-form-item>
      <el-form-item label="超时配置(小时)"><el-input-number v-model="form.audit.timeout" :min="1" /></el-form-item>

      <h3>预警规则</h3>
      <el-form-item label="逾期预警(天)"><el-input-number v-model="form.alert.overdueDays" :min="1"/></el-form-item>
      <el-form-item label="到期提醒(天)"><el-input-number v-model="form.alert.expireDays" :min="1"/></el-form-item>
      <el-form-item label="风险阈值"><el-input-number v-model="form.alert.threshold" :min="0" :max="100"/></el-form-item>
      <el-form-item label="通知设置"><el-input v-model="form.alert.notify" placeholder="短信/邮件/站内"/></el-form-item>

      <div class="actions">
        <el-button @click="reset">重置</el-button>
        <el-button type="primary" @click="save">保存设置</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { ElMessage } from 'element-plus';
const form = reactive({
  basic:{ min:0, max:1000, term:12, rate:6.5, credit:500 },
  pledge:{ type:'steel', ratio:70, risk:1.2 },
  risk:{ creditScore:60, debtRatio:70, industry:1.0 },
  audit:{ flow:'3step', roles:'风控经理, 业务经理', timeout:24 },
  alert:{ overdueDays:7, expireDays:15, threshold:80, notify:'短信, 邮件' }
});
function reset(){
  Object.assign(form, { basic:{ min:0, max:1000, term:12, rate:6.5, credit:500 }, pledge:{ type:'steel', ratio:70, risk:1.2 }, risk:{ creditScore:60, debtRatio:70, industry:1.0 }, audit:{ flow:'3step', roles:'风控经理, 业务经理', timeout:24 }, alert:{ overdueDays:7, expireDays:15, threshold:80, notify:'短信, 邮件' } });
}
function save(){ ElMessage.success('已保存规则设置'); }
</script>

<style scoped>
.page{ padding:16px; }
.form{ max-width:720px; }
.group{ display:inline-flex; align-items:center; gap:8px; }
.actions{ display:flex; gap:8px; justify-content:flex-end; margin-top:10px; }
h3{ margin:10px 0 6px; font-size:16px; }
</style>


