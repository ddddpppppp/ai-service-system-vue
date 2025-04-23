import api from '../index'

export default {
  getConversationList: (data: any) => api.post('shop/data_manage/getConversationList', data).then((res) => {
    return res
  }),
  getConversation: (data: any) => api.post('shop/data_manage/getConversation', data).then((res) => {
    return res
  }),
  getMessageList: (data: any) => api.post('shop/data_manage/getMessageList', data).then((res) => {
    return res
  }),
  submitConversationAnnotated: (data: any) => api.post('shop/data_manage/submitConversationAnnotated', data).then((res) => {
    return res
  }),
  delConversation: (data: any) => api.post('shop/data_manage/delConversation', data).then((res) => {
    return res
  }),
}
