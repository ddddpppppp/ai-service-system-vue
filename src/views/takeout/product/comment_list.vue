<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import apiTakeout from '@/api/modules/takeout'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ref, useTemplateRef } from 'vue'

export interface Props {
  product?: any
}

const props = defineProps<Props>()
const visible = defineModel<boolean>({ default: false })

const loading = ref(false)
const btnDisabled = ref(false)

// 评论列表（假数据）
const comments = ref([
  createInitialFormState(),
])

const formRef = useTemplateRef<FormInstance>('formRef')

const editShow = ref(false)

const formRules = ref<FormRules>({
  content: [
    { required: true, message: '请输入产品名称', trigger: 'blur' },
  ],
  rating: [
    { required: true, message: '请上传产品图片', trigger: 'change' },
  ],
  commentAt: [
    { required: true, message: '请输入产品简介', trigger: 'blur' },
  ],
  nickname: [
    { required: true, message: '请输入产品价格', trigger: 'blur' },
  ],
})

const form = ref(createInitialFormState())

onMounted(() => {
  getDataList()
})

watch(() => props.product?.productId, (val) => {
  if (val) {
    getDataList()
  }
})

function getDataList() {
  loading.value = true
  apiTakeout.getCommentList({ productId: props.product?.productId }).then((res: any) => {
    loading.value = false
    comments.value = res.data.list
  })
}
// 创建初始表单状态的函数
function createInitialFormState() {
  return {
    commentId: '',
    productId: props.product?.productId,
    content: '',
    rating: 0,
    commentAt: '',
    nickname: '',
    storeId: props.product?.storeId,
  }
}

function handleAddComment() {
  editShow.value = true
  form.value = createInitialFormState()
}

function onCancel() {
  // 重置表单数据为初始状态
  form.value = createInitialFormState()
  editShow.value = false
}

function handleSubmitComment() {
  formRef.value?.validate((valid) => {
    if (valid) {
      btnDisabled.value = true
      apiTakeout.editComment({ form: form.value }).then((res: any) => {
        if (res.status === 1) {
          ElMessage.success('评论成功')
          getDataList()
          onCancel()
        }
      }).finally(() => {
        btnDisabled.value = false
      })
    }
    else {
      ElMessage.warning('请填写评论内容')
    }
  })
}

function handleEditComment(row: any) {
  editShow.value = true
  form.value = row
}

function handleDeleteComment(row: any) {
  ElMessageBox.confirm('确定要删除这条评论吗？', '提示').then(() => {
    apiTakeout.deleteComment({ id: row.commentId }).then((res: any) => {
      if (res.status === 1) {
        ElMessage.success('已删除')
        getDataList()
      }
    })
  })
}
</script>

