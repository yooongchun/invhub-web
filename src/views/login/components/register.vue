<template>
  <el-form
    size="large"
    ref="loginFormRef"
    :model="registerData"
    :rules="baseRules"
    class="login-content-form"
  >
    <el-form-item class="login-animation1" prop="email">
      <el-input
        text
        :placeholder="'请输入手机号或邮箱'"
        v-model="registerData.email"
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
    <el-form-item class="login-animation2" prop="password">
      <el-input
        :type="isShowPassword ? 'text' : 'password'"
        :placeholder="'输入密码，至少6位，区分大小写'"
        v-model="registerData.password"
        autocomplete="off"
      >
        <template #prefix>
          <el-icon class="el-input__icon"><Unlock /></el-icon>
        </template>
        <template #suffix>
          <el-icon
            v-if="isShowPassword"
            @click="isShowPassword = !isShowPassword"
            ><View
          /></el-icon>
          <el-icon v-else @click="isShowPassword = !isShowPassword"
            ><Hide
          /></el-icon>
        </template>
      </el-input>
    </el-form-item>
    <el-form-item class="login-animation2" prop="verifyCode">
      <el-col :span="15">
        <el-input
          text
          maxlength="6"
          :placeholder="'请输入验证码'"
          v-model="registerData.verifyCode"
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
          >获取验证码</el-button
        >
      </el-col>
    </el-form-item>
    <el-alert
      title="请输入正确的验证码"
      type="error"
      show-icon
      v-show="showVerifyCodeErrorTip"
    />
    <el-form-item class="login-animation3" prop="captchaCode">
      <el-col :span="15">
        <el-input
          text
          maxlength="6"
          :placeholder="'请输入图形验证码'"
          v-model="registerData.captchaCode"
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
        @click="handleRegisterSubmit"
        @keyup.enter="handleRegisterSubmit"
        :loading="loading"
      >
        <span>注册</span>
      </el-button>
    </el-form-item>
    <div class="font12 mt30 login-animation4 login-msg">登录</div>
  </el-form>
</template>

<script setup lang="ts">
import {
  ChatDotSquare,
  Hide,
  Iphone,
  Unlock,
  View,
} from "@element-plus/icons-vue";
import AuthAPI, { LoginData, RegisterData } from "@/api/auth";
import { FormInstance } from "element-plus";
import { isEmail, isPhone } from "@/utils/util";
import { TOKEN_KEY } from "@/enums/CacheEnum";

// 定义变量内容
const router = useRouter();
const loading = ref(false);

const registerData = ref<RegisterData>({} as RegisterData);
const showVerifyCodeErrorTip = ref(false);
const isShowPassword = ref(false);
// 验证码图片Base64字符串
const captchaBase64 = ref();
// 登录表单ref
const loginFormRef = ref<FormInstance>();

/** 获取验证码 */
function getCaptcha() {
  AuthAPI.getCaptcha().then((data) => {
    registerData.value.captchaKey = data.captchaKey;
    captchaBase64.value = data.captchaBase64;
  });
}

const baseRules = reactive({
  email: [
    {
      required: true,
      trigger: "blur",
      message: "请输入邮箱或手机号",
    },
    {
      validator: async (_: any, value: any, callback: any) => {
        if (!isEmail(value) && !isPhone(value)) {
          callback(new Error("请输入正确的邮箱或手机号"));
        } else {
          const exists = await AuthAPI.userExists(value);
          if (exists) {
            callback(new Error("该邮箱或手机号已被注册"));
            return;
          }
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
  password: [
    {
      required: true,
      trigger: "blur",
      message: "请输入密码",
    },
    {
      pattern: /^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{6,20}$/,
      trigger: "blur",
      message: "密码只能包含字母、数字或特殊字符，长度在6到20位之间",
    },
  ],
});
const verifyCodeLoading = ref(false);
const enableSendVerifyCode = ref(true);

function handleVerifyCode() {
  loginFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      verifyCodeLoading.value = true;
      if (isPhone(registerData.value.email)) {
        registerData.value.phone = registerData.value.email;
        registerData.value.email = "";
      }
      AuthAPI.sendVerifyCode(registerData.value)
        .then(() => {
          ElMessage.success("验证码发送成功");
          enableSendVerifyCode.value = false;
          setTimeout(() => {
            enableSendVerifyCode.value = true;
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
/** 注册表单提交 */
function handleRegisterSubmit() {
  loginFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      if (!/^\d{6}$/.test(registerData.value.verifyCode)) {
        showVerifyCodeErrorTip.value = true;
        setTimeout(() => {
          showVerifyCodeErrorTip.value = false;
        }, 3000);
        return;
      }
      registerData.value.passwordAgain = registerData.value.password;
      registerData.value.username = registerData.value.email
        ? registerData.value.email
        : registerData.value.phone;
      if (isPhone(registerData.value.email)) {
        registerData.value.phone = registerData.value.email;
        registerData.value.email = "";
      }
      loading.value = true;

      AuthAPI.register(registerData.value)
        .then((data: any | LoginData) => {
          ElMessage.success("注册成功，为您自动登录！");
          const { token } = data;
          localStorage.setItem(TOKEN_KEY, token);
          router.push("/");
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
