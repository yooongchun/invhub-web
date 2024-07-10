<template>
  <div class="login-container flex">
    <!-- 顶部工具栏 -->
    <div class="top-bar">
      <el-switch
        v-model="isDark"
        inline-prompt
        active-icon="Moon"
        inactive-icon="Sunny"
        @change="toggleTheme"
      />
    </div>
    <div class="login-left" :style="{ backgroundColor: bgColor }">
      <div class="login-left-logo">
        <img :src="logo" alt="" />
        <div class="login-left-logo-text">
          <span>发票管家</span>
          <span class="login-left-logo-text-msg">助您高效管理发票！</span>
        </div>
      </div>
      <div class="login-left-img">
        <img :src="loginMain" alt="" />
      </div>
      <img :src="loginBg" class="login-left-waves" alt="" v-show="!isDark" />
    </div>
    <div class="login-right flex">
      <div
        class="login-right-warp flex-margin"
        :style="{ backgroundColor: formBgColor }"
      >
        <span class="login-right-warp-one"></span>
        <span class="login-right-warp-two"></span>
        <div class="login-right-warp-mian">
          <div class="login-right-warp-main-title">欢迎您！</div>
          <div class="login-right-warp-main-form">
            <el-tabs v-model="state.tabsActiveName">
              <el-tab-pane :label="'账号登录'" name="account">
                <Account />
              </el-tab-pane>
              <el-tab-pane :label="'验证码登录'" name="mobile">
                <Mobile />
              </el-tab-pane>
              <el-tab-pane :label="'注册账号'" name="register">
                <Register />
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
      </div>
    </div>
    <!-- ICP备案 -->
    <div class="icp-info" v-show="icpVisible">
      <p>
        Copyright © {{ currYear }} zoz.cool All Rights Reserved.
        <a :href="'https://zoz.cool'" target="_blank" style="color: #20a0ff"
          >永春小站</a
        >
        版权所有
      </p>
      <a href="https://beian.miit.gov.cn" target="_blank" style="color: blue">{{
        icpCode
      }}</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, reactive } from "vue";
import logo from "@/assets/logo.png";
import loginMain from "@/assets/login-box-bg.svg";
import loginBg from "@/assets/login-bg.svg";
import { ThemeEnum } from "@/enums/ThemeEnum";
import Account from "@/views/login/components/account.vue";

// 窗口高度
const { height } = useWindowSize();

// 内部依赖
import { useSettingsStore } from "@/store";

// 使用导入的依赖和库
const settingsStore = useSettingsStore();
// 是否暗黑模式
const isDark = ref(settingsStore.theme === ThemeEnum.DARK);
const Mobile = defineAsyncComponent(
  () => import("@/views/login/components/mobile.vue")
);
const Register = defineAsyncComponent(
  () => import("@/views/login/components/register.vue")
);
const currYear = new Date().getFullYear();
const icpCode = "滇ICP备17007299号-2";
// 是否显示 ICP 备案信息
const icpVisible = ref(true);

// 定义变量内容
const state = reactive({
  tabsActiveName: "account",
});

const formBgColor = ref("");
const bgColor = ref("");

/** 主题切换 */
const toggleTheme = () => {
  const newTheme =
    settingsStore.theme === ThemeEnum.DARK ? ThemeEnum.LIGHT : ThemeEnum.DARK;
  settingsStore.changeTheme(newTheme);
  setBgColor(newTheme);
};

function setBgColor(theme: string) {
  formBgColor.value = theme === ThemeEnum.LIGHT ? "white" : "black";
  bgColor.value =
    theme === ThemeEnum.LIGHT ? "rgba(211, 239, 255, 1)" : "black";
}
/** 根据屏幕宽度切换设备模式 */
watchEffect(() => {
  icpVisible.value = height.value >= 600;
});
onMounted(() => {
  setBgColor(settingsStore.theme);
});
</script>

<style scoped lang="scss">
@import "@/styles/transition.scss";

