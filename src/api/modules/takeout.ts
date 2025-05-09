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
  getAllStoreCategory: (data: any) => api.post('shop/takeout/getAllStoreCategory', data).then((res) => {
    return res
  }),
  getAllHomeCategory: () => api.post('shop/takeout/getAllHomeCategory').then((res) => {
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
  getProductList: (data: any) => api.post('shop/takeout/getProductList', data).then((res) => {
    return res
  }),
  getProduct: (data: any) => api.post('shop/takeout/getProduct', data).then((res) => {
    return res
  }),
  editProduct: (data: any) => api.post('shop/takeout/editProduct', data).then((res) => {
    return res
  }),
  enableProduct: (data: any) => api.post('shop/takeout/enableProduct', data).then((res) => {
    return res
  }),
  disableProduct: (data: any) => api.post('shop/takeout/disableProduct', data).then((res) => {
    return res
  }),
  deleteProduct: (data: any) => api.post('shop/takeout/delProduct', data).then((res) => {
    return res
  }),
}
