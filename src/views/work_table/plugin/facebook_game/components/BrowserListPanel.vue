<script setup lang="ts">
import apiWorkTable from '@/api/modules/work_table'
import { ElMessage, ElMessageBox, ElTooltip } from 'element-plus'
import { ref } from 'vue'
import { toast } from 'vue-sonner'

defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:loading', 'refresh-data'])

const router = useRouter()

// 全选状态
const selectAllChecked = ref(false)

// 明确指定 dataList 的类型
interface DataItem {
  id: number
  name: string
  status: number
  remark: any
  checked?: boolean
  aiStatus?: number
  syncStatus?: number
  visitLoginStatus?: number
  visitRechargeStatus?: number
  syncNum?: number
  visitLoginNum?: number
  visitRechargeNum?: number
  visitStatus?: number
  agentId?: string
}
const dataList = ref<DataItem[]>([])

function getDataList() {
  emit('update:loading', true)
  const params = {}
  apiWorkTable.getChromeFacebookList(params).then((res: any) => {
    emit('update:loading', false)
    // Add additional properties to each item
    dataList.value = res.data.list.map((item: any) => ({
      ...item,
      checked: false,
    }))
    // 重置全选状态
    selectAllChecked.value = false
    for (let i: number = 0; i < res.data.list.length; i++) {
      if (res.data.list[i].status === 1) {
        window.ipcRenderer.send('start-browsers', res.data.list[i].name)
      }
    }
  })
}

function onCreate() {
  router.push({
    name: 'pluginFacebookGameDetail',
    params: {
      id: 0,
    },
  })
}

function onEdit(row: any) {
  router.push({
    name: 'pluginFacebookGameDetail',
    params: {
      id: row.id,
    },
  })
}

function onDel(row: any) {
  ElMessageBox.confirm(`确认删除「${row.remark}」吗？`, '确认信息')
    .then(() => {
      apiWorkTable.delChromeFacebook({ ids: [row.id] }).then(() => {
        window.ipcRenderer.send('delete-browsers', row.name)
        getDataList()
        ElMessage.success({
          message: '删除成功',
          center: true,
        })
      })
    })
    .catch(() => {})
}

function onEnable(row: any) {
  ElMessageBox.confirm(`确认启动「${row.remark}」吗？`, '确认信息')
    .then(() => {
      apiWorkTable.enableChromeFacebook({ ids: [row.id] }).then(() => {
        getDataList()
        ElMessage.success({
          message: '启动成功',
          center: true,
        })
      })
    })
    .catch(() => {})
}

function onDisable(row: any) {
  ElMessageBox.confirm(`确认关闭「${row.remark}」吗？`, '确认信息')
    .then(() => {
      apiWorkTable.disableChromeFacebook({ ids: [row.id] }).then(() => {
        window.ipcRenderer.send('delete-browsers', row.name)
        getDataList()
        ElMessage.success({
          message: '关闭成功',
          center: true,
        })
      })
    })
    .catch(() => {})
}

//  同步主页用户和消息
function onSyncChromeFacebook(row: any) {
  ElMessageBox.confirm(`确定创建同步主页任务吗？`, '确认信息')
    .then(() => {
      apiWorkTable.syncChromeFacebook({ ids: [row.id] }).then(() => {
        getDataList()
        ElMessage.success({
          message: '同步开始！！',
          center: true,
        })
      })
    })
    .catch(() => {})
}

function onVisit(item: any, type: string) {
  // If already running, stop it; otherwise start it
  const isRunning = type === 'login'
    ? item.visitStatus === 1
    : item.visitStatus === 2

  const status = isRunning ? 0 : (type === 'login' ? 1 : 2)
  const action = isRunning ? '停止' : '创建'
  const visitType = type === 'login' ? '促登录' : '促充值'

  ElMessageBox.confirm(`确定${action}${visitType}任务吗？`, '确认信息')
    .then(() => {
      apiWorkTable.visitChromeFacebook({
        ids: [item.id],
        type,
        status,
      })
        .then(() => {
          getDataList()
          toast.success(`${action}成功`)
        })
    })
    .catch(() => {})
}

function onSetAiStatus(item: any, status: number) {
  const statusText = status === 1 ? '启用' : '关闭'
  ElMessageBox.confirm(`确定${statusText}AI托管吗？`, '确认信息')
    .then(() => {
      apiWorkTable.setChromeFacebookAiStatus({ ids: [item.id], status })
        .then(() => {
          item.aiStatus = status
          toast.success(`${statusText}成功`)
        })
    })
    .catch(() => {})
}

