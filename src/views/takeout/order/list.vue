<route lang="yaml">
  meta:
    enabled: false
  </route>

<script setup lang="ts">
import apiTakeout from '@/api/modules/takeout'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import TakeoutOrderDetail from './detail.vue'

defineOptions({
  name: 'TakeoutOrderList',
})

const { pagination, getParams, onSizeChange, onCurrentChange, onSortChange } = usePagination()

// 表格是否自适应高度
const tableAutoHeight = ref(false)

// 搜索
const searchDefault = {
  name: '',
  storeId: '',
  dateData: [],
  userName: '',
  agentName: '',
  status: '',
}
const search = ref({ ...searchDefault })

function searchReset() {
  Object.assign(search.value, searchDefault)
}

// 批量操作
const batch = ref({
  enable: true,
  selectionDataList: [] as Array<{ orderNo: string | number }>,
})

// 列表
const loading = ref(false)
const dataList = ref([
  {
    orderNo: '',
    status: '',
  },
])
const storeList = ref([
  {
    storeId: '',
    name: '全部',
  },
])
// 详情
const formModeProps = ref<{
  visible: boolean
  id: number
}>({
  visible: false,
  id: 0,
})

const total = ref({
  totalProfit: 0,
  totalOrder: 0,
  totalSuccessOrder: 0,
  totalOrderAmount: 0,
  totalSuccessOrderAmount: 0,
})

const canComplete = ref(false)

onMounted(() => {
  const route = useRoute()
  if (route.query.storeId) {
    search.value.storeId = route.query.storeId as string
  }
  getDataStore()
  getDataList()
  getDataTotal()
})

async function getDataList(isExport = false) {
  loading.value = true
  if (isExport) {
    pagination.value.size = 999999999
  }
  const params = {
    ...getParams(),
    ...(search.value.name && { name: search.value.name }),
    ...(search.value.storeId && { storeId: search.value.storeId }),
    ...(search.value.dateData && { dateData: search.value.dateData }),
    ...(search.value.userName && { userName: search.value.userName }),
    ...(search.value.agentName && { agentName: search.value.agentName }),
    ...(search.value.status && { status: search.value.status }),
  }
  const res = await apiTakeout.getOrderList(params)
  loading.value = false
  if (isExport) {
    return res.data.list
  }
  dataList.value = res.data.list
  canComplete.value = res.data.canComplete
}

async function getDataTotal() {
  const params = {
    ...getParams(),
    ...(search.value.name && { name: search.value.name }),
    ...(search.value.storeId && { storeId: search.value.storeId }),
    ...(search.value.dateData && { dateData: search.value.dateData }),
    ...(search.value.userName && { userName: search.value.userName }),
    ...(search.value.agentName && { agentName: search.value.agentName }),
    ...(search.value.status && { status: search.value.status }),
  }
  const res = await apiTakeout.getOrderTotal(params)
  pagination.value.total = res.data.total.totalOrder
  total.value = res.data.total
}

function getDataStore() {
  apiTakeout.getAllStore().then((res: any) => {
    storeList.value = res.data.list
  })
}

// 每页数量切换
function sizeChange(size: number) {
  onSizeChange(size).then(() => getDataList())
}

// 当前页码切换（翻页）
function currentChange(page = 1) {
  onCurrentChange(page).then(() => getDataList())
}

// 字段排序
function sortChange({ prop, order }: { prop: string, order: string }) {
  onSortChange(prop, order).then(() => getDataList())
}

function onEdit(row: any) {
  formModeProps.value.id = row.orderNo
  formModeProps.value.visible = true
}

function onCopy(row: any) {
  if (navigator.clipboard && row.checkoutUrl) {
    navigator.clipboard.writeText(row.checkoutUrl)
      .then(() => {
        ElMessage.success({
          message: '复制成功',
          center: true,
        })
      })
      .catch((err) => {
        console.error('Failed to copy URL:', err)
        ElMessage.error({
          message: '复制失败',
          center: true,
        })
      })
  }
}

