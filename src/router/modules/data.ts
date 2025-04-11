import type { RouteRecordRaw } from 'vue-router'

function Layout() {
  return import('@/layouts/index.vue')
}

const routes: RouteRecordRaw[] = [
  {
    path: '/data',
    component: Layout,
    redirect: '/',
    name: 'data',
    meta: {
      title: '数据',
      icon: 'icon-park-outline:sunny',
      auth: 'data',
      alwaysOpened: true,
    },
    children: [
      {
        path: 'trigger_data',
        name: 'triggerData',
        component: () => import('@/views/config/trigger/list.vue'),
        meta: {
          auth: 'triggerData.browse',
          title: '会话列表',
        },
      },
      {
        path: 'trigger_data/detail/:id',
        name: 'triggerDataDetail',
        component: () => import('@/views/config/trigger/detail.vue'),
        meta: {
          title: '会话列表编辑',
          menu: false,
          activeMenu: '/data/trigger_data',
          cache: true,
          noCache: 'triggerData',
          copyright: false,
        },
      },
    ],
  },
]

export default routes
