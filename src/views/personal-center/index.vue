<template>
  <div class="app-container">
    <el-card style="max-width: 90%; margin-left: 5%">
      <template #header>
        <div class="card-header">
          <span>个人信息</span>
        </div>
      </template>
      <el-descriptions :title="userStore.user.username">
        <el-descriptions-item label="邮箱"
          ><el-tag type="primary">{{
            userStore.user.email
          }}</el-tag></el-descriptions-item
        >
        <el-descriptions-item label="手机号"
          ><el-tag type="primary">{{
            userStore.user.phone || "无"
          }}</el-tag></el-descriptions-item
        >
        <el-descriptions-item label="账户余额"
          ><el-tag type="warning"
            >￥{{ userStore.user.balance }}元</el-tag
          ></el-descriptions-item
        >
        <el-descriptions-item label="注册日期"
          ><el-tag type="primary"> {{ userStore.user.createTime }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card style="max-width: 90%; margin-left: 5%; margin-top: 50px">
      <template #header>
        <div class="card-header">
          <span>充值记录</span>
        </div>
      </template>
      <div class="search-container">
        <el-form ref="queryFormRef" :model="queryParams" :inline="true">
          <el-form-item prop="keywords" label="关键字">
            <el-input
              v-model="queryParams.keywords"
              placeholder="订单或用户名"
              clearable
              @keyup.enter="handleQuery"
            />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="handleQuery"
              ><Search />搜索</el-button
            >
            <el-button @click="handleResetQuery"><Refresh />重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-card shadow="never">
        <el-table
          v-loading="loading"
          :data="pageData"
          highlight-current-row
          border
        >
          <el-table-column label="ID" prop="id" width="60" />
          <el-table-column label="订单号" prop="tradeNo" width="250" />
          <el-table-column label="创建时间" prop="createTime" width="160" />
          <el-table-column label="支付时间" prop="gmtPayment" width="160" />
          <el-table-column label="订单金额" prop="amount" width="100">
            <template #default="scope">
              <el-tag type="warning">￥{{ scope.row.amount }}元 </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="用户名" prop="username" width="140" />
          <el-table-column label="订单内容" prop="subject" />
          <el-table-column label="订单状态" prop="tradeStatus" width="100">
            <template #default="scope">
              <el-tag :type="convertStatus(scope.row.tradeStatus, 1)"
                >{{ convertStatus(scope.row.tradeStatus, 0) }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>

        <pagination
          v-if="total > 0"
          v-model:total="total"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          @pagination="handleQuery"
        />
      </el-card>
    </el-card>
    <el-card style="max-width: 90%; margin-left: 5%; margin-top: 50px">
      <template #header>
        <div class="card-header">
          <span>消费记录</span>
        </div>
      </template>
      <div class="search-container">
        <el-form ref="queryFormRef2" :model="queryParams2" :inline="true">
          <el-form-item prop="keywords" label="关键字">
            <el-input
              v-model="queryParams2.keywords"
              placeholder="关键词"
              clearable
              @keyup.enter="handleQuery2"
            />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="handleQuery2"
              ><Search />搜索</el-button
            >
            <el-button @click="handleResetQuery2"><Refresh />重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-card shadow="never">
        <el-table
          v-loading="loading2"
          :data="pageData2"
          highlight-current-row
          border
        >
          <el-table-column label="ID" prop="id" width="60" />
          <el-table-column
            label="交易时间"
            prop="transactionTime"
            width="160"
          />
          <el-table-column
            label="交易状态"
            prop="transactionStatus"
            width="160"
          >
            <template #default="scope">
              <el-tag
                :type="
                  scope.row.transactionStatus === 'SUCCEED'
                    ? 'success'
                    : 'danger'
                "
                >{{
                  scope.row.transactionStatus === "SUCCEED"
                    ? "交易成功"
                    : "交易失败"
                }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="交易金额" prop="remark" width="100">
            <template #default="scope">
              <el-tag type="warning"
                >￥{{ scope.row.transactionAmount }}元
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="备注信息" prop="remark" />
        </el-table>

        <pagination
          v-if="total2 > 0"
          v-model:total="total2"
          v-model:page="queryParams2.pageNum"
          v-model:limit="queryParams2.pageSize"
          @pagination="handleQuery2"
        />
      </el-card>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { Refresh, Search } from "@element-plus/icons-vue";

defineOptions({
  name: "Personal",
  inheritAttrs: false,
});

import OrderAPI, { OrderPageQuery, OrderInfo } from "@/api/order";
import TransactionAPI, {
  TransactionInfo,
  TransactionPageQuery,
} from "@/api/transaction";
import { useUserStore } from "@/store";

const queryFormRef = ref(ElForm);
const queryFormRef2 = ref(ElForm);

const loading = ref(false);
const loading2 = ref(false);
const total = ref(0);
const total2 = ref(0);

const queryParams = reactive<OrderPageQuery>({
  pageNum: 1,
  pageSize: 10,
  keywords: "",
});
const queryParams2 = reactive<TransactionPageQuery>({
  pageNum: 1,
  pageSize: 10,
  keywords: "",
});

// 日志表格数据
const pageData = ref<OrderInfo[]>();
const pageData2 = ref<TransactionInfo[]>();
const userStore = useUserStore();

/** 查询 */
function handleQuery() {
  loading.value = true;
  OrderAPI.getOrderPage(queryParams)
    .then((data) => {
      pageData.value = data.records;
      total.value = data.total;
    })
    .finally(() => {
      loading.value = false;
    });
}
/** 查询 */
function handleQuery2() {
  loading2.value = true;
  TransactionAPI.getTransactionPage(queryParams2)
    .then((data) => {
      pageData2.value = data.records;
      total2.value = data.total;
    })
    .finally(() => {
      loading2.value = false;
    });
}
/** 重置查询 */
function handleResetQuery() {
  queryFormRef.value.resetFields();
  queryParams.pageNum = 1;
  handleQuery();
}
function handleResetQuery2() {
  queryFormRef2.value.resetFields();
  queryParams2.pageNum = 1;
  handleQuery2();
}

function convertStatus(tradeStatus: string, t: number) {
  switch (tradeStatus) {
    case "WAIT_BUYER_PAY":
      return t === 0 ? "待支付" : "warning";
    case "TRADE_SUCCESS":
      return t === 0 ? "支付成功" : "success";
    case "TRADE_CLOSED":
    case "TRADE_FINISHED":
      return t === 0 ? "交易关闭" : "danger";
    default:
      return t === 0 ? "未知" : "info";
  }
}

onMounted(() => {
  handleQuery();
  handleQuery2();
});
</script>
