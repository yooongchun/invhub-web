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
      action="/dev-api/api/v2/file/upload"
      list-type="picture"
      :auto-upload="true"
      style="margin-top: 40px"
      drag
      multiple
      accept="image/*,application/pdf"
      v-model:file-list="uploadState.importFormData.files"
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
    <el-row style="margin-top: 40px"
      ><el-col :span="10" />
      <el-col :span="12">
        <el-progress
          v-if="stepId === 2"
          type="circle"
          :percentage="invTaskState.progress"
      /></el-col>
    </el-row>
    <el-table
      v-if="stepId === 2 && invTaskState.failed.length > 0"
      :data="invTaskState.failed"
      style="width: 100%"
    >
      <el-table-column prop="name" label="文件名" />
      <el-table-column prop="reason" label="失败原因" />
    </el-table>
    <template #footer>
      <div
        style="
          padding-right: var(--el-dialog-padding-primary);
          margin-top: 50px;
        "
      >
        <el-button
          type="primary"
          :disabled="!enableSubmit"
          @click="handleSubmit"
        >
          确 定
        </el-button>
        <el-button @click="handleClose">取 消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { UploadFile, type UploadUserFile } from "element-plus";
import InvAPI from "@/api/inv";
import { UploadFilled } from "@element-plus/icons-vue";
import { TOKEN_KEY } from "@/enums/CacheEnum";
import { getFileExtension } from "@/utils/util";

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
const enableSubmit = ref(false);

const stepId = ref(1);
const uploadState = reactive({
  selectNum: 0,
  uploadNum: 0,
  previewImageUrl: "",
  previewVisible: false,
  importFormData: <
    {
      files: UploadUserFile[];
    }
  >{
    files: [
      {
        name: "food.jpeg",
        url: "https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100",
      },
    ],
  },
});

watch(uploadState, () => {
  if (stepId.value === 1) {
    enableSubmit.value =
      fileUploadResMap.size > 0 &&
      uploadState.selectNum === uploadState.uploadNum;
  }
});
interface FailedMap {
  name: string;
  reason: string;
}

const invTaskState = reactive({
  progress: 0,
  total: 1,
  failed: <[{ name: string; reason: string }]>[],
  pct: 0,
});

const token = localStorage.getItem(TOKEN_KEY);
const handleRemove = (file: UploadFile) => {
  fileUploadResMap.delete(file.uid);
};

const handlePictureCardPreview = (file: UploadFile) => {
  uploadState.previewImageUrl = file.url!;
  uploadState.previewVisible = true;
};

const fileUploadResMap: Map<number, number> = new Map();

const handleClose = () => {
  dialogVisible.value = false;
  uploadState.importFormData.files = [];
};

function handleSuccess(response: any, file: UploadFile) {
  if (response.code !== 0 || response.status !== 200) {
    ElMessage.error(response.message);
    uploadState.selectNum -= 1;
    return;
  }
  fileUploadResMap.set(file.uid, response.data.id);
  uploadState.uploadNum += 1;
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
  uploadState.selectNum += 1;
}

async function startFileParse() {
  invTaskState.total = fileUploadResMap.size;
  for (let [uid, fileId] of fileUploadResMap) {
    InvAPI.parseData(fileId)
      .then(() => {
        invTaskState.progress += 1;
      })
      .catch(() => {
        const fileName = getFileNameByUid(uid);
        if (!fileName) {
          ElMessage.error("文件名获取失败");
        } else {
          invTaskState.failed.push({ name: fileName, reason: "解析失败！" });
        }
      });
    await sleep(1000);
  }
}
function getFileNameByUid(uid: number) {
  const file = uploadState.importFormData.files.find(
    (file) => file.uid === uid
  );
  return file ? file.name : "";
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
const handleSubmit = () => {
  if (!uploadState.importFormData.files.length) {
    ElMessage.warning("请选择文件");
    return;
  }
  stepId.value += 1;
  invTaskState.total = fileUploadResMap.size;
  startFileParse();
};
</script>
