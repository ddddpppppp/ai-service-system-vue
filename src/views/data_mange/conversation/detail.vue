<script setup lang="ts">
import type { Props } from './components/ChatList/ChatList.vue'
import ChatConversationList from './components/ChatList/ChatList.vue'

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

function onSubmit() {
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
      :close-on-click-modal="false"
      destroy-on-close
      class="conversation-drawer"
    >
      <ChatConversationList ref="formRef" v-bind="$props" />
      <div class="buttons">
        <ElButton size="large" @click="onCancel">
          取消
        </ElButton>
        <ElButton v-if="type === 'annotated'" type="primary" size="large" :disabled="btnDisabled" @click="onSubmit">
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
  padding-top: 10px; /* 减小抽屉内容区域的上边距 */
}
</style>
