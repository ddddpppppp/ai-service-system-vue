<route lang="yaml">
meta:
title: 配置与容器列表页
icon: i-ant-design:home-twotone
</route>

<script setup lang="ts">
import { ref } from 'vue'

// 模拟配置列表数据
const configList = ref([
  // { id: 1, name: '配置项1' },
  // { id: 2, name: '配置项2' },
  // { id: 3, name: '配置项3' },
])

// 模拟容器列表数据
const containerList = ref<{ containerId: string, note: any }[]>([])

onMounted(() => {
  window.ipcRenderer.send('request-container-list')

  // window.ipcRenderer.on('update-container-list', (_event, containers: { containerId: string }[]) => {
  //   containers.forEach(({ containerId }) => {
  //     containerList.value.push({ containerId, note: storage.local.get(containerId) || containerId })
  //   })
  // })
})
</script>

<template>
  <div class="mt-10 w-full flex flex-col gap-4 px-4 xl-flex-row">
    <FaPageMain class="m-0 w-40%" title-class="flex flex-wrap items-center justify-between gap-4">
      <template #title>
        配置列表
      </template>
      <ul class="m-0 list-disc px-8 text-sm leading-6 space-y-1">
        <li v-for="item in configList" :key="item.id">
          {{ item }}
        </li>
      </ul>
    </FaPageMain>
    <FaPageMain class="m-0 w-60%" title-class="flex flex-wrap items-center justify-between gap-4">
      <template #title>
        浏览器列表
      </template>
      <ul class="m-0 list-disc px-8 text-sm leading-6 space-y-1">
        {{ containerList }}
      </ul>
    </FaPageMain>
  </div>
</template>

<style scoped>
/* 可以根据需要添加更多样式 */
</style>
