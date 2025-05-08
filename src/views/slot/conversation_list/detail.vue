<script setup lang="ts">
import ChatConversationList from '@/components/ChatList/ChatList.vue'
import { fileToBase64 } from '@/utils/file'
import { computed, ref, useTemplateRef } from 'vue'

defineProps({
  conversationId: {
    type: [String, Number],
    default: '',
  },
  // ... 其他可能的属性
})

const formRef = useTemplateRef('formRef')

// 新消息输入
const messageInput = ref<HTMLElement | null>(null)
const messageText = ref('')

// 图片相关
const hasImageInClipboard = ref(false)
const clipboardImage = ref<File | null>(null)
const showImageConfirm = ref(false)

// 计算图片预览URL
const imagePreviewUrl = computed(() => {
  if (clipboardImage.value) {
    return window.URL.createObjectURL(clipboardImage.value)
  }
  return ''
})

function handleInput(event: Event) {
  // 监听contenteditable输入
  messageText.value = (event.target as HTMLElement).textContent || ''
}

// 发送消息
function sendMessage() {
  if (!messageText.value.trim() && !clipboardImage.value) {
    return
  }

  // 这里可以添加发送消息的逻辑
  if (clipboardImage.value) {
    fileToBase64(clipboardImage.value).then((base64) => {
      formRef.value?.sendMessage({ type: 'image', content: base64 }).then(() => {
      }).finally(() => {
      })
    })
    // 清空图片
    clipboardImage.value = null
    hasImageInClipboard.value = false
    // 关闭确认框
    showImageConfirm.value = false
  }
  else if (messageText.value.trim()) {
    formRef.value?.sendMessage({ type: 'text', content: messageText.value }).then(() => {
    }).finally(() => {
    })
    // 清空输入框
    if (messageInput.value) {
      messageInput.value.textContent = ''
      messageText.value = ''
    }
  }
}

// 监听粘贴事件
function handlePaste(event: ClipboardEvent) {
  // 阻止默认粘贴行为
  if (event.clipboardData && event.clipboardData.items) {
    const items = event.clipboardData.items

    // 检查是否有图片
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.includes('image')) {
        // 阻止默认粘贴行为
        event.preventDefault()

        // 获取图片文件
        const file = items[i].getAsFile()
        if (file) {
          clipboardImage.value = file
          hasImageInClipboard.value = true
          showImageConfirm.value = true
        }
        return
      }
    }
  }
}

// 取消发送图片
function cancelSendImage() {
  clipboardImage.value = null
  hasImageInClipboard.value = false
  showImageConfirm.value = false
}

// 监听键盘事件，按下Enter发送消息，按下Ctrl+Enter或Command+Enter换行
function handleKeydown(event: KeyboardEvent) {
  // 按下Ctrl+Enter或Command+Enter插入换行
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault() // 阻止默认行为

    // 手动插入换行符
    document.execCommand('insertLineBreak')

    // 确保内容更新
    messageText.value = messageInput.value?.textContent || ''
    return
  }

  // 按下Enter发送消息
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault() // 阻止默认行为（换行）
    sendMessage()
  }
}
</script>

<template>
  <div class="chat-main">
    <template v-if="$props.conversationId">
      <div class="chat-conversation-wrapper">
        <ChatConversationList ref="formRef" v-bind="$props" />
      </div>

      <!-- 仅在type为chat时显示输入框 -->
      <div class="chat-input-container">
        <div
          ref="messageInput"
          class="chat-input"
          contenteditable="true"
          placeholder="请输入消息..."
          @input="handleInput"
          @keydown="handleKeydown"
          @paste="handlePaste"
        />
        <div class="chat-input-actions">
          <el-tooltip content="发送消息 (Enter)" placement="top">
            <el-button
              class="send-button"
              type="primary"
              circle
              :disabled="!messageText.trim() && !hasImageInClipboard"
              @click="sendMessage"
            >
              <FaIcon name="i-ph:paper-plane-right-fill" />
            </el-button>
          </el-tooltip>
        </div>
      </div>
    </template>

    <!-- 当没有选择对话时显示空状态提示 -->
    <el-empty v-else description="请选择一个对话" class="empty-placeholder" />

    <!-- 图片确认对话框 -->
    <el-dialog
      v-model="showImageConfirm"
      title="发送图片"
      width="300px"
      :close-on-click-modal="false"
      class="image-confirm-dialog"
    >
      <div class="image-confirm-content">
        <div v-if="clipboardImage" class="image-preview">
          <el-image :src="imagePreviewUrl" fit="contain" />
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelSendImage">取消</el-button>
          <el-button type="primary" @click="sendMessage">发送</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.buttons {
  position: absolute;
  right: 20px;
  bottom: 20px;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

/* 修改 ElDrawer 的 header 高度 */
:deep(.conversation-drawer .el-drawer__header) {
  min-height: 40px; /* 设置最小高度 */
  padding: 10px 20px; /* 减小顶部高度，默认是 20px */
  margin-bottom: 0;
}

:deep(.conversation-drawer .el-drawer__body) {
  height: calc(100% - 60px); /* 为抽屉内容预留高度 */
  padding-top: 10px; /* 减小抽屉内容区域的上边距 */
  overflow: hidden; /* 防止内容溢出 */
}

.chat-main {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-conversation-wrapper {
  flex: 1;
  min-height: 0; /* 关键：允许容器缩小到小于内容的高度 */
  overflow: hidden; /* 确保内容不会溢出 */
}

.chat-input-container {
  display: flex;
  flex-shrink: 0; /* 防止输入框被压缩 */
  gap: 10px;
  align-items: center;
  padding: 16px;
  background-color: #fff;
  border-radius: 0;
}

.chat-input {
  flex: 1;
  min-height: 40px;
  max-height: 120px;
  padding: 10px 16px;
  overflow-y: auto;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
  outline: none;
  background-color: #f4f4f5;
  border-radius: 8px;
}

.chat-input:empty::before {
  color: #909399;
  content: attr(placeholder);
}

.chat-input:focus {
  background-color: #f0f0f0;
}

.chat-input-actions {
  display: flex;
  align-items: center;
}

.send-button {
  font-size: 16px;
}

/* 确保ChatConversationList内部的滚动正常工作 */
:deep(.chat-conversation-wrapper .chat-container) {
  height: 100%;
  overflow: auto;
}

/* 图片确认对话框样式 */
.image-confirm-content {
  text-align: center;
}

.image-preview {
  max-height: 200px;
  margin: 15px 0;
  overflow: hidden;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.image-preview img {
  max-width: 100%;
  max-height: 180px;
  object-fit: contain;
}

.image-preview :deep(.el-image) {
  display: flex;
  justify-content: center;
  width: 100%;
  height: auto;
  max-height: 180px;
}

.image-preview :deep(.el-image__inner) {
  max-width: 100%;
  max-height: 180px;
  object-fit: contain;
}

.dialog-footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

/* 添加空状态提示的样式 */
.empty-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
