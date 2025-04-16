<route lang="yaml">
meta:
title: 配置与容器列表页
icon: i-ant-design:home-twotone
</route>

<script setup lang="ts">
import type { FormInstance } from 'element-plus'
import apiWorkTable from '@/api/modules/work_table'
import useUserStore from '@/store/modules/user.ts'
import eventBus from '@/utils/eventBus.ts'
import { WebSocketService } from '@/utils/websocket'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ref } from 'vue'
import { toast } from 'vue-sonner'

const userStore = useUserStore()

const formRef = useTemplateRef<FormInstance>('formRef')

const router = useRouter()
/**
 * 详情展示模式
 * router 路由跳转
 * dialog 对话框
 * drawer 抽屉
 */
const formMode = ref<'router' | 'dialog' | 'drawer'>('router')

// 模拟配置列表数据
const configList = ref([
  {
    title: '注册接口api配置',
    type: 'api',
    name: 'registerApi',
    form: {
      url: {
        value: '',
        readOnly: false,
      },
      input: {
        readOnly: true,
        value: {
          username: 'string|必填|用户名',
          password: 'string|必填|密码',
          parentId: 'string|选填|父级id',
          agentId: 'string|选填|代理id',
          channelId: 'string|选填|渠道id',
        },
      },
      output: {
        readOnly: true,
        value: {
          code: 'int|必返回|状态码',
          data: {
            userId: 'string|必返回|用户id',
            username: 'string|必返回|用户名',
          },
          message: 'string|必返回|消息',
        },
      },
    },
  },
  {
    title: '送分接口api配置',
    type: 'api',
    name: 'giftScoreApi',
    form: {
      url: {
        value: '',
        readOnly: false,
      },
      input: {
        readOnly: true,
        value: {
          userId: 'string|必填|用户id',
          score: 'float|必填|送分',
        },
      },
      output: {
        readOnly: true,
        value: {
          code: 'int|必返回|状态码',
          data: {},
          message: 'string|必返回|消息',
        },
      },
    },
  },
  {
    title: '充值接口api配置',
    type: 'api',
    name: 'rechargeApi',
    form: {
      url: {
        value: '',
        readOnly: false,
      },
      input: {
        readOnly: true,
        value: {
          userId: 'string|必填|用户id',
          amount: 'float|必填|充值金额',
        },
      },
      output: {
        readOnly: true,
        value: {
          code: 'int|必返回|状态码',
          data: {},
          message: 'string|必返回|消息',
        },
      },
    },
  },
  {
    title: '赎回接口api配置',
    type: 'api',
    name: 'redeemApi',
    form: {
      url: {
        value: '',
        readOnly: false,
      },
      input: {
        readOnly: true,
        value: {
          userId: 'string|必填|用户id',
          amount: 'float|必填|赎回金额',
        },
      },
      output: {
        readOnly: true,
        value: {
          code: 'int|必返回|状态码',
          data: {},
          message: 'string|必返回|消息',
        },
      },
    },
  },
  {
    title: '查询用户接口api配置',
    type: 'api',
    name: 'queryUserApi',
    form: {
      url: {
        value: '',
        readOnly: false,
      },
      input: {
        readOnly: true,
        value: {
          userId: 'string|和username必填一个|用户id',
          username: 'string|和userId必填一个|用户名',
        },
      },
      output: {
        readOnly: true,
        value: {
          code: 'int|必返回|状态码',
          data: {
            userId: 'string|必返回|用户id',
            username: 'string|必返回|用户名',
            giftScore: 'float|必返回|当前试玩积分',
            winScore: 'float|必返回|当前赢分',
            score: 'float|必返回|现有积分',
            canRedeemAmount: 'float|必返回|当前可以申请赎回的金额',
            redeemAmount: 'float|必返回|当前在审核的赎回金额',
            totalGiftScore: 'float|必返回|历史总试玩积分',
            totalWinScore: 'float|必返回|历史总赢取积分',
            totalRebate: 'float|选返回|历史总返利',
            totalRecharge: 'float|必返回|历史总充值',
            totalRedeem: 'float|必返回|历史总赎回',
            lastLoginAt: 'string|必返回|最近登陆时间',
            registedAt: 'string|必返回|用户注册时间',
            offlineAt: 'string|必返回|用户离线时间',
            deviceId: 'string|必返回|设备id',
            cashappTag: 'string|必返回|cashapp标签',
            lastRechargeAt: 'string|必返回|最近充值时间',
            lastRechargeAmount: 'float|必返回|最近充值金额',
            parentId: 'string|必返回|上级id',
          },
          message: 'string|必返回|消息',
        },
      },
    },
  },
  {
    title: '获取用户充值记录接口api配置',
    type: 'api',
    name: 'queryUserRechargeListApi',
    form: {
      url: {
        value: '',
        readOnly: false,
      },
      input: {
        readOnly: true,
        value: {
          userId: 'string|和username必填一个|用户id',
          username: 'string|和userId必填一个|用户名',
        },
      },
      output: {
        readOnly: true,
        value: {
          code: 'int|必返回|状态码',
          data: {
            list: [
              {
                id: 'string|必返回|充值记录id',
                amount: 'float|必返回|充值金额',
                createdAt: 'string|必返回|充值时间',
              },
            ],
          },
          message: 'string|必返回|消息',
        },
      },
    },
  },
  {
    title: '获取用户赎回记录接口api配置',
    type: 'api',
    name: 'queryUserRedeemListApi',
    form: {
      url: {
        value: '',
        readOnly: false,
      },
      input: {
        readOnly: true,
        value: {
          userId: 'string|和username必填一个|用户id',
          username: 'string|和userId必填一个|用户名',
        },
      },
      output: {
        readOnly: true,
        value: {
          code: 'int|必返回|状态码',
          data: {
            list: [
              {
                id: 'string|必返回|赎回记录id',
                amount: 'float|必返回|赎回金额',
                deviceId: 'string|必返回|设备id',
                rechargeAmount: 'float|必返回|赎回前充值金额',
                status: 'int|必返回|赎回状态(-1:审核中,1:已赎回,-2:已拒绝)',
                createdAt: 'string|必返回|赎回时间',
              },
            ],
          },
          message: 'string|必返回|消息',
        },
      },
    },
  },
  {
    title: '登陆事件webhook配置',
    type: 'webhook',
    name: 'loginWebhook',
    form: {
      url: {
        value: 'https://www.xxxx.com/api/login_webhook',
        readOnly: true,
      },
      input: {
        readOnly: true,
        value: {
          userId: 'string|必填|用户id',
        },
      },
      output: {
        readOnly: true,
        value: {
          code: 'int|必返回|状态码',
          data: {},
          message: 'string|必返回|消息',
        },
      },
    },
  },
])

