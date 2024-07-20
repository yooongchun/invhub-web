<script setup lang="ts">
import { FileInfo } from "@/api/file";
import InvAPI from "@/api/inv";

const props = defineProps({
  fileList: {
    type: Array,
    default: () => [],
  },
  start: {
    type: Boolean,
    default: false,
  },
});
interface Result {
  filename: string;
  reason: string;
}
const invTaskState = reactive({
  succeed: <FileInfo[]>[],
  failed: <FileInfo[]>[],
  reason: <Result[]>[],
});

async function startFileParse() {
  for (let fileInfo of props.fileList) {
    InvAPI.parseData(fileInfo.id)
      .then(() => {
        invTaskState.succeed.push(fileInfo);
        invTaskState.reason.push({
          filename: fileInfo.fileName,
          reason: "成功",
        });
      })
      .catch(() => {
        invTaskState.failed.push(fileInfo);
        invTaskState.reason.push({
          filename: fileInfo.fileName,
          reason: "失败",
        });
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
    ((invTaskState.succeed.length + invTaskState.failed.length) * 100.0) /
      props.fileList.length || 0
  );
});

const emit = defineEmits(["sent"]);
onMounted(() => {
  startFileParse();
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
  <el-table :data="invTaskState.reason" style="width: 100%; margin-top: 40px">
    <el-table-column prop="filename" label="文件名" />
    <el-table-column prop="reason" label="结果">
      <template #default="scope">
        <el-tag :type="scope.row.reason === '成功' ? 'success' : 'danger'"
          >{{ scope.row.reason }}
        </el-tag>
      </template>
    </el-table-column>
  </el-table>
</template>

<style scoped lang="scss"></style>
