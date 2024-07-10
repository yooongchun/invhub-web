<template>
  <div class="dashboard-container">
    <!-- github角标 -->
    <!--    <github-corner class="github-corner" />-->

    <el-card shadow="never">
      <el-row justify="space-between">
        <el-col :span="18" :xs="24">
          <div class="flex h-full items-center">
            <img
              class="w-20 h-20 mr-5 rounded-full"
              :src="userStore.user.avatar + '?imageView2/1/w/80/h/80'"
            />
            <div>
              <p>{{ greetings }}</p>
              <p class="text-sm text-gray">
                {{ dailySentence }}
              </p>
            </div>
          </div>
        </el-col>

        <el-col :span="6" :xs="24">
          <div class="flex h-full items-center justify-around">
            <el-statistic
              v-for="item in statisticData"
              :key="item.key"
              :value="item.value"
            >
              <template #title>
                <div class="flex items-center">
                  <svg-icon :icon-class="item.iconClass" size="20px" />
                  <span class="text-[16px] ml-1">{{ item.title }}</span>
                </div>
              </template>
              <template v-if="item.suffix" #suffix>/100</template>
            </el-statistic>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 数据卡片 -->
    <el-row :gutter="10" class="mt-3">
      <el-col
        :xs="24"
        :sm="12"
        :lg="6"
        v-for="(item, index) in cardData"
        :key="index"
      >
        <el-card shadow="never">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-[var(--el-text-color-secondary)]">{{
                item.title
              }}</span>
              <el-tag :type="item.tagType">
                {{ item.tagText }}
              </el-tag>
            </div>
          </template>

          <div class="flex items-center justify-between mt-5">
            <div class="text-lg text-right">
              {{ Math.round(item.count) }}
            </div>
            <svg-icon :icon-class="item.iconClass" size="2em" />
          </div>

          <div
            class="flex items-center justify-between mt-5 text-sm text-[var(--el-text-color-secondary)]"
          >
            <span> {{ item.dataDesc }} </span>
            <span> {{ Math.round(item.total) }} </span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Echarts 图表 -->
    <el-row :gutter="10" class="mt-3">
      <el-col
        :xs="24"
        :sm="12"
        :lg="8"
        class="mb-2"
        v-for="item in chartData"
        :key="item"
      >
        <component
          :is="chartComponent(item)"
          :id="item"
          height="400px"
          width="100%"
          class="bg-[var(--el-bg-color-overlay)]"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import type { EpPropMergeType } from "element-plus/es/utils/vue/props/types";

defineOptions({
  name: "Dashboard",
  inheritAttrs: false,
});

import { useUserStore } from "@/store/modules/user";
import { useTransition, TransitionPresets } from "@vueuse/core";
import CommonAPI, { DailyWordsResult } from "@/api/common";
import StatsAPI, { StatsRecords, MetaData } from "@/api/stats";

const userStore = useUserStore();
const date: Date = new Date();

const greetings = computed(() => {
  const hours = date.getHours();
  if (hours >= 6 && hours < 8) {
    return "晨起披衣出草堂，轩窗已自喜微凉🌅！";
  } else if (hours >= 8 && hours < 12) {
    return "上午好，" + userStore.user.username + "！";
  } else if (hours >= 12 && hours < 18) {
    return "下午好，" + userStore.user.username + "！";
  } else if (hours >= 18 && hours < 24) {
    return "晚上好，" + userStore.user.username + "！";
  } else {
    return "偷偷向银河要了一把碎星，只等你闭上眼睛撒入你的梦中，晚安🌛！";
  }
});

const duration = 2000;

// 销售额
const amount = ref(0);
const amountOutput = useTransition(amount, {
  duration: duration,
  transition: TransitionPresets.easeOutExpo,
});

// 访客数
const visitCount = ref(0);
const visitCountOutput = useTransition(visitCount, {
  duration: duration,
  transition: TransitionPresets.easeOutExpo,
});