const WS_KEY = 'facebook_ws'

let wsService = null

onMounted(() => {
  getDataList()
  if (formMode.value === 'router') {
    eventBus.on('get-data-list', () => {
      getDataList()
    })
  }
  wsService = WebSocketService.getInstance(WS_KEY, {
    token: () => userStore.token || '',
    path: '/ws_facebook/connect',
  })

  // 注册消息处理器
  wsService.registerHandler('update_instance', (data) => {
    console.log('收到聊天消息:', data)
  })

  // 发送消息
  wsService.send('send_message', { text: 'Hello' })

  // 注册错误处理器
  // window.ipcRenderer.on('update-container-list', (_event, containers: { containerId: string }[]) => {
  //   containers.forEach(({ containerId }) => {
  //     containerList.value.push({ containerId, note: storage.local.get(containerId) || containerId })
  //   })
  // })
})

onBeforeUnmount(() => {
  if (formMode.value === 'router') {
    eventBus.off('get-data-list')
  }
  WebSocketService.destroyInstance(WS_KEY)
})

// 列表
const loading = ref(false)
const configLoading = ref(false)
// 明确指定 dataList 的类型
interface DataItem {
  id: number
  name: string
  status: number
  remark: any
}
const dataList = ref<DataItem[]>([])

function getDataList() {
  loading.value = true
  const params = {}
  apiWorkTable.getChromeFacebookList(params).then((res: any) => {
    loading.value = false
    dataList.value = res.data.list
    for (let i: number = 0; i < res.data.list.length; i++) {
      window.ipcRenderer.send('start-browsers', res.data.list[i].name)
    }
  })
}

function onCreate() {
  router.push({
    name: 'pluginFacebookGameDetail',
    params: {
      id: 0,
    },
  })
}

function onEdit(row: any) {
  router.push({
    name: 'pluginFacebookGameDetail',
    params: {
      id: row.id,
    },
  })
}

function onDel(row: any) {
  ElMessageBox.confirm(`确认删除「${row.remark}」吗？`, '确认信息')
    .then(() => {
      apiWorkTable.delChromeFacebook({ id: row.id }).then(() => {
        window.ipcRenderer.send('delete-browsers', row.name)
        getDataList()
        ElMessage.success({
          message: '删除成功',
          center: true,
        })
      })
    })
    .catch(() => {})
}

function onEnable(row: any) {
  ElMessageBox.confirm(`确认启动「${row.remark}」吗？`, '确认信息')
    .then(() => {
      apiWorkTable.enableChromeFacebook({ id: row.id }).then(() => {
        getDataList()
        ElMessage.success({
          message: '启动成功',
          center: true,
        })
      })
    })
    .catch(() => {})
}

function onDisable(row: any) {
  ElMessageBox.confirm(`确认关闭「${row.remark}」吗？`, '确认信息')
    .then(() => {
      apiWorkTable.disableChromeFacebook({ id: row.id }).then(() => {
        getDataList()
        ElMessage.success({
          message: '关闭成功',
          center: true,
        })
      })
    })
    .catch(() => {})
}

