import type { RouteRecordRaw } from 'vue-router'

function Layout() {
  return import('@/layouts/index.vue')
}

const routes: RouteRecordRaw[] = [
  {
    path: '/data_manage',
    component: Layout,
    redirect: '/',
    name: 'dataManage',
    meta: {
      title: '数据',
      icon: 'icon-park-outline:sunny',
      auth: 'dataManage',
      alwaysOpened: true,
    },
    children: [
      {
        path: 'conversation_data',
        name: 'conversationData',
        component: () => import('@/views/data_mange/conversation_list/list.vue'),
        meta: {
          auth: 'conversationData.browse',
          title: '会话列表',
        },
      },
      {
        path: 'annotate_list',
        name: 'annotateList',
        component: () => import('@/views/data_mange/annotate_list/list.vue'),
        meta: {
          auth: 'conversationAnnotated.browse',
          title: '标注列表',
        },
      },
    ],
  },
]

export default routes
