import api from '../index'

export default {
  getChromeFacebookList: (data: any) => api.post('shop/work_table/getChromeFacebookList', data).then((res) => {
    return res
  }),
  getChromeFacebook: (data: any) => api.post('shop/work_table/getChromeFacebook', data).then((res) => {
    return res
  }),
  editChromeFacebook: (data: any) => api.post('shop/work_table/editChromeFacebook', data).then((res) => {
    return res
  }),
  enableChromeFacebook: (data: any) => api.post('shop/work_table/enableChromeFacebook', data).then((res) => {
    return res
  }),
  disableChromeFacebook: (data: any) => api.post('shop/work_table/disableChromeFacebook', data).then((res) => {
    return res
  }),
  delChromeFacebook: (data: any) => api.post('shop/work_table/delChromeFacebook', data).then((res) => {
    return res
  }),
  syncChromeFacebook: (data: any) => api.post('shop/work_table/syncChromeFacebook', data).then((res) => {
    return res
  }),
  saveChromeFacebookConfig: (data: any) => api.post('shop/work_table/saveChromeFacebookConfig', data).then((res) => {
    return res
  }),
}
