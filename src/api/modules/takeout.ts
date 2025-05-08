import api from '../index'

export default {
  getCategoryList: (data: any) => api.post('shop/takeout/getCategoryList', data).then((res) => {
    return res
  }),
  getCategory: (data: any) => api.post('shop/takeout/getCategory', data).then((res) => {
    return res
  }),
  editCategory: (data: any) => api.post('shop/takeout/editCategory', data).then((res) => {
    return res
  }),
  delCategory: (data: any) => api.post('shop/takeout/delCategory', data).then((res) => {
    return res
  }),
  getAllStore: () => api.post('shop/takeout/getAllStore').then((res) => {
    return res
  }),
  getStoreList: (data: any) => api.post('shop/takeout/getStoreList', data).then((res) => {
    return res
  }),
  getStore: (data: any) => api.post('shop/takeout/getStore', data).then((res) => {
    return res
  }),
  editStore: (data: any) => api.post('shop/takeout/editStore', data).then((res) => {
    return res
  }),
  enableStore: (data: any) => api.post('shop/takeout/enableStore', data).then((res) => {
    return res
  }),
  disableStore: (data: any) => api.post('shop/takeout/disableStore', data).then((res) => {
    return res
  }),
}
