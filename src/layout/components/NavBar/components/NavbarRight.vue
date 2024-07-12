<template>
  <div class="flex">
    <template v-if="!isMobile">
      <!--全屏 -->
      <div class="setting-item" @click="toggle">
        <svg-icon
          :icon-class="isFullscreen ? 'fullscreen-exit' : 'fullscreen'"
        />
      </div>

      <!--      &lt;!&ndash; 布局大小 &ndash;&gt;-->
      <!--      <el-tooltip-->
      <!--        :content="$t('sizeSelect.tooltip')"-->
      <!--        effect="dark"-->
      <!--        placement="bottom"-->
      <!--      >-->
      <!--        <size-select class="setting-item" />-->
      <!--      </el-tooltip>-->

      <!-- 语言选择 -->
      <!--      <lang-select class="setting-item" />-->
      <el-button
        :icon="isDark ? Moon : Sunny"
        circle
        size="small"
        @click="toggleTheme"
        class="toggle-theme-btn"
      />
    </template>

    <!-- 用户头像 -->
    <el-dropdown class="setting-item" trigger="click">
      <div class="flex-center h100% p10px">
        <img
          alt=""
          :src="userStore.user.avatar + '?imageView2/1/w/80/h/80'"
          class="rounded-full mr-10px w24px w24px"
        />
        <span>{{ userStore.user.username }}</span>
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <a
            target="_blank"
            href="https://gitee.com/yczha/apihub-web"
          >
            <el-dropdown-item>
              <el-icon>
                <UserFilled/>
              </el-icon>
              <el-text type="primary">个人中心</el-text>
            </el-dropdown-item>
          </a>
          <el-dropdown-item divided @click="showDialog=true">
            <el-icon>
              <CreditCard/>
            </el-icon>
            <el-text type="primary">&nbsp;&nbsp;充&nbsp;&nbsp;值</el-text>
          </el-dropdown-item>
          <el-dropdown-item divided @click="logout">
            <el-icon>
              <SwitchButton/>
            </el-icon>
            <el-text type="primary">退出登录</el-text>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <!-- 设置 -->
    <template v-if="defaultSettings.showSettings">
      <div class="setting-item" @click="settingStore.settingsVisible = true">
        <svg-icon icon-class="setting"/>
      </div>
    </template>
  </div>
  <el-dialog
    v-model="showDialog"
    title="支付页面"
    width="500"
    center
  >
    <Payment :exit="!showDialog" @exitMe="handleClose"/>
  </el-dialog>
</template>
<script setup lang="ts">
import {
  useAppStore,
  useTagsViewStore,
  useUserStore,
  useSettingsStore,
} from "@/store";
import defaultSettings from "@/settings";
import {DeviceEnum} from "@/enums/DeviceEnum";
import {ThemeEnum} from "@/enums/ThemeEnum";
import {CreditCard, Moon, Sunny, SwitchButton, UserFilled} from "@element-plus/icons-vue";
import Payment from "@/components/Payment/index.vue";

const appStore = useAppStore();
const tagsViewStore = useTagsViewStore();
const userStore = useUserStore();
const settingStore = useSettingsStore();

const route = useRoute();
const router = useRouter();

const isMobile = computed(() => appStore.device === DeviceEnum.MOBILE);
const showDialog = ref(false);
const {isFullscreen, toggle} = useFullscreen();

/**
 * 切换主题
 */
const isDark = ref<boolean>(settingStore.theme === ThemeEnum.DARK);
const toggleTheme = () => {
  isDark.value = !isDark.value;
  settingStore.changeTheme(isDark.value ? ThemeEnum.DARK : ThemeEnum.LIGHT);
};

/**
 * 注销
 */
function logout() {
  ElMessageBox.confirm("确定注销并退出系统吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
    lockScroll: false,
  }).then(() => {
    userStore
      .logout()
      .then(() => {
        tagsViewStore.delAllViews();
      })
      .then(() => {
        router.push(`/login?redirect=${route.fullPath}`);
      });
  });
}

function handleClose() {
  showDialog.value = false;
  window.location.reload();
}

</script>
<style lang="scss" scoped>
.setting-item {
  display: inline-block;
  min-width: 40px;
  height: $navbar-height;
  line-height: $navbar-height;
  color: var(--el-text-color);
  text-align: center;
  cursor: pointer;

  &:hover {
    background: rgb(0 0 0 / 10%);
  }
}

.toggle-theme-btn {
  margin-top: 12px;
}

.layout-top,
.layout-mix {
  .setting-item,
  .el-icon {
    color: var(--el-color-white);
  }
}

.dark .setting-item:hover {
  background: rgb(255 255 255 / 20%);
}
</style>
