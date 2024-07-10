<template>
  <el-form
    size="large"
    ref="loginFormRef"
    :model="loginData"
    :rules="loginRules"
    class="login-content-form"
  >
    <el-form-item class="login-animation1" prop="username">
      <el-input
        text
        ref="username"
        :placeholder="'请输入用户名、邮箱或手机号'"
        v-model="loginData.username"
        name="username"
        clearable
        autocomplete="off"
      >
        <template #prefix>
          <el-icon class="el-input__icon"><UserFilled /></el-icon>
        </template>
      </el-input>
    </el-form-item>
    <el-form-item class="login-animation2" prop="password">
      <el-input
        :type="state.isShowPassword ? 'text' : 'password'"
        :placeholder="'输入密码，至少6位，区分大小写'"
        v-model="loginData.password"
        autocomplete="off"
      >
        <template #prefix>
          <el-icon class="el-input__icon"><Unlock /></el-icon>
        </template>
        <template #suffix>
          <el-icon
            v-if="state.isShowPassword"
            @click="state.isShowPassword = !state.isShowPassword"
            ><View
          /></el-icon>
          <el-icon v-else @click="state.isShowPassword = !state.isShowPassword"
            ><Hide
          /></el-icon>
        </template>
      </el-input>
    </el-form-item>
    <el-form-item class="login-animation3" prop="captchaCode">
      <el-col :span="15">
        <el-input
          text
          maxlength="6"
          :placeholder="'请输入验证码'"
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
    <el-form-item class="login-animation4">
      <el-button
        type="primary"
        class="login-content-submit"
        round
        @click="handleLoginSubmit"
        @keyup.enter="handleLoginSubmit"
        :loading="state.loading.signIn"
      >
        <span>登录</span>
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { LocationQuery, useRoute, useRouter } from "vue-router";
import { FormInstance } from "element-plus";
import { Hide, Unlock, UserFilled, View } from "@element-plus/icons-vue";
import AuthAPI, { LoginData } from "@/api/auth";
import { useUserStore } from "@/store";

// 定义变量内容
const router = useRouter();
const state = reactive({
  isShowPassword: false,
  loading: {
    signIn: false,
  },
});

const loginData = ref<LoginData>({
  username: "1729465178@qq.com",
  password: "121561",
} as LoginData);

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
const loginRules = computed(() => {
  return {
    username: [
      {
        required: true,
        trigger: "blur",
        message: "请输入用户名、邮箱或手机号",
      },
    ],
    password: [
      {
        required: true,
        trigger: "blur",
        message: "请输入密码",
      },
      {
        min: 6,
        message: "密码至少6位",
        trigger: "blur",
      },
    ],
    captchaCode: [
      {
        required: true,
        trigger: "blur",
        message: "请输入验证码",
      },
      {
        min: 4,
        trigger: "blur",
        message: "验证码至少4位",
      },
    ],
  };
});

/** 登录表单提交 */
function handleLoginSubmit() {
  loginFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      state.loading.signIn = true;
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
          state.loading.signIn = false;
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
  .login-content-password {
    display: inline-block;
    width: 20px;
    cursor: pointer;
    &:hover {
      color: #909399;
    }
  }
  .login-content-code {
    width: 100%;
    padding: 0;
    font-weight: bold;
    letter-spacing: 5px;
  }
  .login-content-submit {
    width: 100%;
    letter-spacing: 2px;
    font-weight: 300;
    margin-top: 15px;
  }
}
</style>
