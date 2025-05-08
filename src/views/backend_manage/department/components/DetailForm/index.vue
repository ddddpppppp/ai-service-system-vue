<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import apiAdmin from '@/api/modules/admin'
import apiSetting from '@/api/modules/setting'
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
  uuid: props.id,
  name: '',
  adminId: '',
})
const formRules = ref<FormRules>({
  name: [
    { required: true, message: '请输入名称', trigger: 'blur' },
    // { required: true, message: '请选择部门管理员', trigger: 'blur' },
  ],
})

const adminList = ref<any[]>([])

onMounted(() => {
  getInfo()
})

function getInfo() {
  loading.value = true
  apiAdmin.getAllAdmin({}).then((res: any) => {
    loading.value = false
    if (res.status === 1) {
      adminList.value = res.data.adminList
    }
  })
  if (form.value.uuid && Number.parseInt(form.value.uuid as string) !== 0) {
    apiSetting.getDepartment({ uuid: form.value.uuid }).then((res: any) => {
      loading.value = false
      if (res.status === 1) {
        if (res.data.department) {
          form.value = res.data.department
        }
      }
    })
  }
}
defineExpose({
  submit() {
    return new Promise<void>((resolve, reject) => {
      formRef.value?.validate((valid) => {
        if (valid) {
          loading.value = true
          apiSetting.editDepartment({ form: form.value }).then((res: any) => {
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
        else {
          reject(new Error('请检查输入内容'))
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
    </ElForm>
    <ElForm ref="formRef" :model="form" :rules="formRules" label-width="120px" label-suffix="：">
      <ElFormItem label="部门管理员" prop="adminId">
        <ElSelect v-model="form.adminId" placeholder="请选择部门管理员">
          <ElOption v-for="item in adminList" :key="item.uuid" :label="item.name" :value="item.uuid" />
        </ElSelect>
      </ElFormItem>
    </ElForm>
  </div>
</template>
