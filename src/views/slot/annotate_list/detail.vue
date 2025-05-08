<script setup lang="ts">
import type { Props } from '@/components/ChatList/ChatList.vue'
import ChatConversationList from '@/components/ChatList/ChatList.vue'
import { computed, ref, useTemplateRef } from 'vue'

const props = defineProps<{
  mode: 'dialog' | 'drawer'
  type: 'annotated' | 'chat'
} & Props>()

const emits = defineEmits<{
  success: []
}>()

const btnDisabled = ref(false)

const visible = defineModel<boolean>({
  default: false,
})

const formRef = useTemplateRef('formRef')

const title = computed(() => props.type === 'annotated' ? '会话标注' : '会话详情')

function onSubmitConversationAnnotated() {
  // submit() 为组件内部方法
  btnDisabled.value = true
  formRef.value?.submitConversationAnnotated().then(() => {
    emits('success')
    onCancel()
  }).finally(() => {
    btnDisabled.value = false
  })
}

function onCancel() {
  visible.value = false
}
</script>

<template>
  <div>
    <ElDrawer
      v-model="visible"
      :title="title"
      size="1200px"
      :close-on-click-modal="true"
      destroy-on-close
      class="conversation-drawer"
    >
      <div class="chat-main">
        <div class="chat-conversation-wrapper">
          <ChatConversationList ref="formRef" v-bind="$props" />
        </div>
      </div>

      <div v-if="type === 'annotated'" class="buttons">
        <ElButton size="large" @click="onCancel">
          取消
        </ElButton>
        <ElButton type="primary" size="large" :disabled="btnDisabled" @click="onSubmitConversationAnnotated">
          提交标注
        </ElButton>
      </div>
    </ElDrawer>
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
  height: calc(100% - 60px);
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
  border-radius: 0 0 8px 8px;
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
</style>
