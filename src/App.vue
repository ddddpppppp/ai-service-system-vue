<script setup lang="ts">
import useSettingsStore from '@/store/modules/settings'
import useUserStore from '@/store/modules/user'
import dayjs from '@/utils/dayjs'
import { ua } from '@/utils/ua'
import WebSocketService from '@/utils/WebSocketService'
import { ElMessage } from 'element-plus'
import { provide } from 'vue'
import { useI18n } from 'vue-i18n'
import Provider from './ui/provider/index.vue'
import 'dayjs/locale/en'
import 'dayjs/locale/zh-cn'
import 'dayjs/locale/zh-tw'

const route = useRoute()
const settingsStore = useSettingsStore()
const userStore = useUserStore()

let wsService: WebSocketService | null = null

provide('wsService', {
  get instance() { return wsService },
})

const { locale } = useI18n()
const { auth } = useAuth()
const { generateI18nTitle } = useMenu()

document.body.setAttribute('data-os', ua.getOS().name || '')

const isAuth = computed(() => {
  return route.matched.every((item) => {
    return auth(item.meta.auth ?? '')
  })
})

watch([
  () => settingsStore.settings.app.enableDynamicTitle,
  () => settingsStore.title,
  () => settingsStore.customTitleList,
  () => settingsStore.lang,
], () => {
  nextTick(() => {
    if (settingsStore.settings.app.enableDynamicTitle && settingsStore.title) {
      const title = settingsStore.customTitleList.find(item => item.fullPath === route.fullPath)?.title || generateI18nTitle(settingsStore.title)
      document.title = `${title} - ${import.meta.env.VITE_APP_TITLE}`
    }
    else {
      document.title = import.meta.env.VITE_APP_TITLE
    }
  })
}, {
  immediate: true,
  deep: true,
})

onMounted(() => {
  settingsStore.setMode(document.documentElement.clientWidth)
  window.addEventListener('resize', () => {
    settingsStore.setMode(document.documentElement.clientWidth)
  })

  wsService = WebSocketService.getInstance('ws', {
    token: () => userStore.token || '',
    path: '/ws/connect',
  })
  wsService.on('error', (event) => {
    try {
      const data = JSON.parse(event.data)
      ElMessage.error({
        message: data.error_message,
        center: true,
      })
    }
    catch {
      ElMessage.error({
        message: 'Unknown error occurred',
        center: true,
      })
    }
  })
})

watch(() => userStore.token, (newToken) => {
  if (!newToken && wsService) {
    wsService.close()
  }
  else if (newToken && wsService) {
    wsService.connect()
  }
})

onUnmounted(() => {
  if (wsService) {
    wsService.close()
  }
})

watch(() => settingsStore.lang, () => {
  locale.value = settingsStore.lang
})

watch(() => settingsStore.lang, () => {
  switch (settingsStore.lang) {
    case 'zh-cn':
      dayjs.locale('zh-cn')
      break
    case 'zh-tw':
      dayjs.locale('zh-tw')
      break
    case 'en':
      dayjs.locale('en')
      break
  }
}, {
  immediate: true,
})
</script>

<template>
  <Provider>
    <RouterView v-slot="{ Component }">
      <component :is="Component" v-if="isAuth" />
      <FaNotAllowed v-else />
    </RouterView>
    <FaBackToTop />
    <FaLoginAgain />
    <FaCheckUpdates />
    <FaToast />
    <FaNotification />
    <FaSystemInfo />
  </Provider>
</template>
