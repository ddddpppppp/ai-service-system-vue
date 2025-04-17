<route lang="yaml">
meta:
title: 配置与容器列表页
icon: i-ant-design:home-twotone
</route>

<script setup lang="ts">
import useUserStore from '@/store/modules/user.ts'
import eventBus from '@/utils/eventBus.ts'
import { WebSocketService } from '@/utils/websocket'
import { ref } from 'vue'
import BrowserListPanel from './components/BrowserListPanel.vue'
import ConfigListPanel from './components/ConfigListPanel.vue'

const userStore = useUserStore()
const browserListPanelRef = ref<InstanceType<typeof BrowserListPanel> | null>(null)
const configListPanelRef = ref<InstanceType<typeof ConfigListPanel> | null>(null)

// 加载状态
const configLoading = ref(false)
const browserLoading = ref(false)

const formMode = ref<'router' | 'dialog' | 'drawer'>('router')

const WS_KEY = 'facebook_ws'

let wsService = null

onMounted(() => {
  // Initialize the components
  browserListPanelRef.value?.getDataList()
  configListPanelRef.value?.getConfigList()

  if (formMode.value === 'router') {
    eventBus.on('get-data-list', () => {
      // Call getDataList on the BrowserListPanel component reference
      browserListPanelRef.value?.getDataList()
    })
  }
  wsService = WebSocketService.getInstance(WS_KEY, {
    token: () => userStore.token || '',
    path: '/ws_facebook/connect',
  })

  // 注册消息处理器
  wsService.registerHandler('update_instance', (data) => {
    console.log('收到聊天消息:', data)
  })

  // 发送消息
  wsService.send('send_message', { text: 'Hello' })
})

onBeforeUnmount(() => {
  if (formMode.value === 'router') {
    eventBus.off('get-data-list')
  }
  WebSocketService.destroyInstance(WS_KEY)
})

// 子组件刷新方法
function handleRefreshConfig() {
  browserListPanelRef.value?.getDataList()
}
</script>

<template>
  <div class="mt-10 w-full flex flex-col gap-1 px-4 xl:flex-row">
    <div class="w-full xl:w-2/5 xl:pr-4">
      <ConfigListPanel
        ref="configListPanelRef"
        v-model:config-loading="configLoading"
        @refresh-config="handleRefreshConfig"
      />
    </div>
    <div class="w-full xl:w-3/5 xl:pl-4">
      <BrowserListPanel
        ref="browserListPanelRef"
        v-model:loading="browserLoading"
      />
    </div>
  </div>
</template>

<style scoped>
@media (width <= 1279px) {
  .flex-col > div:first-child {
    margin-bottom: 1rem;
  }
}
</style>
