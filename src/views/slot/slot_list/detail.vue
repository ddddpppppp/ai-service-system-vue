<route lang="yaml">
meta:
  enabled: false
</route>

<script setup lang="ts">
import eventBus from '@/utils/eventBus'
import DetailForm from './components/DetailForm/index.vue'

defineOptions({
  name: 'SlotFacebookGameDetail',
})

const route = useRoute()
const router = useRouter()

const formRef = useTemplateRef('formRef')

const btnDisabled = ref<boolean>(false)
function onSubmit() {
  btnDisabled.value = true
  formRef.value?.submit().then(() => {
    eventBus.emit('get-data-list')
    goBack()
  }).finally(() => {
    btnDisabled.value = false
  })
}

function onCancel() {
  goBack()
}

// 返回列表页
function goBack() {
  router.push({ name: 'slotFacebookList' })
}
</script>

<template>
  <div>
    <FaPageHeader :title="!parseInt(route.params.id as string) ? '新增Facebook实例' : '编辑Facebook实例'">
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
          <DetailForm :id="route.params.id as string" ref="formRef" />
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
