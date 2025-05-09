<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import apiTakeout from '@/api/modules/takeout'
import ImageUpload from '@/components/ImageUpload/index.vue'
import { ElMessage } from 'element-plus'
import { inject, ref, useTemplateRef, watch } from 'vue'

export interface Props {
  id?: number | string
  type?: 'home' | 'shop'
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

const uploadFileAction = String(inject('uploadFileAction'))
const loading = ref(false)
const formRef = useTemplateRef<FormInstance>('formRef')

// 创建初始表单状态的函数
function createInitialFormState() {
  return {
    storeId: props.id,
    name: '',
    image: '',
    intro: '',
    tel: '',
    address: '',
    createdAt: '',
    updatedAt: '',
  }
}

const form = ref(createInitialFormState())
const formRules = ref<FormRules>({
  name: [
    { required: true, message: '请输入商铺名称，例如711便利店', trigger: 'blur' },
  ],
  image: [
    { required: true, message: '请上传商铺图片', trigger: 'change' },
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

// 监听props.id变化
watch(() => props.id, (newId) => {
  form.value.storeId = newId
  getInfo()
})

onMounted(() => {
  getInfo()
})

function getInfo() {
  if (props.id && props.id !== '') {
    loading.value = true
    apiTakeout.getStore({ id: props.id }).then((res: any) => {
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
}
</script>

<template>
  <div>
    <el-dialog
      v-model="visible"
      width="500px"
      :title="id ? '编辑店铺' : '新增店铺'"
      :close-on-click-modal="true"
      destroy-on-close
      class="conversation-drawer"
    >
      <div v-loading="loading" class="takeout-shop-main">
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

.takeout-shop-main {
  margin-top: 20px;
}
</style>
