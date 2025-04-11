<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import apiConfig from '@/api/modules/config'
import { ElMessage } from 'element-plus'
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'

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
  name: '',
  triggers: '',
  triggersObject: {},
})
const formRules = ref<FormRules>({
  name: [
    { required: true, message: '请输入名称', trigger: 'blur' },
  ],
  triggers: [
    { required: true, message: '请输入触发器规则', trigger: 'blur' },
  ],
})

onMounted(() => {
  getInfo()
})

// 监听 triggers 变化
watch(() => form.value.triggers, (newVal) => {
  try {
    // 尝试解析 JSON
    form.value.triggersObject = JSON.parse(newVal)
  }
  catch (e) {
    console.error(e)
    // 解析失败时清空或保持原值
    form.value.triggersObject = { error: 'Invalid JSON' }

    // 如果是空字符串则清空
    if (newVal.trim() === '') {
      form.value.triggersObject = {}
    }
  }
}, { immediate: true }) // 立即执行一次

function getInfo() {
  if (Number(form.value.id) !== 0) {
    loading.value = true
    apiConfig.getTrigger({ id: form.value.id }).then((res: any) => {
      if (res.status === 1) {
        loading.value = false
        if (res.data.trigger) {
          form.value = res.data.trigger
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
          apiConfig.editTrigger({ form: form.value }).then((res: any) => {
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
      <ElFormItem label="名称" prop="name">
        <ElInput v-model="form.name" placeholder="请输入触发器名称" />
      </ElFormItem>
      <ElFormItem label="触发器" prop="triggers">
        <ElInput v-model="form.triggers" type="textarea" :rows="10" placeholder="输入 triggers 内容（JSON格式）" />
      </ElFormItem>
      <ElFormItem label="格式化">
        <div class="vue-json-bg">
          <VueJsonPretty
            :data="form.triggersObject"
            show-length
            highlight-mouseover
          />
        </div>
      </ElFormItem>
    </ElForm>
  </div>
</template>

<style lang="scss">
.vue-json-bg {
  padding: 1rem;
  background-color: #f4f4f4;
  border-radius: 5px;
}
</style>
