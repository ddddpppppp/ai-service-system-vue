<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import apiAdmin from '@/api/modules/admin'
import apiSetting from '@/api/modules/setting'
import ImageUpload from '@/components/ImageUpload/index.vue'
import { useFaModal } from '@/ui/components/FaModal'
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
  departmentId: '',
})
const roleList = ref([{ id: 0, name: '请选择角色' }])
const departmentList = ref([{ uuid: '', name: '请选择部门' }])
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
  departmentId: [
    { required: true, message: '请选择部门', trigger: 'blur' },
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
        roleList.value = res.data.list
      }
    }
  }).catch((e) => {
    loading.value = false
    useFaModal().error({
      title: '提醒',
      content: e.statusText,
    })
  })
  apiAdmin.getAllDepartment({}).then((res) => {
    if (res.status === 1) {
      if (res.data.list) {
        departmentList.value = res.data.list
      }
    }
  }).catch((e) => {
    useFaModal().error({
      title: '提醒',
      content: e.statusText,
    })
  }).finally(() => {
    loading.value = false
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
    return new Promise<void>((resolve, reject) => {
      formRef.value?.validate((valid) => {
        if (valid) {
          loading.value = true
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
      <ElFormItem label="部门" prop="departmentId">
        <el-select v-model="form.departmentId" placeholder="请选择部门">
          <el-option v-for="(department, index) in departmentList" :key="index" :label="department.name" :value="department.uuid" />
        </el-select>
      </ElFormItem>
    </ElForm>
  </div>
</template>
