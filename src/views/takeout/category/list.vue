<route lang="yaml">
meta:
  enabled: false
</route>

<script setup lang="ts">
import apiTakeout from '@/api/modules/takeout'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute } from 'vue-router'
import TakeoutCategoryDetail from './detail.vue'

defineOptions({
  name: 'SlotPetterList',
})

const { pagination, getParams, onSizeChange, onCurrentChange, onSortChange } = usePagination()

// 表格是否自适应高度
const tableAutoHeight = ref(false)

// 搜索
const searchDefault = {
  name: '',
  storeId: '',
}
const search = ref({ ...searchDefault })

function searchReset() {
  Object.assign(search.value, searchDefault)
}

// 批量操作
const batch = ref({
  enable: true,
  selectionDataList: [] as Array<{ id: string | number }>,
})

// 列表
const loading = ref(false)
const dataList = ref([])
const storeList = ref([
  {
    storeId: '',
    name: '全部',
  },
])
// 详情
const formModeProps = ref<{
  visible: boolean
  id: number
  type: 'home' | 'shop'
}>({
  visible: false,
  id: 0,
  type: 'home',
})

const route = useRoute()

onMounted(() => {
  const query = route.query
  formModeProps.value.type = query.type as 'home' | 'shop'
  if (formModeProps.value.type === 'shop') {
    search.value.storeId = ''
    getDataStore()
  }
  else {
    search.value.storeId = formModeProps.value.type
  }
  getDataList()
})

function getDataList() {
  loading.value = true
  const params = {
    ...getParams(),
    ...(search.value.name && { name: search.value.name }),
    ...({ storeId: search.value.storeId }),
  }
  apiTakeout.getCategoryList(params).then((res: any) => {
    loading.value = false
    dataList.value = res.data.list
    pagination.value.total = res.data.total
  })
}

function getDataStore() {
  apiTakeout.getAllStore().then((res: any) => {
    storeList.value = res.data.list
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
  formModeProps.value.id = 0
  formModeProps.value.visible = true
}

function onEdit(row: any) {
  formModeProps.value.id = row.id
  formModeProps.value.visible = true
}

function onDel(row: any) {
  ElMessageBox.confirm(`确认删除「${row.name}」吗？`, '确认信息').then(() => {
    apiTakeout.delCategory({ id: row.id }).then(() => {
      getDataList()
      ElMessage.success({
        message: '删除成功',
        center: true,
      })
    })
  }).catch(() => {})
}

function onDelBatch() {
  ElMessageBox.confirm(`确认批量删除吗？`, '确认信息').then(() => {
    const ids: any[] = []
    batch.value.selectionDataList.forEach((item) => {
      ids.push(item.id)
    })
    apiTakeout.delCategory({ ids }).then(() => {
      getDataList()
      ElMessage.success({
        message: '删除成功',
        center: true,
      })
    })
  }).catch(() => {})
}
</script>

<template>
  <div :class="{ 'absolute-container': tableAutoHeight }">
    <FaPageHeader title="分类管理" class="mb-0" />
    <FaPageMain :class="{ 'flex-1 overflow-auto': tableAutoHeight }" :main-class="{ 'flex-1 flex flex-col overflow-auto': tableAutoHeight }">
      <FaSearchBar :show-toggle="false">
        <template #default="{ fold, toggle }">
          <ElForm :model="search" size="default" label-width="100px" inline-message inline class="search-form">
            <ElFormItem label="名称">
              <ElInput v-model="search.name" placeholder="请输入分类名称，支持模糊查询" clearable @keydown.enter="currentChange()" @clear="currentChange()" />
            </ElFormItem>
            <ElFormItem v-if="formModeProps.type === 'shop'" label="店铺">
              <ElSelect v-model="search.storeId" placeholder="请选择店铺" clearable>
                <ElOption v-for="item in storeList" :key="item.storeId" :label="item.name" :value="item.storeId" />
              </ElSelect>
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
              <ElButton disabled link @click="toggle">
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
          新增分类
        </ElButton>
        <!--        <ElButton v-if="batch.enable" size="default" :disabled="!batch.selectionDataList.length" @click="onDelBatch"> -->
        <!--          删除 -->
        <!--        </ElButton> -->
        <ElButtonGroup v-if="batch.enable">
          <ElButton size="default" :disabled="!batch.selectionDataList.length" @click="onDelBatch">
            删除
          </ElButton>
          <!-- <ElButton size="default" :disabled="!batch.selectionDataList.length" @click="onRecoveryBatch">
            恢复
          </ElButton> -->
        </ElButtonGroup>
      </ElSpace>
      <ElTable v-loading="loading" class="my-4" :data="dataList" stripe highlight-current-row border height="100%" @sort-change="sortChange" @selection-change="batch.selectionDataList = $event">
        <ElTableColumn v-if="batch.enable" type="selection" align="center" fixed />
        <ElTableColumn prop="name" label="分类名称" />
        <ElTableColumn v-if="formModeProps.type === 'shop'" prop="storeName" label="所属店铺" />
        <ElTableColumn prop="createdAt" label="生成时间" />
        <ElTableColumn prop="updatedAt" label="更新日期" />
        <ElTableColumn label="操作" width="250" align="center" fixed="right">
          <template #default="scope">
            <ElButton type="primary" size="small" plain @click="onEdit(scope.row)">
              编辑
            </ElButton>
            <ElButton type="danger" size="small" plain @click="onDel(scope.row)">
              删除
            </ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
      <ElPagination :current-page="pagination.page" :total="pagination.total" :page-size="pagination.size" :page-sizes="pagination.sizes" :layout="pagination.layout" :hide-on-single-page="false" class="pagination" background @size-change="sizeChange" @current-change="currentChange" />
    </FaPageMain>
    <TakeoutCategoryDetail :id="formModeProps.id" v-model="formModeProps.visible" :type="formModeProps.type" @success="getDataList" />
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
