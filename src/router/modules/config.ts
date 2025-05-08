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
    children: [],
  },
]

export default routes
