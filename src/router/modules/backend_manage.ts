import type { RouteRecordRaw } from 'vue-router'

function Layout() {
  return import('@/layouts/index.vue')
}

const routes: RouteRecordRaw[] = [
  {
    path: '/backend_manage',
    component: Layout,
    redirect: '/backend_manage/role',
    name: 'backendManage',
    meta: {
      title: '后台管理',
      icon: 'i-ri:function-line',
      auth: 'backendManage',
    },
    children: [
      {
        path: 'role',
        name: 'backendManageRole',
        redirect: '/backend_manage/role',
        meta: {
          title: '角色管理',
          auth: 'roleManagement.browse',
        },
        children: [
          {
            path: '',
            name: 'backendManageRoleList',
            component: () => import('@/views/backend_manage/role/list.vue'),
            meta: {
              title: '角色列表',
              menu: false,
              cache: ['backendManageRoleDetail'],
            },
          },
          {
            path: 'detail/:id',
            name: 'backendManageRoleDetail',
            component: () => import('@/views/backend_manage/role/detail.vue'),
            meta: {
              title: '角色编辑',
              menu: false,
              activeMenu: '/backend_manage/role',
              cache: true,
              noCache: 'backendManageRoleList',
              copyright: false,
            },
          },
        ],
      },
    ],
  },
]

export default routes
