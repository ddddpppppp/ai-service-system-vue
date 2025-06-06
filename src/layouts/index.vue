<script setup lang="ts">
import { useSlots } from '@/slots'
import useKeepAliveStore from '@/store/modules/keepAlive'
import useMenuStore from '@/store/modules/menu'
import useSettingsStore from '@/store/modules/settings'
import useWatermarkStore from '@/store/modules/watermark'
import eventBus from '@/utils/eventBus'
import { useTimeoutFn } from '@vueuse/core'
import hotkeys from 'hotkeys-js'
import AppSetting from './components/AppSetting/index.vue'
import Header from './components/Header/index.vue'
import HotkeysIntro from './components/HotkeysIntro/index.vue'
import MainSidebar from './components/MainSidebar/index.vue'
import Preferences from './components/Preferences/index.vue'
import SubSidebar from './components/SubSidebar/index.vue'
import Topbar from './components/Topbar/index.vue'
import IframeView from './components/views/iframe.vue'
import LinkView from './components/views/link.vue'

defineOptions({
  name: 'Layout',
})

const routeInfo = useRoute()

const settingsStore = useSettingsStore()
const keepAliveStore = useKeepAliveStore()
const menuStore = useMenuStore()
useWatermarkStore()

const mainPage = useMainPage()

// 头部当前实际高度
const headerActualHeight = computed(() => {
  let actualHeight = Number.parseInt(getComputedStyle(document.documentElement).getPropertyValue('--g-header-height'))
  if (['single', 'side', 'only-side', 'side-panel'].includes(settingsStore.settings.menu.mode) || settingsStore.mode === 'mobile') {
    actualHeight = 0
  }
  if (settingsStore.mainPageMaximizeStatus) {
    actualHeight = 0
  }
  return actualHeight
})

// 侧边栏主导航当前实际宽度
const mainSidebarActualWidth = computed(() => {
  let actualWidth = Number.parseInt(getComputedStyle(document.documentElement).getPropertyValue('--g-main-sidebar-width'))
  if (settingsStore.settings.menu.mode === 'single') {
    actualWidth = 0
  }
  if (['head', 'only-head', 'head-panel'].includes(settingsStore.settings.menu.mode) && settingsStore.mode !== 'mobile') {
    actualWidth = 0
  }
  if (settingsStore.mainPageMaximizeStatus) {
    actualWidth = 0
  }
  return actualWidth
})

// 侧边栏次导航当前实际宽度
const subSidebarActualWidth = computed(() => {
  let actualWidth = Number.parseInt(getComputedStyle(document.documentElement).getPropertyValue('--g-sub-sidebar-width'))
  if (settingsStore.settings.menu.subMenuCollapse && settingsStore.mode !== 'mobile') {
    actualWidth = Number.parseInt(getComputedStyle(document.documentElement).getPropertyValue('--g-sub-sidebar-collapse-width'))
  }
  if (['only-side', 'only-head', 'side-panel', 'head-panel'].includes(settingsStore.settings.menu.mode) && settingsStore.mode !== 'mobile') {
    actualWidth = 0
  }
  if (menuStore.sidebarMenus.every(item => item.meta?.menu === false)) {
    actualWidth = 0
  }
  if (settingsStore.mainPageMaximizeStatus) {
    actualWidth = 0
  }
  return actualWidth
})

// 顶栏当前实际高度
const topbarActualHeight = computed(() => {
  let actualHeight = 0
  if (settingsStore.settings.tabbar.enable) {
    actualHeight += Number.parseInt(getComputedStyle(document.documentElement).getPropertyValue('--g-tabbar-height'))
  }
  const index = settingsStore.settings.toolbar.layout.findIndex(item => item === '->')
  const enableToolbarLeftSide = settingsStore.settings.toolbar.layout.some((item, i) => {
    if (i < index && item !== '->') {
      if (settingsStore.settings.app.routeBaseOn === 'filesystem' && item === 'breadcrumb') {
        return false
      }
      return settingsStore.settings.toolbar[item]
    }
    return false
  })
  if (!['head', 'only-head', 'head-panel'].includes(settingsStore.settings.menu.mode) || enableToolbarLeftSide) {
    actualHeight += Number.parseInt(getComputedStyle(document.documentElement).getPropertyValue('--g-toolbar-height'))
  }
  if (settingsStore.mainPageMaximizeStatus) {
    actualHeight = 0
  }
  return actualHeight
})

const isIframe = computed(() => !!routeInfo.meta.iframe)
const isLink = computed(() => !!routeInfo.meta.link)

