import type { Iframe } from '#/global'
import useSettingsStore from './settings'

const useIframeStore = defineStore(
  // 唯一ID
  'iframe',
  () => {
    const settingsStore = useSettingsStore()

    const list = ref<Iframe.recordRaw[]>([])
    const recentPathList = ref<Iframe.recordRaw['path'][]>([])
    const openedList = computed(() => list.value.filter(item => item.isOpen))

    // 关闭加载状态
    function closeLoading(path: string) {
      const index = list.value.findIndex(item => item.path === path)
      if (index > -1) {
        list.value[index].isLoading = false
      }
    }
    // 打开 iframe
    function open(data: {
      path: Iframe.recordRaw['path']
      src: Iframe.recordRaw['src']
      title?: Iframe.recordRaw['title']
    }) {
      if (!list.value.some(item => item.path === data.path)) {
        list.value.push({
          ...data,
          isOpen: false,
          isLoading: true,
        })
      }
      const item = list.value.find(item => item.path === data.path)
      if (item) {
        item.isOpen = true
        const index = recentPathList.value.findIndex(item => item === data.path)
        if (index === -1) {
          recentPathList.value.unshift(data.path)
        }
        else if (index > 0) {
          // 置顶
          recentPathList.value.unshift(recentPathList.value.splice(index, 1)[0])
        }
      }
      // 最大缓存数量检测，超过缓存数量则关闭最早打开的 iframe
      let count = 0
      recentPathList.value.forEach((item) => {
        if (list.value.find(v => v.path === item)?.isOpen) {
          count++
        }
        if (count > settingsStore.settings.mainPage.iframeCacheMax) {
          const index = list.value.findIndex(v => v.path === item)
          if (index > -1) {
            list.value[index].isOpen = false
            list.value[index].isLoading = true
          }
        }
      })
    }
    // 关闭 iframe
    function close(path: string | string[]) {
      if (typeof path === 'string') {
        const index = list.value.findIndex(item => item.path === path)
        if (index > -1) {
          list.value[index].isOpen = false
          list.value[index].isLoading = true
        }
        recentPathList.value = recentPathList.value.filter(item => item !== path)
      }
      else {
        path.forEach((item) => {
          const index = list.value.findIndex(v => v.path === item)
          if (index > -1) {
            list.value[index].isOpen = false
            list.value[index].isLoading = true
          }
          recentPathList.value = recentPathList.value.filter(v => v !== item)
        })
      }
    }

    return {
      openedList,
      closeLoading,
      open,
      close,
    }
  },
)

export default useIframeStore
