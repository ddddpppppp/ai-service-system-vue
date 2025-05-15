<script setup lang="ts">
import apiTakeout from '@/api/modules/takeout'
import { nextTick, onMounted, ref, watch } from 'vue'

export interface Props {
  id?: number | string
}
const props = withDefaults(
  defineProps<Props>(),
  {
    id: '',
  },
)

const visible = defineModel<boolean>({
  default: false,
})

const loading = ref(false)
const orderData = ref<any>(null)

watch(() => visible.value, (newVisible) => {
  if (newVisible) {
    nextTick(() => {
      getInfo()
    })
  }
})

onMounted(() => {
  getInfo()
})

function getInfo() {
  if (props.id && props.id !== '') {
    loading.value = true
    apiTakeout.getOrder({ id: props.id }).then((res: any) => {
      loading.value = false
      if (res.status === 1) {
        orderData.value = res.data.order
      }
    })
  }
}

function onCancel() {
  visible.value = false
}
</script>

<template>
  <div>
    <ElDrawer
      v-model="visible"
      size="800px"
      title="订单详情"
      :close-on-click-modal="true"
      destroy-on-close
      class="order-detail-drawer"
    >
      <div v-loading="loading" class="order-detail-main">
        <template v-if="orderData">
          <!-- 订单基本信息 -->
          <div class="order-header">
            <div class="order-info">
              <div class="order-number">
                <span class="label"><i class="el-icon-document" /> 订单号：</span>
                <span class="value">{{ orderData.orderNo }}</span>
              </div>
              <div class="order-status">
                <span class="label"><i class="el-icon-info" /> 状态：</span>
                <span class="status-badge" :class="[orderData.statusClass]">
                  {{ orderData.statusName }}
                </span>
              </div>
            </div>
            <div class="order-dates">
              <div class="order-date">
                <span class="label"><i class="el-icon-time" /> 创建时间：</span>
                <span class="value">{{ orderData.createdAt }}</span>
              </div>
              <div class="order-date">
                <span class="label"><i class="el-icon-refresh" /> 更新时间：</span>
                <span class="value">{{ orderData.updatedAt }}</span>
              </div>
            </div>
          </div>

          <!-- 收货地址 -->
          <div class="address-section">
            <div class="section-title">
              收货地址
            </div>
            <div class="address-content">
              {{ orderData.addressInfo }}
            </div>
          </div>

          <!-- 商店和商品列表 -->
          <div v-for="(store, storeIndex) in orderData.stores" :key="storeIndex" class="store-section">
            <div class="store-header">
              <div class="store-info">
                <div class="store-image">
                  <img :src="store.image" alt="店铺图片" class="store-img">
                </div>
                <div class="store-name">
                  {{ store.name }}
                </div>
              </div>
            </div>

            <!-- 商品列表 -->
            <div class="products-table">
              <el-table :data="store.orderItems" border size="small" style="width: 100%;">
                <el-table-column label="商品" min-width="250">
                  <template #default="scope">
                    <div class="product-info">
                      <div class="product-image">
                        <img :src="scope.row.productImage" alt="商品图片" class="product-img">
                      </div>
                      <div class="product-name">
                        {{ scope.row.productName }}
                      </div>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="price" label="单价" width="80">
                  <template #default="scope">
                    ${{ scope.row.price.toFixed(2) }}
                  </template>
                </el-table-column>
                <el-table-column prop="quantity" label="数量" width="60" />
                <el-table-column prop="subtotal" label="小计" width="80" />
                <el-table-column prop="tax" label="税费" width="80" />
                <el-table-column prop="total" label="总计" width="80" />
              </el-table>
            </div>

            <!-- 商店小计 -->
            <div class="store-summary">
              <div class="summary-row">
                <span class="summary-label">商品小计：</span>
                <span class="summary-value">{{ store.subtotal }}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">配送费：</span>
                <span class="summary-value">${{ store.deliveryFee.toFixed(2) }}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">税费：</span>
                <span class="summary-value">{{ store.tax }}</span>
              </div>
              <div class="summary-row total">
                <span class="summary-label">商店总计：</span>
                <span class="summary-value">{{ store.total }}</span>
              </div>
            </div>
          </div>

          <!-- 订单总计 -->
          <div class="order-summary">
            <div class="summary-row">
              <span class="summary-label">商品小计：</span>
              <span class="summary-value">{{ orderData.subtotal }}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">配送费：</span>
              <span class="summary-value">{{ orderData.deliveryFee }}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">税费：</span>
              <span class="summary-value">{{ orderData.tax }}</span>
            </div>
            <div class="summary-row total">
              <span class="summary-label">订单总计：</span>
              <span class="summary-value">{{ orderData.total }}</span>
            </div>
          </div>
        </template>
        <div v-else class="no-data">
          暂无订单数据
        </div>
      </div>

      <template #footer>
        <div class="drawer-footer">
          <ElButton size="large" @click="onCancel">
            关闭
          </ElButton>
        </div>
      </template>
    </ElDrawer>
  </div>
