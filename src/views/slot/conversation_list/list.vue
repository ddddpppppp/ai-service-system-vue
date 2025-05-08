<route lang="yaml">
meta:
  enabled: false
</route>

<script setup lang="ts">
import apiDataManage from '@/api/modules/slot'
import { debounce } from '@/utils/helper'
import { ElMessage, ElMessageBox } from 'element-plus'
import FormMode from './detail.vue'

// 定义会话项的类型接口
interface ConversationItem {
  conversationId: string
  username?: string
  avatar?: string
  content?: string
  endTime?: string
  name?: string
  sender?: string
  unreadCount?: number
  [key: string]: any
}

defineOptions({
  name: 'SlotConversationList',
})

const { pagination, getParams } = usePagination()

// 表格是否自适应高度
const tableAutoHeight = ref(true)

// 搜索
const searchDefault = {
  nickname: '',
  channel: '',
  sender: '',
  status: '',
  content: '',
  endTime: '',
  startTime: '',
}
const search = ref({ ...searchDefault })

// 批量操作
const batch = ref({
  enable: true,
  selectionDataList: [] as ConversationItem[],
})

// 全选状态
const isAllSelected = ref(false)

// 选择模式
const selectionMode = ref(false)

// 列表
const loading = ref(false)
const dataList = ref<ConversationItem[]>([])

// 创建一个 ref 来引用容器元素
const contactContainer = ref<HTMLElement | null>(null)
const scrollThreshold = 100 // 滚动到距离底部100px内时加载更多

const statusList = ref([
  {
    label: '全部',
    value: '',
  },
  {
    label: '待清洗',
    value: 'raw',
  },
  {
    label: '已清洗',
    value: 'cleaned',
  },
  {
    label: '已标注',
    value: 'annotated',
  },
  {
    label: '已完成',
    value: 'archived',
  },
])

const senderList = ref([
  {
    label: '全部',
    value: '',
  },
  {
    label: '用户',
    value: 'user',
  },
  {
    label: '机器人',
    value: 'bot',
  },
  {
    label: '助手',
    value: 'assistant',
  },
])

// 详情
const formModeProps = ref({
  visible: false,
  id: '',
  type: 'chat' as 'annotated' | 'chat',
})

// 改用drawer控制过滤器的显示/隐藏
const filterDrawerVisible = ref(false)

// 重置过滤器
function resetFilter() {
  Object.assign(search.value, {
    nickname: '',
    channel: '',
    sender: '',
    status: '',
    content: '',
    endTime: '',
    startTime: '',
  })
}

onMounted(() => {
  if (contactContainer.value) {
    contactContainer.value.addEventListener('scroll', handleScroll)
    pagination.value.page = 1
    pagination.value.size = 20
    getDataList()
  }
})

onUnmounted(() => {
  if (contactContainer.value) {
    contactContainer.value.removeEventListener('scroll', handleScroll)
  }
})

function searchData() {
  pagination.value.page = 1
  getDataList()
}

// 使用防抖包装滚动处理函数
function handleScroll() {
  // 检查是否已经在加载或不应该触发加载
  if (!contactContainer.value || loading.value) {
    return
  }

  // 检查是否滚动到底部附近
  if (contactContainer.value.scrollTop + contactContainer.value.clientHeight >= contactContainer.value.scrollHeight - scrollThreshold) {
    // 最后一条数据了自动放弃加载
    if (dataList.value.length >= pagination.value.total || dataList.value.length === 0) {
      return
    }

    // 立即设置加载状态，防止重复触发
    loading.value = true

    // 延迟执行实际加载逻辑
    debounce(async () => {
      try {
        // 记住当前滚动位置和内容高度
        const prevScrollHeight = contactContainer.value!.scrollHeight

        // 加载更多消息
        pagination.value.page += 1
        await getDataList()

        // 等待DOM更新
        await nextTick()

        // 保持滚动位置
        const newScrollHeight = contactContainer.value!.scrollHeight
        contactContainer.value!.scrollTop = newScrollHeight - prevScrollHeight + contactContainer.value!.scrollTop
      }
      catch (error) {
        console.error('Failed to load more messages:', error)
      }
      finally {
        loading.value = false
      }
    }, 1000)()
  }
}

