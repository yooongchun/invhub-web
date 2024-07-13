<template>
  <div>
    <el-space direction="vertical" alignment="center">
      <div class="select-amount" v-if="!qrCodeData.showQrcode">
        <el-button-group class="ml-4 btn-group">
          <el-button
            :color="btnGroupData.color"
            plain
            :dark="isDark"
            @click="handleChoose(val)"
            v-for="val in btnGroupData.choice"
            :key="val"
            >￥{{ val }}元
          </el-button>
        </el-button-group>
        <h3 class="flex flex-wrap items-center mb-4 amount-text">自定义金额</h3>
        <el-input-number
          v-model="btnGroupData.chosen"
          :precision="2"
          :step="1"
          :min="1"
          :max="1000"
        />
        <el-button
          @click="handleConfirm"
          :dark="isDark"
          type="primary"
          plain
          style="margin-top: 50px"
          >确定
        </el-button>
      </div>
      <el-space
        direction="vertical"
        style="margin-left: 140px"
        v-if="qrCodeData.showQrcode"
      >
        <el-text class="mx-1" type="info">扫一扫付款</el-text>
        <el-text class="mx-1" type="warning" size="large"
          >￥{{ btnGroupData.chosen }}元</el-text
        >
        <el-card
          :body-style="{ padding: 0, marginBottom: 0 }"
          v-loading="!qrCodeData.qrLoaded"
        >
          <vue-qr
            :logoSrc="qrCodeData.qrCodeCenterLogoUrl"
            :margin="10"
            :text="qrCodeData.qrCodeUrl"
            :size="200"
          />
          <template #footer>
            <el-row>
              <el-col :span="8"><img alt="" :src="Scan" width="40px" /></el-col>
              <el-col :span="2" />
              <el-col :span="14"
                ><span>打开支付宝<br />扫一扫付款</span></el-col
              >
            </el-row>
          </template>
        </el-card>
        <el-text type="info"
          >支付剩余时间：
          <el-text size="large" type="warning"
            >{{ qrCodeData.leftTime }}秒</el-text
          >
        </el-text>
      </el-space>
    </el-space>
  </div>
</template>

<script setup lang="ts">
import { ThemeEnum } from "@/enums/ThemeEnum";

defineOptions({
  name: "Payment",
  inheritAttrs: false,
});
import { onMounted } from "vue";
import AlipayAPI, { OrderInfo } from "@/api/payment";
import vueQr from "vue-qr/src/packages/vue-qr.vue";
import { useSettingsStore } from "@/store";
import Scan from "@/assets/icons/scan.svg";
import AlipayLogo from "@/assets/icons/alipay-logo.svg";

const settingStore = useSettingsStore();
const isDark = computed(() => settingStore.theme === ThemeEnum.DARK);
const OrderStatusEnum = Object.freeze({
  WAIT_BUYER_PAY: "WAIT_BUYER_PAY",
  TRADE_SUCCESS: "TRADE_SUCCESS",
  TRADE_CLOSED: "TRADE_CLOSED",
  TRADE_FINISHED: "TRADE_FINISHED",
});
const props = defineProps({
  //子组件接收父组件传递过来的值
  exit: Boolean,
});
const { exit } = toRefs(props);
const emit = defineEmits(["exitMe"]);

const btnGroupData = reactive({
  color: "#626aef",
  chosen: 0.0,
  choice: [1, 5, 10, 20, 50, 100],
});

const qrCodeData = reactive({
  showQrcode: false,
  qrLoaded: false,
  qrCodeUrl: "",
  orderId: "",
  qrCodeCenterLogoUrl: AlipayLogo,
  leftTime: 300,
  timer: undefined,
});

function handleChoose(val: number) {
  btnGroupData.chosen = val;
}

function handleConfirm() {
  if (btnGroupData.chosen < 1) {
    ElMessage.warning("最低充值金额￥1元！");
    return;
  }
  qrCodeData.showQrcode = true;
  AlipayAPI.createOrder({
    subject: `【发票管家】充值￥${btnGroupData.chosen}元`,
    amount: btnGroupData.chosen,
  })
    .then((res: OrderInfo) => {
      qrCodeData.qrCodeUrl = res.qrCode;
      qrCodeData.qrLoaded = true;
      qrCodeData.orderId = res.orderId;
      qrCodeData.timer = setInterval(() => {
        qrCodeData.leftTime -= 1;
        handleOrderStatus();
        if (qrCodeData.leftTime <= 0) {
          clearInterval(qrCodeData.timer);
          qrCodeData.showQrcode = false;
          qrCodeData.qrLoaded = false;
          qrCodeData.leftTime = 300;
          ElMessage.warning("支付超时，请重新支付！");
        }
      }, 1000);
    })
    .catch(() => {
      ElMessage.error("创建订单失败，请重试或联系管理员！");
    });
}

function handleOrderStatus() {
  AlipayAPI.getOrderInfo(qrCodeData.orderId)
    .then((res: OrderInfo) => {
      if (res.tradeStatus === OrderStatusEnum.TRADE_SUCCESS) {
        clearInterval(qrCodeData.timer);
        qrCodeData.showQrcode = false;
        qrCodeData.qrLoaded = false;
        qrCodeData.leftTime = 300;
        ElMessage.success("支付成功！");
        emit("exitMe");
      } else if (res.tradeStatus === OrderStatusEnum.TRADE_CLOSED) {
        clearInterval(qrCodeData.timer);
        qrCodeData.showQrcode = false;
        qrCodeData.qrLoaded = false;
        qrCodeData.leftTime = 300;
        ElMessage.warning("支付超时，请重新支付！");
      }
    })
    .catch(() => {
      ElMessage.error("查询订单状态失败，请重试或联系管理员！");
    });
}

watch(exit, (newVal, _) => {
  //父组件退出
  if (newVal) {
    if (qrCodeData.timer) {
      clearInterval(qrCodeData.timer);
      qrCodeData.showQrcode = false;
      qrCodeData.qrLoaded = false;
      qrCodeData.leftTime = 300;
    }
  }
});
onMounted(() => {
  //挂载完成之后执行
});
</script>

<style lang="scss" scoped>
.select-amount {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 50px;

  .amount-text {
    margin-left: 10px;
  }
}

.btn-group-2 {
  display: flex;
  margin-top: 50px;
}

.qrcode-card {
  width: 100%;
  margin-left: 120px;
}
</style>
