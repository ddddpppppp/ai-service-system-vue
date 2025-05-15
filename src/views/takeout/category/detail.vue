<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import apiTakeout from '@/api/modules/takeout'
import ImageUpload from '@/components/ImageUpload/index.vue'
import { ElMessage } from 'element-plus'
import { inject, ref, useTemplateRef, watch } from 'vue'

export interface Props {
  id?: number | string
  type?: 'home' | 'shop'
  storeId?: number | string
}
const props = withDefaults(
  defineProps<Props>(),
  {
    id: '',
    type: 'home',
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
    id: props.id,
    name: '',
    image: '',
    storeId: props.storeId,
    createdAt: '',
    updatedAt: '',
  }
}

const form = ref(createInitialFormState())
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
    { required: true, message: '请选择店铺', trigger: 'change' },
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
  if (props.type === 'shop') {
    form.value.storeId = props.storeId
    apiTakeout.getAllStore().then((res: any) => {
      storeList.value = res.data.list
    })
  }
  if (props.id && props.id !== '') {
    loading.value = true
    apiTakeout.getCategory({ id: props.id }).then((res: any) => {
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
}
</script>

<template>
  <div>
    <el-dialog
      v-model="visible"
      width="500px"
      :title="id ? '编辑分类' : '新增分类'"
      :close-on-click-modal="true"
      destroy-on-close
      class="conversation-drawer"
    >
      <div v-loading="loading" class="takeout-category-main">
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
