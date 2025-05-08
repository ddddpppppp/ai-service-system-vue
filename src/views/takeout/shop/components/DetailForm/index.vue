<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import apiTakeout from '@/api/modules/takeout'
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
  name: '',
  image: '',
  intro: '',
  tel: '',
  address: '',
  createdAt: '',
  updatedAt: '',
})
const formRules = ref<FormRules>({
  name: [
    { required: true, message: '请输入商铺名称，例如711便利店', trigger: 'blur' },
  ],
  image: [
    { required: true, message: '请上传商铺图片', trigger: 'blur' },
  ],
  intro: [
    { required: true, message: '请输入商铺简介', trigger: 'blur' },
  ],
  tel: [
    { required: true, message: '请输入商铺电话', trigger: 'blur' },
  ],
  address: [
    { required: true, message: '请输入商铺地址', trigger: 'blur' },
  ],
})

onMounted(() => {
  getInfo()
})

function getInfo() {
  if (Number(form.value.id) !== 0) {
    loading.value = true
    apiTakeout.getStore({ id: form.value.id }).then((res: any) => {
      loading.value = false
      if (res.status === 1) {
        form.value = res.data.store
      }
    })
  }
}

function onUploadSuccess(res: any) {
  form.value.image = res.data.url
}

defineExpose({
  submit() {
    return new Promise<void>((resolve, reject) => {
      formRef.value?.validate((valid) => {
        if (valid) {
          loading.value = true
          apiTakeout.editStore({ form: form.value }).then((res: any) => {
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
      <ElFormItem label="商铺名称" prop="name">
        <ElInput v-model="form.name" placeholder="请输入商铺名称，例如711便利店" />
      </ElFormItem>
      <ElFormItem label="商铺图片" prop="image">
        <ImageUpload v-model="form.image" :action="uploadFileAction" :width="100" :height="100" :notip="true" @on-success="onUploadSuccess" />
      </ElFormItem>
      <ElFormItem label="商铺简介" prop="intro">
        <ElInput v-model="form.intro" type="textarea" placeholder="请输入商铺简介" />
      </ElFormItem>
      <ElFormItem label="商铺电话" prop="tel">
        <ElInput v-model="form.tel" placeholder="请输入商铺电话" />
      </ElFormItem>
      <ElFormItem label="商铺地址" prop="address">
        <ElInput v-model="form.address" type="textarea" placeholder="请输入商铺地址" />
      </ElFormItem>
    </ElForm>
  </div>
</template>
