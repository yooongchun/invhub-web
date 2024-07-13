<template>
  <!-- 上传组件 -->
  <el-upload
    v-model="fileId"
    class="single-uploader"
    :show-file-list="false"
    list-type="picture-card"
    :before-upload="handleBeforeUpload"
    :http-request="uploadFile"
  >
    <img
      v-if="fileId && !isPdf && preview.url"
      :src="preview.url"
      alt=""
      class="single-uploader__image"
    />
    <img
      v-else-if="fileId && isPdf && preview.url"
      :src="PDFIcon"
      alt=""
      class="single-uploader__image"
    />
    <el-icon v-else class="single-uploader__icon"><Plus /></el-icon>
  </el-upload>
</template>

<script setup lang="ts">
import { UploadRawFile, UploadRequestOptions } from "element-plus";
import FileAPI, { FileInfo, FilePreview } from "@/api/file";
import { Plus } from "@element-plus/icons-vue";
import PDFIcon from "@/assets/icons/PDF.svg";
const props = defineProps({
  modelValue: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(["update:modelValue"]);
const fileId = useVModel(props, "modelValue", emit);
const isPdf = ref(false);
const preview = reactive<FilePreview>({});

/**
 * 自定义图片上传
 *
 * @param options
 */
function uploadFile(options: UploadRequestOptions): Promise<any> {
  FileAPI.upload(options.file)
    .then((fileInfo: FileInfo) => {
      FileAPI.previewFile(fileInfo.id)
        .then((filePreview: FilePreview) => {
          fileId.value = fileInfo.id;
          preview.fileType = filePreview.fileType;
          preview.url = filePreview.url;
          isPdf.value = filePreview.fileType === "application/pdf";
        })
        .catch();
    })
    .catch();
}

/**
 * 限制用户上传文件的格式和大小
 */
function handleBeforeUpload(file: UploadRawFile) {
  if (file.size > 2 * 1048 * 1048) {
    ElMessage.warning("上传文件不能大于2M");
    return false;
  }
  const validTypes = [
    "image/jpeg",
    "image/png",
    "image/bmp",
    "image/webp",
    "application/pdf",
  ];
  if (!validTypes.includes(file.type)) {
    ElMessage.warning("仅支持上传jpg、png、bmp、webp、pdf格式的文件");
    return false;
  }
  return true;
}
</script>

<style scoped lang="scss">
.single-uploader {
  overflow: hidden;
  cursor: pointer;
  border: 1px var(--el-border-color) solid;
  border-radius: 6px;

  &:hover {
    border-color: var(--el-color-primary);
  }

  &__image {
    display: block;
    width: 178px;
    height: 178px;
  }

  &___icon {
    width: 178px;
    height: 178px;
    font-size: 28px;
    color: #8c939d;
    text-align: center;
  }
}
</style>
