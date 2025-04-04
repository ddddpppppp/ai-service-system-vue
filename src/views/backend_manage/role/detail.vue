<route lang="yaml">
meta:
  enabled: false
</route>

<script setup lang="ts">
import eventBus from '@/utils/eventBus'
import DetailForm from './components/DetailForm/index.vue'

defineOptions({
  name: 'BackendManageRoleDetail',
})

const route = useRoute()
const router = useRouter()

const formRef = useTemplateRef('formRef')

function onSubmit() {
  formRef.value?.submit().then(() => {
    eventBus.emit('get-data-list')
    goBack()
  })
}

function onCancel() {
  goBack()
}

// 返回列表页
function goBack() {
  router.push({ name: 'backendManageRoleList' })
}
</script>

<template>
  <div>
    <FaPageHeader :title="!route.params.id ? '新增角色' : '编辑角色'">
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
      <ElButton type="primary" size="large" @click="onSubmit">
        提交
      </ElButton>
      <ElButton size="large" @click="onCancel">
        取消
      </ElButton>
    </FaFixedActionBar>
  </div>
</template>
