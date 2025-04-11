<script setup>
import * as echarts from 'echarts'
import { onMounted, ref } from 'vue'

const sessionChart = ref(null)
const responseChart = ref(null)

onMounted(() => {
  // 会话趋势图表
  const sessionChartInstance = echarts.init(sessionChart.value)
  sessionChartInstance.setOption({
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六'],
    },
    yAxis: {
      type: 'value',
      name: '会话量',
    },
    series: [{
      data: [120, 200, 150, 80, 70, 110],
      type: 'bar',
      itemStyle: {
        color: '#409EFF',
      },
    }],
  })

  // 响应时间图表
  const responseChartInstance = echarts.init(responseChart.value)
  responseChartInstance.setOption({
    xAxis: {
      type: 'category',
      data: ['1小时', '2小时', '3小时', '4小时', '5小时', '6小时', '7小时', '8小时'],
    },
    yAxis: {
      type: 'value',
      name: '响应时间(秒)',
    },
    series: [{
      data: [10, 12, 15, 18, 14, 16, 20, 15.5],
      type: 'bar',
      itemStyle: {
        color: '#67C23A',
      },
    }],
  })
})
</script>

<template>
  <el-row :gutter="20">
    <el-col :span="12">
      <el-card shadow="hover">
        <template #header>
          <span>会话趋势</span>
        </template>
        <div ref="sessionChart" style="height: 300px;" />
      </el-card>
    </el-col>
    <el-col :span="12">
      <el-card shadow="hover">
        <template #header>
          <span>机器人响应时间</span>
          <div class="response-stats">
            <span>平均响应时间: 15.5秒</span>
            <span style="margin-left: 20px;">最长响应时间: 45.5秒</span>
          </div>
        </template>
        <div ref="responseChart" style="height: 300px;" />
      </el-card>
    </el-col>
  </el-row>
</template>

<style scoped>
.response-stats {
  float: right;
  font-size: 14px;
  color: #909399;
}
</style>
