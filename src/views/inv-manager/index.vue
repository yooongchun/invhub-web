<!-- 发票管理 -->
<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :lg="2" :xs="24" class="mb-[12px]" />
      <!-- 发票列表 -->
      <el-col :lg="20" :xs="24">
        <div class="search-container">
          <el-form
            ref="queryFormRef"
            :model="queryState.queryParams"
            :inline="true"
          >
            <el-form-item label="关键字" prop="keywords">
              <el-input
                v-model="queryState.queryParams.keywords"
                placeholder="发票代码/号码/类型或创建人"
                clearable
                style="width: 200px"
                @keyup.enter="handleQuery"
              />
            </el-form-item>

            <el-form-item label="查验状态" prop="invChecked">
              <el-select
                v-model="queryState.queryParams.invChecked"
                placeholder="全部"
                clearable
                class="!w-[100px]"
              >
                <el-option label="未查验" value="10" />
                <el-option label="查验中" value="20" />
                <el-option label="已查验" value="30" />
                <el-option label="查无此票" value="31" />
                <el-option label="不一致" value="32" />
                <el-option label="查验失败" value="40" />
              </el-select>
            </el-form-item>

            <el-form-item label="人工校验" prop="checked">
              <el-select
                v-model="queryState.queryParams.checked"
                placeholder="全部"
                clearable
                class="!w-[100px]"
              >
                <el-option label="未校验" value="0" />
                <el-option label="已校验" value="1" />
              </el-select>
            </el-form-item>
            <el-form-item label="报销进度" prop="reimbursed">
              <el-select
                v-model="queryState.queryParams.reimbursed"
                placeholder="全部"
                clearable
                class="!w-[100px]"
              >
                <el-option label="未报" value="0" />
                <el-option label="在途" value="2" />
                <el-option label="已报" value="1" />
                <el-option label="已拒" value="3" />
              </el-select>
            </el-form-item>

            <el-form-item label="金额范围" prop="amount">
              <el-input-number
                v-model="queryState.queryParams.minAmount"
                :precision="2"
                :step="1"
                :min="0.1"
              />
              <el-input-number
                v-model="queryState.queryParams.maxAmount"
                :precision="2"
                :step="1"
                :min="0.1"
              />
            </el-form-item>

            <el-form-item label="开票时间">
              <el-date-picker
                class="!w-[240px]"
                v-model="queryState.dateTimeRange"
                type="daterange"
                range-separator="~"
                start-placeholder="开始时间"
                end-placeholder="截止时间"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleQuery">
                <el-icon>
                  <Search />
                </el-icon>
                搜索
              </el-button>
              <el-button @click="handleResetQuery">
                <el-icon>
                  <Refresh />
                </el-icon>
                重置
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <el-card shadow="never" class="table-container">
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
                  :disabled="pageState.removeIds.length === 0"
                  @click="handleDelete()"
                >
                  <el-icon>
                    <RemoveFilled />
                  </el-icon>
                  删除
                </el-button>
              </div>
              <div>
                <el-button
                  class="ml-3"
                  type="success"
                  @click="handleOpenImportDialog"
                >
                  <template #icon>
                    <Download />
                  </template>
                  导入
                </el-button>
                <el-button class="ml-3" @click="handleExport">
                  <template #icon>
                    <Upload />
                  </template>
                  导出
                </el-button>
              </div>
            </div>
          </template>

          <el-table
            v-loading="queryState.loading"
            :data="pageState.pageData"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" align="center" />
            <el-table-column
              label="发票号码"
              align="center"
              prop="invNum"
              width="180"
            />
            <el-table-column
              key="invCode"
              label="发票代码"
              align="center"
              prop="invCode"
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
                <el-tag :type="scope.row.checked == 1 ? 'success' : 'info'"
                  >{{ scope.row.checked == 1 ? "是" : "否" }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column label="报销进度" align="center" prop="reimbursed">
              <template #default="scope">
                <el-tag type="info" v-if="scope.row.reimbursed == 0">
                  未报
                </el-tag>
                <el-tag type="warning" v-else-if="scope.row.reimbursed == 1">
                  在途
                </el-tag>
                <el-tag type="success" v-else-if="scope.row.reimbursed == 2">
                  已报
                </el-tag>
                <el-tag type="danger" v-else-if="scope.row.reimbursed == 3">
                  已拒
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="查验结果" align="center" prop="invChecked">
              <template #default="scope">
                <el-tag type="info" v-if="scope.row.invChecked == 10">
                  未查验
                </el-tag>
                <el-tag type="warning" v-else-if="scope.row.invChecked == 20">
                  <el-icon class="is-loading">
                    <Loading />
                  </el-icon>
                  查验中
                </el-tag>
                <el-tag type="success" v-else-if="scope.row.invChecked == 30">
                  已查验
                </el-tag>
                <el-tag type="danger" v-else-if="scope.row.invChecked == 31">
                  查无此票
                </el-tag>
                <el-tag type="danger" v-else-if="scope.row.invChecked == 32">
                  不一致
                </el-tag>
                <el-tag type="danger" v-else-if="scope.row.invChecked == 33">
                  已作废
                </el-tag>
                <el-tag type="danger" v-else-if="scope.row.invChecked == 40">
                  查验失败
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="报销人" align="center" prop="owner" />
            <el-table-column label="操作" fixed="right" width="230">
              <template #default="scope">
                <el-button
                  type="primary"
                  size="small"
                  link
                  @click="handleViewFile(scope.row.id)"
                >
                  <el-icon>
                    <Picture />
                  </el-icon>
                  查看
                </el-button>
                <el-button
                  type="primary"
                  link
                  size="small"
                  @click="handleViewCheckResult(scope.row.id)"
                >
                  <el-icon>
                    <Postcard />
                  </el-icon>
                  查验
                </el-button>
                <el-button
                  type="primary"
                  link
                  size="small"
                  @click="handleCheckAgain(scope.row.id)"
                >
                  <el-icon>
                    <VideoPlay />
                  </el-icon>
                  重查
                </el-button>
                <el-button
                  type="success"
                  link
                  size="small"
                  @click="handleOpenDialog(scope.row.id)"
                >
                  <el-icon>
                    <Edit />
                  </el-icon>
                  修改
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <pagination
            v-if="pageState.total > 0"
            v-model:total="pageState.total"
            v-model:page="queryState.queryParams.pageNum"
            v-model:limit="queryState.queryParams.pageSize"
            @pagination="handleQuery"
          />
        </el-card>
      </el-col>
    </el-row>

    <!-- 修改表单弹窗 -->
    <el-drawer
      v-model="editState.visible"
      :title="editState.title"
      append-to-body
      @close="handleCloseDialog"
    >
      <!-- 新增/编辑表单 -->
      <el-form
        ref="invFormRef"
        :model="editState.formData"
        :rules="editState.rules"
        label-width="80px"
      >
        <el-form-item label="发票号码" prop="invNum">
          <el-input
            v-model="editState.formData.invNum"
            placeholder="请输入发票号码"
          />
        </el-form-item>
        <el-form-item label="发票代码" prop="invCode">
          <el-input
            v-model="editState.formData.invCode"
            placeholder="请输入发票代码"
          />
        </el-form-item>
        <el-form-item label="开票日期" prop="invDate">
          <el-date-picker
            v-model="editState.formData.invDate"
            type="date"
            placeholder="选择开票日期"
          />
        </el-form-item>
        <el-form-item label="开票金额" prop="amount">
          <el-input-number
            v-model="editState.formData.amount"
            :step="1"
            :precision="2"
            :min="0"
          />
        </el-form-item>
        <el-form-item label="税额" prop="tax">
          <el-input v-model="editState.formData.tax" placeholder="请输入税额" />
        </el-form-item>
        <el-form-item label="校验码" prop="checkCode">
          <el-input
            v-model="editState.formData.checkCode"
            placeholder="请输入校验码（后6位）"
          />
        </el-form-item>
        <el-form-item label="已校验" prop="checked">
          <el-radio-group v-model="editState.formData.checked">
            <el-radio :value="1">是</el-radio>
            <el-radio :value="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="报销进度" prop="reimbursed">
          <el-radio-group v-model="editState.formData.reimbursed">
            <el-radio :value="0">未报</el-radio>
            <el-radio :value="1">在途</el-radio>
            <el-radio :value="2">已报</el-radio>
            <el-radio :value="3">已拒</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="报销人" prop="owner">
          <el-input
            v-model="editState.formData.owner"
            placeholder="请输入报销人"
          />
        </el-form-item>
        <el-form-item label="发票文件" v-if="!editState.t">
          <single-upload v-model="editState.formData.fileId" />
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
    <ImportInvData v-model:visible="importState.importDialogVisible" />
    <!-- 文件预览弹窗 -->
    <el-dialog
      v-if="previewState.showDialog"
      v-model="previewState.showDialog"
      title="文件预览"
      center
      :fullscreen="true"
      @close="handleClosePreviewFile"
    >
      <PDF
        :src="previewState.url"
        :pdfWidth="'80%'"
        v-loading.fullscreen.lock="previewState.fileType.length < 1"
        v-if="previewState.isPdf"
      />
      <el-image
        v-else
        :src="previewState.url"
        fit="contain"
        style="width: 80%; margin-left: 10%"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import edit from "@/views/demo/curd/config/edit";

defineOptions({
  name: "User",
  inheritAttrs: false,
});

import {
  Download,
  Edit,
  Loading,
  Picture,
  Plus,
  Postcard,
  Refresh,
  RemoveFilled,
  Search,
  Upload,
  VideoPlay,
} from "@element-plus/icons-vue";
import PDF from "pdf-vue3";

import InvAPI, { InvPageQuery, InvData, InvQueryResult } from "@/api/inv";
import FileAPI, { FilePreview } from "@/api/file";
import SingleUpload from "@/components/Upload/SingleUpload.vue";
import ImportInvData from "./components/ImportInvData.vue";

const queryFormRef = ref(ElForm);
const invFormRef = ref(ElForm);

const queryState = reactive({
  loading: false,
  queryParams: <InvPageQuery>{
    pageNum: 1,
    pageSize: 10,
  },
  dateTimeRange: "",
});

const pageState = reactive({
  removeIds: [],
  total: 0,
  pageData: <InvData[]>[],
});

/** 导入弹窗显示状态 */
const importState = reactive({
  importDialogVisible: false,
});

watch(importState, (newVal) => {
  if (!newVal.importDialogVisible) {
    handleQuery();
  }
});

const previewState = reactive({
  fileType: "",
  url: "",
  isPdf: false,
  showDialog: false,
});

const editState = reactive({
  visible: false,
  title: "",
  t: 0, // 0 新建 1 修改
  rules: {
    invNum: [
      { required: true, message: "请输入发票号码", trigger: "blur" },
      {
        pattern: /^\d{8}$|^\d{20}$/,
        message: "长度普通票8位，全电票20位",
        trigger: "blur",
      },
    ],
    invCode: [
      {
        pattern: /^\d{12}$/,
        message: "发票代码为12位数字",
        trigger: "blur",
      },
    ],
    amount: [
      { required: true, message: "请输入金额", trigger: "blur" },
      {
        pattern: /^\d+\.?\d*$/,
        message: "金额格式不正确",
        trigger: "blur",
      },
    ],
    tax: [
      {
        required: true,
        message: "请输入税额，若无则填写*或免税",
        trigger: "blur",
      },
    ],
    checkCode: [
      {
        pattern: /^\d{6}$|^\d{20}$/,
        message: "填写校验码后六位数字或全部20位",
        trigger: "blur",
      },
    ],
  },
  formData: <InvData>{
    checked: 0,
    reimbursed: 0,
  },
});

/** 查询 */
function handleQuery() {
  queryState.loading = true;
  InvAPI.getPage(queryState.queryParams)
    .then((res: InvQueryResult) => {
      pageState.pageData = res.records;
      pageState.total = res.total;
    })
    .finally(() => {
      queryState.loading = false;
    });
}

/** 重置查询 */
function handleResetQuery() {
  queryFormRef.value.resetFields();
  queryState.dateTimeRange = "";
  queryState.queryParams.pageNum = 1;
  queryState.queryParams.startTime = undefined;
  queryState.queryParams.endTime = undefined;
  queryState.queryParams.minAmount = undefined;
  queryState.queryParams.maxAmount = undefined;
  handleQuery();
}

async function handleOpenDialog(id?: number) {
  editState.visible = true;
  if (id) {
    editState.t = 1;
    editState.title = "修改发票信息";
    InvAPI.getInvData(id).then((res: InvData) => {
      editState.formData = res;
    });
  } else {
    editState.title = "新增发票数据";
  }
}
function handleDelete() {
  const invIds = pageState.removeIds.join(",");
  if (!invIds) {
    ElMessage.warning("请勾选删除项");
    return;
  }

  ElMessageBox.confirm("确认删除?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(
    function () {
      queryState.loading = true;
      InvAPI.deleteByIds(invIds)
        .then(() => {
          ElMessage.success("删除成功");
          handleResetQuery();
        })
        .finally(() => (queryState.loading = false));
    },
    function () {
      ElMessage.info("已取消");
    }
  );
}
/** 行复选框选中记录选中ID集合 */
function handleSelectionChange(selection: any) {
  pageState.removeIds = selection.map((item: any) => item.id);
}

function handleOpenImportDialog() {
  importState.importDialogVisible = true;
}

function handleExport() {}

function handleCloseDialog() {
  editState.visible = false;
  invFormRef.value.resetFields();
  invFormRef.value.clearValidate();

  editState.formData.id = 0;
  editState.t = 0;
}

function handleClosePreviewFile() {
  previewState.showDialog = false;
  previewState.url = "";
  previewState.fileType = "";
  previewState.isPdf = false;
}
/**将文件链接转为byte数组*/
async function fetchFileAsBase64(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = function () {
      resolve(reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function handleViewFile(id: number) {
  previewState.showDialog = true;
  FileAPI.previewFile(id).then((res: FilePreview) => {
    if (res.fileType === "application/pdf") {
      previewState.isPdf = true;
      fetchFileAsBase64(res.url)
        .then((base64: any) => {
          previewState.url = base64;
        })
        .catch(() => {
          ElMessage.error("文件预览失败");
          previewState.showDialog = false;
        });
    } else {
      previewState.url = res.url;
      previewState.isPdf = false;
    }
    previewState.fileType = res.fileType;
  });
}

function handleViewCheckResult(id: number) {}

function handleCheckAgain(id: number) {}

const handleSubmit = useThrottleFn(() => {
  invFormRef.value.validate((valid: any) => {
    if (valid) {
      const invId = editState.formData.id;
      if (invId) {
        InvAPI.update(editState.formData).then(() => {
          ElMessage.success("修改发票信息成功");
          handleCloseDialog();
          handleResetQuery();
        });
      } else {
        InvAPI.add(editState.formData).then(() => {
          ElMessage.success("新增发票信息成功");
          handleCloseDialog();
          handleResetQuery();
        });
      }
    }
  });
}, 3000);

watch(
  computed(() => {
    return queryState.dateTimeRange;
  }),
  (newVal) => {
    if (newVal) {
      queryState.queryParams.startTime = newVal[0];
      queryState.queryParams.endTime = newVal[1];
    } else {
      queryState.queryParams.startTime = undefined;
      queryState.queryParams.endTime = undefined;
    }
  }
);

onMounted(() => {
  handleQuery();
});
</script>
