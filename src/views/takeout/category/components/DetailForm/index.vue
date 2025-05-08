<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import apiTakeout from '@/api/modules/takeout'
import ImageUpload from '@/components/ImageUpload/index.vue'
import { ElMessage } from 'element-plus'
import { inject } from 'vue'

export interface Props {
  id?: number | string
  type?: 'home' | 'shop'
}
const props = withDefaults(
  defineProps<Props>(),
  {
    id: '',
    type: 'home',
  },
)

const uploadFileAction = String(inject('uploadFileAction'))
const loading = ref(false)
const formRef = useTemplateRef<FormInstance>('formRef')
const form = ref({
  id: props.id,
  name: '',
  image: '',
  storeId: '',
  createdAt: '',
  updatedAt: '',
})
const storeList = ref([
  {
    storeId: '',
    name: '全部',
  },
])
const formRules = ref<FormRules>({
  name: [
    { required: true, message: '请输入分类名称，例如蛋糕，咖啡', trigger: 'blur' },
  ],
  image: [
    { required: true, message: '请上传分类图片', trigger: 'blur' },
  ],
  storeId: [
    { required: true, message: '请选择店铺', trigger: 'blur' },
  ],
})

onMounted(() => {
  getInfo()
})

function getInfo() {
  if (props.type === 'shop') {
    form.value.storeId = ''
    apiTakeout.getAllStore().then((res: any) => {
      storeList.value = res.data.list
    })
  }
  if (Number(form.value.id) !== 0) {
    loading.value = true
    apiTakeout.getCategory({ id: form.value.id }).then((res: any) => {
      loading.value = false
      if (res.status === 1) {
        form.value = res.data.category
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
          apiTakeout.editCategory({ form: form.value }).then((res: any) => {
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
      <ElFormItem label="分类名称" prop="name">
        <ElInput v-model="form.name" placeholder="请输入分类名称，例如中餐，蛋糕，咖啡" />
      </ElFormItem>
      <ElFormItem v-if="type === 'shop'" label="店铺" prop="storeId">
        <ElSelect v-model="form.storeId" placeholder="请选择店铺">
          <ElOption v-for="item in storeList" :key="item.storeId" :label="item.name" :value="item.storeId" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="分类图片" prop="image">
        <ImageUpload v-model="form.image" :action="uploadFileAction" :width="100" :height="100" :notip="true" @on-success="onUploadSuccess" />
      </ElFormItem>
    </ElForm>
  </div>
</template>
