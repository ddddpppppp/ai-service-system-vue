<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import apiAdmin from '@/api/modules/admin'
import apiSetting from '@/api/modules/setting'
import ImageUpload from '@/components/ImageUpload/index.vue'
import { ElMessage } from 'element-plus'
import { inject } from 'vue'

export interface Props {
  id?: number | string
}
const props = withDefaults(
  defineProps<Props>(),
  {
    id: '',
  },
)

const uploadFileAction = String(inject('uploadFileAction'))
const loading = ref(false)
const formRef = useTemplateRef<FormInstance>('formRef')
const form = ref({
  id: props.id,
  avatar: '',
  nickname: '',
  username: '',
  password: '',
  roleId: 0,
})
const roleList = ref([])
let usernameDisabled = false
const formRules = ref<FormRules>({
  avatar: [
    { required: true, message: '请上传头像', trigger: 'blur' },
  ],
  nickname: [
    { required: true, message: '请输入管理员昵称', trigger: 'blur' },
  ],
  username: [
    { required: true, message: '请输入管理员账号', trigger: 'blur' },
  ],
  roleId: [
    { required: true, message: '请选择角色', trigger: 'blur' },
  ],
})

onMounted(() => {
  getInfo()
})

function getInfo() {
  loading.value = true
  apiAdmin.getAllRole({}).then((res) => {
    if (res.status === 1) {
      if (res.data.list) {
        loading.value = false
        roleList.value = res.data.list
      }
    }
  })
  if (Number(form.value.id) !== 0) {
    usernameDisabled = true
    apiSetting.getAdmin({ id: form.value.id }).then((res: any) => {
      if (res.status === 1) {
        if (res.data.admin) {
          form.value = res.data.admin
        }
      }
    })
  }
}
function onUpdateAvatar(res: any) {
  form.value.avatar = res.data.url
}
defineExpose({
  submit() {
    return new Promise<void>((resolve) => {
      formRef.value?.validate((valid) => {
        if (valid) {
          apiSetting.editAdmin({ form: form.value }).then((res: any) => {
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
      <ElFormItem label="头像" prop="avatar">
        <ImageUpload v-model="form.avatar" name="file" :width="150" :height="150" :action="uploadFileAction" @on-success="onUpdateAvatar" />
      </ElFormItem>
      <ElFormItem label="昵称" prop="nickname">
        <ElInput v-model="form.nickname" placeholder="请输入管理员名称" />
      </ElFormItem>
      <ElFormItem label="登录账号" prop="username">
        <ElInput v-model="form.username" placeholder="请输入登录账号" :disabled="usernameDisabled" />
      </ElFormItem>
      <ElFormItem label="登录密码" prop="password">
        <ElInput v-model="form.password" placeholder="请输入登录密码，不输入就不更改密码" />
      </ElFormItem>
      <ElFormItem label="角色" prop="roleId">
        <el-radio-group v-model="form.roleId">
          <el-radio v-for="(role, index) in roleList" :key="index" :value="role.id">
          {{ role.name }}
          </el-radio>
        </el-radio-group>
      </ElFormItem>
</ElForm>
  </div>
</template>
