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
    ],
  },
  {
    path: '/payment_channel',
    component: Layout,
    redirect: '/payment_channel/payment',
    name: 'payment',
    meta: {
      title: '支付渠道',
      icon: 'ri:bank-card-2-line',
      auth: 'paymentChannel',
      alwaysOpened: true,
    },
    children: [
      {
        path: 'payment',
        name: 'paymentChannel',
        component: () => import('@/views/backend_manage/payment/list.vue'),
        meta: {
          title: '代收渠道',
          auth: 'paymentChannel.browse',
        },
      },
    ],
  },
  {
    path: '/log_manage',
    component: Layout,
    redirect: '/log_manage/operation_log',
    name: 'logManage',
    meta: {
      title: '日志管理',
      icon: 'ri:blogger-line',
      auth: 'backendManage',
      alwaysOpened: true,
    },
    children: [
      {
        path: 'operationLog',
        name: 'backendManageOperationLog',
        component: () => import('@/views/backend_manage/operation_log/list.vue'),
        meta: {
          title: '操作日志',
          auth: 'systemLogs.browse',
        },
      },
    ],
  },
]

export default routes
