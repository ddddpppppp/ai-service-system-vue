import type { Route } from '#/global'
import type { RouteRecordRaw } from 'vue-router'
import { $t } from '@/locales'
import storage from '@/utils/storage'
// import pinia from '@/store'
// import useSettingsStore from '@/store/modules/settings'
import generatedRoutes from 'virtual:generated-pages'
import { setupLayouts } from 'virtual:meta-layouts'
import Ai from './modules/ai.ts'
import BackendManage from './modules/backend_manage.ts'
import Config from './modules/config.ts'
// import MultilevelMenuExample from './modules/multilevel.menu.example'
import Takeout from './modules/takeout.ts'

// 固定路由（默认路由）
const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login.vue'),
    meta: {
      whiteList: true,
      title: $t('app.route.login'),
    },
  },
  {
    path: '/:all(.*)*',
    name: 'notFound',
    component: () => import('@/views/[...all].vue'),
    meta: {
      title: '找不到页面',
    },
  },
]

// 系统路由
const systemRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: () => {
      // 从本地存储获取重定向路径，如果不存在则使用默认路径
      const redirectPath = storage.local.get('redirectPath')
      return redirectPath || '/slot/slot_dashboard'
    },
    component: () => import('@/layouts/index.vue'),
    meta: {
      breadcrumb: false,
    },
    children: [
      {
        path: 'reload',
        name: 'reload',
        component: () => import('@/views/reload.vue'),
        meta: {
          title: $t('app.route.reload'),
          breadcrumb: false,
        },
      },
    ],
  },
]

// 动态路由（异步路由、导航栏路由）
const asyncRoutes: Route.recordMainRaw[] = [
  {
    meta: {
      title: '外卖',
      auth: 'takeoutDashboard.browse',
      icon: 'icon-park-solid:hamburger-one',
    },
    children: [
      ...Takeout,
    ],
  },
  {
    meta: {
      title: 'AI',
      icon: 'solar:radar-2-bold-duotone',
    },
    children: [
      ...Ai,
    ],
  },
  {
    meta: {
      title: '管理',
      icon: 'i-uim:box',
    },
    children: [
      ...BackendManage,
    ],
  },
  {
    meta: {
      title: '配置',
      auth: 'config.browse',
      icon: 'i-uim:microsoft',
    },
    children: [
      ...Config,
    ],
  },
]

const constantRoutesByFilesystem = generatedRoutes.filter((item) => {
  return item.meta?.enabled !== false && item.meta?.constant === true
})

const asyncRoutesByFilesystem = setupLayouts(generatedRoutes.filter((item) => {
  return item.meta?.enabled !== false && item.meta?.constant !== true && item.meta?.layout !== false
}))

export {
  asyncRoutes,
  asyncRoutesByFilesystem,
  constantRoutes,
  constantRoutesByFilesystem,
  systemRoutes,
}
