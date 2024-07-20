<template>
  <div class="app-container">
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item prop="keywords" label="关键字">
          <el-input
            v-model="queryParams.keywords"
            placeholder="消息内容"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="消息类型" prop="type">
          <el-select
            v-model="queryParams.type"
            placeholder="全部"
            clearable
            class="!w-[100px]"
          >
            <el-option label="用户消息" value="0" />
            <el-option label="系统通知" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery"
            ><Search />搜索</el-button
          >
          <el-button @click="handleResetQuery"><Refresh />重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="never">
      <template #header>
        <div class="flex-x-between">
          <div>
            <el-button type="success" @click="handleOpenDialog()">
              <el-icon>
                <Plus />
              </el-icon>
              新增
            </el-button>
            <el-button
              type="danger"
              :disabled="removeIds.length === 0"
              @click="handleDelete()"
            >
              <el-icon>
                <RemoveFilled />
              </el-icon>
              删除
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="pageData"
        highlight-current-row
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" align="center" />
        <el-table-column label="ID" prop="id" width="80" />
        <el-table-column label="父ID" prop="parentId" width="80" />
        <el-table-column label="时间" prop="createTime" width="180" />
        <el-table-column label="类型" prop="type" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.type === 1 ? 'success' : 'info'"
              >{{ scope.row.type === 1 ? "系统通知" : "用户消息" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="已删除" prop="deleted" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.deleted === 1 ? 'danger' : 'info'"
              >{{ scope.row.deleted === 1 ? "是" : "否" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作人" prop="username" width="100" />
        <el-table-column label="内容" prop="text" />
        <el-table-column label="操作" fixed="right" width="230">
          <template #default="scope">
            <el-button
              type="success"
              link
              size="small"
              @click="handleOpenDialog(scope.row.id, 0)"
            >
              <el-icon>
                <Edit />
              </el-icon>
              修改
            </el-button>
            <el-button
              type="success"
              link
              size="small"
              @click="handleOpenDialog(scope.row.id, 1)"
              v-if="scope.row.type === 0"
            >
              <el-icon>
                <Edit />
              </el-icon>
              回复
            </el-button>
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

    <!-- 修改表单弹窗 -->
    <el-drawer
      v-model="editState.visible"
      :title="editState.title"
      append-to-body
      @close="handleCloseDialog"
    >
      <!-- 新增/编辑表单 -->
      <el-form ref="formRef" :model="editState.formData" label-width="80px">
        <el-form-item label="消息内容" prop="text">
          <el-input
            style="width: 240px"
            :rows="2"
            type="textarea"
            v-model="editState.formData.text"
            placeholder="请输入消息内容"
          />
        </el-form-item>
        <el-form-item label="消息类型" prop="type" v-if="editState.t === 0">
          <el-radio-group v-model="editState.formData.type">
            <el-radio :value="1">系统通知</el-radio>
            <el-radio :value="0">用户消息</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          label="父消息"
          prop="text"
          v-if="editState.t === 0 && editState.formData.type === 0"
        >
          <el-select
            v-model="queryParams.keywords"
            filterable
            remote
            reserve-keyword
            placeholder="输入内容搜索"
            :remote-method="remoteSearch"
            :loading="loading"
            style="width: 240px"
            ><el-option
              v-for="item in options"
              :key="item.id"
              :label="'#' + item.id + ' ' + item.text"
              :value="item.id"
          /></el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
          <el-button @click="handleCloseDialog">取 消</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import {
  Edit,
  Plus,
  Refresh,
  RemoveFilled,
  Search,
} from "@element-plus/icons-vue";

defineOptions({
  name: "Message",
  inheritAttrs: false,
});

import MsgAPI, { MsgDetail, MsgPageQuery } from "@/api/msg";

const queryFormRef = ref(ElForm);

const loading = ref(false);
const total = ref(0);

const queryParams = reactive<MsgPageQuery>({
  pageNum: 1,
  pageSize: 10,
  keywords: "",
});

// 日志表格数据
const pageData = ref<MsgDetail[]>();

/** 查询 */
function handleQuery() {
  loading.value = true;
  MsgAPI.getMsgList(queryParams)
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
  queryParams.pageNum = 1;
  handleQuery();
}

/** 删除功能 */
const removeIds = ref<number[]>([]);
function handleSelectionChange(selection: any) {
  removeIds.value = selection.map((item: any) => item.id);
}
function handleDelete() {
  MsgAPI.removeList(removeIds.value.join(",")).then(() => {
    handleQuery();
  });
}

const editState = reactive({
  visible: false,
  title: "",
  t: 0, // 0->新增, 1->回复, 2->修改
  loading: false,
  formData: <MsgDetail>{
    type: 0,
  },
});
const options = ref<MsgDetail[]>([]);
function remoteSearch(query: string) {
  if (query) {
    editState.loading = true;
    MsgAPI.getMsgList({ keywords: query, pageNum: 1, pageSize: 100 }).then(
      (data) => {
        editState.loading = false;
        options.value = data.records;
      }
    );
  } else {
    options.value = [];
  }
}
const formRef = ref(ElForm);
function handleSubmit() {
  if (editState.formData.text.length < 10) {
    ElMessage.warning("消息内容不能少于10个字符");
    return;
  }
  if (!editState.formData.id || editState.t === 1) {
    if (editState.t === 0 && queryParams.keywords) {
      const regex = /-?\d+(\.\d+)?/g;
      const matches = queryParams.keywords.toString().match(regex);
      const numbers = matches.map(Number);
      editState.formData.parentId = numbers[0];
    }
    MsgAPI.addMsg(editState.formData).then(() => {
      handleCloseDialog();
      handleResetQuery();
    });
  } else {
    MsgAPI.editMsg(editState.formData).then(() => {
      handleCloseDialog();
      handleQuery();
    });
  }
}
function handleCloseDialog() {
  editState.visible = false;
  formRef.value.resetFields();
  formRef.value.clearValidate();
  editState.formData = <MsgDetail>{ type: 0 };
}
function handleOpenDialog(id?: number, t?: number) {
  editState.visible = true;
  editState.t = !id ? 0 : t ? 1 : 2;
  editState.title =
    editState.t === 0 ? "新增" : editState.t === 1 ? "回复" : "修改";
  if (id) {
    MsgAPI.getMsg(id).then((data) => {
      editState.formData = data;
      if (editState.t === 1) {
        editState.formData = <MsgDetail>{ parentId: id, type: data.type };
      }
    });
  }
}
onMounted(() => {
  handleQuery();
});
</script>