watch(() => settingsStore.settings.menu.subMenuCollapse, (val) => {
  if (settingsStore.mode === 'mobile') {
    if (!val) {
      document.body.classList.add('overflow-hidden')
    }
    else {
      document.body.classList.remove('overflow-hidden')
    }
  }
})

watch(() => routeInfo.path, () => {
  if (settingsStore.mode === 'mobile') {
    settingsStore.$patch((state) => {
      state.settings.menu.subMenuCollapse = true
    })
  }
})

onMounted(() => {
  hotkeys('alt+up,alt+down', (e, handle) => {
    e.preventDefault()
    switch (handle.key) {
      case 'alt+up':
        mainPage.maximize(true)
        break
      case 'alt+down':
        mainPage.maximize(false)
        break
    }
  })
})
onUnmounted(() => {
  hotkeys.unbind('alt+up,alt+down')
})

let timeout: (() => void) | undefined
function handleMouseenter() {
  timeout?.()
  settingsStore.setHoverSidebar(true)
}
function handleMouseleave() {
  timeout?.()
  ;({ stop: timeout } = useTimeoutFn(() => {
    settingsStore.setHoverSidebar(false)
  }, 300))
}

const enableAppSetting = import.meta.env.VITE_APP_SETTING
</script>

<template>
  <div
    class="layout" :style="{
      '--g-header-actual-height': `${headerActualHeight}px`,
      '--g-main-sidebar-actual-width': `${mainSidebarActualWidth}px`,
      '--g-sub-sidebar-actual-width': `${subSidebarActualWidth}px`,
      '--g-topbar-actual-height': `${topbarActualHeight}px`,
    }"
  >
    <div id="app-main" :class="{ 'main-page-maximize': settingsStore.mainPageMaximizeStatus }">
      <Header />
      <div class="wrapper">
        <div class="sidebar-container" :class="{ show: settingsStore.mode === 'mobile' && !settingsStore.settings.menu.subMenuCollapse }" @mouseenter="handleMouseenter" @mouseleave="handleMouseleave">
          <MainSidebar />
          <SubSidebar />
        </div>
        <div class="invisible fixed inset-0 z-1009 bg-black/50 op-0 backdrop-blur-sm transition-opacity" :class="{ 'op-100! visible!': settingsStore.mode === 'mobile' && !settingsStore.settings.menu.subMenuCollapse }" @click="settingsStore.toggleSidebarCollapse()" />
        <div class="main-container pb-[var(--g-main-container-padding-bottom)]">
          <Topbar />
          <div class="main">
            <div v-show="settingsStore.mainPageMaximizeStatus" class="exit-main-page-maximize" @click="settingsStore.setMainPageMaximize()">
              <FaIcon name="i-ri:logout-box-line" />
            </div>
            <RouterView v-slot="{ Component, route }">
              <Transition :name="(settingsStore.settings.mainPage.enableTransition && !settingsStore.isReloading) ? settingsStore.settings.mainPage.transitionMode : ''" mode="out-in">
                <KeepAlive :include="keepAliveStore.list">
                  <component :is="Component" v-show="!(isIframe || isLink)" :key="route.fullPath" />
                </KeepAlive>
              </Transition>
            </RouterView>
            <IframeView v-show="isIframe && !isLink" />
            <LinkView v-if="isLink" />
          </div>
          <FaCopyright />
        </div>
      </div>
    </div>
    <Preferences v-if="settingsStore.settings.userPreferences.enable" />
    <HotkeysIntro />
    <template v-if="enableAppSetting">
      <div class="app-setting" @click="eventBus.emit('global-app-setting-toggle')">
        <FaIcon name="i-uiw:setting-o" class="icon" />
      </div>
      <AppSetting />
    </template>
    <component :is="useSlots('free-position')" />
  </div>
</template>

<style scoped>
[data-app-width-mode="adaption"] {
  #app-main {
    width: 100%;
  }
}

[data-app-width-mode="adaption-min-width"] {
  #app-main {
    width: max(var(--g-app-width), 100%);
  }
}

[data-app-width-mode="center"] {
  #app-main {
    width: var(--g-app-width);
  }
}

[data-app-width-mode="center-max-width"] {
  #app-main {
    width: min(var(--g-app-width), 100%);
  }
}