</template>

<style scoped>
.order-detail-main {
  padding: 10px 0;
}

.order-header {
  display: flex;
  justify-content: space-between;
  padding-bottom: 12px;
  margin-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.order-info,
 .order-dates {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.order-number,
 .order-date {
  display: flex;
  align-items: center;
}

.label {
  margin-right: 5px;
  font-size: 13px;
  font-weight: 500;
  color: #606266;
}

.value {
  font-size: 13px;
  color: #303133;
}

.status-badge {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  color: #909399;
  background-color: #f4f4f5;
  border-radius: 12px;
}

.status-badge.success {
  color: #67c23a;
  background-color: #f0f9eb;
}

.status-badge.primary {
  color: var(--primary-color);
  background-color: #ecf5ff;
}

.status-badge.danger {
  color: #f56c6c;
  background-color: #fef0f0;
}

.address-section {
  padding: 10px;
  margin-bottom: 15px;
  font-size: 13px;
  background-color: #f8f8f8;
  border-radius: 4px;
}

.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.section-title::before {
  display: inline-block;
  width: 3px;
  height: 14px;
  margin-right: 6px;
  content: "";
  background-color: #409eff;
  border-radius: 1px;
}

.address-content {
  line-height: 1.4;
  color: #606266;
}

.store-section {
  margin-bottom: 20px;
  overflow: hidden;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgb(0 0 0 / 5%);
}

.store-header {
  padding: 10px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
}

.store-info {
  display: flex;
  gap: 10px;
  align-items: center;
}

.store-image {
  width: 40px;
  height: 40px;
  overflow: hidden;
  border-radius: 4px;
}

.store-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.store-name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.products-table {
  margin-bottom: 0;
  font-size: 13px;
}

.product-info {
  display: flex;
  gap: 8px;
  align-items: center;
}

.product-image {
  width: 50px;
  height: 50px;
  overflow: hidden;
  border-radius: 4px;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-name {
  font-size: 13px;
  font-weight: 500;
}

.store-summary {
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: flex-end;
  padding: 10px;
  font-size: 13px;
  background-color: #f8f8f8;
}

.order-summary {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-end;
  padding: 12px 15px;
  margin-top: 15px;
  font-size: 13px;
  background-color: #f5f7fa;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgb(0 0 0 / 5%);
}

.summary-row {
  display: flex;
  gap: 15px;
  align-items: center;
}

.summary-label {
  color: #606266;
}

.summary-value {
  min-width: 80px;
  font-weight: 500;
  color: #303133;
  text-align: right;
}

.total {
  padding-top: 6px;
  margin-top: 4px;
  border-top: 1px solid #dcdfe6;
}

.total .summary-label,
.total .summary-value {
  font-size: 14px;
  font-weight: 600;
  color: #f56c6c;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
}

.no-data {
  padding: 30px 0;
  font-size: 14px;
  color: #909399;
  text-align: center;
}

:deep(.el-table) {
  font-size: 13px;
}

:deep(.el-table th) {
  padding: 8px 0;
  background-color: #f5f7fa;
}

:deep(.el-table td) {
  padding: 8px 0;
}

:deep(.el-drawer__header) {
  padding: 15px 20px;
  margin-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-drawer__body) {
  padding: 0 20px;
}
</style>
