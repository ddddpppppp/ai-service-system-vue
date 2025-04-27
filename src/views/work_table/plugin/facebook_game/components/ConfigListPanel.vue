<script setup lang="ts">
import type { FormInstance } from 'element-plus'
import apiWorkTable from '@/api/modules/work_table'
import { FormField } from '@/ui/shadcn/ui/form'
import { ref } from 'vue'
import { toast } from 'vue-sonner'

defineProps({
  configLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:configLoading', 'refreshConfig'])

const formRef = useTemplateRef<FormInstance>('formRef')

// 配置列表数据
interface ConfigForm {
  freeplayAmount?: {
    value: number
    readOnly: number
  }
  sendAfterRecharge?: {
    value: boolean
    readOnly: number
  }
  url?: {
    value: string
    readOnly: number
  }
  input?: {
    readOnly: number
    value: any
  }
  output?: {
    readOnly: number
    value: any
  }
}

interface ConfigItem {
  title: string
  type: 'api' | 'webhook' | 'rule'
  name: string
  form: ConfigForm
}

const configList = ref<ConfigItem[]>([
  {
    title: '送分配置',
    type: 'rule',
    name: 'sendScoreConfig',
    form: {
      freeplayAmount: {
        value: 0,
        readOnly: 0,
      },
      sendAfterRecharge: {
        value: false,
        readOnly: 0,
      },
    },
  },
  {
    title: '注册接口api配置',
    type: 'api',
    name: 'registerApi',
    form: {
      url: {
        value: '',
        readOnly: 0,
      },
      input: {
        readOnly: 1,
        value: {
          username: 'string|必填|用户名',
          password: 'string|必填|密码',
          parentId: 'string|选填|父级id',
          agentId: 'string|选填|代理id',
          channelId: 'string|选填|渠道id',
        },
      },
      output: {
        readOnly: 1,
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
    title: '注册接口api配置',
    type: 'api',
    name: 'registerApi',
    form: {
      url: {
        value: '',
        readOnly: 0,
      },
      input: {
        readOnly: 1,
        value: {
          username: 'string|必填|用户名',
          password: 'string|必填|密码',
          parentId: 'string|选填|父级id',
          agentId: 'string|选填|代理id',
          channelId: 'string|选填|渠道id',
        },
      },
      output: {
        readOnly: 1,
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
    name: 'sendScoreApi',
    form: {
      url: {
        value: '',
        readOnly: 0,
      },
      input: {
        readOnly: 1,
        value: {
          userId: 'string|必填|用户id',
          score: 'float|必填|送分',
        },
      },
      output: {
        readOnly: 1,
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
        readOnly: 0,
      },
      input: {
        readOnly: 1,
        value: {
          userId: 'string|必填|用户id',
          amount: 'float|必填|充值金额',
        },
      },
      output: {
        readOnly: 1,
        value: {
          code: 'int|必返回|状态码',
          data: { url: 'string|必返回|充值链接' },
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
        readOnly: 0,
      },
      input: {
        readOnly: 1,
        value: {
          userId: 'string|必填|用户id',
          amount: 'float|必填|赎回金额',
        },
      },
      output: {
        readOnly: 1,
        value: {
          code: 'int|必返回|状态码',
          data: {},
          message: 'string|必返回|消息',
        },
      },
    },
  },
  {
    title: '查询用户Id接口api配置',
    type: 'api',
    name: 'queryUserIdApi',
    form: {
      url: {
        value: '',
        readOnly: 0,
      },
      input: {
        readOnly: 1,
        value: {
          username: 'string|必填|用户名',
        },
      },
      output: {
        readOnly: 1,
        value: {
          code: 'int|必返回|状态码',
          data: {
            userId: 'string|必返回|用户id',
          },
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
        readOnly: 0,
      },
      input: {
        readOnly: 1,
        value: {
          userId: 'string|和username必填一个|用户id',
          username: 'string|和userId必填一个|用户名',
        },
      },
      output: {
        readOnly: 1,
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
        readOnly: 0,
      },
      input: {
        readOnly: 1,
        value: {
          userId: 'string|和username必填一个|用户id',
          username: 'string|和userId必填一个|用户名',
        },
      },
      output: {
        readOnly: 1,
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
        readOnly: 0,
      },
      input: {
        readOnly: 1,
        value: {
          userId: 'string|和username必填一个|用户id',
          username: 'string|和userId必填一个|用户名',
        },
      },
      output: {
        readOnly: 1,
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
        readOnly: 1,
      },
      input: {
        readOnly: 1,
        value: {
          userId: 'string|必填|用户id',
        },
      },
      output: {
        readOnly: 1,
        value: {
          code: 'int|必返回|状态码',
          data: {},
          message: 'string|必返回|消息',
        },
      },
    },
  },
])

function getConfigList() {
  emit('update:configLoading', true)
  const params = {}
  apiWorkTable.getChromeFacebookConfig(params).then((res: any) => {
    emit('update:configLoading', false)
    if (res.data.list && res.data.list.length > 0) {
      res.data.list.forEach((apiItem: any) => {
        configList.value.forEach((item, index) => {
          if (item.name === apiItem.name) {
            if (item.name === 'sendScoreConfig' && item.type === 'rule') {
              if (!apiItem.form.freeplayAmount) {
                apiItem.form.freeplayAmount = { value: 0, readOnly: 0 }
              }
              if (!apiItem.form.sendAfterRecharge) {
                apiItem.form.sendAfterRecharge = { value: false, readOnly: 0 }
              }
            }
            configList.value[index] = apiItem
          }
        })
      })
    }
  })
}

function onSaveConfig(item: any) {
  emit('update:configLoading', true)
  apiWorkTable
    .saveChromeFacebookConfig(item)
    .then(async () => {
      toast.success('修改成功')
      emit('refreshConfig')
    })
    .finally(() => {
      emit('update:configLoading', false)
    })
}

// Expose methods to parent component
defineExpose({
  getConfigList,
  configList,
})
</script>

<template>
  <FaPageMain
    class="m-0 h-92vh w-full overflow-auto"
    title-class="flex flex-wrap items-center justify-between gap-4"
  >
    <template #title>
      配置列表
    </template>
    <div class="config-list">
      <FaPageMain
        v-for="(item, index) in configList"
        :key="index"
        :title="item.title"
        class="m-t-3"
        :collaspe="true"
        height="70px"
      >
        <ElForm ref="formRef" :model="item.form">
          <template v-if="item.type === 'api' || item.type === 'webhook'">
            <FormField
              v-if="item.form.url && typeof item.form.url === 'object'"
              name="url"
            >
              <div class="relative pb-6 space-y-0">
                <FaInput
                  v-model="item.form.url.value"
                  :disabled="item.form.url.readOnly === 1"
                  type="text"
                  placeholder="请输入请求url"
                  class="w-full"
                />
              </div>
            </FormField>
            <div class="mt-4 flex flex-col gap-4 md:flex-row">
              <FormField v-if="typeof item.form.input === 'object'" name="input" class="w-full flex flex-col md:w-1/2">
                <div class="mb-2 text-gray-700 font-medium">
                  请求体
                </div>
                <div class="relative flex-grow text-sm space-y-0">
                  <pre class="json-view h-full"><code>{{ JSON.stringify(item.form.input.value, null, 2) }}</code></pre>
                </div>
              </FormField>
              <FormField v-if="typeof item.form.output === 'object'" name="output" class="w-full flex flex-col md:w-1/2">
                <div class="mb-2 text-gray-700 font-medium">
                  返回体
                </div>
                <div class="relative flex-grow text-sm space-y-0">
                  <pre class="json-view h-full"><code>{{ JSON.stringify(item.form.output.value, null, 2) }}</code></pre>
                </div>
              </FormField>
            </div>
          </template>

          <template v-else-if="item.type === 'rule' && item.name === 'sendScoreConfig'">
            <div class="mb-4 text-sm space-y-4">
              <div class="space-y-4">
                <div v-if="item.form.freeplayAmount" class="flex items-center gap-2">
                  <span class="w-48">Freeplay送分数量：</span>
                  <FaInput
                    v-model="item.form.freeplayAmount.value"
                    type="number"
                    placeholder="请输入送分金额"
                    class="flex-grow"
                    :disabled="item.form.freeplayAmount.readOnly === 1"
                  />
                </div>
                <!-- <div v-if="item.form.sendAfterRecharge" class="flex items-center gap-2">
                    <span class="w-48">上次有充值才送分：</span>
                    <ElSwitch
                      v-model="item.form.sendAfterRecharge.value"
                      :disabled="item.form.sendAfterRecharge.readOnly === 1"
                    />
                  </div> -->
              </div>
            </div>
          </template>

          <FaButton
            type="button"
            size="lg"
            class="m-b-5 mt-8 w-full"
            @click="onSaveConfig(item)"
          >
            保存
          </FaButton>
        </ElForm>
      </FaPageMain>
    </div>
  </FaPageMain>
</template>

<style scoped>
.json-view {
  height: 100%;
  max-height: none;
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
</style>