<template>
  <el-dialog v-model="visible" :title="(`${props.product?.name}的评论列表`)" width="700px">
    <div class="comment-list-container">
      <!-- 产品信息 -->
      <div class="product-info">
        <img :src="props.product?.image" class="product-img">
        <div class="product-meta">
          <div class="product-title">
            {{ props.product?.name }}
          </div>
          <div class="product-rating">
            <el-rate :model-value="props.product.rating" :disabled="true" size="large" allow-half class="rate-class" />
            <span class="rating-num">{{ (props.product.rating || 0).toFixed(1) }}</span>
            <span class="comment-count">({{ props.product.commentCount || 0 }})</span>
          </div>
        </div>
      </div>
      <!-- 添加评论按钮 -->
      <FaButton type="primary" size="sm" class="add-btn" @click="handleAddComment">
        <FaIcon name="ic:outline-add" size="4" /> 添加评论
      </FaButton>
      <!-- 评论列表 -->
      <div class="comment-list">
        <div v-for="(item) in comments" :key="item.commentId" class="comment-item">
          <div class="avatar">
            <div class="avatar-circle">
              {{ item.nickname.slice(0, 2).toUpperCase() }}
            </div>
          </div>
          <div class="comment-content">
            <div class="comment-header">
              <span class="user-name">{{ item.nickname }}</span>
              <el-rate v-model="item.rating" :disabled="true" allow-half class="rate-class" />
            </div>
            <div class="comment-date">
              {{ item.commentAt }}
            </div>
            <div class="comment-text">
              {{ item.content }}
            </div>
          </div>
          <div class="comment-actions">
            <FaIcon name="ic:outline-edit-calendar" class="edit-icon" size="4" @click="handleEditComment(item)" />
            <FaIcon name="ic:outline-delete" class="delete-icon" size="4" @click="handleDeleteComment(item)" />
          </div>
        </div>
      </div>
      <el-empty v-if="comments.length === 0" description="暂无评论" />

      <!-- 评论添加弹窗 -->
      <el-dialog v-model="editShow" title="添加评论" width="400px">
        <el-form ref="formRef" label-width="80px" label-position="top" :model="form" :rules="formRules">
          <el-form-item label="昵称" prop="nickname">
            <el-input v-model="form.nickname" placeholder="请输入昵称" />
          </el-form-item>
          <el-form-item label="评分" prop="rating">
            <el-rate v-model="form.rating" allow-half class="rate-class" />
          </el-form-item>
          <el-form-item label="内容" prop="content">
            <el-input v-model="form.content" type="textarea" :rows="3" placeholder="请输入评论内容" />
          </el-form-item>
          <el-form-item label="评论时间" prop="commentAt">
            <el-date-picker v-model="form.commentAt" type="date" value-format="YYYY-MM-DD" placeholder="请选择评论时间" style="width: 100%;" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="onCancel">
            取消
          </el-button>
          <el-button type="primary" :disabled="btnDisabled" @click="handleSubmitComment">
            提交
          </el-button>
        </template>
      </el-dialog>
    </div>
  </el-dialog>
</template>

<style scoped>
.comment-list-container {
  max-width: 700px;
  margin: 0 auto;
  background: #fff;
}

.product-info {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.product-img {
  width: 60px;
  height: 60px;
  margin-right: 16px;
  object-fit: cover;
  border-radius: 8px;
}

.product-meta {
  flex: 1;
}

.product-title {
  margin-bottom: 4px;
  font-size: 16px;
  font-weight: 600;
}

.product-rating {
  display: flex;
  gap: 6px;
  align-items: center;
}

.rating-num {
  font-weight: 500;
  color: #faad14;
}

.comment-count {
  margin-left: 2px;
  color: #888;
}

.add-btn {
  height: 2.2rem;
  margin-bottom: 10px;
}

.comment-list {
  padding: 0 10px;
  margin-top: 8px;
}

.comment-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  padding: 18px 0 10px;
  border-bottom: 1px solid #f0f0f0;
}

.comment-item:last-child {
  border-bottom: none;
}

.avatar {
  margin-right: 12px;
}

.avatar-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  font-size: 18px;
  font-weight: bold;
  color: #409eff;
  background: #e6f0fa;
  border-radius: 50%;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  gap: 8px;
  align-items: center;
}

.user-name {
  font-weight: 500;
  color: #333;
}

.rate-class {
  --el-rate-icon-size: 16px;
  --el-rate-icon-margin: 0px;

  height: auto;
}

:deep(.el-rate--large) {
  --el-rate-icon-size: 20px;
}

.comment-date {
  margin-bottom: 5px;
  font-size: 11px;
  color: #aaa;
}

.comment-text {
  margin-top: 2px;
  font-size: 12px;
  color: #444;
}

.comment-actions {
  display: flex;
  gap: 6px;
  margin-left: 10px;
}

.delete-icon {
  color: #fa3e3e;
  cursor: pointer;
  transform: scale(1.13);
}

.edit-icon {
  color: hsl(var(--primary));
  cursor: pointer;
}

.comment-action-icon {
  cursor: pointer;
}

:deep(.el-form-item--label-top .el-form-item__label) {
  margin-bottom: 8px;
  font-size: 13px;
  line-height: 12px;
}
</style>
