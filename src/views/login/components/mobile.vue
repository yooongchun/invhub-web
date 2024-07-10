<template>
  <el-form
    size="large"
    ref="loginFormRef"
    :model="loginData"
    :rules="baseRules"
    class="login-content-form"
  >
    <el-form-item class="login-animation1" prop="email">
      <el-input
        text
        :placeholder="'请输入手机号或邮箱'"
        v-model="loginData.email"
        clearable
        autocomplete="off"
      >
        <template #prefix>
          <el-icon class="el-input__icon">
            <Iphone />
          </el-icon>
        </template>
      </el-input>
    </el-form-item>
    <el-form-item class="login-animation2" prop="verifyCode">
      <el-col :span="15">
        <el-input
          text
          maxlength="6"
          :placeholder="'请输入验证码'"
          v-model="loginData.verifyCode"
          clearable
          autocomplete="off"
        >
          <template #prefix>
            <el-icon class="el-input__icon">
              <ChatDotSquare />
            </el-icon>
          </template>
        </el-input>
      </el-col>
      <el-col :span="1" />
      <el-col :span="8">
        <el-button
          class="login-content-code"
          @click="handleVerifyCode"
          :disabled="!enableSendVerifyCode"
          >获取验证码{{ timer >= 0 ? "(" + timer + "s)" : "" }}</el-button
        >
      </el-col>
    </el-form-item>
    <el-form-item class="login-animation3" prop="captchaCode">
      <el-col :span="15">
        <el-input
          text
          maxlength="6"
          :placeholder="'请输入图形验证码'"
          v-model="loginData.captchaCode"
          clearable
          autocomplete="off"
        >
          <template #prefix>
            <svg-icon icon-class="captcha" class="mx-2" />
          </template>
        </el-input>
      </el-col>
      <el-col :span="1" />
      <el-col :span="8">
        <el-image
          @click="getCaptcha"
          :src="captchaBase64"
          class="captcha-image"
        />
      </el-col>
    </el-form-item>
    <el-form-item class="login-animation3">
      <el-button
        type="primary"
        class="login-content-submit"
        round
        @keyup.enter="handleLoginSubmit"
        @click="handleLoginSubmit"
        :loading="loading"
      >
        <span>登录</span>
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ChatDotSquare, Iphone } from "@element-plus/icons-vue";
import AuthAPI, { LoginData } from "@/api/auth";
import { LocationQuery, useRoute } from "vue-router";
import { FormInstance } from "element-plus";
import { useUserStore } from "@/store";
import { isEmail, isPhone } from "@/utils/util";

// 定义变量内容
const router = useRouter();
const loading = ref(false);

const loginData = ref<LoginData>({} as LoginData);

// 使用导入的依赖和库
const userStore = useUserStore();
const route = useRoute();
// 验证码图片Base64字符串
const captchaBase64 = ref();
// 登录表单ref
const loginFormRef = ref<FormInstance>();

/** 获取验证码 */
function getCaptcha() {
  AuthAPI.getCaptcha().then((data) => {
    loginData.value.captchaKey = data.captchaKey;
    captchaBase64.value = data.captchaBase64;
  });
}

/** 解析 redirect 字符串 为 path 和  queryParams */
function parseRedirect(): {
  path: string;
  queryParams: Record<string, string>;
} {
  const query: LocationQuery = route.query;
  const redirect = (query.redirect as string) ?? "/";

  const url = new URL(redirect, window.location.origin);
  const path = url.pathname;
  const queryParams: Record<string, string> = {};

  url.searchParams.forEach((value, key) => {
    queryParams[key] = value;
  });

  return { path, queryParams };
}
const baseRules = reactive({
  email: [
    {
      required: true,
      trigger: "blur",
      message: "请输入邮箱或手机号",
    },
    {
      validator: (_: any, value: any, callback: any) => {
        if (!isEmail(value) && !isPhone(value)) {
          callback(new Error("请输入正确的邮箱或手机号"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
  captchaCode: [
    {
      required: true,
      trigger: "blur",
      message: "请输入图形验证码",
    },
    {
      min: 4,
      trigger: "blur",
      message: "验证码至少4位",
    },
  ],
});
const verifyCodeLoading = ref(false);
const enableSendVerifyCode = ref(true);
const timer = ref(-1);

function handleVerifyCode() {
  loginFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      if (isPhone(loginData.value.email)) {
        loginData.value.phone = loginData.value.email.trim();
        loginData.value.email = "";
      }
      verifyCodeLoading.value = true;
      AuthAPI.sendVerifyCode(loginData.value)
        .then(() => {
          ElMessage.success("验证码发送成功");
          enableSendVerifyCode.value = false;
          timer.value = 30;
          const interval = setInterval(() => {
            timer.value -= 1;
          }, 1000);
          setTimeout(() => {
            enableSendVerifyCode.value = true;
            clearInterval(interval);
            timer.value = -1;
          }, 30000);
        })
        .catch(() => {
          getCaptcha();
        })
        .finally(() => {
          verifyCodeLoading.value = false;
        });
    }
  });
}
/** 登录表单提交 */
function handleLoginSubmit() {
  loginFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      if (!/^\d{6}$/.test(loginData.value.verifyCode)) {
        ElMessage.error("请输入正确的验证码");
        return;
      }
      loading.value = true;
      if (isPhone(loginData.value.email)) {
        loginData.value.phone = loginData.value.email.trim();
        loginData.value.email = "";
      }
      userStore
        .login(loginData.value)
        .then(() => {
          const { path, queryParams } = parseRedirect();
          router.push({ path: path, query: queryParams });
        })
        .catch(() => {
          getCaptcha();
        })
        .finally(() => {
          loading.value = false;
        });
    }
  });
}

onMounted(() => {
  getCaptcha();
});
</script>

<style scoped lang="scss">
@import "@/styles/transition.scss";

.login-content-form {
  margin-top: 20px;
  @for $i from 1 through 4 {
    .login-animation#{$i} {
      opacity: 0;
      animation-name: error-num;
      animation-duration: 0.5s;
      animation-fill-mode: forwards;
      animation-delay: calc($i/10) + s;
    }
  }

  .login-content-code {
    width: 100%;
    padding: 0;
  }

  .login-content-submit {
    width: 100%;
    letter-spacing: 2px;
    font-weight: 300;
    margin-top: 15px;
  }

  .login-msg {
    color: var(--el-text-color-placeholder);
  }
}
</style>
