<script setup>
import apiTakeout from '@/api/modules/takeout'
import router from '@/router'
import { BarChart, LineChart } from 'echarts/charts'
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { computed, onMounted, ref } from 'vue'
import VChart from 'vue-echarts'

// Register ECharts components
use([
  CanvasRenderer,
  BarChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
])

// 获取当前日期及之前的7天时间范围
const dateRange = ref(getLast7Days())

// Team performance data
const teamPeriod = ref('month')

// Wallet data
const wallet = ref({
  balance: 0,
  balanceFrozen: 0,
})

// Team sales data
const teamSales = ref([])

// Dashboard data
const personalStats = ref({
  orderCount: 0,
  orderTrend: { value: 0, trend: 'up' },
  paidOrderCount: 0,
  paidOrderTrend: { value: 0, trend: 'up' },
  paidAmount: 0,
  paidAmountTrend: { value: 0, trend: 'up' },
  conversionRate: 0,
  conversionRateTrend: { value: 0, trend: 'up' },
})

const teamStats = ref({
  orderCount: 0,
  orderTrend: { value: 0, trend: 'up' },
  paidOrderCount: 0,
  paidOrderTrend: { value: 0, trend: 'up' },
  paidAmount: 0,
  paidAmountTrend: { value: 0, trend: 'up' },
  conversionRate: 0,
  conversionRateTrend: { value: 0, trend: 'up' },
})

// Chart data
const chartData = ref({
  labels: [],
  orderData: [],
  paidOrderData: [],
  amountData: [],
})

// ECharts option for team performance
const teamChartOption = computed(() => {
  // Get the primary color from CSS variable
  // Create a cohesive color palette based on the primary color
  const colors = [
    '#09090b', // Primary color for first series
    '#09090b', // Lighter shade for second series
    '#09090b', // Slightly darker for line series
  ]

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    legend: {
      data: ['订单量', '已支付订单量', '已支付订单金额'],
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: [
      {
        type: 'category',
        data: chartData.value.labels || [],
      },
    ],
    yAxis: [
      {
        type: 'value',
        name: '订单数量',
        position: 'left',
      },
      {
        type: 'value',
        name: '金额',
        position: 'right',
        axisLabel: {
          formatter: '{value} 元',
        },
      },
    ],
    series: [
      {
        name: '订单量',
        type: 'bar',
        barWidth: 20,
        itemStyle: {
          color: colors[0], // Explicitly set color for first series
        },
        data: chartData.value.orderData || [],
      },
      {
        name: '已支付订单量',
        type: 'bar',
        barWidth: 20,
        itemStyle: {
          color: colors[1], // Explicitly set color for second series
        },
        data: chartData.value.paidOrderData || [],
      },
      {
        name: '已支付订单金额',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        symbolSize: 8,
        lineStyle: {
          width: 3,
          color: colors[2], // Explicitly set line color
        },
        itemStyle: {
          color: colors[2], // Explicitly set point color
        },
        data: chartData.value.amountData || [],
      },
    ],
    color: colors,
  }
})

onMounted(() => {
  getDashboardData()
})

async function getDashboardData() {
  const res = await apiTakeout.getDashboard({
    startDate: dateRange.value[0],
    endDate: dateRange.value[1],
    period: teamPeriod.value,
  })

  if (res && res.status === 1 && res.data) {
    // Update personal stats
    personalStats.value = res.data.personal || personalStats.value

    // Update team stats
    teamStats.value = res.data.team || teamStats.value

    // Update chart data
    chartData.value = res.data.chart || chartData.value

    // Update wallet data
    wallet.value = res.data.wallet || wallet.value

    // Update team sales data
    teamSales.value = res.data.teamSales || []
  }
}

