import api from '../index'

export default {
  getChromeFacebookList: (data: any) => api.post('shop/slot/getChromeFacebookList', data).then((res) => {
    return res
  }),
  getChromeFacebook: (data: any) => api.post('shop/slot/getChromeFacebook', data).then((res) => {
    return res
  }),
  editChromeFacebook: (data: any) => api.post('shop/slot/editChromeFacebook', data).then((res) => {
    return res
  }),
  enableChromeFacebook: (data: any) => api.post('shop/slot/enableChromeFacebook', data).then((res) => {
    return res
  }),
  disableChromeFacebook: (data: any) => api.post('shop/slot/disableChromeFacebook', data).then((res) => {
    return res
  }),
  delChromeFacebook: (data: any) => api.post('shop/slot/delChromeFacebook', data).then((res) => {
    return res
  }),
  syncChromeFacebook: (data: any) => api.post('shop/slot/syncChromeFacebook', data).then((res) => {
    return res
  }),
  visitChromeFacebook: (data: any) => api.post('shop/slot/visitChromeFacebook', data).then((res) => {
    return res
  }),
  setChromeFacebookAiStatus: (data: any) => api.post('shop/slot/setChromeFacebookAiStatus', data).then((res) => {
    return res
  }),
  getChromeFacebookConfig: (data: any) => api.post('shop/slot/getChromeFacebookConfig', data).then((res) => {
    return res
  }),
  saveChromeFacebookConfig: (data: any) => api.post('shop/slot/saveChromeFacebookConfig', data).then((res) => {
    return res
  }),

  getConversationList: (data: any) => api.post('shop/slot/getConversationList', data).then((res) => {
    return res
  }),
  getConversation: (data: any) => api.post('shop/slot/getConversation', data).then((res) => {
    return res
  }),
  getMessageList: (data: any) => api.post('shop/slot/getMessageList', data).then((res) => {
    return res
  }),
  getRawMessageList: (data: any) => api.post('shop/slot/getRawMessageList', data).then((res) => {
    return res
  }),
  submitConversationAnnotated: (data: any) => api.post('shop/slot/submitConversationAnnotated', data).then((res) => {
    return res
  }),
  delConversation: (data: any) => api.post('shop/slot/delConversation', data).then((res) => {
    return res
  }),

  getPetterSceneList: (data: any) => api.post('shop/slot/getPetterSceneList', data).then((res) => {
    return res
  }),
  getPetterList: (data: any) => api.post('shop/slot/getPetterList', data).then((res) => {
    return res
  }),
  getPetter: (data: any) => api.post('shop/slot/getPetter', data).then((res) => {
    return res
  }),
  editPetter: (data: any) => api.post('shop/slot/editPetter', data).then((res) => {
    return res
  }),
  delPetter: (data: any) => api.post('shop/slot/delPetter', data).then((res) => {
    return res
  }),
}
