<route lang="yaml">
  meta:
    enabled: false
  </route>

<script setup lang="ts">
import apiTakeout from '@/api/modules/takeout'
import router from '@/router'
import { ElMessage, ElMessageBox } from 'element-plus'
import TakeoutCategoryDetail from '../category/detail.vue'
import TakeoutShopDetail from './detail.vue'

defineOptions({
  name: 'TakeoutShopList',
})

const { pagination, getParams, onSizeChange, onCurrentChange } = usePagination()

// 表格是否自适应高度
const tableAutoHeight = ref(false)

// 默认图片
const defaultImg = ref('')

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
  selectionDataList: [] as Array<{ storeId: string | number }>,
})

// 列表
const loading = ref(false)
const dataList = ref([] as Array<{
  storeId: string | number
  name: string
  image: string
  status: number
  statusClass: string
  statusName: string
  productCount: number
}>)
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
}>({
  visible: false,
  id: 0,
})

const formModeCategoryProps = ref<{
  visible: boolean
  storeId: string | number
}>({
  visible: false,
  storeId: '',
})

// 是否全选
const allSelected = computed({
  get: () => isAllSelected(),
  set: val => toggleSelectAll(val),
})

onMounted(() => {
  getDataStore()
  getDataList()
})

function getDataList() {
  loading.value = true
  const params = {
    ...getParams(),
    ...(search.value.name && { name: search.value.name }),
    ...({ storeId: search.value.storeId }),
  }
  apiTakeout.getStoreList(params).then((res: any) => {
    loading.value = false
    dataList.value = res.data.list
    pagination.value.total = res.data.total
    batch.value.selectionDataList = []
    allSelected.value = false
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

function onCreate() {
  formModeProps.value.id = 0
  formModeProps.value.visible = true
}

function onEdit(row: any) {
  formModeProps.value.id = row.storeId
  formModeProps.value.visible = true
}

function onAddCategory(row: any) {
  formModeCategoryProps.value.storeId = row.storeId
  formModeCategoryProps.value.visible = true
}

function onDisable(row: any) {
  ElMessageBox.confirm(`确认下架「${row.name}」吗？`, '确认信息').then(() => {
    apiTakeout.disableStore({ id: row.storeId }).then(() => {
      getDataList()
      ElMessage.success({
        message: '下架成功',
        center: true,
      })
    })
  }).catch(() => {})
}

function onDisableBatch() {
  ElMessageBox.confirm(`确认批量下架吗？`, '确认信息').then(() => {
    const ids: any[] = []
    batch.value.selectionDataList.forEach((item) => {
      ids.push(item.storeId)
    })
    apiTakeout.disableStore({ ids }).then(() => {
      getDataList()
      ElMessage.success({
        message: '下架成功',
        center: true,
      })
    })
  }).catch(() => {})
}
function onEnable(row: any) {
  ElMessageBox.confirm(`确认上架「${row.name}」吗？`, '确认信息').then(() => {
    apiTakeout.enableStore({ id: row.storeId }).then(() => {
      getDataList()
      ElMessage.success({
        message: '上架成功',
        center: true,
      })
    })
  }).catch(() => {})
}

function onEnableBatch() {
  ElMessageBox.confirm(`确认批量上架吗？`, '确认信息').then(() => {
    const ids: any[] = []
    batch.value.selectionDataList.forEach((item) => {
      ids.push(item.storeId)
    })
    apiTakeout.enableStore({ ids }).then(() => {
      getDataList()
      ElMessage.success({
        message: '上架成功',
        center: true,
      })
    })
  }).catch(() => {})
}

function toProductList(shop: any) {
  router.push({
    name: 'takeoutShopProduct',
    query: {
      storeId: shop.storeId,
    },
  })
}
function onSelectionChange(shop: any, checked: boolean | string | number) {
  const isChecked = Boolean(checked)
  if (isChecked) {
    batch.value.selectionDataList.push(shop)
  }
  else {
    const index = batch.value.selectionDataList.findIndex(item => item.storeId === shop.storeId)
    if (index !== -1) {
      batch.value.selectionDataList.splice(index, 1)
    }
  }
}

function isSelected(shop: any) {
  return batch.value.selectionDataList.some(item => item.storeId === shop.storeId)
}

function toggleSelectAll(checked: boolean | string | number) {
  const isChecked = Boolean(checked)
  if (isChecked) {
    batch.value.selectionDataList = [...dataList.value]
  }
  else {
    batch.value.selectionDataList = []
  }
}

function isAllSelected() {
  return dataList.value.length > 0 && batch.value.selectionDataList.length === dataList.value.length
}
</script>

<template>
  <div :class="{ 'absolute-container': tableAutoHeight }">
    <FaPageHeader title="店铺管理" class="mb-0" />
    <FaPageMain :class="{ 'flex-1 overflow-auto': tableAutoHeight }" :main-class="{ 'flex-1 flex flex-col overflow-auto': tableAutoHeight }">
      <FaSearchBar :show-toggle="false">
        <template #default="{ fold, toggle }">
          <ElForm :model="search" size="default" label-width="100px" inline-message inline class="search-form">
            <ElFormItem label="名称">
              <ElInput v-model="search.name" placeholder="请输入店铺名称，支持模糊查询" clearable @keydown.enter="currentChange()" @clear="currentChange()" />
            </ElFormItem>
            <ElFormItem label="店铺">
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
          新增店铺
        </ElButton>
        <ElCheckbox v-model="allSelected" style="margin-right: 10px;">
          全选
        </ElCheckbox>
        <ElButtonGroup v-if="batch.enable">
          <ElButton size="default" :disabled="!batch.selectionDataList.length" @click="onDisableBatch">
            下架
          </ElButton>
          <ElButton size="default" :disabled="!batch.selectionDataList.length" @click="onEnableBatch">
            上架
          </ElButton>
        </ElButtonGroup>
      </ElSpace>
      <ElRow :gutter="20" class="shop-card-list">
        <ElCol
          v-for="shop in dataList"
          :key="shop.storeId"
          :span="6"
          class="shop-card-col"
        >
          <ElCard shadow="hover" class="shop-card">
            <div class="shop-card-img-wrap" @click="toProductList(shop)">
              <div class="shop-card-checkbox" @click.stop>
                <ElCheckbox :model-value="isSelected(shop)" @update:model-value="checked => onSelectionChange(shop, checked)" />
              </div>
              <img :src="shop.image || defaultImg" class="shop-card-img">
              <ElTag class="shop-card-status-tag" :type="shop.statusClass as any">
                {{ shop.statusName }}
              </ElTag>
            </div>
            <div class="shop-card-content">
              <div class="shop-card-title">
                {{ shop.name }}
              </div>
              <div class="shop-card-row">
                <span class="shop-card-info">产品数量: {{ shop.productCount }}</span>
                <span class="shop-card-actions">
                  <ElButton size="small" circle plain @click="onAddCategory(shop)">
                    <FaIcon name="tabler:category-filled" />
                  </ElButton>
                  <ElButton size="small" circle plain @click="onEdit(shop)">
                    <FaIcon name="i-ep:edit" />
                  </ElButton>
                  <ElButton
                    v-if="shop.status === 1"
                    size="small"
                    circle
                    plain
                    @click="onDisable(shop)"
                  >
                    <FaIcon name="gravity-ui:ban" />
                  </ElButton>
                  <ElButton
                    v-else
                    type="success"
                    size="small"
                    circle
                    plain
                    @click="onEnable(shop)"
                  >
                    <FaIcon name="i-ep:check" />
                  </ElButton>
                </span>
              </div>
            </div>
          </ElCard>
        </ElCol>
      </ElRow>
      <ElEmpty v-if="dataList.length === 0" description="暂无数据" />
      <ElPagination :current-page="pagination.page" :total="pagination.total" :page-size="pagination.size" :page-sizes="pagination.sizes" :layout="pagination.layout" :hide-on-single-page="false" class="pagination" background @size-change="sizeChange" @current-change="currentChange" />
    </FaPageMain>
    <TakeoutShopDetail :id="formModeProps.id" v-model="formModeProps.visible" @success="getDataList" />
    <TakeoutCategoryDetail v-model="formModeCategoryProps.visible" type="shop" :store-id="formModeCategoryProps.storeId" @success="getDataList" />
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

  .shop-card-list {
    margin-top: 30px;
  }

  .shop-card-col {
    margin-bottom: 12px;
  }

  .shop-card {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 0;
    overflow: hidden;
    background: #fff;
    border-radius: 12px;
  }

  .shop-card-img-wrap {
    position: relative;
    width: 100%;
    aspect-ratio: 2.5/1;
    overflow: hidden;
    cursor: pointer;
    border-radius: 12px 12px 0 0;
  }

  .shop-card-checkbox {
    position: absolute;
    top: 8px;
    left: 8px;
    z-index: 2;
    padding: 0 5px;
  }

  /* Make the checkbox larger */
  .shop-card-checkbox :deep(.el-checkbox__input) {
    transform: scale(1.2);
  }

  .shop-card-img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .shop-card-status-tag {
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 2;
    height: 22px;
    padding: 0 6px;
    font-size: 12px;
    line-height: 20px;
  }

  .shop-card-content {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: 8px 15px;
  }

  .shop-card-title {
    margin-bottom: 2px;
    font-size: 15px;
    font-weight: 500;
    line-height: 1.2;
  }

  .shop-card-row {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 2px;
  }

  .shop-card-info {
    font-size: 12px;
    color: #666;
  }

  .shop-card-actions {
    min-width: 80px;
  }

  .shop-card-actions .el-button + .el-button {
    margin-left: 4px;
  }

  .shop-card-intro {
    margin-top: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 12px;
    color: #888;
    white-space: nowrap;
  }

  :deep(.el-card__body) {
    padding: 0;
  }
  </style>