function getDataList() {
  loading.value = true
  const params = {
    ...getParams(),
    ...(search.value.channel && { channel: search.value.channel }),
    ...(search.value.status && { status: search.value.status }),
    ...(search.value.sender && { sender: search.value.sender }),
    ...(search.value.content && { content: search.value.content }),
    ...(search.value.startTime && { startTime: search.value.startTime }),
    ...(search.value.endTime && { endTime: search.value.endTime }),
  }
  apiDataManage.getConversationList(params).then((res: any) => {
    loading.value = false
    if (pagination.value.page === 1) {
      dataList.value = res.data.list
    }
    else {
      dataList.value = [...dataList.value, ...res.data.list]
    }
    pagination.value.total = res.data.total
  })
}

function onChatList(row: ConversationItem) {
  formModeProps.value.type = 'chat'
  formModeProps.value.id = row.conversationId
}

function onDelBatch() {
  ElMessageBox.confirm(`确认批量删除这些对话吗？删除后无法找回`, '确认信息').then(() => {
    const ids: string[] = []
    batch.value.selectionDataList.forEach((item) => {
      ids.push(item.conversationId)
    })
    apiDataManage.delConversation({ ids }).then(() => {
      getDataList()
      ElMessage.success({
        message: '删除成功',
        center: true,
      })
    })
  }).catch(() => {})
}

// 选择或取消选择一个会话
function toggleSelection(row: ConversationItem, checked: boolean) {
  if (checked) {
    batch.value.selectionDataList.push(row)
  }
  else {
    const index = batch.value.selectionDataList.findIndex(item => item.conversationId === row.conversationId)
    if (index !== -1) {
      batch.value.selectionDataList.splice(index, 1)
    }
  }
  // 检查是否所有项都被选中
  isAllSelected.value = batch.value.selectionDataList.length === dataList.value.length
}

// 检查是否选中
function isItemSelected(item: ConversationItem): boolean {
  return batch.value.selectionDataList.some(selected => selected.conversationId === item.conversationId)
}

// 全选/取消全选
function toggleSelectAll() {
  if (isAllSelected.value) {
    // 取消全选
    batch.value.selectionDataList = []
    isAllSelected.value = false
  }
  else {
    // 全选
    batch.value.selectionDataList = [...dataList.value]
    isAllSelected.value = true
  }
}

// 切换选择模式
function toggleSelectionMode() {
  selectionMode.value = !selectionMode.value

  // 退出选择模式时，清空选择
  if (!selectionMode.value) {
    batch.value.selectionDataList = []
    isAllSelected.value = false
  }
}
</script>

