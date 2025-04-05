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
        path: 'merchant',
        name: 'backendManageMerchant',
        redirect: '/backend_manage/Merchant',
        meta: {
          title: '商户管理',
          auth: 'merchantManagement.browse',
        },
        children: [
          {
            path: '',
            name: 'backendManageMerchantList',
            component: () => import('@/views/backend_manage/merchant/list.vue'),
            meta: {
              title: '商户列表',
              menu: false,
              cache: ['backendManageMerchantDetail'],
            },
          },
          {
            path: 'detail/:id',
            name: 'backendManageMerchantDetail',
            component: () => import('@/views/backend_manage/merchant/detail.vue'),
            meta: {
              title: '商户编辑',
              menu: false,
              activeMenu: '/backend_manage/merchant',
              cache: true,
              noCache: 'backendManageMerchantList',
              copyright: false,
            },
          },
        ],
      },
      {
        path: 'admin',
        name: 'backendManageAdmin',
        redirect: '/backend_manage/admin',
        meta: {
          title: '员工管理',
          auth: 'staffManagement.browse',
        },
        children: [
          {
            path: '',
            name: 'backendManageAdminList',
            component: () => import('@/views/backend_manage/admin/list.vue'),
            meta: {
              title: '员工列表',
              menu: false,
              cache: ['backendManageAdminDetail'],
            },
          },
          {
            path: 'detail/:id',
            name: 'backendManageAdminDetail',
            component: () => import('@/views/backend_manage/admin/detail.vue'),
            meta: {
              title: '员工编辑',
              menu: false,
              activeMenu: '/backend_manage/admin',
              cache: true,
              noCache: 'backendManageAdminList',
              copyright: false,
            },
          },
        ],
      },
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
      {
        path: 'operationLog',
        name: 'backendManageOperationLog',
        redirect: '/backend_manage/operationLog',
        meta: {
          title: '日志管理',
          auth: 'systemLogs.browse',
        },
        children: [
          {
            path: '',
            name: 'backendManageOperationLogList',
            component: () => import('@/views/backend_manage/operation_log/list.vue'),
            meta: {
              title: '日志列表',
              menu: false,
              cache: ['backendManageOperationLogDetail'],
            },
          }
        ],
      },
    ],
  },
]

export default routes
