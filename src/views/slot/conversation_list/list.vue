<route lang="yaml">
  meta:
    enabled: false
  </route>

<script setup lang="ts">
import type { WebSocketService } from '@/utils/WebSocketService'
import apiDataManage from '@/api/modules/slot'
// 导入事件总线
import eventBus from '@/utils/eventBus'
// import { debounce } from '@/utils/helper'
import { ElMessage, ElMessageBox } from 'element-plus'
// 按需导入 Scroll 组件
import { Scroll } from 'view-ui-plus'
import { inject, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import FormMode from './detail.vue'
// 如果需要样式，可以单独导入
import 'view-ui-plus/dist/styles/viewuiplus.css'

defineOptions({
  name: 'SlotConversationList',
})
// 获取全局 WebSocket 服务
const wsServiceProvider = inject<{ instance: WebSocketService | null }>('wsService')
const wsService = wsServiceProvider?.instance

// 获取路由对象
const route = useRoute()

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

const { pagination, getParams } = usePagination()

// 表格是否自适应高度
const tableAutoHeight = ref(true)

const loading = ref(false)
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
const dataList = ref<ConversationItem[]>([])

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

// 主页列表
const channelList = ref([] as any[])

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
  pagination.value.page = 1
  pagination.value.size = 20

  if (route.query.channel) {
    search.value.channel = route.query.channel as string
  }
  getDataList()

  getChannelList()
  // 添加事件监听
  eventBus.on('message-sent', handleMessageSent)
  onReceiveMessage()
})

// 监听路由参数变化
watch(() => route.query.channel, (newChannel) => {
  console.log(newChannel)
  if (newChannel) {
    search.value.channel = newChannel as string
    // 重置分页并重新加载数据
    pagination.value.page = 1
    getDataList()
  }
})

onUnmounted(() => {
  // 移除事件监听
  eventBus.off('message-sent', handleMessageSent)
})

function searchData() {
  pagination.value.page = 1
  getDataList()
}

// 修改为使用 Scroll 组件的方式
function handleReachBottom() {
  return new Promise((resolve) => {
    // 检查是否已经在加载或不应该触发加载
    // 最后一条数据了自动放弃加载
    if (dataList.value.length >= pagination.value.total || dataList.value.length === 0) {
      return
    }
    // 加载更多消息
    pagination.value.page += 1
    getDataList()
    resolve(true)
  })
}

function getDataList() {
  const params = {
    ...getParams(),
    ...(search.value.nickname && { nickname: search.value.nickname }),
    ...(search.value.channel && { channel: search.value.channel }),
    ...(search.value.status && { status: search.value.status }),
    ...(search.value.sender && { sender: search.value.sender }),
    ...(search.value.content && { content: search.value.content }),
    ...(search.value.startTime && { startTime: search.value.startTime }),
    ...(search.value.endTime && { endTime: search.value.endTime }),
  }
  loading.value = true
  apiDataManage.getConversationList(params).then((res: any) => {
    if (pagination.value.page === 1) {
      dataList.value = res.data.list
    }
    else {
      dataList.value = [...dataList.value, ...res.data.list]
    }
    pagination.value.total = res.data.total
  }).finally(() => {
    loading.value = false
  })
}

function getChannelList() {
  apiDataManage.getAllChromeFacebook({}).then((res: any) => {
    channelList.value = res.data.list
  })
}

function onChatList(row: ConversationItem) {
  row.unreadMessageCount = 0
  formModeProps.value.type = 'chat'
  formModeProps.value.id = row.conversationId
  apiDataManage.readAllMsg({ sessionId: row.sessionId })
}

