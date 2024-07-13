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
      v-if="stepId === 2"
      :data="uploadState.importFormData.files"
      style="width: 100%"
    >
      <el-table-column prop="name" label="文件名" />
      <el-table-column prop="url" label="文件链接" />
      <el-table-column prop="status" label="任务状态" />
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
          :disabled="
            uploadState.importFormData.files.length === 0 && stepId === 1
          "
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

const invTaskState = reactive({
  progress: 0,
  failed: 0,
  total: 0,
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
  fileUploadResMap.set(file.uid, response.data.id);
}

async function startFileParse() {
  for (let [_, fileId] of fileUploadResMap) {
    InvAPI.parseData(fileId)
      .then(() => {
        invTaskState.progress += 1;
      })
      .catch(() => {
        invTaskState.failed += 1;
      });
    await sleep(1000);
  }
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
