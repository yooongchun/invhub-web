<!-- 发票管理 -->
<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :lg="2" :xs="24" class="mb-[12px]" />
      <!-- 发票列表 -->
      <el-col :lg="20" :xs="24">
        <div class="search-container">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="关键字" prop="keywords">
              <el-input
                v-model="queryParams.keywords"
                placeholder="发票代码/号码/类型或创建人"
                clearable
                style="width: 200px"
                @keyup.enter="handleQuery"
              />
            </el-form-item>

            <el-form-item label="状态" prop="status">
              <el-select
                v-model="queryParams.status"
                placeholder="全部"
                clearable
                class="!w-[100px]"
              >
                <el-option label="初始化" value="0" />
                <el-option label="处理中" value="1" />
                <el-option label="成功" value="2" />
                <el-option label="失败" value="-1" />
              </el-select>
            </el-form-item>

            <el-form-item label="人工校验" prop="checked">
              <el-select
                v-model="queryParams.checked"
                placeholder="全部"
                clearable
                class="!w-[100px]"
              >
                <el-option label="未校验" value="0" />
                <el-option label="已校验" value="1" />
              </el-select>
            </el-form-item>
            <el-form-item label="报销" prop="reimbursed">
              <el-select
                v-model="queryParams.reimbursed"
                placeholder="全部"
                clearable
                class="!w-[100px]"
              >
                <el-option label="未报销" value="0" />
                <el-option label="已报销" value="1" />
              </el-select>
            </el-form-item>

            <el-form-item label="金额范围" prop="amount">
              <el-input-number
                v-model="queryParams.minAmount"
                :precision="2"
                :step="0.1"
                :min="0.1"
              />
              <el-input-number
                v-model="queryParams.maxAmount"
                :precision="2"
                :step="0.1"
                :min="0.1"
              />
            </el-form-item>

            <el-form-item label="开票时间">
              <el-date-picker
                class="!w-[240px]"
                v-model="dateTimeRange"
                type="daterange"
                range-separator="~"
                start-placeholder="开始时间"
                end-placeholder="截止时间"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleQuery"
                ><el-icon><Search /></el-icon>搜索</el-button
              >
              <el-button @click="handleResetQuery">
                <el-icon><Refresh /></el-icon>
                重置</el-button
              >
            </el-form-item>
          </el-form>
        </div>

        <el-card shadow="never" class="table-container">
          <template #header>
            <div class="flex-x-between">
              <div>
                <el-button type="success" @click="handleOpenDialog()"
                  ><el-icon><Plus /></el-icon>新增</el-button
                >
                <el-button
                  type="danger"
                  :disabled="removeIds.length === 0"
                  @click="handleDelete()"
                  ><el-icon><RemoveFilled /></el-icon>禁用</el-button
                >
              </div>
              <div>
                <el-button
                  class="ml-3"
                  @click="handleOpenImportDialog"
                  :disabled="'true'"
                  ><template #icon><Upload /></template>导入</el-button
                >
                <el-button class="ml-3" @click="handleExport" :disabled="'true'"
                  ><template #icon><Download /></template>导出</el-button
                >
              </div>
            </div>
          </template>

          <el-table
            v-loading="loading"
            :data="pageData"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" align="center" />
            <el-table-column key="id" label="编号" align="center" prop="id" />
            <el-table-column
              key="username"
              label="用户名"
              align="center"
              prop="username"
              width="200"
            />
            <el-table-column
              label="手机号"
              align="center"
              prop="phone"
              width="120"
            />
            <el-table-column
              label="邮箱"
              align="center"
              prop="email"
              width="200"
            />
            <el-table-column
              key="balance"
              label="余额"
              align="center"
              prop="balance"
            >
              <template #default="scope">
                <el-tag type="warning">￥{{ scope.row.balance }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="状态" align="center" prop="deleted">
              <template #default="scope">
                <el-tag :type="scope.row.deleted == 0 ? 'success' : 'info'">{{
                  scope.row.deleted == 0 ? "启用" : "禁用"
                }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column
              label="创建时间"
              align="center"
              prop="createTime"
              width="180"
            />
            <el-table-column label="操作" fixed="right" width="220">
              <template #default="scope">
                <el-button
                  type="primary"
                  size="small"
                  link
                  @click="handleResetPassword(scope.row)"
                  ><el-icon><RefreshLeft /></el-icon>重置密码</el-button
                >
                <el-button
                  type="primary"
                  link
                  size="small"
                  @click="handleOpenDialog(scope.row.id)"
                  ><el-icon><Edit /></el-icon>编辑</el-button
                >
                <el-button
                  type="danger"
                  link
                  size="small"
                  v-if="scope.row.deleted === 0"
                  @click="handleDelete(scope.row.id)"
                  ><el-icon><RemoveFilled /></el-icon>禁用</el-button
                >
                <el-button
                  type="success"
                  link
                  size="small"
                  v-else
                  @click="handleEnable(scope.row.id)"
                  ><el-icon><CircleCheckFilled /></el-icon>启用</el-button
                >
              </template>
            </el-table-column>
          </el-table>

          <pagination
            v-if="total > 0"
            v-model:total="total"
            v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize"
            @pagination="handleQuery"
          />
        </el-card>
      </el-col>
    </el-row>

    <!-- 用户表单弹窗 -->
    <el-drawer
      v-model="dialog.visible"
      :title="dialog.title"
      append-to-body
      @close="handleCloseDialog"
    >
      <!-- 用户新增/编辑表单 -->
      <el-form
        ref="userFormRef"
        :model="formData"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="formData.username"
            :readonly="!!formData.id"
            placeholder="请输入用户名"
          />
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <el-input
            v-model="formData.phone"
            placeholder="请输入手机号码"
            maxlength="11"
          />
        </el-form-item>

        <el-form-item label="邮  &nbsp; 箱" prop="email">
          <el-input
            v-model="formData.email"
            placeholder="请输入邮箱"
            maxlength="50"
          />
        </el-form-item>

        <el-form-item label="头  &nbsp; 像" prop="avatar">
          <el-input
            v-model="formData.avatar"
            placeholder="请输入头像地址"
            maxlength="200"
          />
        </el-form-item>

        <el-form-item label="余  &nbsp; 额" prop="balance">
          <el-input
            v-model="formData.balance"
            placeholder="请输入用户余额"
            maxlength="20"
          />
        </el-form-item>

        <el-form-item label="管理员" prop="admin">
          <el-radio-group>
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="状  &nbsp; 态" prop="deleted">
          <el-radio-group v-model="formData.status">
            <el-radio :label="0">正常</el-radio>
            <el-radio :label="1">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" >确 定</el-button>
          <el-button >取 消</el-button>
        </div>
      </template>
    </el-drawer>

    <!-- 用户导入弹窗 -->
    <user-import v-model:visible="importDialogVisible" />
  </div>
</template>

<script setup lang="ts">
import {
  CircleCheckFilled,
  Download,
  Edit,
  Plus,
  Refresh,
  RefreshLeft,
  RemoveFilled,
  Search,
  Upload,
} from "@element-plus/icons-vue";

defineOptions({
  name: "User",
  inheritAttrs: false,
});

import InvAPI, { InvPageQuery } from "@/api/inv";
const queryFormRef = ref(ElForm);
const userFormRef = ref(ElForm);

const loading = ref(false);
const removeIds = ref([]);
const total = ref(0);
const pageData = ref<[]>();
/** 用户查询参数  */
const queryParams = reactive<InvPageQuery>({
  pageNum: 1,
  pageSize: 10,
});

const dateTimeRange = ref("");
watch(dateTimeRange, (newVal) => {
  if (newVal) {
    queryParams.startTime = newVal[0];
    queryParams.endTime = newVal[1];
  } else {
    queryParams.startTime = undefined;
    queryParams.endTime = undefined;
  }
});

/**  用户弹窗对象  */
const dialog = reactive({
  visible: false,
  title: "",
});

/** 导入弹窗显示状态 */
const importDialogVisible = ref(false);

// 用户表单数据
const formData = reactive({
  status: 0,
});

function handleQuery() {}
function handleResetQuery() {}
function handleOpenDialog() {}
function handleDelete() {}
function handleSelectionChange() {}
function handleOpenImportDialog() {}
function handleExport() {}
function handleCloseDialog() {}
function handleResetPassword() {}
function handleEnable() {}
onMounted(() => {});
</script>