function onReadBatch() {
  ElMessageBox.confirm(`确认批量已读这些对话吗？`, '确认信息').then(() => {
    const ids: string[] = []
    batch.value.selectionDataList.forEach((item) => {
      ids.push(item.sessionId)
    })
    apiDataManage.readAllMsg({ ids }).then(() => {
      getDataList()
      ElMessage.success({
        message: '已读成功',
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

// 添加一个日期格式化函数
function formatDateTime(dateTimeStr: string): string {
  if (!dateTimeStr) {
    return ''
  }

  const date = new Date(dateTimeStr)
  const month = date.getMonth() + 1 // 月份从0开始
  const day = date.getDate()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')

  return `${month}-${day} ${hours}:${minutes}`
}

// 处理消息发送事件，将用户置顶
function handleMessageSent(data: { conversationId: string, message: any }) {
  // 找到对应的会话
  const index = dataList.value.findIndex(item => Number.parseInt(item.conversationId) === Number.parseInt(data.conversationId))

  if (index !== -1) {
    // 找到了会话，将其从当前位置移除
    const conversation = dataList.value[index]

    // 更新会话的最新消息内容和时间
    conversation.content = data.message.textContent || '[图片]'
    conversation.endTime = formatDateTime(data.message.sentAt)

    // 从数组中移除
    dataList.value.splice(index, 1)

    // 添加到数组开头（置顶）
    dataList.value.unshift(conversation)

    return conversation
  }

  return null
}

function onReceiveMessage() {
  wsService?.on('game_new_message', (event) => {
    try {
      let data = JSON.parse(event.data)
      data = data.data

      // 处理新消息：更新会话列表并置顶
      if (data && data.conversationId) {
        // 构造与handleMessageSent兼容的数据格式
        const messageData = {
          conversationId: data.conversationId,
          message: {
            textContent: data.textContent,
            sentAt: data.sentAt,
            contentType: data.contentType,
          },
        }

        // 复用handleMessageSent方法进行置顶操作
        const conversation = handleMessageSent(messageData)
        // 如果找到了会话，更新未读消息计数
        if (conversation) {
          // 如果当前打开的会话就是收到消息的会话，则将消息添加到聊天列表
          if (Number.parseInt(formModeProps.value.id) === Number.parseInt(data.conversationId)) {
            // 通过事件总线通知ChatList组件添加新消息
            eventBus.emit('new-message-received', data)
            apiDataManage.readAllMsg({ sessionId: data.sessionId })
          }
          else if (Number.parseInt(data.isRead) === -1) {
            // 未读消息数+1
            if (!conversation.unreadMessageCount) {
              conversation.unreadMessageCount = 0
            }
            conversation.unreadMessageCount += 1
          }
        }
        // 如果没有找到会话，创建一个新的会话并置顶
        else {
          // 创建新会话对象
          const newConversation = {
            conversationId: data.conversationId,
            sessionId: data.sessionId,
            username: data.username || '未命名用户',
            avatar: data.avatar || '',
            content: data.textContent || (data.contentType === 'image' ? '[图片]' : ''),
            endTime: formatDateTime(data.sentAt),
            unreadMessageCount: 1,
            sender: data.senderRole,
          }

          // 添加到数组开头（置顶）
          dataList.value.unshift(newConversation)
        }
      }
    }
    catch (error) {
      console.error('Failed to process new message:', error)
      ElMessage.error({
        message: 'Unknown error occurred',
        center: true,
      })
    }
  })
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
                      type="success"
                      size="small"
                      class="operation-btn w-full"
                      :disabled="batch.selectionDataList.length === 0 || !selectionMode"
                      @click="onReadBatch"
                    >
                      <div class="flex items-center justify-center">
                        <FaIcon name="tabler:check" class="mr-2" />
                        已读
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

          <div v-loading="loading" class="user-list-content">
            <!-- 替换为 Scroll 组件 -->
            <Scroll
              loading-text="loading..."
              :on-reach-bottom="handleReachBottom"
              :distance-to-edge="10"
            >
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
                      <el-badge v-if="item.unreadMessageCount" :value="item.unreadMessageCount" class="unread-badge" />
                    </div>
                  </div>
                </div>
              </div>
              <!-- <div v-if="loading" class="loading-more py-2 text-center">
                加载更多...
              </div> -->
            </Scroll>
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
              <span>主页</span>
            </div>
            <el-select v-model="search.channel" placeholder="请选择主页" class="w-full" clearable>
              <el-option v-for="item in channelList" :key="item.channelId" :label="item.name" :value="item.channelId" />
            </el-select>
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
    position: relative;
    display: flex; /* 添加flex布局 */
    flex: 1;
    flex-direction: column; /* 垂直方向布局 */
    height: 100%; /* 修改为100%，让它填满父容器的剩余空间 */
  }

  /* 确保Scroll组件占满整个容器 */
  .user-list-content :deep(.ivu-scroll-container) {
    height: 100% !important;
  }

  .user-list-content :deep(.ivu-scroll-wrapper) {
    height: 100% !important;
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
    width: 245px;
  }

  .preview-content {
    flex: 1;
    width: 205px;
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

  /* 添加 Scroll 组件相关样式 */
  .loading-more {
    padding: 10px 0;
    font-size: 12px;
    color: #909399;
    text-align: center;
  }

  /* 调整徽标位置 */
  :deep(.unread-badge .el-badge__content) {
    transform: translateY(30%);  /* 垂直居中 */
  }
  </style>
