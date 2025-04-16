<script setup>
import { ref } from 'vue'

const cards = ref([
  { label: '会话接听率', value: '86.21%', subText: '接听总量: 25位' },
  { label: '当前排队人数', value: '86', subText: '等待时间: 3秒', unit: '位' },
  {
    label: '平均等待时间',
    value: '45.5',
    subText: '客户总数: 25位',
    unit: '秒',
  },
  { label: '挂机率', value: '8.21%', subText: '接听总量: 25位' },
])

const chatTrends = ref([
  { day: '周一', value: 50, hours: '1小时' },
  { day: '周二', value: 50, hours: '2小时' },
  { day: '周三', value: 70, hours: '3小时' },
  { day: '周四', value: 110, hours: '4小时' },
  { day: '周五', value: 140, hours: '5小时' },
  { day: '周六', value: 180, hours: '6小时' },
])

const botResponses = ref([
  { time: '16:00-17:00', value: 40 },
  { time: '17:00-18:00', value: 100 },
  { time: '18:00-19:00', value: 70 },
  { time: '19:00-20:00', value: 120 },
  { time: '20:00-21:00', value: 90 },
  { time: '21:00-22:00', value: 80 },
  { time: '22:00-23:00', value: 110 },
])

const systemStatus = ref([
  {
    status: '健康',
    api: 'API调用成功率',
    error: '错误率',
    delay: '延迟监控',
    time: '记录时间',
  },
  {
    status: '健康',
    api: 'API调用成功率',
    error: '错误率',
    delay: '延迟监控',
    time: '记录时间',
  },
  {
    status: '健康',
    api: 'API调用成功率',
    error: '错误率',
    delay: '延迟监控',
    time: '记录时间',
  },
  {
    status: '健康',
    api: 'API调用成功率',
    error: '错误率',
    delay: '延迟监控',
    time: '记录时间',
  },
  {
    status: '健康',
    api: 'API调用成功率',
    error: '错误率',
    delay: '延迟监控',
    time: '记录时间',
  },
])

const dateRange = ref('2025-04-01 至 20205-04-30')
const conversationType = ref('全部任务')
</script>

<template>
  <div class="dashboard-wrapper">
    <!-- 顶部标题和筛选器 -->
    <div class="dashboard-header">
      <div class="title">
11/16-12/21数据（全部会话数据分析...）
</div>
      <div class="filters">
        <div class="filter-item">
          <span class="filter-label">会话任务：</span>
          <el-select v-model="conversationType" placeholder="选择任务类型">
            <el-option label="全部任务" value="全部任务" />
          </el-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">日期选择：</span>
          <el-select v-model="dateRange" placeholder="选择日期范围">
            <el-option :label="dateRange" :value="dateRange" />
          </el-select>
        </div>
      </div>
    </div>

    <!-- 顶部统计卡片 -->
    <el-row :gutter="20" class="stat-cards">
      <el-col v-for="(card, index) in cards" :key="index" :span="6">
        <el-card shadow="hover">
          <div class="card-content">
            <div class="card-info">
              <div class="card-title">
{{ card.label }}
</div>
              <div class="card-value">
                {{ card.value }}<span v-if="card.unit">{{ card.unit }}</span>
              </div>
              <div class="card-subtext">
{{ card.subText }}
</div>
            </div>
            <div class="card-chart">
              <div
                class="circle-progress"
                :class="{ 'high-rate': index === 0 || index === 3 }"
              />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 中部图表 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :span="12">
        <el-card shadow="hover">
          <div class="chart-title">
会话趋势
</div>
          <div class="bar-chart">
            <div
              v-for="(item, index) in chatTrends"
              :key="index"
              class="chart-column"
            >
              <div class="y-axis-label">
{{ item.hours }}
</div>
              <div class="bar" :style="{ height: `${item.value}px` }" />
              <div class="x-axis-label">
{{ item.day }}
</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="hover">
          <div class="chart-title">
机器人响应时间
</div>
          <div class="response-stats">
            <span class="stat-item">平均响应时间 <strong>15.5</strong>秒</span>
            <span class="stat-item">最长响应时间 <strong>45.5</strong>秒</span>
          </div>
          <div class="response-chart">
            <div
              v-for="(item, index) in botResponses"
              :key="index"
              class="chart-column"
            >
              <div
                class="bar"
                :style="{ height: `${item.value}px` }"
                :class="{ highlight: index === 1 }"
              />
              <div class="x-axis-label time-label">
{{ item.time }}
</div>
            </div>
          </div>
          <div class="time-segment-label">
时间段
</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 底部系统状态 -->
    <el-card shadow="hover" class="system-status-card">
      <div class="chart-title">
系统健康状态
</div>
      <el-table :data="systemStatus" style="width: 100%;">
        <el-table-column prop="status" label="健康情况" />
        <el-table-column prop="api" label="API调用成功率" />
        <el-table-column prop="error" label="错误率" />
        <el-table-column prop="delay" label="延迟监控" />
        <el-table-column prop="time" label="记录时间" />
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>
.dashboard-wrapper {
  min-height: 100vh;
  padding: 20px;
  background: #f5f7fa;
}

.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.title {
  font-size: 18px;
  font-weight: bold;
}

.filters {
  display: flex;
  gap: 20px;
}

.filter-item {
  display: flex;
  align-items: center;
}

.filter-label {
  margin-right: 10px;
  white-space: nowrap;
}

.stat-cards {
  margin-bottom: 20px;
}

.card-content {
  display: flex;
  justify-content: space-between;
}

.card-info {
  flex: 1;
}

.card-title {
  margin-bottom: 10px;
  font-size: 14px;
  color: #606266;
}

.card-value {
  margin-bottom: 5px;
  font-size: 30px;
  font-weight: bold;
  color: #303133;
}

.card-subtext {
  font-size: 12px;
  color: #909399;
}

.card-chart {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
}

.circle-progress {
  position: relative;
  width: 70px;
  height: 70px;
  background: conic-gradient(#409eff 0% 86%, #e9e9eb 86% 100%);
  border-radius: 50%;
}

.circle-progress::after {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 50px;
  height: 50px;
  content: "";
  background: white;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.high-rate {
  background: conic-gradient(#409eff 0% 86%, #e9e9eb 86% 100%);
}

.charts-row {
  margin-bottom: 20px;
}

.chart-title {
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.bar-chart,
.response-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 250px;
}

.chart-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 40px;
}

.y-axis-label {
  width: 100%;
  margin-bottom: 5px;
  font-size: 12px;
  color: #909399;
  text-align: center;
}

.bar {
  width: 30px;
  background-color: #000;
  border-radius: 4px 4px 0 0;
}

.highlight {
  background-color: #000;
}

.x-axis-label {
  margin-top: 8px;
  font-size: 12px;
  color: #606266;
}

.time-label {
  width: 60px;
  margin-left: 20px;
  text-align: right;
  white-space: nowrap;
  transform: rotate(320deg);
  transform-origin: left;
}

.time-segment-label {
  margin-top: 20px;
  margin-right: 20px;
  color: #606266;
  text-align: right;
}

.response-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
}

.stat-item {
  font-size: 14px;
  color: #606266;
}

.stat-item strong {
  font-size: 18px;
  color: #303133;
}

.system-status-card {
  margin-top: 20px;
}
</style>
