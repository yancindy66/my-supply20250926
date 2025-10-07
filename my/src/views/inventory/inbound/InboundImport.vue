<template>
  <div style="padding:16px">
    <h3>Excel 导入入库申请</h3>
    <div style="margin:12px 0; display:flex; gap:12px; align-items:center">
      <input type="file" accept=".csv,.xlsx" @change="onFileChange" />
      <el-button type="success" @click="downloadTemplate">下载模板</el-button>
      <span v-if="msg" :style="{color: ok? '#0a7':'#d33'}">{{ msg }}</span>
    </div>

    <!-- 已去除预览表：选择文件即直接生成预约单并填充主表 -->

    <!-- 预约列表（始终显示表头；无数据时显示空提示） -->
    <el-table :data="createdList" size="small" border style="margin-top:20px" :empty-text="'暂无预约数据，请先导入Excel文件'">
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="client_batch_no" label="货物批次号" min-width="180" />
      <el-table-column prop="owner_name" label="客户" width="120" />
      <el-table-column label="仓库" width="100">
        <template #default="{row}">仓库{{ row.target_warehouse_id }}</template>
      </el-table-column>
      <el-table-column label="商品" width="100">
        <template #default="{row}">商品{{ row.commodity_id }}</template>
      </el-table-column>
      <el-table-column prop="total_planned_quantity" label="数量" width="80" align="center" />
      <el-table-column label="重量" width="80" align="center">
        <template #default>-</template>
      </el-table-column>
      <el-table-column prop="measurement_unit" label="规格" width="80" />
      <el-table-column prop="vehicle_plate" label="车牌" width="120" />
      <el-table-column prop="driver_phone" label="司机电话" width="130" />
      <el-table-column label="身份证号" width="180">
        <template #default>-</template>
      </el-table-column>
      <el-table-column prop="created_at" label="预约入库时间" width="160" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{row}">
          <el-tag :type="row.status==='approved'?'success':(row.status==='pending'?'warning':'info')">
            {{ mapStatus(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100">
        <template #default="{row}">
          <el-button 
            size="small" 
            type="primary" 
            @click="submitApply(row)" 
            :disabled="row.status !== 'approved'"
          >
            申请
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import * as XLSX from 'xlsx';

const rows = ref<any[]>([]);
const loading = ref(false);
const msg = ref('');
const ok = ref(false);
const createdList = ref<any[]>([]);

// 修复文件解析
async function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  if (!input.files?.[0]) return;
  
  const file = input.files[0];
  try{
    const buf = await file.arrayBuffer();
    let items: any[] = [];
    if(file.name.toLowerCase().endsWith('.xlsx')){
      const wb = XLSX.read(buf, { type:'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json:any[] = XLSX.utils.sheet_to_json(ws, { defval:'' });
      items = json.map((r:any, idx:number)=>({
        warehouse_id: Number(r.warehouse_id || r.仓库ID || 1),
        commodity_id: Number(r.commodity_id || r.商品ID || 1),
        quantity: Number(r.quantity || r.数量 || 0),
        unit: String(r.unit || r.单位 || '件'),
        vehicle_plate: String(r.vehicle_plate || r.车牌 || ''),
        driver_phone: String(r.driver_phone || r.司机电话 || ''),
        _row_no: idx+2
      })).filter(x=>Number(x.quantity)>0);
    }else{
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter(Boolean);
      const headers = lines[0].split(',');
      const arr = lines.slice(1).map((ln)=>{
        const cols = ln.split(','); const o:any={}; headers.forEach((h,i)=> o[h]=cols[i]||''); return o;
      });
      items = arr.map((r:any, idx:number)=>({
        warehouse_id: Number(r.warehouse_id || 1), commodity_id: Number(r.commodity_id || 1), quantity: Number(r.quantity || 0), unit: String(r.unit||'件'), vehicle_plate: String(r.vehicle_plate||''), driver_phone: String(r.driver_phone||''), _row_no: idx+2
      })).filter(x=>Number(x.quantity)>0);
    }
    // 直接提交到后端生成预约单，并填入主表
    const resp = await fetch('/v1/inbound/reservations/import', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(items) });
    const data = await resp.json();
    if(!resp.ok || data.code){ throw new Error(data.message||'导入失败'); }
    createdList.value = (data.data?.created||[]).map((x:any)=>({ id:x.id, client_batch_no: x.client_reservation_no, owner_name:'导入客户', target_warehouse_id: items[0]?.warehouse_id, commodity_id: items[0]?.commodity_id, total_planned_quantity: items[0]?.quantity, measurement_unit: items[0]?.unit, vehicle_plate: items[0]?.vehicle_plate, driver_phone: items[0]?.driver_phone, created_at:new Date().toISOString().slice(0,16).replace('T',' '), status:x.status||'pending' }));
    msg.value = `导入成功：${createdList.value.length} 条`;
  }catch(err:any){ msg.value = '导入失败：'+(err.message||err); }
}

// 导入提交
async function submit() {
  if (!rows.value.length) {
    msg.value = '没有可导入的数据';
    return;
  }
  
  loading.value = true;
  msg.value = '正在导入...';
  ok.value = false;
  
  try {
    console.log('提交的数据:', rows.value);
    
    const response = await fetch('/v1/inbound/reservations/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rows.value)
    });
    
    const result = await response.json();
    console.log('导入响应:', result);
    
    if (result.code === 0) {
      ok.value = true;
      const createdCount = result.data?.created?.length || 0;
      msg.value = `导入成功：${createdCount} 条`;
      
      // 显示生成的预约单
    createdList.value = (result.data?.created || []).map((item: any) => ({
      id: item.id,
      client_batch_no: item.client_reservation_no,
      owner_name: item.owner_name || '导入客户',
      target_warehouse_id: item.target_warehouse_id,
      commodity_id: item.commodity_id,
      total_planned_quantity: item.total_planned_quantity,
      measurement_unit: item.measurement_unit,
      vehicle_plate: item.vehicle_plate,
      driver_phone: item.driver_phone,
      created_at: item.created_at || new Date().toISOString().slice(0, 16).replace('T', ' '),
      status: item.status || 'pending'
    }));
      
      // 清空预览数据
      rows.value = [];
      
    } else {
      throw new Error(result.message || `导入失败 (错误码: ${result.code})`);
    }
    
  } catch (error: any) {
    console.error('导入错误:', error);
    msg.value = error.message || '导入失败，请检查网络连接';
  } finally {
    loading.value = false;
  }
}

// 状态映射
function mapStatus(s: string) {
  const statusMap: Record<string, string> = {
    'pending': '待审核',
    'approved': '审核通过', 
    'rejected': '已驳回',
    'completed': '已完成'
  };
  return statusMap[s] || s;
}

// 申请入库
async function submitApply(row: any) {
  try {
    const response = await fetch(`/v1/inbound/reservations/${row.id}/apply`, {
      method: 'POST'
    });
    
    const result = await response.json();
    
    if (result.code === 0) {
      row.status = 'completed';
      msg.value = '申请入库成功！';
    } else {
      throw new Error(result.message || '申请失败');
    }
  } catch (error: any) {
    msg.value = '申请失败：' + (error.message || error);
  }
}

// 下载模板：字段与主表一致
function downloadTemplate(){
  const headers = ['序号','货物批次号','客户','仓库','商品','数量','重量','规格','车牌','司机电话','身份证号','预约入库时间'];
  const demo = ['1','YY202510070001', '演示货主A', '天津港1号仓', '大豆', '36', '', '件', '津A12345', '18811042506', '', new Date().toISOString().slice(0,16).replace('T',' ')];
  const csv = [headers.join(','), demo.join(',')].join('\n');
  const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '预约导入模板.csv';
  a.click();
  URL.revokeObjectURL(a.href);
}
</script>