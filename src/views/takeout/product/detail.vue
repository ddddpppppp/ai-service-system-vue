<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import apiTakeout from '@/api/modules/takeout'
import ImageUpload from '@/components/ImageUpload/index.vue'
import { ElMessage } from 'element-plus'
import { inject, ref, useTemplateRef, watch } from 'vue'

export interface Props {
  id?: number | string
  storeId?: number | string
}
const props = withDefaults(
  defineProps<Props>(),
  {
    id: '',
    storeId: '',
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
    productId: props.id,
    name: '',
    image: '',
    intro: '',
    price: '',
    storeCategoryId: '',
    storeId: props.storeId,
    createdAt: '',
    updatedAt: '',
  }
}

const form = ref(createInitialFormState())

const storeCategoryList = ref([{
  id: 0,
  name: '请选择分类',
}])
const storeList = ref([{
  storeId: '',
  name: '请选择店铺',
}])

const formRules = ref<FormRules>({
  name: [
    { required: true, message: '请输入产品名称', trigger: 'blur' },
  ],
  image: [
    { required: true, message: '请上传产品图片', trigger: 'change' },
  ],
  intro: [
    { required: true, message: '请输入产品简介', trigger: 'blur' },
  ],
  price: [
    { required: true, message: '请输入产品价格', trigger: 'blur' },
  ],
  storeCategoryId: [
    { required: true, message: '请选择店铺分类', trigger: 'change' },
  ],
  storeId: [
    { required: true, message: '请选择店铺', trigger: 'change' },
  ],
})

watch(() => props.storeId, (newStoreId) => {
  form.value.storeId = newStoreId
})

// 监听对话框显示状态，当显示时重新加载数据
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
  apiTakeout.getAllStoreCategory({ storeId: props.storeId }).then((res: any) => {
    storeCategoryList.value = res.data.list
  })
  apiTakeout.getAllStore().then((res: any) => {
    storeList.value = res.data.list
  })
  if (props.id && props.id !== '') {
    loading.value = true
    apiTakeout.getProduct({ id: props.id }).then((res: any) => {
      loading.value = false
      if (res.status === 1) {
        form.value = res.data.product
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
        apiTakeout.editProduct({ form: form.value }).then((res: any) => {
          if (res.status === 1) {
            ElMessage.success({
              message: res.statusText,
              center: true,
            })
          }
          resolve()
        }).finally(() => {
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
      width="700px"
      :title="id ? '编辑产品' : '新增产品'"
      :close-on-click-modal="true"
      destroy-on-close
      class="conversation-drawer"
    >
      <div v-loading="loading" class="takeout-product-main">
        <ElForm ref="formRef" :model="form" :rules="formRules" label-width="120px" label-suffix="：">
          <ElFormItem label="店铺" prop="storeId">
            <ElSelect v-model="form.storeId" placeholder="请选择店铺" clearable :disabled="true">
              <ElOption v-for="item in storeList" :key="item.storeId" :label="item.name" :value="item.storeId" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="产品名称" prop="name">
            <ElInput v-model="form.name" placeholder="请输入产品名称" />
          </ElFormItem>
          <ElFormItem label="产品图片" prop="image">
            <ImageUpload v-model="form.image" :action="uploadFileAction" :width="100" :height="100" :notip="true" :size="3000" @on-success="onUploadSuccess" />
          </ElFormItem>
          <ElFormItem label="店铺分类" prop="storeCategoryId">
            <ElSelect v-model="form.storeCategoryId" placeholder="请选择店铺分类" clearable>
              <ElOption v-for="item in storeCategoryList" :key="item.id" :label="item.name" :value="item.id" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="产品价格" prop="price">
            <ElInput v-model="form.price" placeholder="请输入产品价格" />
          </ElFormItem>
          <ElFormItem label="产品简介" prop="intro">
            <ElInput v-model="form.intro" type="textarea" placeholder="请输入产品简介" :rows="4" />
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

.takeout-product-main {
  margin-top: 20px;
}
</style>
