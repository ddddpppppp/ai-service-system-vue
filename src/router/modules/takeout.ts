import type { RouteRecordRaw } from 'vue-router'

function Layout() {
  return import('@/layouts/index.vue')
}

const routes: RouteRecordRaw[] = [
  {
    path: '/takeout',
    component: Layout,
    redirect: '/',
    name: 'takeout',
    meta: {
      title: '仪表盘',
      icon: 'icon-park-outline:freezing-line-column',
      alwaysOpened: true,
    },
    children: [
      {
        path: 'takeout_dashboard',
        name: 'takeoutDashboard',
        component: () => import('@/views/takeout/dashboard/dashboard.vue'),
        meta: {
          auth: 'takeoutDashboard.browse',
          title: 'Dashboard',
        },
      },
    ],
  },
  {
    path: '/takeout_setting',
    component: Layout,
    redirect: '/',
    name: 'takeoutSetting',
    meta: {
      title: '管理设置',
      icon: 'i-clarity:plugin-outline-alerted',
      alwaysOpened: true,
    },
    children: [
      {
        path: 'takeout_category',
        name: 'takeoutCategory',
        component: () => import('@/views/takeout/category/list.vue'),
        meta: {
          auth: 'takeoutCategory.browse',
          title: '分类管理',
          query: {
            type: 'home',
          },
        },
      },
    ],
  },
  {
    path: '/takeout_shop',
    component: Layout,
    redirect: '/',
    name: 'takeoutShop',
    meta: {
      title: '店铺管理',
      icon: 'i-clarity:plugin-outline-alerted',
      alwaysOpened: true,
    },
    children: [
      {
        path: 'takeout_shop_list',
        name: 'takeoutShopList',
        component: () => import('@/views/takeout/shop/list.vue'),
        meta: {
          auth: 'takeoutShop.browse',
          title: '店铺列表',
        },
      },
      {
        path: 'takeout_shop_category',
        name: 'takeoutShopCategory',
        component: () => import('@/views/takeout/category/list.vue'),
        meta: {
          auth: 'takeoutShop.browse',
          title: '店铺分类',
          query: {
            type: 'shop',
          },
        },
      },
      {
        path: 'takeout_shop_product',
        name: 'takeoutShopProduct',
        component: () => import('@/views/takeout/product/list.vue'),
        meta: {
          auth: 'takeoutShop.browse',
          title: '产品管理',
        },
      },
    ],
  },
]

export default routes
