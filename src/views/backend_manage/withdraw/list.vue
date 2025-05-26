<route lang="yaml">
meta:
  enabled: false
</route>

<script setup lang="ts">
import apiSetting from '@/api/modules/setting'
import eventBus from '@/utils/eventBus'
import { ElDialog, ElImage, ElMessage, ElMessageBox } from 'element-plus'

defineOptions({
  name: 'BackendManageWithdrawList',
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
  status: '',
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
      withdrawNo: '',
    },
  ],
})

// 列表
const loading = ref(false)
const dataList = ref([])
const balance = ref(0)
const isAccess = ref(false)
const uploadFileAction = String(inject('uploadFileAction'))
const payProofImage = ref('')
const uploadDialogVisible = ref(false)
const currentRow = ref<any>(null)

// 添加预览相关的状态变量
const previewVisible = ref(false)
const previewImageUrl = ref('')

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
  apiSetting.getWithdrawList(params).then((res: any) => {
    loading.value = false
    dataList.value = res.data.list
    balance.value = res.data.balance
    pagination.value.total = res.data.total
    isAccess.value = res.data.isAccess
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
    name: 'backendManageWithdrawDetail',
    params: {
      id: 0,
    },
  })
}

function onDisable(row: any) {
  ElMessageBox.confirm(`确认拒绝「${row.nickname}」的提现吗？`, '确认信息').then(() => {
    apiSetting.disableWithdraw({ id: row.withdrawNo }).then(() => {
      getDataList()
      ElMessage.success({
        message: '拒绝成功',
        center: true,
      })
    })
  }).catch(() => { })
}

function onCancel(row: any) {
  ElMessageBox.confirm(`确认取消「${row.nickname}」的提现吗？`, '确认信息').then(() => {
    apiSetting.cancelWithdraw({ id: row.withdrawNo }).then(() => {
      getDataList()
      ElMessage.success({
        message: '取消成功',
        center: true,
      })
    })
  })
}

function onDisableBatch() {
  ElMessageBox.confirm(`确认批量拒绝吗？`, '确认信息').then(() => {
    const ids: any[] = []
    batch.value.selectionDataList.forEach((item) => {
      ids.push(item.withdrawNo)
    })
    apiSetting.disableWithdraw({ ids }).then(() => {
      getDataList()
      ElMessage.success({
        message: '拒绝成功',
        center: true,
      })
    })
  }).catch(() => { })
}

function onUpdatePayProof(res: any) {
  payProofImage.value = res.data.url
}

function onEnable(row: any) {
  currentRow.value = row
  payProofImage.value = ''
  uploadDialogVisible.value = true
}

function confirmEnable() {
  if (!payProofImage.value) {
    ElMessage.warning('请先上传支付凭证')
    return
  }

  ElMessageBox.confirm(`确认通过「${currentRow.value.nickname}」的提现吗？`, '确认信息').then(() => {
    apiSetting.enableWithdraw({
      id: currentRow.value.withdrawNo,
      payProof: payProofImage.value, // 添加支付凭证
    }).then(() => {
      getDataList()
      ElMessage.success({
        message: '通过成功',
        center: true,
      })
      uploadDialogVisible.value = false
    })
  }).catch(() => {})
}

function onEnableBatch() {
  ElMessageBox.confirm(`确认批量通过吗？`, '确认信息').then(() => {
    const ids: any[] = []
    batch.value.selectionDataList.forEach((item) => {
      ids.push(item.withdrawNo)
    })
    apiSetting.enableWithdraw({ ids }).then(() => {
      getDataList()
      ElMessage.success({
        message: '通过成功',
        center: true,
      })
    })
  }).catch(() => { })
}

// 实现 onPreview 方法
function onPreview(qrcodeUrl: string) {
  if (!qrcodeUrl) {
    return
  }
  previewImageUrl.value = qrcodeUrl
  previewVisible.value = true
}
</script>