//  同步主页用户和消息
function onSyncChromeFacebook(row: any) {
  ElMessageBox.confirm(`确认同步主页吗？`, '确认信息')
    .then(() => {
      apiWorkTable.syncChromeFacebook({ id: row.id }).then(() => {
        getDataList()
        ElMessage.success({
          message: '同步开始！！',
          center: true,
        })
      })
    })
    .catch(() => {})
}

function onShow(row: any) {
  window.ipcRenderer.send('show-container', row.name)
}

function onSubmit(item: any) {
  formRef.value?.validate((valid) => {
    if (valid) {
      configLoading.value = true
      apiWorkTable
        .saveChromeFacebookConfig(item)
        .then(async () => {
          toast.success('修改成功')
        })
        .finally(() => {
          configLoading.value = false
        })
    }
  })
}
// function onTest(row: any) {
//   window.ipcRenderer.send('timer-control', row.name, 'start')
// }
</script>

<template>
  <div class="mt-10 w-full flex flex-col gap-4 px-4 xl-flex-row">
    <FaPageMain
      class="m-0 h-92vh w-40% overflow-auto"
      title-class="flex flex-wrap items-center justify-between gap-4 "
    >
      <template #title>
配置列表
</template>
      <div class="config-list" :loading="configLoading">
        <FaPageMain
          v-for="(item, index) in configList"
          :key="index"
          :title="item.title"
          class="m-t-3"
          :collaspe="true"
          height="70px"
        >
          <ElForm ref="formRef" :model="item.form">
            <FormField v-if="item.form.url && typeof item.form.url === 'object'" name="url">
              <FormItem class="relative pb-6 space-y-0">
                <FaInput
                  v-model="item.form.url.value"
                  :disabled="item.form.url.readOnly"
                  type="text"
                  placeholder="请输入请求url"
                  class="w-full"
                />
              </FormItem>
            </FormField>
            <div class="mt-4 flex flex-row gap-4">
              <FormField v-if="typeof item.form.input === 'object'">
                <label class="text-sm text-gray-500">请求体</label>
                <FormItem class="relative text-sm space-y-0">
                  <pre
                    class="json-view"
                  ><code>{{ JSON.stringify(item.form.input.value, null, 2) }}</code></pre>
                </FormItem>
              </FormField>
              <FormField v-if="typeof item.form.output === 'object'">
                <label class="text-sm text-gray-500">返回体</label>
                <FormItem class="relative text-sm space-y-0">
                  <pre
                    class="json-view"
                  ><code>{{ JSON.stringify(item.form.output.value, null, 2) }}</code></pre>
                </FormItem>
              </FormField>
            </div>
            <FaButton size="lg" class="m-b-5 mt-8 w-full" type="submit" @click="onSubmit">
              保存
            </FaButton>
          </ElForm>
        </FaPageMain>
      </div>
    </FaPageMain>
    <FaPageMain
      class="m-0 h-92vh w-60% overflow-auto"
      title-class="flex flex-wrap items-center justify-between gap-4"
    >
      <template #title>
浏览器列表
</template>
      <div>
        <FaButton @click="onCreate">
添加
</FaButton>
      </div>
      <div v-for="(item, index) in dataList" :key="index">
        <ElButton @click="onEdit(item)">
编辑{{ item.remark }}
</ElButton>
        <ElButton v-if="item.status === 1" @click="onShow(item)">
打开{{ item.remark }}
</ElButton>
        <ElButton @click="onDel(item)">
删除{{ item.remark }}
</ElButton>
        <ElButton v-if="item.status === -1" @click="onEnable(item)">
          启动{{ item.remark }}
        </ElButton>
        <ElButton v-else @click="onDisable(item)">
关闭{{ item.remark }}
</ElButton>
        <ElButton @click="onSyncChromeFacebook(item)">
同步{{ item.remark }}
</ElButton>
        <FaSpotlightCard>
          <div class="flex flex-col gap-2 rounded p-6 lg:p-8">
            <FaIcon name="i-ri:magic-line" class="h-8 w-8" />
            <h1 class="text-2xl font-medium">
              悬停在这
            </h1>
          </div>
        </FaSpotlightCard>
      </div>
    </FaPageMain>
  </div>
</template>

<style scoped>
/* 可以根据需要添加更多样式 */

.h-92vh {
  height: 92vh;
}

:deep(.vjs-tree) {
  font-size: 10px !important;
}

:deep(.vjs-value) {
  font-size: 10px !important;
}

:deep(.vjs-key) {
  font-size: 10px !important;
}

.json-view {
  max-height: 300px;
  padding: 8px;
  margin: 0;
  overflow: auto;
  font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
  font-size: 11px;
  line-height: 1.4;
  color: #333;
  word-break: break-word;
  white-space: pre-wrap;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.json-view code {
  padding: 0;
  background: transparent;
}
</style>
