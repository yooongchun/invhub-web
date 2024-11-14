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
                @change="handleQuery"
              >
                <el-option
                  v-for="item of invCheckStatus"
                  :key="item.code"
                  :label="item.msg"
                  :value="item.code"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="人工校验" prop="checked">
              <el-select
                v-model="queryState.queryParams.checked"
                placeholder="全部"
                clearable
                class="!w-[100px]"
                @change="handleQuery"
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
                @change="handleQuery"
              >
                <el-option label="未报" value="0" />
                <el-option label="在途" value="1" />
                <el-option label="已报" value="2" />
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
                <el-tooltip
                  class="box-item"
                  effect="dark"
                  content="自动解析发票关键数据，非100%准确，请务必仔细核验！可通过查验保证数据准确性！每份￥0.01！"
                  placement="top-start"
                >
                  <el-button
                    class="ml-3"
                    type="success"
                    @click="handleOpenImportDialog"
                  >
                    <template #icon>
                      <Download />
                    </template>
                    自动解析
                  </el-button>
                </el-tooltip>
                <el-tooltip
                  class="box-item"
                  effect="dark"
                  content="手动录入发票数据，后续可进行查验！"
                  placement="top-start"
                >
                  <el-button type="info" @click="handleOpenDialog()">
                    <el-icon>
                      <Plus />
                    </el-icon>
                    手动录入
                  </el-button>
                </el-tooltip>
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
                <el-tooltip
                  class="box-item"
                  effect="dark"
                  content="是否在每次上传发票数据之后自动触发查验？查验可以从国税官网查验发票的真伪！同时查验成功之后可以保证数据的准确性，建议查验！每份￥0.05！"
                  placement="top-start"
                >
                  <el-checkbox
                    v-model="autoCheckEnable"
                    label="开启自动查验"
                    border
                    @change="handleAutoCheckChanged"
                  />
                </el-tooltip>
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
                <el-tag :type="getInvCheckStatus(scope.row.invChecked).tip">
                  {{ getInvCheckStatus(scope.row.invChecked).msg }}
                  <el-icon
                    class="is-loading"
                    v-if="getInvCheckStatus(scope.row.invChecked).loading"
                  >
                    <Loading />
                  </el-icon>
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
                  @click="handleViewFile(scope.row.fileId)"
                  :disabled="scope.row.fileId == 0"
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
                  :disabled="
                    scope.row.invChecked == 0 ||
                    scope.row.invChecked == 20 ||
                    scope.row.invChecked == 31 ||
                    scope.row.invChecked == 32 ||
                    scope.row.invChecked == 33
                  "
                >
                  <el-icon>
                    <Picture v-if="scope.row.invChecked == 30" />
                    <Postcard v-else />
                  </el-icon>
                  {{ scope.row.invChecked == 30 ? "结果" : "查验" }}
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
} from "@element-plus/icons-vue";
import PDF from "pdf-vue3";
import InvAPI, { InvPageQuery, InvData, InvQueryResult } from "@/api/inv";
import FileAPI, { FilePreview } from "@/api/file";
import SingleUpload from "@/components/Upload/SingleUpload.vue";
import ImportInvData from "./components/ImportInvData.vue";
import UserAPI from "@/api/user";

const queryFormRef = ref(ElForm);
const invFormRef = ref(ElForm);
// 打开自动查验开关
const autoCheckEnable = ref(false);
// 存在查验中的任务，定时刷新
const inChecking = ref(false);

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
        pattern: /^\d{12}$|^\d{10}$/,
        message: "发票代码为10/12位数字",
        trigger: "blur",
      },
    ],
    amount: [
      { required: true, message: "请输入金额", trigger: "blur" },
      {
        pattern: /^-?\d+\.?\d*$/,
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

function handleAutoCheckChanged() {
  // 处理自动查验开启事件
  UserAPI.setAutoCheck(autoCheckEnable.value);
  setTimeout(() => {
    handleQuery();
  }, 10000);
}

/** 查询 */
function handleQuery() {
  queryState.loading = true;
  InvAPI.getPage(queryState.queryParams)
    .then((res: InvQueryResult) => {
      pageState.pageData = res.records;
      pageState.total = res.total;
      for (let record of res.records) {
        inChecking.value =
          inChecking.value ||
          record.invChecked === 20 ||
          record.invChecked === 0;
      }
    })
    .finally(() => {
      queryState.loading = false;
      // 如果存在查验中的任务，10秒之后刷新
      if (inChecking.value) {
        setTimeout(() => {
          console.log("刷新查验进度...", inChecking.value);
          handleQuery();
        }, 10000);
      }
    });
}

const invCheckStatus = reactive([
  { code: 0, msg: "初始化", tip: "info", loading: false },
  { code: 10, msg: "未查验", tip: "info", loading: false },
  { code: 20, msg: "查验中", tip: "warning", loading: true },
  { code: 30, msg: "已查验", tip: "success", loading: false },
  { code: 31, msg: "查无此票", tip: "danger", loading: false },
  { code: 32, msg: "不一致", tip: "danger", loading: false },
  { code: 33, msg: "已作废", tip: "danger", loading: false },
  { code: 40, msg: "查验失败", tip: "danger", loading: false },
  { code: 50, msg: "超过查验次数", tip: "warning", loading: false },
  { code: 51, msg: "访问被限制", tip: "warning", loading: false },
]);

function getInvCheckStatus(code: any) {
  for (const s of invCheckStatus) {
    if (s.code === code) {
      return s;
    }
  }
  return { code: -1, msg: "未知状态", tip: "danger", loading: false };
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

function handleViewCheckResult(id: number) {
  for (const row of pageState.pageData) {
    if (row.id === id) {
      // 提交查验任务：未开始查验、查验失败、超过查验次数、访问被限制，这四类场景可以提交
      if (
        row.invChecked === 10 ||
        row.invChecked === 40 ||
        row.invChecked === 50 ||
        row.invChecked === 51
      ) {
        ElMessageBox.confirm("确定发起查验任务吗?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "success",
        })
          .then(() => {
            InvAPI.submitInvCheckTask(id).then(() => {
              ElMessage({
                type: "success",
                message: "任务已提交",
              });
              handleQuery();
            });
          })
          .catch(() => {
            ElMessage({
              type: "info",
              message: "任务已取消",
            });
          });
        return;
      }
    }
  }
  previewState.showDialog = true;
  InvAPI.previewCheckResult(id).then((res: FilePreview) => {
    previewState.url = res.url;
    previewState.isPdf = false;
    previewState.fileType = res.fileType;
  });
}

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
  UserAPI.getAutoCheck().then((res) => {
    if (res === "1") {
      autoCheckEnable.value = true;
    }
  });
});
</script>
