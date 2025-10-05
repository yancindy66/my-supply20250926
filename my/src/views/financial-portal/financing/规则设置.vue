<template>
  <div class="page-wrap">
    <h2>融资规则设置</h2>
    <div class="toolbar">
      <button class="btn primary" @click="add">增加参数</button>
    </div>
    <div class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th class="idx">序号</th>
            <th>参数键</th>
            <th>参数值</th>
            <th>说明</th>
            <th class="op">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="rules.length===0"><td class="center" colspan="5">暂无规则</td></tr>
          <tr v-for="(r, idx) in rules" :key="r.key">
            <td class="idx">{{ idx + 1 }}</td>
            <td>{{ r.key }}</td>
            <td>{{ r.value }}</td>
            <td class="text-ellipsis" :title="r.remark">{{ r.remark }}</td>
            <td class="op">
              <button class="btn xs" @click="edit(r)">修改</button>
              <button class="btn xs danger" @click="remove(r)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const rules = ref<any[]>([]);
function add(){ /* TODO: 增加参数 */ }
function edit(r:any){ /* TODO: 修改参数 */ }
function remove(r:any){ /* TODO: 删除参数 */ }
</script>

<style scoped>
.page-wrap{ font-size:13px; }
.toolbar{ margin:8px 0; }
.btn{ height:28px; padding:0 10px; border:1px solid #e5e7eb; background:#fff; border-radius:6px; cursor:pointer; }
.btn.primary{ background:#2563eb; border-color:#2563eb; color:#fff; }
.btn.danger{ background:#ef4444; border-color:#ef4444; color:#fff; }
.table-wrapper{ overflow:auto; background:#fff; border:1px solid #eef2f6; border-radius:8px; }
table{ width:max-content; border-collapse:collapse; }
th,td{ padding:8px 10px; border-bottom:1px solid #eef2f6; white-space:nowrap; }
thead th{ position:sticky; top:0; background:#f7f9fc; z-index:1; }
.idx{ width:64px; text-align:center; }
.op{ min-width:140px; }
.text-ellipsis{ max-width:360px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; display:inline-block; vertical-align:bottom; }
</style>


