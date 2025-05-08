<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import TakeoutCategoryForm from './components/DetailForm/index.vue'

defineProps<{
  id?: number | string
  type?: 'home' | 'shop'
}>()

const emits = defineEmits<{
  success: []
}>()

const btnDisabled = ref(false)

const visible = defineModel<boolean>({
  default: false,
})

const formRef = useTemplateRef('formRef')
function onSubmit() {
  // submit() 为组件内部方法
  btnDisabled.value = true
  formRef.value?.submit().then(() => {
    emits('success')
    onCancel()
  }).finally(() => {
    btnDisabled.value = false
  })
}

function onCancel() {
  visible.value = false
}
</script>

<template>
  <div>
    <el-dialog
      v-model="visible"
      width="500px"
      title="分类详情"
      :close-on-click-modal="true"
      destroy-on-close
      class="conversation-drawer"
    >
      <div class="takeout-category-main">
        <TakeoutCategoryForm ref="formRef" v-bind="$props" />
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