function onShow(row: any) {
  window.ipcRenderer.send('show-container', row.name)
}

// 批量选择功能
function selectAll() {
  dataList.value.forEach((item) => {
    item.checked = selectAllChecked.value
  })
}

// 获取已选中的项目
function getSelectedItems() {
  return dataList.value.filter(item => item.checked)
}

// 批量操作函数
function batchOperation(operation: string) {
  const selected = getSelectedItems()
  if (selected.length === 0) {
    ElMessage.warning('请先选择实例')
    return
  }

  // 获取选中项的ID数组
  const selectedIds = selected.map(item => item.id)

  switch (operation) {
    case 'start':
      ElMessageBox.confirm(`确认批量启动选中的${selected.length}个实例吗？`, '确认信息')
        .then(() => {
          apiWorkTable.enableChromeFacebook({ ids: selectedIds }).then(() => {
            getDataList()
            ElMessage.success('批量启动成功')
          })
        })
        .catch(() => {})
      break
    case 'stop':
      ElMessageBox.confirm(`确认批量关闭选中的${selected.length}个实例吗？`, '确认信息')
        .then(() => {
          apiWorkTable.disableChromeFacebook({ ids: selectedIds }).then(() => {
            getDataList()
            ElMessage.success('批量关闭成功')
          })
        })
        .catch(() => {})
      break
    case 'sync':
      ElMessageBox.confirm(`确认为选中的${selected.length}个实例创建同步主页任务吗？`, '确认信息')
        .then(() => {
          apiWorkTable.syncChromeFacebook({ ids: selectedIds }).then(() => {
            getDataList()
            ElMessage.success('同步任务已创建')
          })
        })
        .catch(() => {})
      break
    case 'ai':
      ElMessageBox.confirm(`确认为选中的${selected.length}个实例创建AI托管任务吗？`, '确认信息')
        .then(() => {
          apiWorkTable.setChromeFacebookAiStatus({ ids: selectedIds, status: 1 }).then(() => {
            getDataList()
            ElMessage.success('AI托管任务已创建')
          })
        })
        .catch(() => {})
      break
    case 'ai_close':
      ElMessageBox.confirm(`确认关闭选中的${selected.length}个实例的AI托管吗？`, '确认信息')
        .then(() => {
          apiWorkTable.setChromeFacebookAiStatus({ ids: selectedIds, status: -1 }).then(() => {
            getDataList()
            ElMessage.success('AI托管已关闭')
          })
        })
        .catch(() => {})
      break
    case 'visit_login':
      ElMessageBox.confirm(`确认为选中的${selected.length}个实例创建促登录任务吗？`, '确认信息')
        .then(() => {
          apiWorkTable.visitChromeFacebook({ ids: selectedIds, type: 'login', status: 1 }).then(() => {
            getDataList()
            ElMessage.success('促登录任务已创建')
          })
        })
        .catch(() => {})
      break
    case 'visit_recharge':
      ElMessageBox.confirm(`确认为选中的${selected.length}个实例创建促充值任务吗？`, '确认信息')
        .then(() => {
          apiWorkTable.visitChromeFacebook({ ids: selectedIds, type: 'recharge', status: 2 }).then(() => {
            getDataList()
            ElMessage.success('促充值任务已创建')
          })
        })
        .catch(() => {})
      break
    default:
      break
  }
}

// Expose methods to parent component
defineExpose({
  getDataList,
  dataList,
})
</script>

