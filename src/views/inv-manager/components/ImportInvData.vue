<template>
  <el-dialog
    v-model="dialogVisible"
    :align-center="true"
    title="导入数据"
    width="800px"
    center
    @close="handleClose"
  >
    <el-steps
      style="max-width: 800px"
      :active="stepId"
      finish-status="success"
      align-center
    >
      <el-step title="选择文件" :status="stepId > 1 ? 'success' : 'process'" />
      <el-step
        title="解析文件"
        :status="stepId > 2 ? 'success' : stepId === 2 ? 'process' : 'wait'"
      />
      <el-step title="完成" :status="stepId === 3 ? 'success' : 'wait'" />
    </el-steps>
    <el-upload
      :action="uploadUrl"
      list-type="picture"
      :auto-upload="true"
      style="margin-top: 40px"
      drag
      multiple
      accept="image/*,application/pdf"
      v-model:file-list="uploadState.files"
      :on-preview="handlePictureCardPreview"
      :on-remove="handleRemove"
      :on-success="handleSuccess"
      :before-upload="beforeUpload"
      :headers="{ Authorization: token }"
      v-if="stepId === 1"
    >
      <el-icon class="el-icon--upload">
        <upload-filled />
      </el-icon>
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      <template #tip>
        <div class="el-upload__tip">支持多种图片或PDF格式！</div>
      </template>
    </el-upload>
    <el-dialog v-model="uploadState.previewVisible">
      <img w-full :src="uploadState.previewImageUrl" alt="Preview Image" />
    </el-dialog>
    <ProcessInvData
      :fileList="uploadState.succeed"
      @sent="handleReady"
      v-if="stepId === 2"
    />
    <template #footer>
      <div
        style="
          padding-right: var(--el-dialog-padding-primary);
          margin-top: 50px;
        "
      >
        <el-button
          type="primary"
          :disabled="!enableSubmitBtn"
          @click="handleSubmit"
        >
          确 定
        </el-button>
        <el-button v-if="stepId === 1" @click="handleClose">取 消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { UploadFile, type UploadUserFile } from "element-plus";
import { UploadFilled } from "@element-plus/icons-vue";
import { TOKEN_KEY } from "@/enums/CacheEnum";
import { getFileExtension } from "@/utils/util";
import { FileInfo } from "@/api/file";
import ProcessInvData from "@/views/inv-manager/components/ProcessInvData.vue";

const uploadUrl = `${import.meta.env.VITE_APP_BASE_API}/api/v2/file/upload`;

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(["update:visible", "import-success"]);
const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => {
    emit("update:visible", val);
  },
});
const stepId = ref(1);
const uploadState = reactive({
  previewImageUrl: "",
  previewVisible: false,
  files: <UploadUserFile[]>[],
  succeed: <FileInfo[]>[],
});

const childReady = ref(false);
const enableSubmitBtn = computed(() => {
  if (stepId.value === 1) {
    return (
      uploadState.files.length &&
      uploadState.files.length === uploadState.succeed.length
    );
  }
  return childReady.value;
});
const token = localStorage.getItem(TOKEN_KEY);
const handleRemove = (file: UploadFile) => {
  uploadState.files = uploadState.files.filter((item) => item.uid !== file.uid);
};

const handlePictureCardPreview = (file: UploadFile) => {
  uploadState.previewImageUrl = file.url!;
  uploadState.previewVisible = true;
};

function handleReady() {
  // 子组件处理完成，可以关闭
  childReady.value = true;
}

function handleClose() {
  dialogVisible.value = false;
  uploadState.files = [];
  uploadState.succeed = [];
  stepId.value = 1;
}

function handleSuccess(response: any, file: UploadFile) {
  if (response.code !== 0 || response.status !== 200) {
    if (response.code === 2006) {
      ElMessage.warning("文件已存在，无需重复上传！");
    } else {
      ElMessage.error(response.message);
    }
    handleRemove(file);
    return;
  }
  response.data.file = file;
  uploadState.succeed.push(response.data);
}

const supportedFileTypes = ["jpeg", "png", "bmp", "webp", "pdf", "jpg"];

function beforeUpload(file: UploadFile) {
  const isLt2M = file.size! / 1024 / 1024 < 2;
  if (!isLt2M) {
    ElMessage.error(`${file.name}: 文件大小超过 2MB!`);
    return false;
  }
  if (!supportedFileTypes.includes(getFileExtension(file.name!))) {
    ElMessage.error(`${file.name}: 文件类型不支持!`);
    return false;
  }
}

function handleSubmit() {
  if (!uploadState.files.length) {
    ElMessage.warning("请选择文件");
    return;
  }
  stepId.value += 1;
  if (stepId.value > 2) {
    handleClose();
  }
}
</script>
