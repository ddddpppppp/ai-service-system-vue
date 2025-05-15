import type { RouteRecordRaw } from 'vue-router'

function Layout() {
  return import('@/layouts/index.vue')
}

const routes: RouteRecordRaw[] = [
  {
    path: '/slot',
    component: Layout,
    redirect: '/',
    name: 'slot',
    meta: {
      title: '仪表盘',
      icon: 'icon-park-outline:freezing-line-column',
      auth: 'slotDashboard.browse',
      alwaysOpened: true,
    },
    children: [
      {
        path: 'slot',
        name: 'slotDashboard',
        component: () => import('@/views/slot/dashboard/dashboard.vue'),
        meta: {
          auth: 'slotDashboard.browse',
          title: 'Dashboard',
        },
      },
    ],
  },
  {
    path: '/slot_list',
    component: Layout,
    redirect: '/',
    name: 'slotList',
    meta: {
      title: '投流列表',
      auth: 'slotFacebookList.browse',
      icon: 'i-clarity:plugin-outline-alerted',
      alwaysOpened: true,
    },
    children: [
      {
        path: 'facebook_game',
        name: 'slotFacebookList',
        component: () => import('@/views/slot/slot_list/list.vue'),
        meta: {
          auth: 'slotFacebookList.browse',
          title: 'Facebook主页',
        },
      },
      {
        path: 'facebook_game/detail/:id',
        name: 'slotFacebookGameDetail',
        component: () => import('@/views/slot/slot_list/detail.vue'),
        meta: {
          title: 'Facebook主页编辑',
          menu: false,
          auth: 'slotFacebookList.browse',
          activeMenu: '/slot_list/facebook_game',
          cache: true,
          noCache: 'slotFacebookList',
          copyright: false,
        },
      },
    ],
  },
  {
    path: '/slot_data_manage',
    component: Layout,
    redirect: '/',
    name: 'slotDataManage',
    meta: {
      title: '数据管理',
      icon: 'icon-park-outline:sunny',
      alwaysOpened: true,
    },
    children: [
      {
        path: 'slot_conversation_data',
        name: 'slotConversationData',
        component: () => import('@/views/slot/conversation_list/list.vue'),
        meta: {
          auth: 'slotConversationData.browse',
          title: '会话列表',
        },
      },
      {
        path: 'slot_annotate_list',
        name: 'slotAnnotateList',
        component: () => import('@/views/slot/annotate_list/list.vue'),
        meta: {
          auth: 'slotConversationAnnotated.browse',
          title: '标注列表',
        },
      },
      {
        path: 'slot_petter_management',
        name: 'slotPetterManagement',
        component: () => import('@/views/slot/petter/list.vue'),
        meta: {
          title: '话术管理',
          auth: 'slotPetterManagement.browse',
        },
      },
      {
        path: 'slot_petter_management/detail/:id',
        name: 'slotPetterManagementDetail',
        component: () => import('@/views/slot/petter/detail.vue'),
        meta: {
          title: '话术编辑',
          menu: false,
          activeMenu: '/slot_data_manage/slot_petter_management',
          cache: true,
          noCache: 'slotPetterManagement',
          copyright: false,
        },
      },
    ],
  },
]

export default routes
