<route lang="yaml">
meta:
  enabled: false
</route>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import apiSlot from '@/api/modules/slot'
import ImagesUpload from '@/components/ImagesUpload/index.vue'
import eventBus from '@/utils/eventBus'
import { ElMessage } from 'element-plus'
import { inject, ref, useTemplateRef, watch } from 'vue'

defineOptions({
  name: 'SlotPetterDetail',
})

const route = useRoute()
const router = useRouter()

const uploadFileAction = String(inject('uploadFileAction'))
const loading = ref(false)
const formRef = useTemplateRef<FormInstance>('formRef')
const btnDisabled = ref<boolean>(false)

// 创建初始表单状态的函数
function createInitialFormState() {
  return {
    id: route.params.id as string,
    name: '',
    content: {
      images: [] as string[],
      text: [''] as string[],
    },
    scene: '',
    createdAt: '',
    updatedAt: '',
  }
}

const form = ref(createInitialFormState())
const sceneList = ref<Array<{ key: string | number, name: string }>>([])
const formRules = ref<FormRules>({
  name: [
    { required: true, message: '请输入话术名称', trigger: 'blur' },
  ],
  content: [
    { required: true, message: '请输入话术内容', trigger: 'blur' },
  ],
})

// 监听路由参数变化
watch(() => route.params.id, (newId) => {
  form.value.id = newId as string
  getInfo()
})

onMounted(() => {
  getInfo()
})

function getInfo() {
  apiSlot.getPetterSceneList({}).then((res: any) => {
    if (res.status === 1) {
      sceneList.value = res.data.list
    }
  })
  const id = route.params.id as string
  if (id && id !== '0') {
    loading.value = true
    apiSlot.getPetter({ id }).then((res: any) => {
      loading.value = false
      if (res.status === 1) {
        form.value = res.data.petter
        if (!Array.isArray(form.value.content.text)) {
          form.value.content.text = form.value.content.text ? [form.value.content.text] : ['']
        }
        if (form.value.content.text.length === 0) {
          form.value.content.text.push('')
        }
      }
    })
  }
}

function addTextItem() {
  form.value.content.text.push('')
}

function removeTextItem(index: number) {
  if (form.value.content.text.length > 1) {
    form.value.content.text.splice(index, 1)
  }
  else {
    ElMessage.warning('至少保留一项回复内容')
  }
}

function onUploadSuccess(res: any) {
  form.value.content.images.push(res.data.url)
}

function onSubmit() {
  btnDisabled.value = true
  submit().then(() => {
    eventBus.emit('get-data-list')
    goBack()
  }).finally(() => {
    btnDisabled.value = false
  })
}

function onCancel() {
  // 重置表单数据
  form.value = createInitialFormState()
  goBack()
}

// 返回列表页
function goBack() {
  router.push({ name: 'slotPetterManagement' })
}

function submit() {
  return new Promise<void>((resolve, reject) => {
    formRef.value?.validate((valid) => {
      if (valid) {
        loading.value = true
        apiSlot.editPetter({ form: form.value }).then((res: any) => {
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
    <FaPageHeader :title="!parseInt(route.params.id as string) ? '新增话术' : '编辑话术'">
      <ElButton size="default" round @click="goBack">
        <template #icon>
          <FaIcon name="i-ep:arrow-left" />
        </template>
        返回
      </ElButton>
    </FaPageHeader>
    <FaPageMain>
      <ElRow type="flex" justify="center">
        <ElCol :md="24" :lg="16">
          <div v-loading="loading">
            <ElForm ref="formRef" :model="form" :rules="formRules" label-width="120px" label-suffix="：">
              <ElFormItem label="话术名称" prop="name">
                <ElInput v-model="form.name" placeholder="请输入话术名称" />
              </ElFormItem>
              <ElFormItem label="场景" prop="scene">
                <ElSelect v-model="form.scene">
                  <ElOption v-for="scene in sceneList" :key="scene.key" :value="scene.key" :label="scene.name" />
                </ElSelect>
              </ElFormItem>

              <div class="reply-content-section">
                <div class="reply-header">
                  <div class="header-left">
                    <div class="placeholder-info">
                      <span class="placeholder-label">默认占位符:</span>
                      <div class="placeholder-list">
                        <span><code>${username}</code> - 游戏账号</span>
                        <span><code>${password}</code> - 游戏密码</span>
                      </div>
                    </div>
                  </div>
                  <ElButton type="primary" size="small" @click="addTextItem">
                    <FaIcon name="i-ep:plus" class="mr-1" />
                    新增回复内容
                  </ElButton>
                </div>

                <ElFormItem
                  v-for="(_, index) in form.content.text"
                  :key="index"
                  :label="index === 0 ? '回复内容' : ''"
                  :prop="`content.text.${index}`"
                  :class="index > 0 ? 'additional-text-item' : ''"
                >
                  <div class="text-item-wrapper" style="width: 100%;">
                    <ElInput v-model="form.content.text[index]" type="textarea" placeholder="请输入回复内容" :rows="4" class="w-180" />
                    <FaIcon v-if="index > 0 || form.content.text.length > 1" name="i-ep:delete" class="delete-icon" @click="removeTextItem(index)" />
                  </div>
                </ElFormItem>
              </div>

              <ElFormItem label="回复图片" prop="content">
                <ImagesUpload v-model="form.content.images" :action="uploadFileAction" :notip="true" @on-success="onUploadSuccess" />
              </ElFormItem>
            </ElForm>
          </div>
        </ElCol>
      </ElRow>
    </FaPageMain>
    <FaFixedActionBar>
      <ElButton :disabled="btnDisabled" type="primary" size="large" @click="onSubmit">
        提交
      </ElButton>
      <ElButton size="large" @click="onCancel">
        取消
      </ElButton>
    </FaFixedActionBar>
  </div>
</template>

<style scoped>
.reply-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-left: 120px;
  margin-bottom: 15px;
}

.header-left {
  display: flex;
  flex-direction: column;
  max-width: 75%;
}

.placeholder-info {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: flex-start;
}

.placeholder-label {
  margin-right: 4px;
  font-size: 12px;
  color: #606266;
  white-space: nowrap;
}

.placeholder-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 16px;
  font-size: 12px;
  color: #909399;
}

.placeholder-info code {
  padding: 2px 4px;
  font-family: monospace;
  color: #409eff;
  background-color: #f5f7fa;
  border-radius: 3px;
}

.text-item-wrapper {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  width: 100%;
}

.delete-icon {
  margin-top: 10px;
  font-size: 15px;
  color: #f56c6c;
  cursor: pointer;
}

.additional-text-item :deep(.el-form-item__label) {
  visibility: hidden;
}
</style>
