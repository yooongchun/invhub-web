import request from "@/utils/request";

const USER_BASE_URL = "/api/v2/user";

class UserAPI {
  /**
   * 获取当前登录用户信息
   *
   * @returns 登录用户昵称、头像信息，包括角色和权限
   */
  static getInfo() {
    return request<any, UserInfo>({
      url: `${USER_BASE_URL}/info`,
      method: "get",
    });
  }

  static getUserInfo(id: number) {
    return request<any, UserInfo>({
      url: `${USER_BASE_URL}/${id}`,
      method: "get",
    });
  }

  static setAutoCheck(enabled: boolean) {
    return request({
      url: `${USER_BASE_URL}/setting`,
      method: "post",
      params: { key: "AUTO_RUN_INV_CHECK", value: enabled ? "1" : "0" },
    });
  }

  /**
   * 获取用户分页列表
   *
   * @param queryParams 查询参数
   */
  static getPage(queryParams: UserPageQuery) {
    return request<any, PageResult<UserPageVO[]>>({
      url: `${USER_BASE_URL}/list`,
      method: "get",
      params: queryParams,
    });
  }

  /**
   * 获取用户表单详情
   *
   * @param userId 用户ID
   * @returns 用户表单详情
   */
  static getFormData(userId: number) {
    return request<any, UserForm>({
      url: `${USER_BASE_URL}/${userId}/form`,
      method: "get",
    });
  }

  /**
   * 添加用户
   *
   * @param data 用户表单数据
   */
  static add(data: UserForm) {
    return request({
      url: `${USER_BASE_URL}/`,
      method: "post",
      data: data,
    });
  }

  /**
   * 修改用户
   *
   * @param data 用户表单数据
   */
  static update(data: UserForm) {
    return request({
      url: `${USER_BASE_URL}/`,
      method: "put",
      data: data,
    });
  }

  /**
   * 修改用户密码
   *
   * @param id 用户ID
   * @param password 新密码
   */
  static updatePassword(id: number, password: string) {
    return request({
      url: `${USER_BASE_URL}/${id}/change-password`,
      method: "patch",
      params: { newPassword: password },
    });
  }

  /**
   * 批量删除用户，多个以英文逗号(,)分割
   *
   * @param ids 用户ID字符串，多个以英文逗号(,)分割
   */
  static deleteByIds(ids: string) {
    return request({
      url: `${USER_BASE_URL}/${ids}`,
      method: "delete",
    });
  }

  /**
   * 启动用户：解禁
   */
  static enableId(id: number) {
    return request({
      url: `${USER_BASE_URL}/${id}/enable`,
      method: "patch",
    });
  }

  /** 下载用户导入模板 */
  static downloadTemplate() {
    return request({
      url: `${USER_BASE_URL}/template`,
      method: "get",
      responseType: "arraybuffer",
    });
  }

  /**
   * 导出用户
   *
   * @param queryParams 查询参数
   */
  static export(queryParams: UserPageQuery) {
    return request({
      url: `${USER_BASE_URL}/export`,
      method: "get",
      params: queryParams,
      responseType: "arraybuffer",
    });
  }

  /** 注销 接口*/
  static logout() {
    return request({
      url: `${USER_BASE_URL}/logout`,
      method: "post",
    });
  }

  /**
   * 导入用户
   *
   * @param deptId 部门ID
   * @param file 导入文件
   */
  static import(deptId: number, file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return request({
      url: `${USER_BASE_URL}/import`,
      method: "post",
      params: { deptId: deptId },
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }
}

export default UserAPI;

/** 登录用户信息 */
export interface UserBaseInfo {
  id?: number;
  /** 用户ID */
  uid?: number;
  /** 用户名 */
  username?: string;
  /** 是否管理员 1->是 0->否 */
  admin?: number;
  /** 用户头像URL */
  avatar?: string;
  /** 余额 */
  balance?: number;
  /** 用户邮箱 */
  email?: string;
  /** 手机号 */
  phone?: string;
  /** 备注信息 */
  remark?: string;
  /** 创建时间 */
  createTime?: Date;
  /** 用户状态(1:启用;0:禁用) */
  deleted?: number;
}

export interface UserInfo extends UserBaseInfo {
  /** 角色 */
  roles: string[];
  /** 权限 */
  perms: string[];
}

/**
 * 用户分页查询对象
 */
export interface UserPageQuery extends PageQuery {
  /** 搜索关键字 */
  keywords?: string;

  /** 用户状态 */
  deleted?: number;

  /** 开始时间 */
  startTime?: string;

  /** 结束时间 */
  endTime?: string;
}

/** 用户分页对象 */
export interface UserPageVO extends UserBaseInfo {}

/** 用户表单类型 */
export interface UserForm extends UserBaseInfo {
  password?: string;
}
