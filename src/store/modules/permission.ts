import { RouteRecordRaw } from "vue-router";
import { constantRoutes } from "@/router";
import { store } from "@/store";
import { RouteVO } from "@/api/menu";

const modules = import.meta.glob("../../views/**/**.vue");
const Layout = () => import("@/layout/index.vue");

/**
 * Use meta.role to determine if the current user has permission
 *
 * @param roles 用户角色集合
 * @param route 路由
 * @returns
 */
const hasPermission = (roles: string[], route: RouteRecordRaw) => {
  if (route.meta && route.meta.roles) {
    // 角色【超级管理员】拥有所有权限，忽略校验
    if (roles.includes("ROOT")) {
      return true;
    }
    return roles.some((role) => {
      if (route.meta?.roles) {
        return route.meta.roles.includes(role);
      }
    });
  }
  return false;
};

/**
 * 递归过滤有权限的动态路由
 *
 * @param routes 接口返回所有的动态路由
 * @param roles 用户角色集合
 * @returns 返回用户有权限的动态路由
 */
const filterAsyncRoutes = (routes: RouteVO[], roles: string[]) => {
  const asyncRoutes: RouteRecordRaw[] = [];
  routes.forEach((route) => {
    const tmpRoute = { ...route } as RouteRecordRaw; // 深拷贝 route 对象 避免污染
    if (hasPermission(roles, tmpRoute)) {
      // 如果是顶级目录，替换为 Layout 组件
      if (tmpRoute.component?.toString() == "Layout") {
        tmpRoute.component = Layout;
      } else {
        // 如果是子目录，动态加载组件
        const component = modules[`../../views/${tmpRoute.component}.vue`];
        if (component) {
          tmpRoute.component = component;
        } else {
          tmpRoute.component = modules[`../../views/error-page/404.vue`];
        }
      }

      if (tmpRoute.children) {
        tmpRoute.children = filterAsyncRoutes(route.children, roles);
      }

      asyncRoutes.push(tmpRoute);
    }
  });

  return asyncRoutes;
};
// setup
export const usePermissionStore = defineStore("permission", () => {
  // state
  const routes = ref<RouteRecordRaw[]>([]);

  // actions
  function setRoutes(newRoutes: RouteRecordRaw[]) {
    routes.value = constantRoutes.concat(newRoutes);
  }

  /**
   * 生成动态路由
   *
   * @param roles 用户角色集合
   * @returns
   */
  function generateRoutes(roles: string[]) {
    const routesData: RouteRecordRaw[] = [
      {
        path: "/inv",
        component: Layout,
        name: "inv",
        meta: {
          title: "发票管理",
          icon: "api",
          hidden: false,
          alwaysShow: true,
          params: null,
        },
        children: [
          {
            path: "info",
            component: modules["../../views/inv-manager/index.vue"],
            name: "发票信息",
            meta: {
              title: "发票信息",
              icon: "el-icon-tickets",
              hidden: false,
              keepAlive: true,
              alwaysShow: false,
              params: null,
            },
          },
        ],
      },
    ];
    // 当为Admin的时候，添加系统管理菜单
    if (roles.includes("admin")) {
      const adminRoutesData: RouteRecordRaw[] = [
        {
          path: "/api",
          component: Layout,
          name: "/api",
          meta: {
            title: "接口文档",
            icon: "api",
            hidden: false,
            alwaysShow: true,
            params: null,
          },
          children: [
            {
              path: "apifox",
              component: modules["../../views/demo/api/apifox.vue"],
              name: "Apifox",
              meta: {
                title: "Apifox",
                icon: "api",
                hidden: false,
                keepAlive: true,
                alwaysShow: false,
                params: null,
              },
            },
          ],
        },
        {
          path: "/system",
          component: Layout,
          redirect: "/system/user",
          name: "/system",
          meta: {
            title: "系统管理",
            icon: "system",
            hidden: false,
            alwaysShow: false,
            params: null,
          },
          children: [
            {
              path: "user",
              component: modules["../../views/system/user/index.vue"],
              name: "User",
              meta: {
                title: "用户管理",
                icon: "el-icon-User",
                hidden: false,
                keepAlive: true,
                alwaysShow: false,
                params: null,
              },
            },
            {
              path: "message",
              component: modules["../../views/system/message/index.vue"],
              name: "Message",
              meta: {
                title: "消息管理",
                icon: "el-icon-chat-dot-round",
                hidden: false,
                keepAlive: true,
                alwaysShow: false,
                params: null,
              },
            },
            {
              path: "log",
              component: modules["../../views/system/log/index.vue"],
              name: "Log",
              meta: {
                title: "系统日志",
                icon: "document",
                hidden: false,
                keepAlive: true,
                alwaysShow: false,
                params: null,
              },
            },
          ],
        },
      ];
      routesData.push(...adminRoutesData);
    }
    setRoutes(routesData);
    return routesData;
  }

  /**
   * 获取与激活的顶部菜单项相关的混合模式左侧菜单集合
   */
  const mixLeftMenus = ref<RouteRecordRaw[]>([]);
  function setMixLeftMenus(topMenuPath: string) {
    const matchedItem = routes.value.find((item) => item.path === topMenuPath);
    if (matchedItem && matchedItem.children) {
      mixLeftMenus.value = matchedItem.children;
    }
  }
  return {
    routes,
    setRoutes,
    generateRoutes,
    mixLeftMenus,
    setMixLeftMenus,
  };
});

// 非setup
export function usePermissionStoreHook() {
  return usePermissionStore(store);
}
