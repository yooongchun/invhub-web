<!-- 发票管理 -->
<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :lg="2" :xs="24" class="mb-[12px]"/>
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

            <el-form-item label="查验状态" prop="invChecked">
              <el-select
                v-model="queryParams.invChecked"
                placeholder="全部"
                clearable
                class="!w-[100px]"
                >
                <el-option label="未查验" value="10"/>
                <el-option label="查验中" value="20"/>
                <el-option label="已查验" value="30"/>
                <el-option label="查无此票" value="31"/>
                <el-option label="不一致" value="32"/>
                <el-option label="查验失败" value="40"/>
              </el-select>
            </el-form-item>

            <el-form-item label="人工校验" prop="checked">
              <el-select
                v-model="queryParams.checked"
                placeholder="全部"
                clearable
                class="!w-[100px]"
              >
                <el-option label="未校验" value="0"/>
                <el-option label="已校验" value="1"/>
              </el-select>
            </el-form-item>
            <el-form-item label="报销进度" prop="reimbursed">
              <el-select
                v-model="queryParams.reimbursed"
                placeholder="全部"
                clearable
                class="!w-[100px]"
              >
                <el-option label="未报" value="0"/>
                <el-option label="在途" value="2"/>
                <el-option label="已报" value="1"/>
                <el-option label="已拒" value="3"/>
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
              >
                <el-icon>
                  <Search/>
                </el-icon>
                搜索
              </el-button
              >
              <el-button @click="handleResetQuery">
                <el-icon>
                  <Refresh/>
                </el-icon>
                重置
              </el-button
              >
            </el-form-item>
          </el-form>
        </div>

        <el-card shadow="never" class="table-container">
          <template #header>
            <div class="flex-x-between">
              <div>
                <el-button type="success" @click="handleOpenDialog()"
                >
                  <el-icon>
                    <Plus/>
                  </el-icon>
                  新增
                </el-button
                >
                <el-button
                  type="danger"
                  :disabled="removeIds.length === 0"
                  @click="handleDelete()"
                >
                  <el-icon>
                    <RemoveFilled/>
                  </el-icon>
                  删除
                </el-button
                >
              </div>
              <div>
                <el-button
                  class="ml-3"
                  type="success"
                  @click="handleOpenImportDialog"
                >
                  <template #icon>
                    <Download/>
                  </template>
                  导入
                </el-button
                >
                <el-button class="ml-3" @click="handleExport"
                >
                  <template #icon>
                    <Upload/>
                  </template>
                  导出
                </el-button
                >
              </div>
            </div>
          </template>

          <el-table
            v-loading="loading"
            :data="pageData"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" align="center"/>
            <el-table-column
              key="invCode"
              label="发票代码"
              align="center"
              prop="invCode"
              width="180"
            />
            <el-table-column
              label="发票号码"
              align="center"
              prop="invNum"
              width="180"
            />
            <el-table-column
              label="开具金额"
              align="center"
              prop="amount"
              width="100"
            />
            <el-table-column
              label="校验码"
              align="center"
              prop="checkCode"
              width="80"
            />
            <el-table-column
              label="税额"
              align="center"
              prop="tax"
              width="100"
            />
            <el-table-column
              label="开票时间"
              align="center"
              prop="invDate"
              width="100"
            />
            <el-table-column label="已校验" align="center" prop="checked">
              <template #default="scope">
                <el-tag :type="scope.row.checked == 1 ? 'success' : 'info'">{{
                    scope.row.checked == 1 ? "是" : "否"
                  }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column label="报销进度" align="center" prop="reimbursed">
              <template #default="scope">
                <el-tag type="info" v-if="scope.row.reimbursed == 0"> 未报</el-tag>
                <el-tag type="warning" v-else-if="scope.row.reimbursed == 1"> 在途</el-tag>
                <el-tag type="success" v-else-if="scope.row.reimbursed == 2"> 已报</el-tag>
                <el-tag type="danger" v-else-if="scope.row.reimbursed == 3"> 已拒</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="查验结果" align="center" prop="invChecked">
              <template #default="scope">
                <el-tag type="info" v-if="scope.row.invChecked == 10"> 未查验</el-tag>
                <el-tag type="warning" v-else-if="scope.row.invChecked == 20">
                  <el-icon class="is-loading">
                    <Loading/>
                  </el-icon>
                  查验中
                </el-tag>
                <el-tag type="success" v-else-if="scope.row.invChecked == 30"> 已查验</el-tag>
                <el-tag type="danger" v-else-if="scope.row.invChecked == 31"> 查无此票</el-tag>
                <el-tag type="danger" v-else-if="scope.row.invChecked == 32"> 不一致</el-tag>
                <el-tag type="danger" v-else-if="scope.row.invChecked == 33"> 已作废</el-tag>
                <el-tag type="danger" v-else-if="scope.row.invChecked == 40"> 查验失败</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="报销人" align="center" prop="owner"/>
            <el-table-column label="操作" fixed="right" width="230">
              <template #default="scope">
                <el-button
                  type="primary"
                  size="small"
                  link
                  @click="handleViewFile(scope.row)"
                >
                  <el-icon>
                    <Picture/>
                  </el-icon>
                  文件
                </el-button
                >
                <el-button
                  type="primary"
                  link
                  size="small"
                  @click="handleViewCheckResult(scope.row.id)"
                >
                  <el-icon>
                    <Postcard/>
                  </el-icon>
                  结果
                </el-button
                >
                <el-button
                  type="primary"
                  link
                  size="small"
                  @click="handleCheckAgain(scope.row.id)"
                >
                  <el-icon>
                    <VideoPlay/>
                  </el-icon>
                  重查
                </el-button
                >
                <el-button
                  type="success"
                  link
                  size="small"
                  @click="handleEdit(scope.row.id)"
                >
                  <el-icon>
                    <Edit/>
                  </el-icon>
                  修改
                </el-button
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
          <el-button type="primary">确 定</el-button>
          <el-button>取 消</el-button>
        </div>
      </template>
    </el-drawer>

    <!-- 用户导入弹窗 -->
    <user-import v-model:visible="importDialogVisible"/>
  </div>
</template>

<script setup lang="ts">
import {
  Download,
  Edit, Picture,
  Plus, Postcard,
  Refresh,
  RemoveFilled,
  Search,
  Upload, VideoPlay,
} from "@element-plus/icons-vue";

defineOptions({
  name: "User",
  inheritAttrs: false,
});

import InvAPI, {InvPageQuery, InvData} from "@/api/inv";

const queryFormRef = ref(ElForm);
const userFormRef = ref(ElForm);

const loading = ref(false);
const removeIds = ref([]);
const total = ref(0);
const pageData = ref<InvData[]>();
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

/** 查询 */
function handleQuery() {
  loading.value = true;
  InvAPI.getPage(queryParams)
    .then((res) => {
      pageData.value = res.records;
      total.value = res.total;
    })
    .finally(() => {
      loading.value = false;
    });
}

/** 重置查询 */
function handleResetQuery() {
  queryFormRef.value.resetFields();
  dateTimeRange.value = "";
  queryParams.pageNum = 1;
  queryParams.startTime = undefined;
  queryParams.endTime = undefined;
  queryParams.minAmount = undefined;
  queryParams.maxAmount = undefined;
  handleQuery();
}

function handleOpenDialog() {
}

function handleDelete() {
}

function handleSelectionChange() {
}

function handleOpenImportDialog() {
}

function handleExport() {
}

function handleCloseDialog() {
}

function handleViewFile(id: number) {
}

function handleViewCheckResult(id: number) {
}

function handleCheckAgain(id: number) {
}

function handleEdit(id: number) {
}

onMounted(() => {
});
</script>
