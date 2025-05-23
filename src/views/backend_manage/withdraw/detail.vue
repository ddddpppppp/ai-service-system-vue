<route lang="yaml">
meta:
  enabled: false
</route>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import apiSetting from '@/api/modules/setting'
import eventBus from '@/utils/eventBus'
import { ElMessage } from 'element-plus'

defineOptions({
  name: 'BackendManageWithdrawDetail',
})

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const formRef = useTemplateRef<FormInstance>('formRef')
const btnDisabled = ref<boolean>(false)
// 创建初始表单状态的函数
function createInitialFormState() {
  return {
    id: route.params.id as string,
    amount: '',
    account: '',
    status: '',
  }
}
const balanceTotal = ref({
  balance: 0,
  balanceFrozen: 0,
})
const form = ref(createInitialFormState())
const formRules = ref<FormRules>({
  amount: [
    { required: true, message: '请输入提现金额', trigger: 'blur' },
    {
      validator: (_, value, callback) => {
        const amount = Number(value)
        if (Number.isNaN(amount)) {
          callback(new Error('请输入有效的金额'))
        }
        else if (amount < 100) {
          callback(new Error('提现金额不能小于100'))
        }
        else if (amount > balanceTotal.value.balance) {
          callback(new Error('提现金额不能超过可提现金额'))
        }
        else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
  account: [
    { required: true, message: '请输入提现账号', trigger: 'blur' },
  ],
})

// 监听路由参数变化
watch(() => route.params.id, (newId) => {
  form.value.id = newId as string
  getInfo()
})

onMounted(() => {
  getInfo()
})

function getInfo() {
  apiSetting.getBalanceTotal({}).then((res: any) => {
    if (res.status === 1) {
      balanceTotal.value.balance = res.data.balance
      balanceTotal.value.balanceFrozen = res.data.balanceFrozen
    }
  })
}

function onSubmit() {
  submit().then(() => {
    eventBus.emit('get-data-list')
    goBack()
  })
}

function onCancel() {
  // 重置表单数据
  form.value = createInitialFormState()
  goBack()
}

// 返回列表页
function goBack() {
  router.push({ name: 'backendManageWithdraw' })
}

function submit() {
  return new Promise<void>((resolve, reject) => {
    formRef.value?.validate((valid) => {
      if (valid) {
        btnDisabled.value = true
        loading.value = true
        apiSetting.editWithdraw({ form: form.value }).then((res: any) => {
          if (res.status === 1) {
            ElMessage.success({
              message: res.statusText,
              center: true,
            })
          }
          resolve()
        }).finally(() => {
          btnDisabled.value = false
          loading.value = false
        })
      }
      else {
        reject(new Error('请检查输入内容'))
      }
    })
  })
}
</script>

<template>
  <div>
    <FaPageHeader :title="!parseInt(route.params.id as string) ? '新增提现' : '账户提现申请'">
      <ElButton size="default" round @click="goBack">
        <template #icon>
          <FaIcon name="i-ep:arrow-left" />
        </template>
        返回
      </ElButton>
    </FaPageHeader>
    <FaPageMain>
      <!-- 添加步骤条 -->
      <ElRow type="flex" justify="center">
        <ElCol :span="24" :lg="16">
          <div class="steps-container">
            <el-steps :active="0" simple>
              <el-step title="提交提现申请" />
              <el-step title="管理员审理转账" />
              <el-step title="提现结果" />
            </el-steps>
          </div>
        </ElCol>
      </ElRow>

      <!-- 添加提现说明 -->
      <ElRow type="flex" justify="center">
        <ElCol :span="24" :lg="16">
          <div class="withdraw-notice">
            <div class="notice-content">
              <div class="notice-icon">
                <FaIcon name="i-ep:info-filled" />
              </div>
              <div class="notice-list">
                <div class="notice-title">
                  提现说明
                </div>
                <ol>
                  <li>每次允许提现金额要大于 <span class="highlight">$100</span> ，金额可精确到分。</li>
                  <li>暂仅支持提现至加密货币。</li>
                  <li>提现申请提交后预计1-3个工作日内进行审理转账。</li>
                </ol>
              </div>
            </div>
          </div>
        </ElCol>
      </ElRow>

      <ElRow type="flex" justify="center">
        <ElCol :md="24" :lg="16">
          <div v-loading="loading">
            <ElForm ref="formRef" :model="form" :rules="formRules" label-width="120px" label-suffix="：">
              <ElFormItem label="提现金额" prop="amount">
                <ElInput v-model="form.amount" placeholder="请输入提现金额" />
                <div class="balance-info">
                  <div class="balance-item">
                    <span class="balance-label">可提现金额：</span>
                    <span class="balance-value">${{ balanceTotal.balance }} </span>
                  </div>
                  <div class="balance-item">
                    <span class="balance-label">提现冻结中：</span>
                    <span class="balance-value">${{ balanceTotal.balanceFrozen }} </span>
                  </div>
                </div>
              </ElFormItem>
              <ElFormItem label="提现账号" prop="account">
                <ElInput v-model="form.account" placeholder="请输入提现账号" />
              </ElFormItem>
            </ElForm>
          </div>
        </ElCol>
      </ElRow>
    </FaPageMain>
    <FaFixedActionBar>
      <ElButton :disabled="btnDisabled" type="primary" size="large" @click="onSubmit">
        提交
      </ElButton>
      <ElButton size="large" @click="onCancel">
        取消
      </ElButton>
    </FaFixedActionBar>
  </div>
</template>

<style scoped>
.steps-container {
  margin-bottom: 20px;
}

.withdraw-notice {
  margin-bottom: 30px;
  background-color: #fffbf0;
  border: 1px solid #ffeeba;
  border-radius: 4px;
}

.notice-content {
  display: flex;
  padding: 15px;
}

.notice-icon {
  margin-top: 2px;
  margin-right: 15px;
  font-size: 18px;
  color: #e6a23c;
}

.notice-list {
  flex: 1;
}

.notice-title {
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: bold;
}

.notice-list ol {
  padding-left: 20px;
  margin: 0;
}

.notice-list li {
  margin-bottom: 6px;
  font-size: 13px;
  line-height: 1.5;
}

.notice-list li:last-child {
  margin-bottom: 0;
}

.highlight {
  font-weight: bold;
  color: #f56c6c;
}

.balance-info {
  display: flex;
  gap: 20px;
  padding: 10px 15px;
  margin-top: 8px;
  background-color: var(--el-color-primary-light-9);
  border-radius: 4px;
}

.balance-item {
  display: flex;
  align-items: center;
}

.balance-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.balance-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-color-primary);
}
</style>
