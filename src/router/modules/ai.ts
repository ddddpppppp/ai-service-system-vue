import type { RouteRecordRaw } from 'vue-router'

function Layout() {
  return import('@/layouts/index.vue')
}

const routes: RouteRecordRaw[] = [
  {
    path: '/ai',
    component: Layout,
    redirect: '/',
    name: 'ai',
    meta: {
      title: '仪表盘',
      icon: 'solar:safe-2-bold-duotone',
      alwaysOpened: true,
    },
    children: [
      {
        path: 'ai_dashboard',
        name: 'aiDashboard',
        component: () => import('@/views/multilevel_menu_example/dashboard.vue'),
        meta: {
          title: '数据看板',
        },
      },
    ],
  },
  {
    path: '/account_list',
    component: Layout,
    redirect: '/',
    name: 'accountList',
    meta: {
      title: '授权管理',
      icon: 'solar:widget-2-bold-duotone',
      alwaysOpened: true,
    },
    children: [
      {
        path: 'index',
        name: 'accountListIndex',
        component: () => import('@/views/multilevel_menu_example/account_list/list.vue'),
        meta: {
          title: '授权列表',
        },
      },
    ],
  },
  {
    path: '/chat_list',
    component: Layout,
    redirect: '/',
    name: 'chatList',
    meta: {
      title: '聊天列表',
      icon: 'solar:users-group-two-rounded-linear',
      alwaysOpened: true,
    },
    children: [
      {
        path: 'index',
        name: 'chatListIndex',
        component: () => import('@/views/multilevel_menu_example/chat_list/list.vue'),
        meta: {
          title: '聊天列表',
        },
      },
    ],
  },
]

export default routes