// function onDel(row: any) {
//   ElMessageBox.confirm(`确认删除「${row.orderNo}」吗？`, '确认信息').then(() => {
//     apiTakeout.delOrder({ id: row.orderNo }).then(() => {
//       getDataList()
//       getDataTotal()
//       ElMessage.success({
//         message: '删除成功',
//         center: true,
//       })
//     })
//   }).catch(() => {})
// }

// function onDelBatch() {
//   ElMessageBox.confirm(`确认批量删除吗？`, '确认信息').then(() => {
//     const ids: any[] = []
//     batch.value.selectionDataList.forEach((item) => {
//       ids.push(item.orderNo)
//     })
//     apiTakeout.delOrder({ ids }).then(() => {
//       getDataList()
//       getDataTotal()
//       ElMessage.success({
//         message: '删除成功',
//         center: true,
//       })
//     })
//   }).catch(() => {})
// }

function onFinish(row: any) {
  ElMessageBox.confirm(`确认标记「${row.orderNo}」完成吗？`, '确认信息').then(() => {
    apiTakeout.finishOrder({ id: row.orderNo }).then(() => {
      getDataList()
      ElMessage.success({
        message: '标记完成成功',
        center: true,
      })
    })
  }).catch(() => {})
}

function onFinishBatch() {
  ElMessageBox.confirm(`确认批量标记完成吗？`, '确认信息').then(() => {
    const ids: any[] = []
    batch.value.selectionDataList.forEach((item) => {
      ids.push(item.orderNo)
    })
    apiTakeout.finishOrder({ ids }).then(() => {
      getDataList()
      ElMessage.success({
        message: '标记完成成功',
        center: true,
      })
    })
  }).catch(() => {})
}

function onRefund(row: any) {
  ElMessageBox.confirm(`确认标记「${row.orderNo}」退款吗？`, '确认信息').then(() => {
    apiTakeout.refundOrder({ id: row.orderNo }).then(() => {
      getDataList()
      ElMessage.success({
        message: '标记退款成功',
        center: true,
      })
    })
  }).catch(() => {})
}

function onCancel(row: any) {
  ElMessageBox.confirm(`确认标记「${row.orderNo}」取消吗？`, '确认信息').then(() => {
    apiTakeout.cancelOrder({ id: row.orderNo }).then(() => {
      getDataList()
      ElMessage.success({
        message: '标记取消成功',
        center: true,
      })
    })
  }).catch(() => {})
}

function onCancelBatch() {
  ElMessageBox.confirm(`确认批量标记取消吗？`, '确认信息').then(() => {
    const ids: any[] = []
    batch.value.selectionDataList.forEach((item) => {
      ids.push(item.orderNo)
    })
    apiTakeout.cancelOrder({ ids }).then(() => {
      getDataList()
      ElMessage.success({
        message: '标记取消成功',
        center: true,
      })
    })
  }).catch(() => {})
}

function onExport() {
  getDataList(true).then((res: any) => {
    if (!res || !res.length) {
      ElMessage.warning('没有数据可导出')
      return
    }

    // 定义CSV的列头
    const headers = [
      '订单号',
      '商户',
      '用户',
      '小计',
      '配送费',
      '税',
      '总价',
      '状态',
      '生成时间',
      '更新日期',
    ]

    // 从数据中提取对应的字段
    const rows = res.map((item: any) => [
      item.orderNo,
      item.merchantName,
      item.userName,
      item.subtotal,
      item.deliveryFee,
      item.tax,
      item.total,
      item.statusName,
      item.createdAt,
      item.updatedAt,
    ])

    // 组合标题行和数据行
    const csvContent = [
      headers.join(','),
      ...rows.map((row: any) => row.join(',')),
    ].join('\n')

    // 创建Blob对象并下载
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const filename = `订单列表_${new Date().toISOString().split('T')[0]}.csv`

    // 设置链接属性
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.display = 'none'

    // 添加到DOM，触发下载，然后移除
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    ElMessage.success({
      message: '导出成功',
      center: true,
    })
  })
}