<template>
  <FaPageMain
    class="m-0 h-92vh w-full overflow-auto"
    title-class="flex flex-wrap items-center justify-between gap-4"
  >
    <template #title>
      Facebook列表
    </template>
    <div class="button-group p-8-4 flex justify-end space-x-3">
      <div class="flex flex-grow items-center">
        <ElTooltip content="选择/取消选择所有实例" placement="top" effect="dark">
          <ElCheckbox v-model="selectAllChecked" @change="selectAll">
            全选
          </ElCheckbox>
        </ElTooltip>
      </div>
      <FaButton variant="outline" @click="onCreate">
        添加实例
      </FaButton>
      <FaButton variant="outline" @click="batchOperation('sync')">
        同步
      </FaButton>
      <FaButton variant="outline" @click="batchOperation('ai')">
        AI托管
      </FaButton>
      <FaButton variant="outline" @click="batchOperation('ai_close')">
        关闭ai
      </FaButton>
      <FaButton variant="outline" @click="batchOperation('visit_login')">
        促登录
      </FaButton>
      <FaButton variant="outline" @click="batchOperation('visit_recharge')">
        促充值
      </FaButton>
    </div>
    <div v-if="dataList.length === 0" class="flex items-center justify-center" style="height: 50vh;">
      <ElEmpty description="暂无实例，请先添加" />
    </div>
    <div v-else class="card-grid">
      <FaSpotlightCard
        v-for="(item, index) in dataList"
        :key="index"
        class="card-item relative p-0"
      >
        <!-- Status Icons -->
        <div class="absolute right-2 top-2 flex space-x-2">
          <!-- AI托管状态 -->
          <div v-if="item.aiStatus === 1" class="status-icon" title="AI托管任务进行中">
            <ElTooltip placement="top" effect="dark">
              <template #content>
                <div>
                  <div class="font-bold">
                    AI托管任务进行中
                  </div>
                  <div class="mt-1 text-xs">
                    自动回复消息并与用户交流
                  </div>
                </div>
              </template>
              <div class="i-mdi-robot animate-spin text-sm text-blue-500" />
            </ElTooltip>
          </div>
          <!-- 同步状态 -->
          <div v-if="item.syncStatus === 1" class="status-icon" title="正在同步主页数据">
            <ElTooltip placement="top" effect="dark">
              <template #content>
                <div>
                  <div class="font-bold">
                    正在同步主页数据
                  </div>
                  <div class="mt-1 text-xs">
                    已同步{{ item.syncNum }}个用户
                  </div>
                </div>
              </template>
              <div class="i-mdi-sync animate-spin text-sm text-green-500" />
            </ElTooltip>
          </div>
          <!-- 促登录状态 -->
          <div v-if="item.visitLoginStatus === 1" class="status-icon" title="促登录任务进行中">
            <ElTooltip placement="top" effect="dark">
              <template #content>
                <div>
                  <div class="font-bold">
                    促登录任务进行中
                  </div>
                  <div class="mt-1 text-xs">
                    已完成{{ item.visitLoginNum }}个用户促登录
                  </div>
                </div>
              </template>
              <div class="i-mdi-account-arrow-right animate-spin text-sm text-purple-500" />
            </ElTooltip>
          </div>
          <!-- 促充值状态 -->
          <div v-if="item.visitRechargeStatus === 1" class="status-icon" title="促充值任务进行中">
            <ElTooltip placement="top" effect="dark">
              <template #content>
                <div>
                  <div class="font-bold">
                    促充值任务进行中
                  </div>
                  <div class="mt-1 text-xs">
                    已完成{{ item.visitRechargeNum }}个用户促充值
                  </div>
                </div>
              </template>
              <div class="i-mdi-cash-multiple animate-spin text-sm text-yellow-500" />
            </ElTooltip>
          </div>
        </div>

        <div class="flex items-center p-4">
          <!-- Checkbox -->
          <div class="mr-3">
            <ElTooltip content="选择此实例进行批量操作" placement="top" effect="dark">
              <ElCheckbox v-model="item.checked" />
            </ElTooltip>
          </div>
          <div class="mr-3 h-10 w-10 flex-shrink-0">
            <FaIcon name="logos:facebook" style="font-size: 40px;" />
          </div>
          <div>
            <div class="text-sm font-medium">
              {{ item.name }}
            </div>
            <div class="item-remark mt-2 text-xs">
              <ElTag type="success">
                代理id:{{ item.agentId }}
              </ElTag>
              <ElTag type="warning" class="ml-2">
                备注:{{ item.remark }}
              </ElTag>
            </div>
          </div>
        </div>
        <div class="no-gap-buttons flex border-t">
          <ElButton
            v-if="item.status === -1"
            class="button-no-gap flex-1 border-0 rounded-none"
            @click="onEnable(item)"
          >
            启动
          </ElButton>
          <ElButton
            v-else
            class="button-no-gap flex-1 border-0 rounded-none"
            @click="onDisable(item)"
          >
            关闭
          </ElButton>
          <ElButton v-if="item.status === 1" class="button-no-gap flex-1 border-0 rounded-none" @click="onShow(item)">
            窗口
          </ElButton>
          <ElDropdown class="button-no-gap flex-1">
            <ElButton class="button-no-gap dropdown-button no-hover-border w-full border-0 rounded-none">
              更多
            </ElButton>
            <template #dropdown>
              <ElDropdownMenu>
                <ElDropdownItem v-if="item.aiStatus === 1" @click="onSetAiStatus(item, 1)">
                  AI托管
                </ElDropdownItem>
                <ElDropdownItem v-else @click="onSetAiStatus(item, -1)">
                  关闭AI
                </ElDropdownItem>
                <ElDropdownItem @click="onEdit(item)">
                  编辑
                </ElDropdownItem>
                <ElDropdownItem @click="onSyncChromeFacebook(item)">
                  抓取信息
                </ElDropdownItem>
                <ElDropdownItem @click="onVisit(item, 'login')">
                  {{ item.visitStatus === 1 ? '停止促登录' : '促登录任务' }}
                </ElDropdownItem>
                <ElDropdownItem @click="onVisit(item, 'recharge')">
                  {{ item.visitStatus === 2 ? '停止促充值' : '促充值任务' }}
                </ElDropdownItem>
                <ElDropdownItem @click="onDel(item)">
                  删除
                </ElDropdownItem>
              </ElDropdownMenu>
            </template>
          </ElDropdown>
        </div>
      </FaSpotlightCard>
    </div>
  </FaPageMain>
