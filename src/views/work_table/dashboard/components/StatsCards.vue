<template>
  <el-row :gutter="20" class="stats-row">
    <el-col :span="6">
      <el-card shadow="hover">
        <div class="stat-card">
          <div class="stat-title">
            会话接听率
          </div>
          <div class="stat-value">
            86.21%
          </div>
          <div class="stat-desc">
            接听总量: 25位
          </div>
        </div>
      </el-card>
    </el-col>
    <el-col :span="6">
      <el-card shadow="hover">
        <div class="stat-card">
          <div class="stat-title">
            当前排队人数
          </div>
          <div class="stat-value">
            86位
          </div>
          <div class="stat-desc">
            等待时间: 3秒
          </div>
        </div>
      </el-card>
    </el-col>
    <el-col :span="6">
      <el-card shadow="hover">
        <div class="stat-card">
          <div class="stat-title">
            平均等待时间
          </div>
          <div class="stat-value">
            45.5秒
          </div>
          <div class="stat-desc">
            客户总数: 25位
          </div>
        </div>
      </el-card>
    </el-col>
    <el-col :span="6">
      <el-card shadow="hover">
        <div class="stat-card">
          <div class="stat-title">
            挂机率
          </div>
          <div class="stat-value">
            8.21%
          </div>
          <div class="stat-desc">
            接听总量: 25位
          </div>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<style scoped>
.stat-card {
  padding: 20px 0;
  text-align: center;
}

.stat-title {
  font-size: 14px;
  color: #909399;
}

.stat-value {
  margin: 10px 0;
  font-size: 24px;
  font-weight: bold;
  color: #1a2b5a;
}

.stat-desc {
  font-size: 12px;
  color: #c0c4cc;
}

.stats-row {
  margin-bottom: 20px;
}
</style>