function handleSelect(index: string) {
  search.value.status = index
  currentChange()
}
const contextMenuItems = computed(() => {
  return [
    {
      label: '全部',
      index: '',
    },
    {
      label: '待支付',
      index: 'pending',
    },
    {
      label: '送货中',
      index: 'delivering',
    },
    {
      label: '已完成',
      index: 'completed',
    },
    {
      label: '已取消',
      index: 'cancelled',
    },
  ]
})
</script>

<template>
  <div :class="{ 'absolute-container': tableAutoHeight }">
    <FaPageHeader title="订单管理" class="mb-0" />
    <FaPageMain :class="{ 'flex-1 overflow-auto': tableAutoHeight }" :main-class="{ 'flex-1 flex flex-col overflow-auto': tableAutoHeight }">
      <FaSearchBar :show-toggle="false">
        <template #default="{ fold, toggle }">
          <ElForm :model="search" size="default" label-width="100px" inline-message inline class="search-form">
            <ElFormItem label="订单号">
              <ElInput v-model="search.name" placeholder="请输入订单号，支持模糊查询" clearable @keydown.enter="currentChange()" @clear="currentChange()" />
            </ElFormItem>
            <ElFormItem label="店铺">
              <ElSelect v-model="search.storeId" placeholder="请选择店铺" clearable>
                <ElOption v-for="item in storeList" :key="item.storeId" :label="item.name" :value="item.storeId" />
              </ElSelect>
            </ElFormItem>
            <ElFormItem label="日期">
              <ElDatePicker v-model="search.dateData" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" />
            </ElFormItem>
            <ElFormItem label="下单用户名称">
              <ElInput v-model="search.userName" placeholder="请输入下单用户名称，支持模糊查询" clearable @keydown.enter="currentChange()" @clear="currentChange()" />
            </ElFormItem>
            <ElFormItem label="下单代理名称">
              <ElInput v-model="search.agentName" placeholder="此项会搜索代理下面全部的订单" clearable @keydown.enter="currentChange()" @clear="currentChange()" />
            </ElFormItem>
            <ElFormItem>
              <ElButton @click="searchReset(); currentChange()">
                重置
              </ElButton>
              <ElButton type="primary" @click="currentChange(); getDataTotal()">
                <template #icon>
                  <FaIcon name="i-ep:search" />
                </template>
                筛选
              </ElButton>
              <ElButton type="primary" @click="onExport">
                <template #icon>
                  <FaIcon name="i-ep:download" />
                </template>
                导出
              </ElButton>
              <ElButton disabled link @click="toggle">
                <template #icon>
                  <FaIcon :name="fold ? 'i-ep:caret-bottom' : 'i-ep:caret-top' " />
                </template>
                {{ fold ? '展开' : '收起' }}
              </ElButton>
            </ElFormItem>
          </ElForm>
        </template>
      </FaSearchBar>
      <!-- <ElDivider border-style="dashed" /> -->
      <div class="menu-container">
        <el-menu
          class="el-menu"
          mode="horizontal"
          @select="handleSelect"
        >
          <el-menu-item v-for="item in contextMenuItems" :key="item.label" :index="item.index">
            {{ item.label }}
          </el-menu-item>
        </el-menu>
      </div>

      <!-- Replace the batch operations ElSpace with this to align with the menu -->
      <div class="mb-4 flex items-center justify-between">
        <div class="actions-container">
          <ElButtonGroup v-if="batch.enable">
            <!-- <ElButton size="default" :disabled="!batch.selectionDataList.length" @click="onDelBatch">
              <FaIcon name="i-ep:delete" class="mr-1" />
              删除
            </ElButton> -->
            <ElButton v-if="canComplete" size="default" :disabled="!batch.selectionDataList.length" @click="onFinishBatch">
              <FaIcon name="i-ep:check" class="mr-1" />
              标记完成
            </ElButton>
            <ElButton size="default" :disabled="!batch.selectionDataList.length" @click="onCancelBatch">
              <FaIcon name="i-ep:close" class="mr-1" />
              标记取消
            </ElButton>
          </ElButtonGroup>
        </div>
        <div class="flex items-center gap-2">
          <div class="stats-mini-cards">
            <div class="orders mini-card">
              <FaIcon name="i-ep:document" class="mini-card-icon" />
              <span class="mini-card-label">订单总数:</span>
              <span class="mini-card-value">
                <FaCountTo :start-val="0" :end-val="total.totalOrder" :duration="2000" />
              </span>
            </div>

            <div class="mini-card success-orders">
              <FaIcon name="i-ep:document-checked" class="mini-card-icon" />
              <span class="mini-card-label">成功订单数:</span>
              <span class="mini-card-value">
                <FaCountTo :start-val="0" :end-val="total.totalSuccessOrder" :duration="2000" />
              </span>
            </div>

            <div class="mini-card amount">
              <FaIcon name="i-ep:money" class="mini-card-icon" />
              <span class="mini-card-label">总金额:</span>
              <span class="mini-card-value">
                <FaCountTo :start-val="0" :end-val="total.totalOrderAmount" :duration="2000" prefix="$" :decimals="2" />
              </span>
            </div>

            <div class="mini-card success-amount">
              <FaIcon name="i-ep:wallet" class="mini-card-icon" />
              <span class="mini-card-label">成功总金额:</span>
              <span class="mini-card-value">
                <FaCountTo :start-val="0" :end-val="total.totalSuccessOrderAmount" :duration="2000" prefix="$" :decimals="2" />
              </span>
            </div>

            <div class="mini-card profit">
              <FaIcon name="i-ep:coin" class="mini-card-icon" />
              <span class="mini-card-label">我的总收益:</span>
              <span class="mini-card-value">
                <FaCountTo :start-val="0" :end-val="total.totalProfit" :duration="2000" prefix="$" :decimals="2" />
              </span>
            </div>
          </div>
        </div>
      </div>
      <ElTable v-loading="loading" class="my-4" :data="dataList" highlight-current-row border height="100%" @sort-change="sortChange" @selection-change="batch.selectionDataList = $event">
        <ElTableColumn v-if="batch.enable" type="selection" align="center" fixed />
        <ElTableColumn prop="orderNo" label="订单号" min-width="120" align="center" header-align="center" />
        <ElTableColumn prop="paymentMethod" label="支付通道" min-width="120" align="center" header-align="center" />
        <ElTableColumn prop="paymentNo" label="支付订单号" min-width="120" align="center" header-align="center" />
        <ElTableColumn prop="merchantName" label="商户" min-width="120" align="center" header-align="center" />
        <ElTableColumn prop="parentName" label="上级代理" min-width="120" align="center" header-align="center" />
        <ElTableColumn label="代理" min-width="150" align="center" header-align="center">
          <template #default="scope">
            <div class="flex items-center gap-1">
              <ElTag type="primary" size="small" circle>
                {{ scope.row.userLevel }}级
              </ElTag>
              <span>
                {{ scope.row.userName }}
              </span>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="subtotal" label="小计" min-width="120" align="center" header-align="center" />
        <ElTableColumn prop="deliveryFee" label="配送费" min-width="120" align="center" header-align="center" />
        <ElTableColumn prop="tax" label="税" min-width="120" align="center" header-align="center" />
        <ElTableColumn prop="total" label="总价" min-width="120" align="center" header-align="center">
          <template #default="scope">
            <span class="text-red-500 font-bold">
              {{ scope.row.total }}
            </span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="myProfit" label="我的分润" min-width="140" align="center" header-align="center">
          <template #default="scope">
            <div v-if="scope.row.myProfit !== '--'" class="flex items-center gap-1">
              <ElTag type="primary" size="small" circle>
                {{ scope.row.myProfitRate }}%
              </ElTag>
              <span class="text-red-500 font-bold">
                {{ scope.row.myProfit }}
              </span>
            </div>
          </template>
        </ElTableColumn>
        <!-- <ElTableColumn prop="addressInfo" label="地址" /> -->
        <ElTableColumn prop="statusName" label="状态" min-width="120" align="center" header-align="center">
          <template #default="scope">
            <ElTag :type="scope.row.statusClass">
              {{ scope.row.statusName }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="createdAt" label="生成时间" min-width="170" align="center" header-align="center" />
        <ElTableColumn prop="updatedAt" label="更新日期" width="170" header-align="center" />
        <ElTableColumn label="操作" width="150" align="center" fixed="right">
          <template #default="scope">
            <div class="table-action-buttons">
              <ElTooltip content="查看详情" placement="top" effect="light">
                <ElButton type="primary" size="small" circle @click="onEdit(scope.row)">
                  <FaIcon name="i-ep:view" />
                </ElButton>
              </ElTooltip>
              <ElTooltip content="复制" placement="top" effect="light">
                <ElButton type="primary" size="small" circle @click="onCopy(scope.row)">
                  <FaIcon name="ep:connection" />
                </ElButton>
              </ElTooltip>
              <!-- <ElTooltip v-if="scope.row.status === 'cancelled'" content="删除" placement="top" effect="light">
                <ElButton type="danger" size="small" circle @click="onDel(scope.row)">
                  <FaIcon name="i-ep:delete" />
                </ElButton>
              </ElTooltip> -->
              <ElTooltip v-if="scope.row.status === 'delivering' && canComplete" content="标记完成" placement="top" effect="light">
                <ElButton type="success" size="small" circle @click="onFinish(scope.row)">
                  <FaIcon name="i-ep:check" />
                </ElButton>
              </ElTooltip>
              <ElTooltip v-if="scope.row.canRefund" content="标记退款" placement="top" effect="light">
                <ElButton type="warning" size="small" circle @click="onRefund(scope.row)">
                  <FaIcon name="i-ep:close" />
                </ElButton>
              </ElTooltip>
              <ElTooltip v-if="scope.row.status === 'pending'" content="标记取消" placement="top" effect="light">
                <ElButton type="warning" size="small" circle @click="onCancel(scope.row)">
                  <FaIcon name="i-ep:close" />
                </ElButton>
              </ElTooltip>
            </div>
          </template>
        </ElTableColumn>
      </ElTable>
      <ElPagination :current-page="pagination.page" :total="pagination.total" :page-size="pagination.size" :page-sizes="pagination.sizes" :layout="pagination.layout" :hide-on-single-page="false" class="pagination" background @size-change="sizeChange" @current-change="currentChange" />
    </FaPageMain>
    <TakeoutOrderDetail :id="formModeProps.id" v-model="formModeProps.visible" @success="getDataList" />
  </div>
</template>

<style scoped>
.menu-container {
  width: calc(100% + 40px);
  margin-inline: -20px;
  margin-top: 20px;
  margin-bottom: 8px;
  border-bottom: 1px solid hsl(var(--border));

  .el-menu {
    height: 40px;
    margin: 0 20px;
    line-height: 40px;
    background-color: transparent;
    border-bottom: none;
  }
}

.actions-container {
  display: flex;
}

.absolute-container {
  position: absolute;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.search-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(330px, 1fr));
  margin-bottom: -18px;

  :deep(.el-form-item) {
    grid-column: auto / span 1;

    &:last-child {
      grid-column-end: -1;

      .el-form-item__content {
        justify-content: flex-end;
      }
    }
  }
}