</template>

<style scoped>
/* Override Element Plus styles with very high specificity */
:deep(.el-dropdown .el-button.button-no-gap.dropdown-button),
:deep(.el-dropdown .el-button.button-no-gap.dropdown-button:hover),
:deep(.el-dropdown .el-button.button-no-gap.dropdown-button:focus),
:deep(.el-dropdown .el-button.button-no-gap.dropdown-button:active) {
  outline: none !important;
  border: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}

.button-group {
  gap: 12px;
}

.button-group .fa-button {
  transition: all 0.2s ease;
}

.p-8-4 {
  padding: 2rem 1rem;
}

.status-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 15px;
  height: 15px;
  background-color: rgb(255 255 255 / 80%);
  border-radius: 50%;
  box-shadow: 0 1px 3px rgb(0 0 0 / 10%);
}

.animate-spin {
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.h-92vh {
  height: 92vh;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  grid-auto-rows: auto;
  grid-gap: 16px;
}

.card-item {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 270px;
  max-width: 295px;
  height: 100%;
  margin: 0 auto;
}

/* Extra small devices */
@media (width <= 576px) {
  .card-grid {
    grid-template-columns: 1fr;
  }

  .card-item {
    max-width: 100%;
  }
}

@media (width >= 768px) {
  .card-grid {
    grid-template-columns: repeat(auto-fill, minmax(265px, 1fr));
  }
}

@media (width >= 1200px) {
  .card-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (width >= 1600px) {
  .card-grid {
    grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  }
}

.no-gap-buttons {
  display: flex;
  width: 100%;
}

.button-no-gap {
  padding: 0;
  margin: 0;
  border-right: 1px solid #ebeef5;
  border-radius: 0;
}

.button-no-gap:last-child {
  border-right: none;
}

:deep(.el-dropdown-menu__item) {
  padding: 5px 20px;
  line-height: 1.5;
}

:deep(.el-button+.el-button) {
  margin-left: 0;
}

/* Direct style for the dropdown button */
.no-hover-border {
  border: 0 !important;
}

.no-hover-border:hover,
.no-hover-border:focus,
.no-hover-border:active {
  outline: none !important;
  border: 0 !important;
  box-shadow: none !important;
}

.dropdown-button:hover {
  border: none !important;
  box-shadow: none !important;
}

:deep(.el-dropdown .el-button:focus-visible) {
  border: none !important;
  box-shadow: none !important;
}

:deep(.el-dropdown .el-button:hover) {
  border: none !important;
  box-shadow: none !important;
}

/* Override Element Plus specific hover styles */
:deep(.el-button--default:not(.is-disabled):hover) {
  color: #606266;
  background-color: transparent;
  border: none !important;
}

:deep(.el-button--default:not(.is-disabled):focus) {
  color: #606266;
  background-color: transparent;
  border: none !important;
}

/* Ensure dropdown trigger elements have no border on hover */
:deep(.el-dropdown-link:hover),
:deep(.el-dropdown-menu__item:hover) {
  background-color: #f5f7fa;
  border: none !important;
}

/* Tooltip customization */
:deep(.el-tooltip__popper.is-dark) {
  padding: 8px 12px;
  font-size: 12px;
  line-height: 1.4;
  background-color: rgb(50 50 50 / 95%);
  border-radius: 4px;
}

:deep(.el-tooltip__popper[data-popper-placement^="top"] .el-popper__arrow) {
  border-top-color: rgb(50 50 50 / 95%);
}

.item-remark {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
