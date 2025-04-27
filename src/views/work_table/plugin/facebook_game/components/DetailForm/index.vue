<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import apiWorkTable from '@/api/modules/work_table'
import { ElMessage } from 'element-plus'

export interface Props {
  id?: number | string
}
const props = withDefaults(
  defineProps<Props>(),
  {
    id: '',
  },
)

const loading = ref(false)
const formRef = useTemplateRef<FormInstance>('formRef')
const form = ref({
  id: props.id,
  name: '',
  agentId: '',
  remark: '',
  channelId: '',
  landingPage: '',
})
const formRules = ref<FormRules>({
  name: [
    { required: true, message: '请输入名称', trigger: 'blur' },
  ],
  agentId: [
    { required: true, message: '请输入代理id', trigger: 'blur' },
  ],
  remark: [
    { required: true, message: '请输入备注', trigger: 'blur' },
  ],
  channelId: [
    { required: true, message: '请输入主页id', trigger: 'blur' },
  ],
  landingPage: [
    { required: true, message: '请输入落地页', trigger: 'blur' },
  ],
})

onMounted(() => {
  getInfo()
})

function getInfo() {
  if (Number(form.value.id) !== 0) {
    loading.value = true
    apiWorkTable.getChromeFacebook({ id: form.value.id }).then((res: any) => {
      loading.value = false
      if (res.status === 1) {
        if (res.data.item) {
          form.value = res.data.item
        }
      }
    })
  }
}
defineExpose({
  submit() {
    return new Promise<void>((resolve) => {
      formRef.value?.validate((valid) => {
        if (valid) {
          loading.value = true
          apiWorkTable.editChromeFacebook({ form: form.value }).then((res: any) => {
            loading.value = false
            if (res.status === 1) {
              ElMessage.success({
                message: res.statusText,
                center: true,
              })
            }
            resolve()
          })
        }
      })
    })
  },
})
</script>

<template>
  <div v-loading="loading">
    <ElForm ref="formRef" :model="form" :rules="formRules" label-width="120px" label-suffix="：">
      <ElFormItem label="名称" prop="name">
        <ElInput v-model="form.name" placeholder="请输入名称" />
      </ElFormItem>
      <ElFormItem label="代理id" prop="agentId">
        <ElInput v-model="form.agentId" placeholder="请输入代理id" />
      </ElFormItem>
      <ElFormItem label="备注" prop="remark">
        <ElInput v-model="form.remark" placeholder="请输入Facebook备注" />
      </ElFormItem>
      <ElFormItem label="主页id" prop="channelId">
        <ElInput v-model="form.channelId" placeholder="请输入主页id" />
      </ElFormItem>
      <ElFormItem label="落地页" prop="landingPage">
        <ElInput v-model="form.landingPage" placeholder="请输入落地页" />
      </ElFormItem>
    </ElForm>
  </div>
</template>