<template>
  <div :class="{ 'absolute-container': tableAutoHeight }">
    <FaPageHeader title="会话管理" class="mb-0" />
    <div :class="{ 'flex-1 overflow-auto': tableAutoHeight }" class="m-3 flex flex-1 flex-col overflow-auto">
      <div class="conversation-container">
        <!-- 左侧用户列表 -->
        <div class="user-list">
          <div class="user-list-header">
            <div class="search-box">
              <el-input v-model="search.nickname" placeholder="搜索联系人" clearable @keyup.enter="searchData()" />
            </div>
            <div class="filter-options">
              <!-- 批量操作图标 -->
              <el-popover
                placement="bottom"
                :width="220"
                trigger="click"
                popper-class="operations-popover"
              >
                <template #reference>
                  <FaIcon
                    class="mr-3 cursor-pointer p-t-2 text-lg"
                    name="majesticons:applications-add"
                    title="操作"
                  />
                </template>
                <div class="p-0">
                  <div class="batch-operations p-3">
                    <el-button
                      type="primary"
                      size="small"
                      class="operation-btn mb-3 w-full"
                      @click="toggleSelectionMode"
                    >
                      <div class="flex items-center justify-center">
                        <FaIcon
                          :name="selectionMode ? 'tabler:square-x' : 'tabler:select'"
                          class="mr-2"
                        />
                        {{ selectionMode ? '退出选择' : '进入选择' }}
                      </div>
                    </el-button>
                    <el-button
                      :type="isAllSelected ? 'info' : 'success'"
                      size="small"
                      class="operation-btn mb-3 w-full"
                      :disabled="!selectionMode"
                      @click="toggleSelectAll"
                    >
                      <div class="flex items-center justify-center">
                        <FaIcon
                          :name="isAllSelected ? 'tabler:square-off' : 'tabler:checkbox'"
                          class="mr-2"
                        />
                        {{ isAllSelected ? '取消全选' : '全选' }}
                      </div>
                    </el-button>
                    <el-button
                      type="danger"
                      size="small"
                      class="operation-btn w-full"
                      :disabled="batch.selectionDataList.length === 0 || !selectionMode"
                      @click="onDelBatch"
                    >
                      <div class="flex items-center justify-center">
                        <FaIcon name="tabler:trash" class="mr-2" />
                        删除选中
                      </div>
                    </el-button>
                  </div>
                </div>
              </el-popover>

              <!-- 点击图标打开抽屉 -->
              <FaIcon
                class="cursor-pointer p-t-2 text-lg filter"
                name="tabler:filter-pause"
                @click="filterDrawerVisible = true"
              />
            </div>
          </div>

          <div ref="contactContainer" v-loading.body="loading" class="user-list-content">
            <div
              v-for="(item, index) in dataList"
              :key="index"
              class="user-item"
              :class="{ active: formModeProps.id === item.conversationId }"
              @click="selectionMode ? toggleSelection(item, !isItemSelected(item)) : onChatList(item)"
            >
              <div v-if="selectionMode" class="selection-checkbox mr-2">
                <div
                  class="custom-checkbox"
                  :class="{ checked: isItemSelected(item) }"
                  @click.stop="toggleSelection(item, !isItemSelected(item))"
                >
                  <FaIcon v-if="isItemSelected(item)" name="tabler:check" class="check-icon" />
                </div>
              </div>
              <div class="user-item-content" :class="{ 'ml-2': !selectionMode }">
                <div class="user-avatar">
                  <el-avatar :size="40" :src="item.avatar">
                    {{ item.username?.charAt(0) || 'U' }}
                  </el-avatar>
                  <!-- <div v-if="item.sender === 'assistant'" class="user-type-badge">
                    机
                  </div> -->
                </div>
                <div class="user-info">
                  <div class="user-header">
                    <span class="user-name">{{ item.username || '未命名用户' }}</span>
                    <span class="message-time">{{ item.endTime }}</span>
                  </div>
                  <div class="message-preview">
                    <span class="preview-content">{{ item.content || '暂无消息' }}</span>
                    <!-- <el-badge v-if="item.unreadCount" :value="item.unreadCount" class="unread-badge" /> -->
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧聊天窗口 -->
        <div class="chat-window">
          <FormMode :conversation-id="formModeProps.id" :type="formModeProps.type" @success="getDataList" />
        </div>
      </div>
    </div>

    <!-- 使用抽屉组件来显示过滤器 -->
    <el-drawer
      v-model="filterDrawerVisible"
      title="更多筛选"
      size="400px"
      :with-header="true"
      direction="rtl"
    >
      <div class="filter-content p-3">
        <div class="filter-form">
          <div class="form-item mb-3">
            <div class="form-label mb-2">
              <span>对话状态</span>
            </div>
            <el-select v-model="search.status" placeholder="请选择对话状态" class="w-full">
              <el-option
                v-for="item in statusList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>

          <div class="form-item mb-3">
            <div class="form-label mb-2">
              <span>用户角色</span>
            </div>
            <el-select v-model="search.sender" placeholder="请选择用户角色" class="w-full">
              <el-option
                v-for="item in senderList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>

          <div class="form-item mb-3">
            <div class="form-label mb-2">
              <span>关键词</span>
            </div>
            <el-input
              v-model="search.content"
              placeholder="请输入关键词"
              clearable
              class="w-full"
            />
          </div>

          <div class="form-item mb-3">
            <div class="form-label mb-2">
              <span>关键词</span>
            </div>
            <el-input
              v-model="search.channel"
              placeholder="官媒Id"
              clearable
              class="w-full"
            />
          </div>

          <div class="form-item mb-3">
            <div class="form-label mb-2">
              <span>最后回复时间</span>
            </div>
            <el-date-picker
              v-model="search.endTime"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              class="w-full"
              placeholder="请选择时间段"
            />
          </div>

          <div class="form-item mb-3">
            <div class="form-label mb-2">
              <span>会话生成时间</span>
            </div>
            <el-date-picker
              v-model="search.startTime"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              class="w-full"
              placeholder="请选择时间段"
            />
          </div>

          <div class="mt-4 flex justify-between">
            <el-button @click="resetFilter">
              重置
            </el-button>
            <el-button type="primary" @click="searchData(); filterDrawerVisible = false">
              确定
            </el-button>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<style scoped>
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
}

.vue-json-bg {
  padding: 1rem;
  background-color: #f4f4f4;
  border-radius: 5px;
}

:deep(.highlight-text) {
  padding: 2px 0;
  font-weight: bold;
  color: #ff7d00;
  background-color: #fef9e7;
  border-radius: 2px;
}

