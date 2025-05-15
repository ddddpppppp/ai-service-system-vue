<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import apiTakeout from '@/api/modules/takeout'
import { ElMessage } from 'element-plus'
import { inject, nextTick, onMounted, ref, watch } from 'vue'

export interface Props {
  id?: number | string
  type?: 'home' | 'shop'
}
const props = withDefaults(
  defineProps<Props>(),
  {
    id: '',
  },
)

const emits = defineEmits<{
  success: []
}>()

const btnDisabled = ref(false)

const visible = defineModel<boolean>({
  default: false,
})

const uploadFileAction = String(inject('uploadFileAction'))
const loading = ref(false)
const formRef = ref<FormInstance>()
const homeCategoryList = ref([{
  id: 0,
  name: '请选择分类',
}])

// 创建初始表单状态的函数
function createInitialFormState() {
  return {
    storeId: props.id,
    name: '',
    image: '',
    intro: '',
    tel: '',
    address: '',
    homeCategoryId: '',
    taxRate: 0,
    deliveryFee: 0,
    deliveryTime: '',
    weight: 0,
    createdAt: '',
    updatedAt: '',
  }
}

const form = ref(createInitialFormState())

const formRules = ref<FormRules>({
  name: [
    { required: true, message: '请输入商铺名称', trigger: 'blur' },
  ],
  image: [
    { required: true, message: '请上传商铺图片', trigger: 'change' },
  ],
  homeCategoryId: [
    { required: true, message: '请选择产品分类', trigger: 'change' },
  ],
  intro: [
    { required: true, message: '请输入商铺简介', trigger: 'blur' },
  ],
  tel: [
    { required: true, message: '请输入商铺电话', trigger: 'blur' },
  ],
  address: [
    { required: true, message: '请输入商铺地址', trigger: 'blur' },
  ],
  taxRate: [
    { required: true, message: '请输入税率', trigger: 'blur' },
  ],
  deliveryFee: [
    { required: true, message: '请输入配送费', trigger: 'blur' },
  ],
  deliveryTime: [
    { required: true, message: '请输入配送时间', trigger: 'blur' },
  ],
  weight: [
    { required: true, message: '请输入权重', trigger: 'blur' },
  ],
})

watch(() => visible.value, (newVisible) => {
  if (newVisible) {
    nextTick(() => {
      // 重置表单为初始状态，然后加载数据
      form.value = createInitialFormState()
      getInfo()
    })
  }
})

onMounted(() => {
  getInfo()
})

function getInfo() {
  // 获取分类列表
  apiTakeout.getAllHomeCategory().then((res: any) => {
    homeCategoryList.value = res.data.list
  })

  // 如果有ID，获取店铺信息
  if (props.id && props.id !== '') {
    loading.value = true
    apiTakeout.getStore({ id: props.id }).then((res: any) => {
      loading.value = false
      if (res.status === 1) {
        form.value = res.data.store
      }
    })
  }
}

function onUploadSuccess(res: any) {
  form.value.image = res.data.url
}

function onSubmit() {
  btnDisabled.value = true
  formRef.value?.validate((valid, fields) => {
    if (valid) {
      loading.value = true
      apiTakeout.editStore({ form: form.value }).then((res: any) => {
        loading.value = false
        if (res.status === 1) {
          ElMessage.success({
            message: res.statusText,
            center: true,
          })
          emits('success')
          onCancel()
        }
      })
    }
    else {
      // 处理验证失败情况
      if (fields) {
        const firstErrorField = Object.keys(fields)[0]
        const firstErrorMessage = fields[firstErrorField][0].message
        ElMessage.error({
          message: firstErrorMessage,
          center: true,
        })
      }
      btnDisabled.value = false
    }
  })
}

function onCancel() {
  form.value = createInitialFormState()
  visible.value = false
}
</script>

