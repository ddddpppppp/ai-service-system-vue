<script setup>
const tableData = [
  {
    apiSuccess: '99.8%',
    errorRate: '0.2%',
    latency: '120ms',
    recordTime: '2025-04-01 10:00',
    status: '健康',
  },
  {
    apiSuccess: '98.5%',
    errorRate: '1.5%',
    latency: '200ms',
    recordTime: '2025-04-01 12:00',
    status: '健康',
  },
  {
    apiSuccess: '95.2%',
    errorRate: '4.8%',
    latency: '350ms',
    recordTime: '2025-04-01 14:00',
    status: '健康',
  },
]
</script>

<template>
  <el-card shadow="hover" style="margin-top: 20px;">
    <template #header>
      <span>系统健康状态</span>
    </template>
    <el-table :data="tableData" style="width: 100%;">
      <el-table-column prop="apiSuccess" label="API调用成功率" />
      <el-table-column prop="errorRate" label="错误率" />
      <el-table-column prop="latency" label="延迟监控" />
      <el-table-column prop="recordTime" label="记录时间" />
      <el-table-column label="健康状态">
        <template #default="{ row }">
          <el-tag :type="row.status === '健康' ? 'success' : 'danger'">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>
