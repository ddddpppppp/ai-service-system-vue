<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import apiSetting from '@/api/modules/setting'
import apiTakeout from '@/api/modules/takeout'
import { InfoFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { ref, useTemplateRef, watch } from 'vue'

export interface Props {
  id?: number | string
}
const props = withDefaults(
  defineProps<Props>(),
  {
    id: '',
  },
)

const emits = defineEmits<{
  success: []
}>()

const btnDisabled = ref(false)

const visible = defineModel<boolean>({
  default: false,
})

const loading = ref(false)
const formRef = useTemplateRef<FormInstance>('formRef')

// 创建初始表单状态的函数
function createInitialFormState() {
  return {
    id: props.id,
    title: '',
    description: '',
    money: '',
    returnUrl: '',
    paymentChannel: '',
  }
}

const form = ref(createInitialFormState())
const paymentChannelList = ref([] as any[])
const formRules = ref<FormRules>({
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
  ],
  description: [
    { required: true, message: '请输入描述', trigger: 'blur' },
  ],
  money: [
    { required: true, message: '请输入金额', trigger: 'blur' },
  ],
})

// 监听props变化

watch(() => visible.value, (newVisible) => {
  if (newVisible) {
    nextTick(() => {
      // 重置表单为初始状态，然后加载数据
      form.value = createInitialFormState()
      getInfo()
    })
  }
})

onMounted(() => {
  getInfo()
})

function getInfo() {
  apiSetting.getAllPaymentChannel({}).then((res: any) => {
    paymentChannelList.value = res.data.list
  })
}

function onSubmit() {
  btnDisabled.value = true
  submit().then(() => {
    emits('success')
    onCancel()
  }).finally(() => {
    btnDisabled.value = false
  })
}

function onCancel() {
  // 重置表单数据为初始状态
  form.value = createInitialFormState()
  visible.value = false
}

function submit() {
  return new Promise<void>((resolve, reject) => {
    formRef.value?.validate((valid) => {
      if (valid) {
        loading.value = true
        apiTakeout.editOtherOrder({ form: form.value }).then((res: any) => {
          if (res.status === 1) {
            ElMessage.success({
              message: res.statusText,
              center: true,
            })
          }
        }).finally(() => {
          resolve()
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
    <el-dialog
      v-model="visible"
      width="500px"
      :title="id ? '编辑订单' : '新增订单'"
      :close-on-click-modal="true"
      destroy-on-close
      class="conversation-drawer"
    >
      <div v-loading="loading" class="takeout-category-main">
        <ElForm ref="formRef" :model="form" :rules="formRules" label-width="120px" label-suffix="：">
          <div class="mb-4 border-l-4 border-blue-400 rounded-md bg-blue-50 p-3">
            <div class="flex items-center">
              <el-icon class="mr-2 text-blue-500">
                <InfoFilled />
              </el-icon>
              <span class="text-blue-700 font-medium">提示：</span>
            </div>
            <div class="ml-6 mt-1 text-sm text-blue-600">
              手动添加订单并非外卖订单，用于接受转账需求服务。
            </div>
          </div>
          <ElFormItem label="支付渠道" prop="paymentChannel">
            <ElSelect v-model="form.paymentChannel" placeholder="请选择支付渠道">
              <ElOption v-for="item in paymentChannelList" :key="item.id" :label="item.name" :value="item.id" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="标题" prop="title">
            <ElInput v-model="form.title" placeholder="请输入标题，用于支付页面展示" class="w-full" />
            <!-- <div class="w-full flex items-center gap-2">
              <FaLinkPreview :url="payDetailImg" link-class="text-[#18794E] font-bold">
                <FaIcon name="hugeicons:help-circle" />
              </FaLinkPreview>
            </div> -->
          </ElFormItem>
          <ElFormItem label="描述" prop="description">
            <ElInput v-model="form.description" placeholder="请输入描述，用于支付页面展示" />
          </ElFormItem>
          <ElFormItem label="金额" prop="money">
            <ElInput v-model="form.money" placeholder="请输入金额" />
          </ElFormItem>
          <ElFormItem label="返回地址" prop="returnUrl">
            <ElInput v-model="form.returnUrl" placeholder="支付成功或者失败跳转的页面，如果为空，则不跳转" />
          </ElFormItem>
        </ElForm>
      </div>

      <div class="buttons">
        <ElButton size="large" @click="onCancel">
          取消
        </ElButton>
        <ElButton type="primary" size="large" :disabled="btnDisabled" @click="onSubmit">
          提交
        </ElButton>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.takeout-category-main {
  margin-top: 20px;
}
</style>
