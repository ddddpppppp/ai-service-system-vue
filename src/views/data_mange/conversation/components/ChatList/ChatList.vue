<script setup lang="ts">
import apiDataManage from '@/api/modules/data_manage'
import avatar from '@/assets/images/avatar.png'
// Create a simple date formatter function since we don't have access to @/utils/format
import { Loading } from '@element-plus/icons-vue'

import { ElMessage } from 'element-plus'
import MessageAnnotation from './components/MessageAnnotation.vue'

export interface Props {
  conversationId?: number | string
  type?: 'annotated' | 'chat'
}

const props = withDefaults(defineProps<Props>(), {
  conversationId: '',
  type: 'chat',
})

const annotationsMap = ref<Record<string, any[]>>({})

const loading = ref(false)
const messages = ref<any[]>([])
const conversation = ref<any>({})

// Mock categories for dropdown selection
const labelOptions = ref([])

onMounted(() => {
  if (props.conversationId) {
    getConversationDetail()
  }
})

// Simple date formatter function
function formatDateTime(dateStr: string): string {
  if (!dateStr) {
    return ''
  }

  try {
    const date = new Date(dateStr)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }
  catch {
    // Ignore error and return original string
    return dateStr
  }
}

// Fetch conversation details
function getConversationDetail() {
  loading.value = true
  apiDataManage.getConversation({ id: props.conversationId }).then((res: any) => {
    loading.value = false
    if (res.status === 1) {
      conversation.value = res.data.conversation || {}
      messages.value = res.data.messages || []
      labelOptions.value = res.data.labels || []
    }
    else {
      ElMessage.error({
        message: res.statusText || '获取会话详情失败',
        center: true,
      })
    }
  }).catch(() => {
    loading.value = false
    ElMessage.error({
      message: '获取会话详情失败',
      center: true,
    })
  })
}

defineExpose({
  submitConversationAnnotated() {
    return new Promise<void>((resolve, reject) => {
      apiDataManage.submitConversationAnnotated({ id: props.conversationId, annotations: annotationsMap.value }).then((res: any) => {
        loading.value = false
        if (res.status === 1) {
          ElMessage.success({
            message: res.statusText || '标注会话成功',
            center: true,
          })
        }
        else {
          ElMessage.error({
            message: res.statusText || '标注会话失败',
            center: true,
          })
        }
        resolve()
      }).catch(() => {
        loading.value = false
        ElMessage.error({
          message: '标注会话失败',
          center: true,
        })
        reject(new Error('标注会话失败'))
      })
    })
  },
})

// Get message sender class
function getMessageClass(sender: string) {
  return sender === 'user' ? 'chat-message-user' : 'chat-message-assistant'
}

// Get sender name
function getSenderName(sender: string) {
  return sender === 'user' ? conversation.value.username : '助手'
}

function trim(text: string) {
  return text.trim()
}

function updateAnnotations(messageId: string, annotations: any) {
  annotationsMap.value[messageId] = annotations
}
</script>

<template>
  <div v-loading="loading" class="chat-container">
    <div class="chat-messages-container">
      <div v-if="!messages.length" class="chat-empty-state">
        <el-empty description="暂无会话记录" />
      </div>
      <template v-else>
        <div v-for="(message, index) in messages" :key="index" class="chat-message-wrapper">
          <!-- 根据发送者类型调整布局 -->
          <div class="chat-row" :class="{ 'chat-row-reverse': message.senderRole === 'assistant' }">
            <!-- 消息内容 -->
            <div class="message-column">
              <div class="chat-message" :class="getMessageClass(message.senderRole)">
                <div class="message-avatar">
                  <el-avatar :size="40" :src="avatar" />
                </div>
                <div class="message-content">
                  <div class="message-header">
                    <span class="sender-name">{{ getSenderName(message.senderRole) }}</span>
                  </div>
                  <div class="message-body">
                    <div v-if="trim(message.textContent)">
                      {{ trim(message.textContent) }}
                    </div>
                    <div v-if="message.attachment">
                      <el-image
                        :src="message.attachment"
                        alt="image"
                        fit="contain"
                        :preview-src-list="[message.attachment]"
                        loading="lazy"
                        style="max-width: 400px; max-height: 400px;"
                        class="message-image"
                      >
                        <template #placeholder>
                          <div class="image-slot">
                            <el-icon><Loading /></el-icon>
                            <span>加载中...</span>
                          </div>
                        </template>
                        <template #error>
                          <div class="image-slot">
                            <FaIcon name="i-ph:image-broken-duotone" />
                            <span>加载失败</span>
                          </div>
                        </template>
                      </el-image>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 时间显示 - 框外显示，根据发送者对齐 -->
              <div
                v-if="message.createdAt"
                class="message-time"
                :class="{ 'time-right': message.senderRole === 'assistant', 'time-left': message.senderRole === 'user' }"
              >
                {{ formatDateTime(message.createdAt) }}
              </div>
            </div>

            <!-- 用户消息时，标注区在右侧 -->
            <MessageAnnotation
              v-if="props.type === 'annotated' && message.annotations.length > 0"
              :annotations="message.annotations"
              :label-options="labelOptions"
              :message-id="String(message.messageId)"
              @update:annotations="updateAnnotations"
            />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 95%;
  background-color: #f9fafb;
  border-radius: 8px;
}

.chat-messages-container {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  overflow: scroll;
  overflow-y: auto;
}

.chat-empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.chat-message-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 16px;
}

.chat-row {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  width: 100%;

  .message-column {
    display: flex;
    flex-direction: column;
    max-width: 60%;
  }
}

.chat-row-reverse {
  flex-direction: row-reverse;
}

.chat-message {
  display: flex;
  gap: 12px;
  width: 100%;

  &.chat-message-user {
    align-self: flex-start;
    min-width: 200px;

    .message-content {
      background-color: #fff;
      border-radius: 2px 10px 10px;
    }
  }

  &.chat-message-assistant {
    flex-direction: row-reverse;
    align-self: flex-end;
    min-width: 200px;

    .message-content {
      background-color: #e1f3ff;
      border-radius: 10px 2px 10px 10px;

      .message-header {
        flex-direction: row-reverse;
      }
    }
  }
}

.message-avatar {
  flex-shrink: 0;
}

.message-content {
  display: flex;
  flex-direction: column;
  padding: 12px 16px;
  box-shadow: 0 2px 4px rgb(0 0 0 / 5%);
}

.message-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;

  .sender-name {
    font-size: 14px;
    font-weight: 600;
  }
}

.message-body {
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
  white-space: pre-wrap;
}

.message-time {
  margin-top: 6px;
  font-size: 11px;
  color: #909399;

  &.time-right {
    align-self: flex-end;
    margin-right: 52px;
  }

  &.time-left {
    align-self: flex-start;
    margin-left: 52px;
  }
}

.message-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

:deep(.image-slot) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 30px;
  color: #909399;
}
</style>