.cursor-pointer {
  cursor: pointer;
}

.popover-message {
  padding: 4px 8px;
  margin-bottom: 6px;
  font-size: 12px;
  line-height: 1.4;
  word-break: break-word;
  white-space: pre-wrap;
  border-radius: 4px;
}

.pop-message-user {
  text-align: left;
  background-color: #f0f0f0;
}

.pop-message-assistant {
  text-align: left;
  background-color: #e1f3ff;
}

.content-preview {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.conversation-popover) {
  max-width: 500px;
  max-height: 400px;
  overflow: visible;
}

:deep(.conversation-popover .el-popover__content) {
  max-height: 400px;
  padding: 10px;
}

:deep(.el-popover.conversation-popover) {
  padding: 0;
}

.conversation-content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  max-height: 360px;
  padding: 5px;
  overflow-y: auto;
}

.conversation-container {
  position: relative;
  z-index: 1;
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #fff;  /* Ensure background is solid */
  border: 1px solid rgb(230 230 250 / 70%);  /* Subtle border for definition */
  border-radius: 8px;
}

.user-list {
  display: flex;
  flex-direction: column;
  width: 340px;
  height: 100%;
  background-color: #f9f9f9;
  border-right: 1px solid #e6e6e6;
}

.user-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-bottom: 1px solid #e6e6e6;
}

.search-box {
  flex: 1;
  margin-right: 10px;
}

.user-list-content {
  flex: 1;
  overflow-y: auto;
}

.filter-options {
  cursor: pointer;
}

.user-item {
  display: flex;
  align-items: center;
  padding: 12px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
}

.user-item:hover {
  background-color: #f5f7fa;
}

.user-item.active {
  background-color: #ecf5ff;
}

.user-item-content {
  display: flex;
  flex: 1;
  cursor: pointer;
}

.selection-checkbox {
  display: flex;
  align-items: center;
}

.user-avatar {
  position: relative;
  margin-right: 12px;
}

.user-type-badge {
  position: absolute;
  right: -2px;
  bottom: -2px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  font-size: 10px;
  color: #fff;
  background-color: #409eff;
  border-radius: 50%;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.user-name {
  width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
  white-space: nowrap;
}

.message-time {
  font-size: 12px;
  color: #909399;
}

.message-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.preview-content {
  flex: 1;
  width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  color: #606266;
  white-space: nowrap;
}

.unread-badge {
  margin-left: 5px;
}

.chat-window {
  flex: 1;
  height: 100%;
  overflow: hidden;
  box-shadow: 0 0 10px rgb(143 143 143 / 15%);  /* 添加阴影 */
}

.filter-content {
  max-height: 500px;
  overflow-y: auto;
}

.form-label {
  font-size: 14px;
  color: #606266;
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-date-editor.el-input),
:deep(.el-date-editor.el-input__wrapper) {
  width: 100%;
}

/* 抽屉内样式 */
:deep(.el-drawer__header) {
  padding: 16px 20px;
  margin-bottom: 0;
  border-bottom: 1px solid #e4e7ed;
}

:deep(.el-drawer__body) {
  padding: 0;
}

/* 批量操作 */
.batch-operations {
  display: flex;
  flex-direction: column;
}

/* 操作按钮样式 */
.operation-btn {
  height: 36px;
  font-weight: 500;
  border-radius: 4px;
  transition: all 0.25s;
}

.operation-btn:hover {
  box-shadow: 0 4px 8px rgb(0 0 0 / 12%);
  transform: translateY(-2px);
}

.operation-btn:active {
  transform: translateY(0);
}

/* flex 工具类 */
.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

/* 添加右边距 */
.mr-3 {
  margin-right: 12px;
}

.mr-2 {
  margin-right: 8px;
}

/* 确保复选框不受影响 */
:deep(.el-checkbox__input) {
  z-index: 2;
}

/* 添加自定义复选框样式 */
.custom-checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  cursor: pointer;
  border: 1px solid #dcdfe6;
  border-radius: 2px;
  transition: all 0.2s;
}

.custom-checkbox.checked {
  background-color: var(--el-color-primary);
  border-color: var(--el-color-primary);
}

.custom-checkbox .check-icon {
  font-size: 12px;
  color: white;
}

/* 添加左边距 */
.ml-4 {
  margin-left: 16px;
}

/* 操作弹窗样式 */
:deep(.operations-popover) {
  padding: 0;
  overflow: hidden;
}

:deep(.el-button+.el-button) {
  margin-left: 0;
}
</style>
