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
  remark: '',
  channelId: '',
})
const formRules = ref<FormRules>({
  remark: [
    { required: true, message: '请输入备注', trigger: 'blur' },
  ],
  channelId: [
    { required: true, message: '请输入主页id', trigger: 'blur' },
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
      <ElFormItem label="备注" prop="nickname">
        <ElInput v-model="form.remark" placeholder="请输入Facebook备注" />
      </ElFormItem>
      <ElFormItem label="主页id" prop="channelId">
        <ElInput v-model="form.channelId" placeholder="请输入主页id" />
      </ElFormItem>
    </ElForm>
  </div>
</template>
