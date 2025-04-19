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
        component: () => import('@/views/work_table/plugin/facebook_game/list.vue'),
        meta: {
          auth: 'pluginFacebookGame.browse',
          title: 'FacebookGame',
        },
      },
      {
        path: 'facebook_game/detail/:id',
        name: 'pluginFacebookGameDetail',
        component: () => import('@/views/work_table/plugin/facebook_game/detail.vue'),
        meta: {
          title: 'facebook实例',
          menu: false,
          auth: 'pluginFacebookGame.browse',
          activeMenu: '/plugin/facebook_game',
          cache: true,
          noCache: 'pluginFacebookGame',
          copyright: false,
        },
      },
    ],
  },
]

export default routes