.el-divider {
  width: calc(100% + 40px);
  margin-inline: -20px;
  margin-bottom: 12px;
}

:deep(.el-menu-item) {
  height: 40px;
  padding: 0 16px;
  font-size: 14px;
  line-height: 40px;
  color: hsl(var(--accent-foreground)) !important;
  background-color: transparent;
  transition: color 0.3s, background-color 0.3s, border-color 0.3s;

  &:hover {
    color: hsl(var(--primary)) !important;
    background-color: transparent !important;
  }
}

:deep(.el-menu-item.is-active) {
  font-weight: 600;
  color: hsl(var(--primary)) !important;
  background-color: transparent !important;
  border-bottom: 2px solid hsl(var(--primary)) !important;
}

:deep(.el-table) {
  margin-top: 0;

  .font-bold {
    font-weight: bold;
  }

  .el-table__row {
    height: 62px; /* 增加行高 */
    transition: background-color 0.3s;

    &:hover > td {
      background-color: hsl(var(--accent) / 50%) !important;
    }
  }

  /* 斑马纹使用主题色 */
  .el-table__row--striped td {
    background-color: hsl(var(--accent) / 20%) !important;
  }

  /* 单元格内容样式 */
  .cell {
    padding-top: 14px;
    padding-bottom: 14px;
    line-height: 1.5;
  }

  /* 表头样式 */
  .el-table__header th {
    background-color: hsl(var(--accent) / 30%) !important;

    .cell {
      padding-top: 12px;
      padding-bottom: 12px;
      font-weight: 600;
    }
  }

  /* 调整表格边框颜色 */
  &::before, /* 下边框 */
  .el-table__border-left-patch,
  .el-table__border-bottom-patch {
    background-color: hsl(var(--border)) !important;
  }

  /* 表格边框样式 */
  .el-table__border,
  .el-table__fixed-right-patch {
    border-color: hsl(var(--border)) !important;
  }

  td,
  th {
    border-color: hsl(var(--border)) !important;
  }
}

