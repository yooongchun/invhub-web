<!-- 用户管理 -->
<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :lg="2" :xs="24" class="mb-[12px]" />
      <!-- 用户列表 -->
      <el-col :lg="20" :xs="24">
        <div class="search-container">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="关键字" prop="keywords">
              <el-input
                v-model="queryParams.keywords"
                placeholder="用户名/手机号/邮箱"
                clearable
                style="width: 200px"
                @keyup.enter="handleQuery"
              />
            </el-form-item>

            <el-form-item label="状态" prop="deleted">
              <el-select
                v-model="queryParams.deleted"
                placeholder="全部"
                clearable
                class="!w-[100px]"
              >
                <el-option label="启用" value="0" />
                <el-option label="禁用" value="1" />
              </el-select>
            </el-form-item>

            <el-form-item label="创建时间">
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
          <el-radio-group v-model="formData.admin">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="状  &nbsp; 态" prop="deleted">
          <el-radio-group v-model="formData.deleted">
            <el-radio :label="0">正常</el-radio>
            <el-radio :label="1">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
          <el-button @click="handleCloseDialog">取 消</el-button>
        </div>
      </template>
    </el-drawer>

    <!-- 用户导入弹窗 -->
    <user-import
      v-model:visible="importDialogVisible"
      @import-success="handleOpenImportDialogSuccess"
    />
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

import UserAPI, { UserForm, UserPageQuery, UserPageVO } from "@/api/user";
const queryFormRef = ref(ElForm);
const userFormRef = ref(ElForm);

const loading = ref(false);
const removeIds = ref([]);
const total = ref(0);
const pageData = ref<UserPageVO[]>();
/** 用户查询参数  */
const queryParams = reactive<UserPageQuery>({
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
const formData = reactive<UserForm>({
  deleted: 0,
});

/** 用户表单校验规则  */
const rules = reactive({
  username: [{ required: true, message: "用户名不能为空", trigger: "blur" }],
  balance: [
    { required: true, message: "用户余额必传", trigger: "blur" },
    { pattern: /^[1-9]\.?\d*$/, message: "用户余额不合法", trigger: "blur" },
  ],
  admin: [{ required: true, message: "管理员参数必传", trigger: "blur" }],
  email: [
    {
      pattern: /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/,
      message: "请输入正确的邮箱地址",
      trigger: "blur",
    },
  ],
  phone: [
    {
      pattern: /^1[3456789][0-9]\d{8}$/,
      message: "请输入正确的手机号码",
      trigger: "blur",
    },
  ],
});

/** 查询 */
function handleQuery() {
  loading.value = true;
  UserAPI.getPage(queryParams)
    .then((data) => {
      pageData.value = data.records;
      total.value = data.total;
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
  handleQuery();
}

/** 行复选框选中记录选中ID集合 */
function handleSelectionChange(selection: any) {
  removeIds.value = selection.map((item: any) => item.id);
}

/** 重置密码 */
function handleResetPassword(row: { [key: string]: any }) {
  ElMessageBox.prompt(
    "请输入用户「" + row.username + "」的新密码",
    "重置密码",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
    }
  ).then(({ value }) => {
    if (!value || value.length < 6) {
      // 检查密码是否为空或少于6位
      ElMessage.warning("密码至少需要6位字符，请重新输入");
      return false;
    }
    UserAPI.updatePassword(row.id, value).then(() => {
      ElMessage.success("密码重置成功，新密码是：" + value);
    });
  });
}

/**
 * 打开弹窗
 *
 * @param id 用户ID
 */
async function handleOpenDialog(id?: number) {
  dialog.visible = true;
  // 加载角色下拉数据源

  if (id) {
    dialog.title = "修改用户";
    UserAPI.getUserInfo(id).then((data) => {
      Object.assign(formData, { ...data });
    });
  } else {
    dialog.title = "新增用户";
  }
}

/** 关闭弹窗 */
function handleCloseDialog() {
  dialog.visible = false;
  userFormRef.value.resetFields();
  userFormRef.value.clearValidate();

  formData.id = undefined;
  formData.uid = undefined;
  formData.deleted = 0;
}

/** 表单提交 */
const handleSubmit = useThrottleFn(() => {
  userFormRef.value.validate((valid: any) => {
    if (valid) {
      const userId = formData.id;
      loading.value = true;
      if (userId) {
        UserAPI.update(formData)
          .then(() => {
            ElMessage.success("修改用户成功");
            handleCloseDialog();
            handleResetQuery();
          })
          .finally(() => (loading.value = false));
      } else {
        UserAPI.add(formData)
          .then(() => {
            ElMessage.success("新增用户成功");
            handleCloseDialog();
            handleResetQuery();
          })
          .finally(() => (loading.value = false));
      }
    }
  });
}, 3000);

/** 删除用户 */
function handleDelete(id?: number) {
  const userIds = [id || removeIds.value].join(",");
  if (!userIds) {
    ElMessage.warning("请勾选禁用项");
    return;
  }

  ElMessageBox.confirm("确认禁用用户?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(
    function () {
      loading.value = true;
      UserAPI.deleteByIds(userIds)
        .then(() => {
          ElMessage.success("禁用成功");
          handleResetQuery();
        })
        .finally(() => (loading.value = false));
    },
    function () {
      ElMessage.info("已取消");
    }
  );
}
/** 删除用户 */
function handleEnable(id: number) {
  ElMessageBox.confirm("确认解禁用户?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(
    function () {
      loading.value = true;
      UserAPI.enableId(id)
        .then(() => {
          ElMessage.success("启用成功");
          handleResetQuery();
        })
        .finally(() => (loading.value = false));
    },
    function () {
      ElMessage.info("已取消");
    }
  );
}
/** 打开导入弹窗 */
function handleOpenImportDialog() {
  importDialogVisible.value = true;
}

/** 导入用户成功 */
function handleOpenImportDialogSuccess() {
  handleQuery();
}

/** 导出用户 */
function handleExport() {
  UserAPI.export(queryParams).then((response: any) => {
    const fileData = response.data;
    const fileName = decodeURI(
      response.headers["content-disposition"].split(";")[1].split("=")[1]
    );
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8";

    const blob = new Blob([fileData], { type: fileType });
    const downloadUrl = window.URL.createObjectURL(blob);

    const downloadLink = document.createElement("a");
    downloadLink.href = downloadUrl;
    downloadLink.download = fileName;

    document.body.appendChild(downloadLink);
    downloadLink.click();

    document.body.removeChild(downloadLink);
    window.URL.revokeObjectURL(downloadUrl);
  });
}

onMounted(() => {
  handleQuery();
});
</script>
