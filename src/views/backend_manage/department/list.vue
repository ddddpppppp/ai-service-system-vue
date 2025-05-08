<route lang="yaml">
meta:
  enabled: false
</route>

<script setup lang="ts">
import apiSetting from '@/api/modules/setting'
import eventBus from '@/utils/eventBus'
import { ElMessage, ElMessageBox } from 'element-plus'

defineOptions({
  name: 'BackendManageDepartmentList',
})

const router = useRouter()
const { pagination, getParams, onSizeChange, onCurrentChange, onSortChange } = usePagination()

// 表格是否自适应高度
const tableAutoHeight = ref(false)

/**
 * 详情展示模式
 * router 路由跳转
 * dialog 对话框
 * drawer 抽屉
 */
const formMode = ref<'router' | 'dialog' | 'drawer'>('router')

// 搜索
const searchDefault = {
  name: '',
}
const search = ref({ ...searchDefault })
function searchReset() {
  Object.assign(search.value, searchDefault)
}

// 批量操作
const batch = ref({
  enable: true,
  selectionDataList: [
    {
      uuid: '',
    },
  ],
})

// 列表
const loading = ref(false)
const dataList = ref([
  {
    uuid: '',
  },
])

onMounted(() => {
  getDataList()
  if (formMode.value === 'router') {
    eventBus.on('get-data-list', () => {
      getDataList()
    })
  }
})

onBeforeUnmount(() => {
  if (formMode.value === 'router') {
    eventBus.off('get-data-list')
  }
})

function getDataList() {
  loading.value = true
  const params = {
    ...getParams(),
    ...(search.value.name && { name: search.value.name }),
  }
  apiSetting.getDepartmentList(params).then((res: any) => {
    loading.value = false
    dataList.value = res.data.list
    pagination.value.total = res.data.total
  })
}

// 每页数量切换
function sizeChange(size: number) {
  onSizeChange(size).then(() => getDataList())
}

// 当前页码切换（翻页）
function currentChange(page = 1) {
  onCurrentChange(page).then(() => getDataList())
}

// 字段排序
function sortChange({ prop, order }: { prop: string, order: string }) {
  onSortChange(prop, order).then(() => getDataList())
}

function onCreate() {
  router.push({
    name: 'backendManageDepartmentDetail',
    params: {
      id: 0,
    },
  })
}

function onEdit(row: any) {
  router.push({
    name: 'backendManageDepartmentDetail',
    params: {
      id: row.uuid,
    },
  })
}

function onDisable(row: any) {
  ElMessageBox.confirm(`确认禁用「${row.name}」吗？`, '确认信息').then(() => {
    apiSetting.disableDepartment({ uuid: row.uuid }).then(() => {
      getDataList()
      ElMessage.success({
        message: '禁用成功',
        center: true,
      })
    })
  }).catch(() => {})
}

function onDisableBatch() {
  ElMessageBox.confirm(`确认批量禁用吗？`, '确认信息').then(() => {
    const ids: any[] = []
    batch.value.selectionDataList.forEach((item) => {
      ids.push(item.uuid)
    })
    apiSetting.disableDepartment({ ids }).then(() => {
      getDataList()
      ElMessage.success({
        message: '禁用成功',
        center: true,
      })
    })
  }).catch(() => {})
}

function onEnable(row: any) {
  ElMessageBox.confirm(`确认启用「${row.name}」吗？`, '确认信息').then(() => {
    apiSetting.enableDepartment({ uuid: row.uuid }).then(() => {
      getDataList()
      ElMessage.success({
        message: '启用成功',
        center: true,
      })
    })
  }).catch(() => {})
}

function onEnableBatch() {
  ElMessageBox.confirm(`确认批量启用吗？`, '确认信息').then(() => {
    const ids: any[] = []
    batch.value.selectionDataList.forEach((item) => {
      ids.push(item.uuid)
    })
    apiSetting.enableDepartment({ ids }).then(() => {
      getDataList()
      ElMessage.success({
        message: '启用成功',
        center: true,
      })
    })
  }).catch(() => {})
}
</script>