.table-action-buttons {
  display: flex;
  gap: 2px; /* 增加操作按钮之间的间距 */
  justify-content: center;

  :deep(.el-button) {
    padding: 7px; /* 稍微增加按钮大小 */

    .fa-icon {
      font-size: 16px; /* 增加图标大小 */
    }
  }

  :deep(.el-button+.el-button) {
    margin-left: 5px;
  }
}

.stats-mini-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.mini-card {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgb(0 0 0 / 4%);
}

.mini-card.orders {
  background-color: #ecf5ff;
  border: 1px solid #d9ecff;
}

.mini-card.success-orders {
  background-color: #f0f9eb;
  border: 1px solid #e1f3d8;
}

.mini-card.amount {
  background-color: #fef0f0;
  border: 1px solid #fde2e2;
}

.mini-card.success-amount {
  background-color: #f4f4f5;
  border: 1px solid #e9e9eb;
}

.mini-card.profit {
  background-color: #fdf6ec;
  border: 1px solid #faecd8;
}

.mini-card-icon {
  margin-right: 6px;
  font-size: 16px;
}

.mini-card.orders .mini-card-icon {
  color: var(--el-color-primary);
}

.mini-card.success-orders .mini-card-icon {
  color: #67c23a;
}

.mini-card.amount .mini-card-icon {
  color: #f56c6c;
}

.mini-card.success-amount .mini-card-icon {
  color: #909399;
}

.mini-card.profit .mini-card-icon {
  color: #e6a23c;
}

.mini-card-label {
  margin-right: 8px;
  font-size: 13px;
  color: #606266;
}

.mini-card-value {
  font-size: 14px;
  font-weight: 600;
}

.mini-card.orders .mini-card-value {
  color: var(--el-color-primary);
}

.mini-card.success-orders .mini-card-value {
  color: #67c23a;
}

.mini-card.amount .mini-card-value {
  color: #f56c6c;
}

.mini-card.success-amount .mini-card-value {
  color: #909399;
}

.mini-card.profit .mini-card-value {
  color: #e6a23c;
}
</style>
