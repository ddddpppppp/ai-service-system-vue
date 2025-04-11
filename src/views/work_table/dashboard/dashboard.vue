<script setup>
// 基准rem定义（1rem = 16px）
document.documentElement.style.fontSize = '16px'

const metrics = [
  { title: '会话接听率', value: '86.21%', desc: '接听总量: 25位' },
  { title: '当前排队人数', value: '86位', desc: '等待时间: 3秒' },
  { title: '平均等待时间', value: '45.5秒', desc: '客户总数: 25位' },
  { title: '挂机率', value: '8.21%', desc: '接听总量: 25位' },
]

const timeTabs = ['8小时', '7小时', '6小时', '5小时', '4小时', '3小时', '2小时', '1小时']

const days = [
  { name: '周一', height: 120 },
  { name: '周二', height: 200 },
  { name: '周三', height: 150 },
  { name: '周四', height: 80 },
  { name: '周五', height: 70 },
  { name: '周六', height: 110 },
]

const hours = [
  { name: '8h', height: 50 },
  { name: '7h', height: 60 },
  { name: '6h', height: 75 },
  { name: '5h', height: 90 },
  { name: '4h', height: 70 },
  { name: '3h', height: 80 },
  { name: '2h', height: 65 },
  { name: '1h', height: 77 },
]

const healthData = [
  { api: '99.8%', error: '0.2%', latency: '120ms', time: '2025-04-01 10:00', status: '健康' },
  { api: '98.5%', error: '1.5%', latency: '200ms', time: '2025-04-01 12:00', status: '健康' },
  { api: '95.2%', error: '4.8%', latency: '350ms', time: '2025-04-01 14:00', status: '健康' },
]
</script>

<template>
  <div class="pure-dashboard">
    <!-- 指标卡片区 -->
    <div class="metric-container">
      <div v-for="(metric, index) in metrics" :key="index" class="metric-card">
        <div class="metric-title">
{{ metric.title }}
</div>
        <div class="metric-value">
{{ metric.value }}
</div>
        <div class="metric-desc">
{{ metric.desc }}
</div>
      </div>
    </div>

    <!-- 图表区 -->
    <div class="chart-area">
      <!-- 会话趋势图表 -->
      <div class="chart-card left-chart">
        <div class="chart-header">
          <span class="chart-title">会话趋势</span>
          <div class="time-tabs">
            <span
v-for="tab in timeTabs"
                  :key="tab"
                  :class="{ active: tab === '8小时' }"
                  class="time-tab"
>{{ tab }}</span>
          </div>
        </div>
        <div class="chart-content">
          <div
v-for="(day, index) in days"
               :key="index"
               class="chart-bar"
               :style="{ height: `${day.height}px` }"
>
            <div class="day-label">
{{ day.name }}
</div>
          </div>
        </div>
      </div>

      <!-- 响应时间图表 -->
      <div class="chart-card right-chart">
        <div class="chart-header">
          <span class="chart-title">机器人响应时间</span>
          <div class="response-stats">
            <span>平均响应时间: 15.5秒</span>
            <span>最长响应时间: 45.5秒</span>
          </div>
        </div>
        <div class="chart-content">
          <div
v-for="(hour, index) in hours"
               :key="index"
               class="chart-bar"
               :style="{ height: `${hour.height}px` }"
>
            <div class="hour-label">
{{ hour.name }}
</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 系统健康表 -->
    <div class="health-table">
      <div class="table-header">
系统健康状态
</div>
      <div class="header table-row">
        <div>API调用成功率</div>
        <div>错误率</div>
        <div>延迟监控</div>
        <div>记录时间</div>
        <div>健康状态</div>
      </div>
      <div v-for="(row, index) in healthData" :key="index" class="table-row">
        <div>{{ row.api }}</div>
        <div>{{ row.error }}</div>
        <div>{{ row.latency }}</div>
        <div>{{ row.time }}</div>
        <div>
          <span class="status-tag healthy">{{ row.status }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* 精确还原设计规范 */
.pure-dashboard {
  min-height: 100vh;
  padding: 1.25rem; // 20px
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
}

/* 指标卡片 */
.metric-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem; // 16px
  margin-bottom: 1.5rem; // 24px
}

.metric-card {
  padding: 1.125rem; // 18px
  background: #f8f9fa;
  border: 1px solid #ebeff0;
  border-radius: 0.375rem; // 6px
}

.metric-title {
  margin-bottom: 0.75rem; // 12px
  font-size: 0.875rem; // 14px
  color: #606266;
}

.metric-value {
  margin-bottom: 0.5rem; // 8px
  font-size: 1.5rem; // 24px
  font-weight: 600;
  color: #1a2b5a;
}

.metric-desc {
  font-size: 0.75rem; // 12px
  color: #909399;
}

/* 图表区 */
.chart-area {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem; // 16px
  margin-bottom: 1.5rem; // 24px
}

.chart-card {
  padding: 1rem; // 16px
  background: #f8f9fa;
  border: 1px solid #ebeff0;
  border-radius: 0.375rem; // 6px
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem; // 20px
}

.chart-title {
  font-size: 1rem; // 16px
  font-weight: 500;
}

.time-tabs {
  display: flex;
  gap: 0.5rem; // 8px
}

.time-tab {
  padding: 0.25rem 0.5rem; // 4px 8px
  font-size: 0.75rem; // 12px
  color: #606266;
  background: #ebeff0;
  border-radius: 0.25rem; // 4px

  &.active {
    color: white;
    background: #4dabf7;
  }
}

.response-stats {
  display: flex;
  gap: 1rem; // 16px
  font-size: 0.8125rem; // 13px
  color: #909399;
}

.chart-content {
  display: flex;
  gap: 0.75rem; // 12px
  align-items: flex-end;
  height: 12.5rem; // 200px
  padding-top: 1.25rem; // 20px
}

.chart-bar {
  position: relative;
  flex: 1;
  min-width: 2rem; // 32px
  background: #4dabf7;
  border-radius: 0.25rem 0.25rem 0 0; // 4px
}

.day-label,
 .hour-label {
  position: absolute;
  bottom: -1.5rem; // 24px
  width: 100%;
  font-size: 0.75rem; // 12px
  color: #606266;
  text-align: center;
}

/* 健康表格 */
.health-table {
  overflow: hidden;
  border: 1px solid #ebeff0;
  border-radius: 0.375rem; // 6px
}

.table-header {
  padding: 1rem; // 16px
  font-weight: 500;
  background: #f8f9fa;
  border-bottom: 1px solid #ebeff0;
}

.table-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  align-items: center;
  padding: 0.75rem 1rem; // 12px 16px
  border-bottom: 1px solid #ebeff0;

  &.header {
    font-weight: 500;
    background: #f1f3f5;
  }
}

.status-tag {
  display: inline-block;
  padding: 0.25rem 0.5rem; // 4px 8px
  font-size: 0.75rem; // 12px
  border-radius: 0.25rem; // 4px

  &.healthy {
    color: white;
    background: #67c23a;
  }
}
</style>
