import api from '../index'

export default {
  getRoleList: (data: any) => api.post('shop/setting/getRoleList', data).then((res) => {
    return res
  }),
  getRole: (data: any) => api.post('shop/setting/getRole', data).then((res) => {
    return res
  }),
  editRole: (data: any) => api.post('shop/setting/editRole', data).then((res) => {
    return res
  }),
  delRole: (data: any) => api.post('shop/setting/delRole', data).then((res) => {
    return res
  }),
}