// IP数
const dauCount = ref(0);
const dauCountOutput = useTransition(dauCount, {
  duration: duration,
  transition: TransitionPresets.easeOutExpo,
});

// 订单量
const orderCount = ref(0);
const orderCountOutput = useTransition(orderCount, {
  duration: duration,
  transition: TransitionPresets.easeOutExpo,
});

// 右上角数量
const statisticData = ref([
  {
    value: "-",
    iconClass: "money",
    title: "充值",
    key: "charge",
    suffix: "",
  },
  {
    value: "-",
    iconClass: "order",
    title: "消费",
    key: "consume",
  },
  {
    value: "-",
    iconClass: "message",
    title: "余额",
    key: "balance",
  },
]);

interface CardProp {
  title: string;
  tagType: EpPropMergeType<
    StringConstructor,
    "primary" | "success" | "info" | "warning" | "danger",
    unknown
  >;
  tagText: string;
  count: any;
  total: any;
  dataDesc: string;
  iconClass: string;
}

// 卡片数量
const cardData = ref<CardProp[]>([
  {
    title: "新增用户",
    tagType: "success",
    tagText: "日",
    count: visitCountOutput,
    total: 0,
    dataDesc: "总用户数",
    iconClass: "visit",
  },
  {
    title: "IP数",
    tagType: "success",
    tagText: "日",
    count: dauCountOutput,
    total: 0,
    dataDesc: "总IP数",
    iconClass: "ip",
  },
  {
    title: "销售额",
    tagType: "primary",
    tagText: "月",
    count: amountOutput,
    total: 0,
    dataDesc: "总销售额",
    iconClass: "money",
  },
  {
    title: "订单量",
    tagType: "danger",
    tagText: "季",
    count: orderCountOutput,
    total: 0,
    dataDesc: "总订单量",
    iconClass: "order",
  },
]);
// 图表数据
const chartData = ref(["BarChart", "PieChart", "RadarChart"]);
const chartComponent = (item: string) => {
  return defineAsyncComponent(() => import(`./components/${item}.vue`));
};

const dailySentence = ref("生活不止眼前的苟且，还有诗和远方的田野。");
onMounted(() => {
  CommonAPI.getDailyWords().then((res: DailyWordsResult) => {
    console.log(res);
    dailySentence.value = res.content;
  });
  StatsAPI.getMataData().then((metaData: MetaData) => {
    statisticData.value[0].value = metaData.orderAmount
      ? `￥${metaData.orderAmount}元`
      : "-";
    statisticData.value[1].value = metaData.consumeAmount
      ? `￥${metaData.consumeAmount}元`
      : "-";
    statisticData.value[2].value = metaData.balanceAmount
      ? `￥${metaData.balanceAmount}元`
      : "-";
  });
  StatsAPI.getStatsData().then((record: StatsRecords) => {
    visitCount.value = record.NOW.userNum;
    cardData.value[0].total = record.ALL.userNum;
    amount.value = record.NOW.orderAmount;
    cardData.value[2].total = record.ALL.orderAmount;
    dauCount.value = record.NOW.ipNum;
    cardData.value[1].total = record.ALL.ipNum;
    orderCount.value = record.NOW.consumeNum;
    cardData.value[3].total = record.ALL.consumeAmount;
  });
});
</script>

<style lang="scss" scoped>
.dashboard-container {
  position: relative;
  padding: 24px;

  .user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }

  .github-corner {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 1;
    border: 0;
  }

  .data-box {
    display: flex;
    justify-content: space-between;
    padding: 20px;
    font-weight: bold;
    color: var(--el-text-color-regular);
    background: var(--el-bg-color-overlay);
    border-color: var(--el-border-color);
    box-shadow: var(--el-box-shadow-dark);
  }

  .svg-icon {
    fill: currentcolor !important;
  }
}
</style>
