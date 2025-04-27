import type { RouteRecordRaw } from 'vue-router'

function Layout() {
  return import('@/layouts/index.vue')
}

const routes: RouteRecordRaw[] = [
  {
    path: '/backend_manage',
    component: Layout,
    redirect: '/backend_manage/merchant',
    name: 'backendManage',
    meta: {
      title: '后台管理',
      icon: 'i-ri:function-line',
      auth: 'backendManage',
      alwaysOpened: true,
    },
    children: [
      {
        path: 'merchant',
        name: 'backendManageMerchant',
        component: () => import('@/views/backend_manage/merchant/list.vue'),
        meta: {
          title: '商户管理',
          auth: 'merchantManagement.browse',
        },
      },
      {
        path: 'merchant/detail/:id',
        name: 'backendManageMerchantDetail',
        component: () => import('@/views/backend_manage/merchant/detail.vue'),
        meta: {
          title: '商户编辑',
          menu: false,
          activeMenu: '/backend_manage/merchant',
          cache: true,
          noCache: 'backendManageMerchant',
          copyright: false,
        },
      },
      {
        path: 'admin',
        name: 'backendManageAdmin',
        component: () => import('@/views/backend_manage/admin/list.vue'),
        meta: {
          title: '员工管理',
          auth: 'staffManagement.browse',
        },
      },
      {
        path: 'admin/detail/:id',
        name: 'backendManageAdminDetail',
        component: () => import('@/views/backend_manage/admin/detail.vue'),
        meta: {
          title: '员工编辑',
          menu: false,
          activeMenu: '/backend_manage/admin',
          cache: true,
          noCache: 'backendManageAdmin',
          copyright: false,
        },
      },
      {
        path: 'role',
        name: 'backendManageRole',
        component: () => import('@/views/backend_manage/role/list.vue'),
        meta: {
          title: '角色管理',
          auth: 'roleManagement.browse',
        },
      },
      {
        path: 'role/detail/:id',
        name: 'backendManageRoleDetail',
        component: () => import('@/views/backend_manage/role/detail.vue'),
        meta: {
          title: '角色编辑',
          menu: false,
          activeMenu: '/backend_manage/role',
          cache: true,
          noCache: 'backendManageRole',
          copyright: false,
        },
      },
      {
        path: 'operationLog',
        name: 'backendManageOperationLog',
        component: () => import('@/views/backend_manage/operation_log/list.vue'),
        meta: {
          title: '日志管理',
          auth: 'systemLogs.browse',
        },
      },
    ],
  },
  {
    path: '/other_manage',
    component: Layout,
    redirect: '/other_manage/petter',
    name: 'otherManage',
    meta: {
      title: '其他管理',
      icon: 'hugeicons:file-management',
      auth: 'backendManage',
      alwaysOpened: true,
    },
    children: [
      {
        path: 'petter',
        name: 'managePetter',
        component: () => import('@/views/backend_manage/petter/list.vue'),
        meta: {
          title: '话术管理',
          auth: 'petterManagement.browse',
        },
      },
      {
        path: 'petter/detail/:id',
        name: 'managePetterDetail',
        component: () => import('@/views/backend_manage/petter/detail.vue'),
        meta: {
          title: '话术编辑',
          menu: false,
          activeMenu: '/backend_manage/petter/list',
          cache: true,
          noCache: 'managePetter',
          copyright: false,
        },
      },
    ],
  },
]

export default routes
