import api from '../index'

export default {
  // 登录
  login: (data: {
    account: string
    password: string
  }) => api.post('shop/index/login', data).then((res) => {
    return res
  }),

  // 获取权限
  permission: () => api.post('shop/admin/getUserInfo').then((res) => {
    return res
  }),

  // 修改密码
  passwordEdit: (data: {
    password: string
    newPassword: string
  }) => api.post('shop/admin/passwordEdit', data).then((res) => {
    return res
  }),

  // 修改信息
  infoEdit: (data: {
    avatar: string
    nickname: string
  }) => api.post('shop/admin/saveInfo', data).then((res) => {
    return res
  }),

  // 获取偏好设置
  preferences: () => api.get('user/preferences', {
    baseURL: '/mock/',
  }),

  // 修改偏好设置
  preferencesEdit: (preferences: string) => api.post('user/preferences/edit', {
    preferences,
  }, {
    baseURL: '/mock/',
  }),

  // 获取标签栏固定标签页数据
  tabbar: () => api.get('user/tabbar', {
    baseURL: '/mock/',
  }),

  // 修改标签栏固定标签页数据
  tabbarEdit: (tabbar: string) => api.post('user/tabbar/edit', {
    tabbar,
  }, {
    baseURL: '/mock/',
  }),

  // 获取收藏夹
  favorites: () => api.get('user/favorites', {
    baseURL: '/mock/',
  }),

  // 修改收藏夹
  favoritesEdit: (favorites: string) => api.post('user/favorites/edit', {
    favorites,
  }, {
    baseURL: '/mock/',
  }),
}
