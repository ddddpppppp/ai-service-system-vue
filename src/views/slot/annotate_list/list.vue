<route lang="yaml">
meta:
  enabled: false
</route>

<script setup lang="ts">
import apiDataManage from '@/api/modules/slot'
import eventBus from '@/utils/eventBus'
import { ElMessage, ElMessageBox } from 'element-plus'
import FormMode from './detail.vue'

defineOptions({
  name: 'SlotAnnotateList',
})

const { pagination, getParams, onSizeChange, onCurrentChange, onSortChange } = usePagination()

// 表格是否自适应高度
const tableAutoHeight = ref(false)

/**
 * 详情展示模式
 * router 路由跳转
 * dialog 对话框
 * drawer 抽屉
 */
const formMode = ref<'router' | 'dialog' | 'drawer'>('drawer')

// 搜索
const searchDefault = {
  content: '',
  sender: '',
  status: ['cleaned', 'annotated'],
}
const search = ref({ ...searchDefault })
function searchReset() {
  Object.assign(search.value, searchDefault)
}

// 批量操作
const batch = ref({
  enable: true,
  selectionDataList: [] as any[],
})

// 列表
const loading = ref(false)
const dataList = ref([])

// const statusList = ref([
//   {
//     label: '全部',
//     value: '',
//   },
//   {
//     label: '待清洗',
//     value: 'raw',
//   },
//   {
//     label: '已清洗待标注',
//     value: 'cleaned',
//   },
//   {
//     label: '已标注',
//     value: 'annotated',
//   },
//   {
//     label: '已完成',
//     value: 'archived',
//   },
// ])
const senderList = ref([
  {
    label: '全部',
    value: '',
  },
  {
    label: '用户',
    value: 'user',
  },
  {
    label: '机器人',
    value: 'assistant',
  },
  {
    label: '助手',
    value: 'assistant',
  },
])