<template>
  <div>
    <el-dialog
      v-model="visible"
      width="800px"
      :title="id ? '编辑店铺' : '新增店铺'"
      :close-on-click-modal="false"
      destroy-on-close
      class="store-detail-dialog"
    >
      <div v-loading="loading" class="store-form-container">
        <el-form
          ref="formRef"
          :model="form"
          :rules="formRules"
          label-width="100px"
          label-suffix="："
          class="store-form"
        >
          <!-- 表单内容区域 -->
          <div class="form-layout">
            <!-- 左侧列 - 基本信息和配送信息 -->
            <div class="form-column">
              <!-- 基本信息区域 -->
              <div class="form-section">
                <div class="section-header">
                  <i class="el-icon-shop section-icon" />
                  <span>基本信息</span>
                </div>

                <el-form-item label="商铺名称" prop="name">
                  <el-input
                    v-model="form.name"
                    placeholder="请输入商铺名称"
                  >
                    <template #prefix>
                      <i class="el-icon-shop" />
                    </template>
                  </el-input>
                </el-form-item>

                <el-form-item label="产品分类" prop="homeCategoryId">
                  <el-select
                    v-model="form.homeCategoryId"
                    placeholder="请选择分类"
                    class="full-width"
                  >
                    <el-option
                      v-for="item in homeCategoryList"
                      :key="item.id"
                      :label="item.name"
                      :value="item.id"
                    />
                  </el-select>
                </el-form-item>

                <el-form-item label="商铺电话" prop="tel">
                  <el-input
                    v-model="form.tel"
                    placeholder="请输入商铺电话"
                  />
                </el-form-item>

                <el-form-item label="商铺地址" prop="address">
                  <el-input
                    v-model="form.address"
                    type="textarea"
                    :rows="2"
                    placeholder="请输入商铺地址"
                  />
                </el-form-item>
              </div>
            </div>

            <!-- 右侧列 - 商铺图片和其他设置 -->
            <div class="form-column">
              <!-- 商铺图片区域 -->
              <div class="form-section">
                <div class="section-header">
                  <i class="section-icon el-icon-picture" />
                  <span>商铺图片</span>
                </div>

                <el-form-item prop="image" class="image-upload-container">
                  <div class="image-upload-wrapper">
                    <image-upload
                      v-model="form.image"
                      :action="uploadFileAction"
                      :width="200"
                      :height="200"
                      :notip="true"
                      @on-success="onUploadSuccess"
                    />
                  </div>
                </el-form-item>
              </div>
            </div>
          </div>
          <!-- 商铺简介 - 跨越整个宽度 -->
          <div class="form-section full-width-section">
            <el-form-item label="商铺简介" prop="intro">
              <el-input
                v-model="form.intro"
                type="textarea"
                :rows="4"
                placeholder="请输入商铺简介"
              />
            </el-form-item>
          </div>
          <!-- 配送信息区域 -->
          <div class="form-section">
            <div class="section-header">
              <i class="section-icon el-icon-van" />
              <span>配送信息</span>
            </div>

            <div class="notice-box">
              <FaIcon name="gridicons:notice-outline" />
              <span>税率会影响最终订单金额</span>
            </div>

            <div class="form-row">
              <el-form-item label="税率" prop="taxRate">
                <el-input-number
                  v-model="form.taxRate"
                  :min="0"
                  :max="100"
                  :precision="2"
                  class="full-width"
                  placeholder="请输入税率"
                >
                  <template #suffix>
                    %
                  </template>
                </el-input-number>
              </el-form-item>

              <el-form-item label="配送费" prop="deliveryFee">
                <el-input-number
                  v-model="form.deliveryFee"
                  :min="0"
                  :precision="2"
                  class="full-width"
                  placeholder="请输入配送费"
                >
                  <template #prefix>
                    $
                  </template>
                </el-input-number>
              </el-form-item>
              <el-form-item label="配送时间" prop="deliveryTime">
                <el-input
                  v-model="form.deliveryTime"
                  placeholder="请输入配送时间"
                >
                  <template #prefix>
                    <i class="el-icon-timer" />
                  </template>
                  <template #suffix>
                    <span>分钟</span>
                  </template>
                </el-input>
              </el-form-item>
            </div>
          </div>

          <!-- 其他设置区域 -->
          <div class="form-section">
            <div class="section-header">
              <i class="section-icon el-icon-setting" />
              <span>其他设置</span>
            </div>
            <div class="notice-box">
              <FaIcon name="gridicons:notice-outline" />
              <span>权重会影响店铺排序</span>
            </div>

            <el-form-item label="权重" prop="weight">
              <el-input-number
                v-model="form.weight"
                :min="0"
                :precision="0"
                class="full-width"
                placeholder="请输入权重"
              />
            </el-form-item>
          </div>
        </el-form>
      </div>

      <!-- 对话框底部按钮 -->
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="onCancel">
            取 消
          </el-button>
          <el-button
            type="primary"
            :disabled="btnDisabled"
            @click="onSubmit"
          >
            提 交
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.store-detail-dialog :deep(.el-dialog__body) {
  padding: 20px 30px;
}

.store-detail-dialog :deep(.el-dialog__header) {
  padding: 15px 30px;
  margin: 0;
  border-bottom: 1px solid #f0f0f0;
}

.store-detail-dialog :deep(.el-dialog__footer) {
  padding: 15px 30px;
  border-top: 1px solid #f0f0f0;
}

.store-form-container {
  padding: 10px 0;
}

.form-layout {
  display: flex;
  gap: 30px;
}

.form-column {
  flex: 1;
  min-width: 0;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.section-icon {
  margin-right: 8px;
  font-size: 18px;
  color: var(--el-color-primary);
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-row .el-form-item {
  flex: 1;
  margin-bottom: 18px;
}

.full-width {
  width: 100%;
}

.notice-box {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  margin-bottom: 16px;
  font-size: 13px;
  color: #606266;
  background-color: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 4px;
}

.notice-box i {
  margin-right: 8px;
  font-size: 14px;
  color: #e6a23c;
}

.image-upload-container {
  display: flex;
  justify-content: center;
  margin-bottom: 0;
}

.image-upload-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.upload-tip {
  display: flex;
  align-items: center;
  margin-top: 8px;
  font-size: 13px;
  color: #909399;
}

.upload-tip i {
  margin-right: 4px;
}

.info-box {
  padding: 12px 16px;
  margin-top: 16px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.info-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-weight: 500;
  color: #303133;
}

.info-header i {
  margin-right: 6px;
  color: var(--el-color-primary);
}

.info-list {
  padding: 0;
  margin: 0;
  list-style: none;
}

.info-list li {
  display: flex;
  align-items: center;
  margin: 6px 0;
  font-size: 13px;
  color: #606266;
}

.info-list li i {
  margin-right: 6px;
  font-size: 14px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

/* 响应式调整 */
@media (width <= 768px) {
  .form-layout {
    flex-direction: column;
    gap: 16px;
  }

  .form-row {
    flex-direction: column;
    gap: 0;
  }
}
</style>
