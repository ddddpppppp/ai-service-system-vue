import api from '../index'

export default {
  getAllRole: (data: any) => api.post('shop/admin/getAllRole', data).then((res) => {
    return res
  }),
}
