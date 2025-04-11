import type { RouteRecordRaw } from 'vue-router'

function Layout() {
  return import('@/layouts/index.vue')
}

const routes: RouteRecordRaw[] = [
  {
    path: '/config',
    component: Layout,
    redirect: '/',
    name: 'config',
    meta: {
      title: '配置',
      icon: 'icon-park-outline:locking-laptop',
      auth: 'config',
      alwaysOpened: true,
    },
    children: [
      {
        path: 'trigger_config',
        name: 'triggerConfig',
        component: () => import('@/views/config/trigger/list.vue'),
        meta: {
          auth: 'triggerConfig.browse',
          title: '触发器',
        },
      },
      {
        path: 'trigger_config/detail/:id',
        name: 'triggerConfigDetail',
        component: () => import('@/views/config/trigger/detail.vue'),
        meta: {
          title: '触发器编辑',
          menu: false,
          activeMenu: '/config/trigger_config',
          cache: true,
          noCache: 'triggerConfig',
          copyright: false,
        },
      },
    ],
  },
]

export default routes
