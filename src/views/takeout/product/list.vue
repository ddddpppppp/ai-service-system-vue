<route lang="yaml">
  meta:
    enabled: false
  </route>

<script setup lang="ts">
import apiTakeout from '@/api/modules/takeout'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute } from 'vue-router'
import TakeoutProductCommentList from './comment_list.vue'
import TakeoutProductDetail from './detail.vue'

defineOptions({
  name: 'TakeoutProductList',
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
  selectionDataList: [] as Array<{ productId: string | number }>,
})

// 列表
const loading = ref(false)
const dataList = ref([] as Array<{
  productId: string | number
  storeId: string | number
  name: string
  image: string
  status: number
  statusClass: string
  statusName: string
  rating: number
  intro: string
  commentCount: number
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
  storeId: number | string
}>({
  visible: false,
  id: 0,
  storeId: '',
})

const formModeCommentProps = ref<{
  visible: boolean
  product: any
}>({
  visible: false,
  product: {},
})

// 是否全选
const allSelected = computed({
  get: () => isAllSelected(),
  set: val => toggleSelectAll(val),
})

onMounted(() => {
  const route = useRoute()
  const query = route.query
  const storeId = query.storeId as string
  if (storeId) {
    search.value.storeId = storeId
  }
  getDataStore()
  getDataList()
})

function getDataList() {
  loading.value = true
  pagination.value.size = 16
  const params = {
    ...getParams(),
    ...(search.value.name && { name: search.value.name }),
    ...({ storeId: search.value.storeId }),
  }
  apiTakeout.getProductList(params).then((res: any) => {
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
  if (!search.value.storeId) {
    ElMessage.warning('请先选择商铺')
    return
  }
  formModeProps.value.id = 0
  formModeProps.value.storeId = search.value.storeId
  formModeProps.value.visible = true
}

function onEdit(row: any) {
  formModeProps.value.id = row.productId
  formModeProps.value.storeId = row.storeId
  formModeProps.value.visible = true
}

function onComment(row: any) {
  formModeCommentProps.value.product = row
  formModeCommentProps.value.visible = true
}

function onDisable(row: any) {
  ElMessageBox.confirm(`确认下架「${row.name}」吗？`, '确认信息').then(() => {
    apiTakeout.disableProduct({ id: row.productId }).then(() => {
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
      ids.push(item.productId)
    })
    apiTakeout.disableProduct({ ids }).then(() => {
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
    apiTakeout.enableProduct({ id: row.productId }).then(() => {
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
      ids.push(item.productId)
    })
    apiTakeout.enableProduct({ ids }).then(() => {
      getDataList()
      ElMessage.success({
        message: '上架成功',
        center: true,
      })
    })
  }).catch(() => {})
}

function onDeleteBatch() {
  ElMessageBox.confirm(`确认批量删除吗？`, '确认信息').then(() => {
    const ids: any[] = []
    batch.value.selectionDataList.forEach((item) => {
      ids.push(item.productId)
    })
    apiTakeout.deleteProduct({ ids }).then(() => {
      getDataList()
      ElMessage.success({
        message: '删除成功',
        center: true,
      })
    })
  }).catch(() => {})
}

function onSelectionChange(product: any, checked: boolean | string | number) {
  const isChecked = Boolean(checked)
  if (isChecked) {
    batch.value.selectionDataList.push(product)
  }
  else {
    const index = batch.value.selectionDataList.findIndex(item => item.productId === product.productId)
    if (index !== -1) {
      batch.value.selectionDataList.splice(index, 1)
    }
  }
}

function isSelected(product: any) {
  return batch.value.selectionDataList.some(item => item.productId === product.productId)
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
    <FaPageHeader title="产品管理" class="mb-0" />
    <FaPageMain :class="{ 'flex-1 overflow-auto': tableAutoHeight }" :main-class="{ 'flex-1 flex flex-col overflow-auto': tableAutoHeight }">
      <FaSearchBar :show-toggle="false">
        <template #default="{ fold, toggle }">
          <ElForm :model="search" size="default" label-width="100px" inline-message inline class="search-form">
            <ElFormItem label="名称">
              <ElInput v-model="search.name" placeholder="请输入产品名称，支持模糊查询" clearable @keydown.enter="currentChange()" @clear="currentChange()" />
            </ElFormItem>
            <ElFormItem label="商铺">
              <ElSelect v-model="search.storeId" placeholder="请选择商铺" clearable>
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
          新增产品
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
          <ElButton size="default" :disabled="!batch.selectionDataList.length" @click="onDeleteBatch">
            删除
          </ElButton>
        </ElButtonGroup>
      </ElSpace>
      <ElRow :gutter="20" class="product-card-list">
        <ElCol
          v-for="product in dataList"
          :key="product.productId"
          :span="6"
          class="product-card-col"
        >
          <ElCard shadow="hover" class="product-card">
            <div class="product-card-img-wrap">
              <div class="product-card-checkbox">
                <ElCheckbox :model-value="isSelected(product)" @update:model-value="checked => onSelectionChange(product, checked)" />
              </div>
              <img :src="product.image || defaultImg" class="product-card-img">
              <ElTag class="product-card-status-tag" :type="product.statusClass as any">
                {{ product.statusName }}
              </ElTag>
            </div>
            <div class="product-card-content">
              <div class="product-card-title">
                {{ product.name }}
              </div>
              <div class="product-card-comment">
                <el-rate v-model="product.rating" :allow-half="true" :disabled="true" class="product-rating" />
                <span class="product-card-comment-count">({{ product.commentCount }})</span>
              </div>
              <div class="product-card-row">
                <span class="product-card-info" :title="product.intro">{{ product.intro }}</span>
                <span class="product-card-actions">
                  <ElButton size="small" plain circle @click="onComment(product)">
                    <FaIcon name="uil:comment-alt-dots" />
                  </ElButton>
                  <ElButton size="small" circle plain @click="onEdit(product)">
                    <FaIcon name="i-ep:edit" />
                  </ElButton>
                  <ElButton
                    v-if="product.status === 1"
                    size="small"
                    circle
                    plain
                    @click="onDisable(product)"
                  >
                    <FaIcon name="gravity-ui:ban" />
                  </ElButton>
                  <ElButton
                    v-else
                    type="success"
                    size="small"
                    circle
                    plain
                    @click="onEnable(product)"
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
    <TakeoutProductDetail :id="formModeProps.id" v-model="formModeProps.visible" :store-id="formModeProps.storeId" @success="getDataList" />
    <TakeoutProductCommentList v-model="formModeCommentProps.visible" :product="formModeCommentProps.product" @success="getDataList" />
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

.product-card-list {
  margin-top: 30px;
}

.product-card-col {
  margin-bottom: 12px;
}

.product-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0;
  overflow: hidden;
  background: #fff;
  border-radius: 12px;
}

.product-card-img-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 2.5/1;
  overflow: hidden;
  border-radius: 12px 12px 0 0;
}

.product-card-checkbox {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 2;
  padding: 0 5px;
}

/* Make the checkbox larger */
.product-card-checkbox :deep(.el-checkbox__input) {
  transform: scale(1.2);
}

.product-card-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-card-status-tag {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
  height: 22px;
  padding: 0 6px;
  font-size: 12px;
  line-height: 20px;
}

.product-card-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 8px 15px;
}

.product-card-title {
  margin-bottom: 2px;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.2;
}

.product-card-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 2px;
}

.product-card-info {
  width: 290px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  color: #666;
  white-space: nowrap;
}

.product-card-actions {
  min-width: 80px;
}

.product-card-actions .el-button + .el-button {
  margin-left: 4px;
}

.product-card-comment {
  display: flex;
  gap: 4px;
  align-items: center;
  margin-top: 7px;
  margin-bottom: 2px;
  margin-left: -4px;
}

.product-card-comment-count {
  font-size: 12px;
  color: #666;
}

.product-rating {
  height: auto;
  padding-left: 0;
  transform-origin: left;

  --el-rate-icon-size: 20px;
  --el-rate-icon-margin: 0px;
}

.product-card-intro {
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
