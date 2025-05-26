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

  getAdminList: (data: any) => api.post('shop/setting/getAdminList', data).then((res) => {
    return res
  }),
  getAdmin: (data: any) => api.post('shop/setting/getAdmin', data).then((res) => {
    return res
  }),
  editAdmin: (data: any) => api.post('shop/setting/editAdmin', data).then((res) => {
    return res
  }),
  delAdmin: (data: any) => api.post('shop/setting/delAdmin', data).then((res) => {
    return res
  }),
  recoveryAdmin: (data: any) => api.post('shop/setting/recoveryAdmin', data).then((res) => {
    return res
  }),

  getMerchantList: (data: any) => api.post('shop/setting/getMerchantList', data).then((res) => {
    return res
  }),
  getMerchant: (data: any) => api.post('shop/setting/getMerchant', data).then((res) => {
    return res
  }),
  editMerchant: (data: any) => api.post('shop/setting/editMerchant', data).then((res) => {
    return res
  }),
  delMerchant: (data: any) => api.post('shop/setting/delMerchant', data).then((res) => {
    return res
  }),
  recoveryMerchant: (data: any) => api.post('shop/setting/recoveryMerchant', data).then((res) => {
    return res
  }),
  getAllPaymentChannel: (data: any) => api.post('shop/setting/getAllPaymentChannel', data).then((res) => {
    return res
  }),
  getPaymentChannelList: (data: any) => api.post('shop/setting/getPaymentChannelList', data).then((res) => {
    return res
  }),
  disablePaymentChannel: (data: any) => api.post('shop/setting/disablePaymentChannel', data).then((res) => {
    return res
  }),
  enablePaymentChannel: (data: any) => api.post('shop/setting/enablePaymentChannel', data).then((res) => {
    return res
  }),
  editPaymentChannel: (data: any) => api.post('shop/setting/editPaymentChannel', data).then((res) => {
    return res
  }),

  getBalanceTotal: (data: any) => api.post('shop/setting/getBalanceTotal', data).then((res) => {
    return res
  }),
  getBalanceList: (data: any) => api.post('shop/setting/getBalanceList', data).then((res) => {
    return res
  }),
  getBalanceFrozenList: (data: any) => api.post('shop/setting/getBalanceFrozenList', data).then((res) => {
    return res
  }),
  getWithdrawList: (data: any) => api.post('shop/setting/getWithdrawList', data).then((res) => {
    return res
  }),
  editWithdraw: (data: any) => api.post('shop/setting/editWithdraw', data).then((res) => {
    return res
  }),
  disableWithdraw: (data: any) => api.post('shop/setting/disableWithdraw', data).then((res) => {
    return res
  }),
  enableWithdraw: (data: any) => api.post('shop/setting/enableWithdraw', data).then((res) => {
    return res
  }),
  cancelWithdraw: (data: any) => api.post('shop/setting/cancelWithdraw', data).then((res) => {
    return res
  }),

  getOperationLogList: (data: any) => api.post('shop/setting/getOperationLogList', data).then((res) => {
    return res
  }),

}