<template>
  <div :class="{ 'absolute-container': tableAutoHeight }">
    <FaPageHeader title="提现管理" class="mb-0" />
    <FaPageMain
      :class="{ 'flex-1 overflow-auto': tableAutoHeight }"
      :main-class="{ 'flex-1 flex flex-col overflow-auto': tableAutoHeight }"
    >
      <FaSearchBar :show-toggle="false">
        <template #default="{ fold, toggle }">
          <ElForm :model="search" size="default" label-width="100px" inline-message inline class="search-form">
            <ElFormItem label="昵称">
              <ElInput
                v-model="search.name" placeholder="请输入昵称，支持模糊查询" clearable @keydown.enter="currentChange()"
                @clear="currentChange()"
              />
            </ElFormItem>
            <ElFormItem label="状态">
              <ElSelect v-model="search.status" placeholder="请选择状态" clearable>
                <ElOption label="待审核" value="pending" />
                <ElOption label="已通过" value="approved" />
                <ElOption label="已拒绝" value="rejected" />
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
              <ElButton link disabled @click="toggle">
                <template #icon>
                  <FaIcon :name="fold ? 'i-ep:caret-bottom' : 'i-ep:caret-top'" />
                </template>
                {{ fold ? '展开' : '收起' }}
              </ElButton>
            </ElFormItem>
          </ElForm>
        </template>
      </FaSearchBar>
      <ElDivider border-style="dashed" />
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <ElButton v-if="!isAccess" type="primary" size="default" @click="onCreate">
            <template #icon>
              <FaIcon name="i-ep:plus" />
            </template>
            新增提现
          </ElButton>
          <!--        <ElButton v-if="batch.enable" size="default" :disabled="!batch.selectionDataList.length" @click="onDelBatch"> -->
          <!--          删除 -->
          <!--        </ElButton> -->
          <ElButtonGroup v-if="batch.enable && isAccess">
            <ElButton size="default" :disabled="!batch.selectionDataList.length" @click="onDisableBatch">
              驳回
            </ElButton>
            <ElButton size="default" :disabled="!batch.selectionDataList.length" @click="onEnableBatch">
              通过
            </ElButton>
          </ElButtonGroup>
        </div>
        <div class="balance-mini-card">
          <FaIcon name="i-ep:money" class="mini-card-icon" />
          <span class="mini-card-label">余额:</span>
          <span class="mini-card-value">
            <FaCountTo :start-val="0" :end-val="balance" :duration="2000" prefix="$" />
          </span>
        </div>
      </div>
      <ElTable
        v-loading="loading" class="my-4" :data="dataList" height="100%" highlight-current-row border
        @sort-change="sortChange" @selection-change="batch.selectionDataList = $event"
      >
        <ElTableColumn v-if="batch.enable" type="selection" align="center" fixed />
        <ElTableColumn prop="withdrawNo" label="提现单号" min-width="125" header-align="center" align="center" />
        <ElTableColumn prop="merchantName" label="所属商户" min-width="120" header-align="center" align="center" />
        <ElTableColumn prop="nickname" label="昵称" min-width="120" header-align="center" align="center" />
        <ElTableColumn prop="amount" label="提现金额" min-width="120" header-align="center" align="center" />
        <ElTableColumn prop="account" label="提现账号" min-width="350" header-align="center" align="center" />
        <ElTableColumn prop="qrcode" label="提现地址二维码" min-width="125" header-align="center" align="center">
          <template #default="scope">
            <ElButton v-if="scope.row.qrcode" type="primary" size="small" @click="onPreview(scope.row.qrcode)">
              查看
            </ElButton>
            <span v-else>
              暂无
            </span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="payProof" label="转账凭证" min-width="90" header-align="center" align="center">
          <template #default="scope">
            <ElButton v-if="scope.row.payProof" type="primary" size="small" @click="onPreview(scope.row.payProof)">
              查看
            </ElButton>
            <span v-else>
              暂无
            </span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="statusName" label="状态" min-width="90" header-align="center" align="center">
          <template #default="scope">
            <ElButton :type="scope.row.statusClass" size="small">
              {{ scope.row.statusName }}
            </ElButton>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="createdAt" label="生成时间" min-width="170" header-align="center" align="center" />
        <ElTableColumn prop="updatedAt" label="更新日期" min-width="180" header-align="center" align="center" />

        <ElTableColumn label="操作" width="140" align="center" fixed="right">
          <template #default="scope">
            <div v-if="scope.row.status === 'pending'" class="flex items-center justify-center gap-1">
              <ElButton v-if="isAccess" type="danger" size="small" plain @click="onDisable(scope.row)">
                拒绝
              </ElButton>
              <ElButton v-if="isAccess" type="primary" size="small" plain @click="onEnable(scope.row)">
                通过
              </ElButton>
              <ElButton v-if="!isAccess" type="danger" size="small" plain @click="onCancel(scope.row)">
                取消
              </ElButton>
            </div>
            <span v-else>--</span>
          </template>
        </ElTableColumn>
      </ElTable>
      <ElPagination
        :current-page="pagination.page" :total="pagination.total" :page-size="pagination.size"
        :page-sizes="pagination.sizes" :layout="pagination.layout" :hide-on-single-page="false" class="pagination"
        background @size-change="sizeChange" @current-change="currentChange"
      />
    </FaPageMain>

    <!-- 将对话框移到这里，确保它是根元素的一部分，而不是单独的根元素 -->
    <ElDialog v-model="uploadDialogVisible" title="上传支付凭证" width="400px">
      <div class="upload-container">
        <ImageUpload
          v-model="payProofImage"
          name="file"
          :width="150"
          :height="150"
          :action="uploadFileAction"
          @on-success="onUpdatePayProof"
        />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="uploadDialogVisible = false">取消</ElButton>
          <ElButton type="primary" @click="confirmEnable">确认</ElButton>
        </span>
      </template>
    </ElDialog>

    <!-- 二维码预览对话框 -->
    <ElDialog
      v-model="previewVisible"
      title="图片预览"
      width="600px"
      :z-index="2000"

      append-to-body
    >
      <div class="flex justify-center">
        <ElImage
          :src="previewImageUrl"
          fit="contain"
          :preview-src-list="[previewImageUrl]"
          :initial-index="0"
          class="max-h-300 max-w-full"
        />
      </div>
    </ElDialog>
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

.balance-mini-card {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: #ecf5ff;
  border: 1px solid #d9ecff;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgb(0 0 0 / 4%);
}

.mini-card-icon {
  margin-right: 6px;
  font-size: 16px;
  color: var(--el-color-primary);
}

.mini-card-label {
  margin-right: 8px;
  font-size: 13px;
  color: #606266;
}

.mini-card-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-color-primary);
}
</style>