<template>
  <div :class="{ 'absolute-container': tableAutoHeight }">
    <FaPageHeader title="部门管理" class="mb-0" />
    <FaPageMain :class="{ 'flex-1 overflow-auto': tableAutoHeight }" :main-class="{ 'flex-1 flex flex-col overflow-auto': tableAutoHeight }">
      <FaSearchBar :show-toggle="false">
        <template #default="{ fold, toggle }">
          <ElForm :model="search" size="default" label-width="100px" inline-message inline class="search-form">
            <ElFormItem label="名称">
              <ElInput v-model="search.name" placeholder="请输入部门名称，支持模糊查询" clearable @keydown.enter="currentChange()" @clear="currentChange()" />
            </ElFormItem>
            <ElFormItem>
              <ElButton @click="searchReset(); currentChange()">
                重置
              </ElButton>
              <ElButton type="primary" @click="currentChange()">
                <template #icon>
                  <FaIcon name="i-ep:search" />
                </template>
                筛选
              </ElButton>
              <ElButton link disabled @click="toggle">
                <template #icon>
                  <FaIcon :name="fold ? 'i-ep:caret-bottom' : 'i-ep:caret-top' " />
                </template>
                {{ fold ? '展开' : '收起' }}
              </ElButton>
            </ElFormItem>
          </ElForm>
        </template>
      </FaSearchBar>
      <ElDivider border-style="dashed" />
      <ElSpace wrap>
        <ElButton type="primary" size="default" @click="onCreate">
          <template #icon>
            <FaIcon name="i-ep:plus" />
          </template>
          新增部门
        </ElButton>
        <!-- <ElButton v-if="batch.enable" size="default" :disabled="!batch.selectionDataList.length" @click="onDelBatch">
          禁用
        </ElButton> -->
        <ElButtonGroup v-if="batch.enable">
          <ElButton size="default" :disabled="!batch.selectionDataList.length" @click="onEnableBatch">
            启用
          </ElButton>
          <ElButton size="default" :disabled="!batch.selectionDataList.length" @click="onDisableBatch">
            禁用
          </ElButton>
        </ElButtonGroup>
      </ElSpace>
      <ElTable v-loading="loading" class="my-4" :data="dataList" stripe highlight-current-row border height="100%" @sort-change="sortChange" @selection-change="batch.selectionDataList = $event">
        <ElTableColumn v-if="batch.enable" type="selection" align="center" fixed />
        <ElTableColumn prop="name" label="部门名称" />
        <ElTableColumn prop="adminName" label="管理员" />
        <ElTableColumn prop="status" label="状态" align="center">
          <template #default="scope">
            <ElTag :type="scope.row.statusClass">
              {{ scope.row.statusName }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="createdAt" label="生成时间" />
        <ElTableColumn prop="updatedAt" label="更新日期" />
        <ElTableColumn label="操作" width="250" align="center" fixed="right">
          <template #default="scope">
            <ElButton type="primary" size="small" plain @click="onEdit(scope.row)">
              编辑
            </ElButton>
            <ElButton v-if="scope.row.status === 1" type="danger" size="small" plain @click="onDisable(scope.row)">
              禁用
            </ElButton>
            <ElButton v-else type="success" size="small" plain @click="onEnable(scope.row)">
              启用
            </ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
      <ElPagination :current-page="pagination.page" :total="pagination.total" :page-size="pagination.size" :page-sizes="pagination.sizes" :layout="pagination.layout" :hide-on-single-page="false" class="pagination" background @size-change="sizeChange" @current-change="currentChange" />
    </FaPageMain>
  </div>
</template>

<style scoped>
.absolute-container {
  position: absolute;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.search-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(330px, 1fr));
  margin-bottom: -18px;

  :deep(.el-form-item) {
    grid-column: auto / span 1;

    &:last-child {
      grid-column-end: -1;

      .el-form-item__content {
        justify-content: flex-end;
      }
    }
  }
}

.el-divider {
  width: calc(100% + 40px);
  margin-inline: -20px;
}
</style>