// 详情
const formModeProps = ref({
  visible: false,
  id: '',
  type: 'chat' as 'annotated' | 'chat',
})

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
    type: 'annotate',
    ...getParams(),
    ...(search.value.content && { content: search.value.content }),
    ...(search.value.status && { status: search.value.status }),
    ...(search.value.sender && { sender: search.value.sender }),
  }
  apiDataManage.getConversationList(params).then((res: any) => {
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

function onAnnotated(row: any) {
  formModeProps.value.type = 'annotated'
  formModeProps.value.id = row.conversationId
  formModeProps.value.visible = true
}

function onDel(row: any) {
  ElMessageBox.confirm(`确认删除「${row.name}」吗？`, '确认信息').then(() => {
    apiDataManage.delConversation({ id: row.conversationId }).then(() => {
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
      ids.push(item.conversationId)
    })
    apiDataManage.delConversation({ ids }).then(() => {
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
    <FaPageHeader title="会话管理" class="mb-0" />
    <FaPageMain :class="{ 'flex-1 overflow-auto': tableAutoHeight }" :main-class="{ 'flex-1 flex flex-col overflow-auto': tableAutoHeight }">
      <FaSearchBar :show-toggle="false">
        <template #default="{ fold, toggle }">
          <ElForm :model="search" size="default" label-width="120px" inline-message inline class="search-form">
            <ElFormItem label="消息内容">
              <ElInput v-model="search.content" placeholder="请输入消息内容，支持模糊查询" clearable @keydown.enter="currentChange()" @clear="currentChange()" />
            </ElFormItem>
            <ElFormItem label="消息内容发送者">
              <ElSelect v-model="search.sender" placeholder="请选择发送者" clearable>
                <ElOption v-for="item in senderList" :key="item.value" :label="item.label" :value="item.value" />
              </ElSelect>
            </ElFormItem>
            <!-- <ElFormItem label="状态选择">
              <ElSelect v-model="search.status" placeholder="请选择状态" clearable :disabled="true">
                <ElOption v-for="item in statusList" :key="item.value" :label="item.label" :value="item.value" />
              </ElSelect>
            </ElFormItem> -->
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
        <ElButton v-if="batch.enable" size="default" :disabled="!batch.selectionDataList.length" @click="onDelBatch">
          删除
        </ElButton>
        <!--        <ElButtonGroup v-if="batch.enable"> -->
        <!--          <ElButton size="default" :disabled="!batch.selectionDataList.length" @click="onDelBatch"> -->
        <!--            删除 -->
        <!--          </ElButton> -->
        <!--          <ElButton size="default" :disabled="!batch.selectionDataList.length" @click="onRecoveryBatch"> -->
        <!--            恢复 -->
        <!--          </ElButton> -->
        <!--        </ElButtonGroup> -->
      </ElSpace>
      <ElTable v-loading="loading" class="my-4" :data="dataList" stripe highlight-current-row border height="100%" @sort-change="sortChange" @selection-change="batch.selectionDataList = $event">
        <ElTableColumn v-if="batch.enable" type="selection" align="center" fixed />
        <ElTableColumn prop="conversationId" label="会话id" />
        <ElTableColumn prop="username" label="用户名" />
        <ElTableColumn prop="statusName" label="状态">
          <template #default="scope">
            <ElTag :type="scope.row.statusColor">
              {{ scope.row.statusName }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="content" label="消息内容">
          <template #default="scope">
            <ElPopover
              placement="right"
              trigger="hover"
              :width="400"
              popper-class="conversation-popover"
            >
              <template #default>
                <div class="conversation-content-wrapper">
                  <template v-if="scope.row.mixedContent && Array.isArray(scope.row.mixedContent)">
                    <div
                      v-for="(message, index) in scope.row.mixedContent" :key="index"
                      class="popover-message"
                      :class="{ 'pop-message-user': message.senderRole === 'user', 'pop-message-assistant': message.senderRole === 'assistant' }"
                    >
                      <div v-if="(message.contentType === 'text' || message.contentType === 'mixed') && message.textContent">
                        <strong>{{ message.senderRole === 'user' ? '用户' : '助手' }}:</strong> {{ message.textContent }}
                      </div>
                      <div v-else>
                        <strong>{{ message.senderRole === 'user' ? '用户' : '助手' }}:</strong> [其它]
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    {{ scope.row.content }}
                  </template>
                </div>
              </template>
              <template #reference>
                <div class="content-preview cursor-pointer">
                  <template v-if="scope.row.content && search.content && typeof scope.row.content === 'string' && typeof search.content === 'string'">
                    <span v-html="scope.row.content.replace(new RegExp(search.content, 'gi'), (match: string) => `<span class='highlight-text'>${match}</span>`)" />
                  </template>
                  <template v-else>
                    {{ scope.row.content }}
                  </template>
                </div>
              </template>
            </ElPopover>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="startTime" label="会话开始时间" />
        <ElTableColumn prop="endTime" label="会话结束时间" />

        <ElTableColumn label="操作" width="250" align="center" fixed="right">
          <template #default="scope">
            <ElButton v-if="scope.row.status === 'cleaned'" type="primary" size="small" plain @click="onAnnotated(scope.row)">
              标注
            </ElButton>
            <ElButton type="danger" size="small" plain @click="onDel(scope.row)">
              删除
            </ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
      <ElPagination :current-page="pagination.page" :total="pagination.total" :page-size="pagination.size" :page-sizes="pagination.sizes" :layout="pagination.layout" :hide-on-single-page="false" class="pagination" background @size-change="sizeChange" @current-change="currentChange" />
      <FormMode v-model="formModeProps.visible" :conversation-id="formModeProps.id" mode="dialog" :type="formModeProps.type" @success="getDataList" />
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

.vue-json-bg {
  padding: 1rem;
  background-color: #f4f4f4;
  border-radius: 5px;
}

:deep(.highlight-text) {
  padding: 2px 0;
  font-weight: bold;
  color: #ff7d00;
  background-color: #fef9e7;
  border-radius: 2px;
}

.cursor-pointer {
  cursor: pointer;
}

.popover-message {
  padding: 4px 8px;
  margin-bottom: 6px;
  font-size: 12px;
  line-height: 1.4;
  word-break: break-word;
  white-space: pre-wrap;
  border-radius: 4px;
}

.pop-message-user {
  text-align: left;
  background-color: #f0f0f0;
}

.pop-message-assistant {
  text-align: left;
  background-color: #e1f3ff;
}

.content-preview {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.conversation-popover) {
  max-width: 500px;
  max-height: 400px;
  overflow: visible;
}

:deep(.conversation-popover .el-popover__content) {
  max-height: 400px;
  padding: 10px;
}

:deep(.el-popover.conversation-popover) {
  padding: 0;
}

.conversation-content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  max-height: 360px;
  padding: 5px;
  overflow-y: auto;
}
</style>
