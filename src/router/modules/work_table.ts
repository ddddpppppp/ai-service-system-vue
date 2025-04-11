import type { RouteRecordRaw } from 'vue-router'

function Layout() {
  return import('@/layouts/index.vue')
}

const routes: RouteRecordRaw[] = [
  {
    path: '/work_table',
    component: Layout,
    redirect: '/',
    name: 'workTable',
    meta: {
      title: '工作台',
      icon: 'icon-park-outline:freezing-line-column',
      auth: 'common',
      alwaysOpened: true,
    },
    children: [
      {
        path: 'dashboard',
        name: 'workTableDashboard',
        component: () => import('@/views/work_table/dashboard/dashboard.vue'),
        meta: {
          title: 'Dashboard',
        },
      },
    ],
  },
  {
    path: '/plugin',
    component: Layout,
    redirect: '/',
    name: 'plugin',
    meta: {
      title: '插件',
      icon: 'i-clarity:plugin-outline-alerted',
      auth: 'common',
      alwaysOpened: true,
    },
    children: [
      {
        path: 'facebook_game',
        name: 'pluginFacebookGame',
        component: () => import('@/views/work_table/plugin/facebook_game/facebook-game.vue'),
        meta: {
          title: 'Facebook',
        },
      },
    ],
  },
]

export default routes