[data-mode="mobile"] {
  #app-main {
    width: 100%;
  }

  .sidebar-container {
    transform: translateX(calc((var(--g-main-sidebar-width) + var(--g-sub-sidebar-width)) * -1));

    [dir="rtl"] & {
      transform: translateX(calc(var(--g-main-sidebar-width) + var(--g-sub-sidebar-width)));
    }

    &.show {
      transform: translateX(0);
    }
  }

  .main-container {
    margin-inline-start: 0 !important;
  }

  &[data-menu-mode="single"] {
    .sidebar-container {
      transform: translateX(calc(var(--g-sub-sidebar-width) * -1));

      [dir="rtl"] & {
        transform: translateX(var(--g-sub-sidebar-width));
      }

      &.show {
        transform: translateX(0);
      }
    }
  }
}

.layout {
  height: 100%;
}

#app-main {
  height: 100%;
  margin: 0 auto;

  /* 页面最大化 */
  &.main-page-maximize {
    :deep(header),
    :deep(.sidebar-container),
    :deep(.topbar-container) {
      display: none;
    }
  }
}

.wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  padding-top: var(--g-header-actual-height);
  transition: padding-top 0.3s;

  .sidebar-container {
    position: fixed;
    top: var(--g-header-actual-height);
    bottom: 0;
    z-index: 1010;
    display: flex;
    width: calc(var(--g-main-sidebar-actual-width) + var(--g-sub-sidebar-actual-width));
    box-shadow: -1px 0 0 0 hsl(var(--border)), 1px 0 0 0 hsl(var(--border));
    transition: width 0.3s, transform 0.3s, box-shadow 0.3s, top 0.3s;

    &:has(> .main-sidebar-container.main-sidebar-enter-active),
    &:has(> .main-sidebar-container.main-sidebar-leave-active),
    &:has(> .sub-sidebar-container.sub-sidebar-enter-active),
    &:has(> .sub-sidebar-container.sub-sidebar-leave-active) {
      overflow: hidden;
    }
  }

  .main-sidebar-container:not(.main-sidebar-leave-active) + .sub-sidebar-container {
    inset-inline-start: var(--g-main-sidebar-width);
  }

  .main-container {
    display: flex;
    flex-direction: column;
    min-height: 100%;
    margin-inline-start: calc(var(--g-main-sidebar-actual-width) + var(--g-sub-sidebar-actual-width));
    background-color: var(--g-main-area-bg);
    box-shadow: -1px 0 0 0 hsl(var(--border)), 1px 0 0 0 hsl(var(--border));
    transition: margin-inline-start 0.3s, background-color 0.3s, box-shadow 0.3s;

    .main {
      position: relative;
      flex: auto;
      height: 100%;
      margin: var(--g-topbar-actual-height) 0 0;
      overflow: hidden;

      .exit-main-page-maximize {
        --uno: bg-primary text-primary-foreground op-50 hover-op-100 transition-opacity;

        position: fixed;
        top: -40px;
        right: -40px;
        z-index: 1000;
        width: 80px;
        height: 80px;
        cursor: pointer;
        border-radius: 50%;

        i {
          position: absolute;
          bottom: 16px;
          left: 16px;
        }
      }
    }
  }
}

.app-setting {
  --uno: bg-primary text-primary-foreground ltr:rounded-l-md rtl:rounded-r-md;

  position: fixed;
  inset-inline-end: 0;
  top: calc(50% + 250px);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  font-size: 24px;
  cursor: pointer;

  .icon {
    animation: rotate 5s linear infinite;
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }
}

/* 主内容区动画 */
.fade-enter-active,
.slide-left-enter-active,
.slide-right-enter-active,
.slide-top-enter-active,
.slide-bottom-enter-active {
  transition: 0.2s;
}

.fade-leave-active,
.slide-left-leave-active,
.slide-right-leave-active,
.slide-top-leave-active,
.slide-bottom-leave-active {
  transition: 0.15s;
}

.fade-enter-from {
  opacity: 0;
}

.fade-leave-to {
  opacity: 0;
}

.slide-left-enter-from {
  margin-left: 20px;
  opacity: 0;
}

.slide-left-leave-to {
  margin-left: -20px;
  opacity: 0;
}

.slide-right-enter-from {
  margin-left: -20px;
  opacity: 0;
}

.slide-right-leave-to {
  margin-left: 20px;
  opacity: 0;
}

.slide-top-enter-from {
  margin-top: 20px;
  opacity: 0;
}

.slide-top-leave-to {
  margin-top: -20px;
  opacity: 0;
}

.slide-bottom-enter-from {
  margin-top: -20px;
  opacity: 0;
}

.slide-bottom-leave-to {
  margin-top: 20px;
  opacity: 0;
}
</style>
