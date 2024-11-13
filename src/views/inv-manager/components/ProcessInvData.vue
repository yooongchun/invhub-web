<script setup lang="ts">
import { FileInfo } from "@/api/file";
import InvAPI from "@/api/inv";

const props = defineProps<{
  fileList: FileInfo[];
}>();

const invTaskState = reactive({
  succeed: <FileInfo[]>[],
  failed: <FileInfo[]>[],
});

async function startFileParse() {
  for (let fileInfo of props.fileList) {
    fileInfo.taskReason = "开始解析";
    InvAPI.parseData(fileInfo.id)
      .then(() => {
        invTaskState.succeed.push(fileInfo);
        fileInfo.taskReason = "解析成功";
      })
      .catch((res) => {
        if (res.message === "发票信息已存在") {
          invTaskState.succeed.push(fileInfo);
          fileInfo.taskReason = "发票已存在";
        } else {
          invTaskState.failed.push(fileInfo);
          fileInfo.taskReason = "解析失败";
        }
      });
    await sleep(100);
  }
  emit("sent", 1);
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const pct = computed(() => {
  return Number.parseInt(
    String(
      ((invTaskState.succeed.length + invTaskState.failed.length) * 100.0) /
        props.fileList.length || 0
    )
  );
});

const emit = defineEmits(["sent"]);
onMounted(() => {
  startFileParse();
});

const fileListWithDefaultTaskReason = computed(() => {
  return props.fileList.map((file) => ({
    ...file,
    taskReason: file.taskReason || "初始化",
  }));
});
</script>

<template>
  <el-row style="margin-top: 40px">
    <el-col :span="3" />
    <el-col :span="7">
      <el-progress
        type="circle"
        :percentage="invTaskState.succeed.length"
        status="success"
      >
        <template #default="{ percentage }">
          <div class="percentage-value">{{ percentage }}张</div>
          <div class="percentage-label">成功</div>
        </template>
      </el-progress>
    </el-col>
    <el-col :span="7">
      <el-progress type="circle" :percentage="pct">
        <template #default="{ percentage }">
          <div class="percentage-value">{{ percentage }}%</div>
          <div class="percentage-label">进度</div>
        </template>
      </el-progress>
    </el-col>
    <el-col :span="7">
      <el-progress
        type="circle"
        :percentage="invTaskState.failed.length"
        status="exception"
      >
        <template #default="{ percentage }">
          <div class="percentage-value">{{ percentage }}张</div>
          <div class="percentage-label">失败</div>
        </template>
      </el-progress>
    </el-col>
  </el-row>
  <el-table
    :data="fileListWithDefaultTaskReason"
    style="width: 100%; margin-top: 40px"
  >
    <el-table-column prop="fileName" label="文件名" />
    <el-table-column prop="taskReason" label="任务状态">
      <template #default="scope">
        <el-tag
          :type="
            scope.row.taskReason === '解析成功'
              ? 'success'
              : scope.row.taskReason === '解析失败'
                ? 'danger'
                : scope.row.taskReason === '发票已存在'
                  ? 'warning'
                  : 'info'
          "
          >{{ scope.row.taskReason }}
        </el-tag>
      </template>
    </el-table-column>
  </el-table>
</template>

<style scoped lang="scss"></style>
