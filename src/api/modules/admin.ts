import api from '../index'

export default {
  getAllRole: (data: any) => api.post('shop/admin/getAllRole', data).then((res) => {
    return res
  }),
  getAllDepartment: (data: any) => api.post('shop/admin/getAllDepartment', data).then((res) => {
    return res
  }),
  getAllAdmin: (data: any) => api.post('shop/admin/getAllAdmin', data).then((res) => {
    return res
  }),
}
