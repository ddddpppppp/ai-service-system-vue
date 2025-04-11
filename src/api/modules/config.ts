import api from '../index'

export default {

  getTriggerList: (data: any) => api.post('shop/config/getTriggerList', data).then((res) => {
    return res
  }),
  getTrigger: (data: any) => api.post('shop/config/getTrigger', data).then((res) => {
    return res
  }),
  editTrigger: (data: any) => api.post('shop/config/editTrigger', data).then((res) => {
    return res
  }),
  delTrigger: (data: any) => api.post('shop/config/delTrigger', data).then((res) => {
    return res
  }),
}