.login-container {
  height: 100%;
  width: 100%;
  background: var(--el-clolor-white);
  .top-bar {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 100%;
    padding: 10px;
  }
  .login-left {
    flex: 1;
    position: relative;
    background-color: rgba(211, 239, 255, 1);
    margin-right: 100px;

    .login-left-logo {
      display: flex;
      align-items: center;
      position: absolute;
      top: 50px;
      left: 25%;
      z-index: 1;
      animation: logoAnimation 0.3s ease;

      img {
        width: 52px;
        height: 52px;
      }

      .login-left-logo-text {
        display: flex;
        flex-direction: column;

        span {
          margin-left: 10px;
          font-size: 28px;
          color: #26a59a;
        }

        .login-left-logo-text-msg {
          font-size: 12px;
          color: #32a99e;
        }
      }
    }

    .login-left-img {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-20%, -25%);
      width: 100%;
      height: 52%;

      img {
        width: 50%;
        height: 50%;
        animation: error-num 0.6s ease;
      }
    }

    .login-left-waves {
      position: absolute;
      top: 0;
      height: 100%;
      right: -11%;
    }
  }

  .login-right {
    width: 50%;
    height: 50%;

    .login-right-warp {
      margin-left: 20%;
      margin-top: 20%;
      border: 1px solid var(--el-color-primary-light-3);
      border-radius: 3px;
      width: 500px;
      height: 600px;
      position: relative;
      overflow: hidden;
      background-color: var(--el-color-white);

      .login-right-warp-one,
      .login-right-warp-two {
        position: absolute;
        display: block;
        width: inherit;
        height: inherit;

        &::before,
        &::after {
          content: "";
          position: absolute;
          z-index: 1;
        }
      }

      .login-right-warp-one {
        &::before {
          filter: hue-rotate(0deg);
          top: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: linear-gradient(
            90deg,
            transparent,
            var(--el-color-primary)
          );
          animation: loginLeft 3s linear infinite;
        }

        &::after {
          filter: hue-rotate(60deg);
          top: -100%;
          right: 2px;
          width: 3px;
          height: 100%;
          background: linear-gradient(
            180deg,
            transparent,
            var(--el-color-primary)
          );
          animation: loginTop 3s linear infinite;
          animation-delay: 0.7s;
        }
      }

      .login-right-warp-two {
        &::before {
          filter: hue-rotate(120deg);
          bottom: 2px;
          right: -100%;
          width: 100%;
          height: 3px;
          background: linear-gradient(
            270deg,
            transparent,
            var(--el-color-primary)
          );
          animation: loginRight 3s linear infinite;
          animation-delay: 1.4s;
        }

        &::after {
          filter: hue-rotate(300deg);
          bottom: -100%;
          left: 0;
          width: 3px;
          height: 100%;
          background: linear-gradient(
            360deg,
            transparent,
            var(--el-color-primary)
          );
          animation: loginBottom 3s linear infinite;
          animation-delay: 2.1s;
        }
      }

      .login-right-warp-mian {
        display: flex;
        flex-direction: column;
        height: 100%;

        .login-right-warp-main-title {
          height: 130px;
          line-height: 130px;
          font-size: 27px;
          text-align: center;
          letter-spacing: 3px;
          animation: logoAnimation 0.3s ease;
          animation-delay: 0.3s;
          color: var(--el-text-color-primary);
        }

        .login-right-warp-main-form {
          flex: 1;
          padding: 0 50px 50px;

          .login-content-main-sacn {
            position: absolute;
            top: 0;
            right: 0;
            width: 50px;
            height: 50px;
            overflow: hidden;
            cursor: pointer;
            transition: all ease 0.3s;
            color: var(--el-color-primary);

            &-delta {
              position: absolute;
              width: 35px;
              height: 70px;
              z-index: 2;
              top: 2px;
              right: 21px;
              background: var(--el-color-white);
              transform: rotate(-45deg);
            }

            &:hover {
              opacity: 1;
              transition: all ease 0.3s;
              color: var(--el-color-primary) !important;
            }

            i {
              width: 47px;
              height: 50px;
              display: inline-block;
              font-size: 48px;
              position: absolute;
              right: 1px;
              top: 0;
            }
          }
        }
      }
    }
  }

  .icp-info {
    position: absolute;
    width: 100%;
    bottom: 4px;
    font-size: 14px;
    text-align: center;
    color: #909399;
  }
}
</style>