// Format number with commas
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 获取最近7天的日期范围函数
function getLast7Days() {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 6) // 当前日期算一天，所以减6天

  // 格式化日期为 YYYY/MM/DD 格式
  const formatDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}/${month}/${day}`
  }

  return [formatDate(start), formatDate(end)]
}

function toWithdraw() {
  router.push({ name: 'backendManageWithdraw' })
}
</script>

<template>
  <div class="dashboard-container">
    <!-- Header with FaPageHeader -->
    <FaPageHeader title="看板" class="mb-0" />

    <!-- Date Filter -->
    <div class="date-filter-container">
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        format="YYYY/MM/DD"
        value-format="YYYY/MM/DD"
        @change="getDashboardData"
      />
    </div>
    <div class="dashboard">
      <!-- Stat Cards - First Row -->
      <div class="mb-4 flex-center gap-4">
        <FaDigitalCard
          title="订单量"
          icon="i-ep:shopping-cart"
          :digital="formatNumber(personalStats.orderCount)"
          :description="`较上个周期${personalStats.orderTrend.trend === 'up' ? '上升' : '下降'}${personalStats.orderTrend.value}%`"
          :trend="personalStats.orderTrend.trend"
        />
        <FaDigitalCard
          title="已支付订单量"
          icon="i-ep:money"
          :digital="formatNumber(personalStats.paidOrderCount)"
          :description="`较上个周期${personalStats.paidOrderTrend.trend === 'up' ? '上升' : '下降'}${personalStats.paidOrderTrend.value}%`"
          :trend="personalStats.paidOrderTrend.trend"
        />
        <FaDigitalCard
          title="已支付订单金额"
          icon="i-ep:document"
          :digital="`＄${formatNumber(personalStats.paidAmount)}`"
          :description="`较上个周期${personalStats.paidAmountTrend.trend === 'up' ? '上升' : '下降'}${personalStats.paidAmountTrend.value}%`"
          :trend="personalStats.paidAmountTrend.trend"
        />
        <FaDigitalCard
          title="订单转化率"
          icon="i-ep:data-analysis"
          :digital="`${personalStats.conversionRate}%`"
          :description="`较上个周期${personalStats.conversionRateTrend.trend === 'up' ? '上升' : '下降'}${personalStats.conversionRateTrend.value}%`"
          :trend="personalStats.conversionRateTrend.trend"
        />
      </div>

      <!-- Stat Cards - Second Row -->
      <div class="mb-6 flex-center gap-4">
        <FaDigitalCard
          title="团队订单量"
          icon="i-ep:shopping-bag"
          :digital="formatNumber(teamStats.orderCount)"
          :description="`较上个周期${teamStats.orderTrend.trend === 'up' ? '上升' : '下降'}${teamStats.orderTrend.value}%`"
          :trend="teamStats.orderTrend.trend"
        />
        <FaDigitalCard
          title="团队已支付订单量"
          icon="i-ep:credit-card"
          :digital="formatNumber(teamStats.paidOrderCount)"
          :description="`较上个周期${teamStats.paidOrderTrend.trend === 'up' ? '上升' : '下降'}${teamStats.paidOrderTrend.value}%`"
          :trend="teamStats.paidOrderTrend.trend"
        />
        <FaDigitalCard
          title="团队已支付订单金额"
          icon="i-ep:wallet"
          :digital="`＄${formatNumber(teamStats.paidAmount)}`"
          :description="`较上个周期${teamStats.paidAmountTrend.trend === 'up' ? '上升' : '下降'}${teamStats.paidAmountTrend.value}%`"
          :trend="teamStats.paidAmountTrend.trend"
        />
        <FaDigitalCard
          title="团队订单转化率"
          title-tips="已支付订单量/订单总量"
          icon="i-ep:data-line"
          :digital="`${teamStats.conversionRate}%`"
          :description="`较上个周期${teamStats.conversionRateTrend.trend === 'up' ? '上升' : '下降'}${teamStats.conversionRateTrend.value}%`"
          :trend="teamStats.conversionRateTrend.trend"
        />
      </div>
      <!-- Wallet and Team Sales Section -->
      <el-row :gutter="20" class="dashboard-section">
        <el-col :xs="24" :md="8">
          <el-card shadow="hover" class="section-card wallet-card">
            <template #header>
              <div class="card-header">
                <span>我的钱包</span>
              </div>
            </template>

            <div class="wallet-content">
              <div class="wallet-item">
                <div class="wallet-label">
                  钱包余额
                </div>
                <div class="wallet-value">
                  ${{ formatNumber(wallet.balance) }}
                </div>
              </div>
              <div class="wallet-item">
                <div class="wallet-label">
                  冻结余额
                </div>
                <div class="wallet-value">
                  ${{ formatNumber(wallet.balanceFrozen) }}
                </div>
              </div>
              <el-button type="primary" class="wallet-button" @click="toWithdraw">
                提现
              </el-button>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :md="16">
          <el-card shadow="hover" class="section-card">
            <template #header>
              <div class="card-header">
                <span>团队订单情况</span>
              </div>
            </template>

            <el-table :data="teamSales" style="width: 100%;" height="400">
              <el-table-column prop="name" label="名称" />
              <el-table-column prop="orderCount" label="订单量" />
              <el-table-column prop="successCount" label="订单成功数量" />
              <el-table-column prop="successAmount" label="订单成功金额">
                <template #default="scope">
                  ¥{{ formatNumber(scope.row.successAmount) }}
                </template>
              </el-table-column>
              <el-table-column prop="profit" label="利润">
                <template #default="scope">
                  ¥{{ formatNumber(scope.row.profit) }}
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>
      <!-- Team Performance Section with ECharts -->
      <el-row :gutter="20" class="dashboard-section">
        <el-col :span="24">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>团队业绩统计</span>
                <el-radio-group v-model="teamPeriod" size="small" @change="getDashboardData">
                  <el-radio-button value="day">
                    日
                  </el-radio-button>
                  <el-radio-button value="week">
                    周
                  </el-radio-button>
                  <el-radio-button value="month">
                    月
                  </el-radio-button>
                </el-radio-group>
              </div>
            </template>

            <!-- Team Performance Chart with ECharts -->
            <div class="echarts-container">
              <VChart class="chart" :option="teamChartOption" autoresize />
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  min-height: calc(100vh - 100px);
  padding: 20px;
}

.date-filter-container {
  position: absolute;
  top: 1.1rem;
  right: 1rem;
  margin-bottom: 24px;
}

.mb-0 {
  margin-bottom: 0;
}

.mb-4 {
  margin-bottom: 16px;
}

.mb-6 {
  margin-bottom: 24px;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.gap-4 {
  gap: 16px;
}

.dashboard-section {
  margin-bottom: 24px;
}

.section-card {
  max-height: 360px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.echarts-container {
  width: 100%;
  height: 400px;
}

.chart {
  width: 100%;
  height: 100%;
}

.wallet-card {
  height: 100%;
}

.wallet-content {
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.wallet-item {
  margin-bottom: 16px;
}

.wallet-label {
  margin-bottom: 4px;
  font-size: 14px;
  color: #666;
}

.wallet-value {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.wallet-button {
  align-self: flex-start;
  margin-top: auto;
}

/* Override Element Plus styles to match the primary color */
:deep(.el-button--primary) {
  --el-button-bg-color: hsl(var(--primary));
  --el-button-border-color: hsl(var(--primary));
  --el-button-hover-bg-color: hsl(var(--primary));
  --el-button-hover-border-color: hsl(var(--primary));
  --el-button-active-bg-color: hsl(var(--primary));
  --el-button-active-border-color: hsl(var(--primary));
}

:deep(.el-radio-button__orig-radio:checked + .el-radio-button__inner) {
  background-color: hsl(var(--primary));
  border-color: hsl(var(--primary));
  box-shadow: -1px 0 0 0 hsl(var(--primary));
}
</style>
