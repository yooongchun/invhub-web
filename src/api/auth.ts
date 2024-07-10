import request from "@/utils/request";

const AUTH_BASE_URL = "/api/v2/auth";

class AuthAPI {
  /** 登录 接口*/
  static login(data: LoginData) {
    return request<any, LoginResult>({
      url: `${AUTH_BASE_URL}/login`,
      method: "post",
      data: data,
    });
  }

  /** 注册 接口*/
  static register(data: RegisterData) {
    return request<any, LoginResult>({
      url: `${AUTH_BASE_URL}/register`,
      method: "post",
      data: data,
    });
  }

  /** 获取验证码 接口*/
  static getCaptcha() {
    return request<any, CaptchaResult>({
      url: `${AUTH_BASE_URL}/captcha`,
      method: "get",
    });
  }

  /** 获取手机或邮箱验证码 接口*/
  static sendVerifyCode(loginData: LoginData) {
    return request<any, string>({
      url: `${AUTH_BASE_URL}/verify-code`,
      method: "post",
      data: loginData,
    });
  }
  /** 用户是否存在，根据手机号或邮箱判断 */
  static userExists(userKey: string) {
    return request<any, boolean>({
      url: `${AUTH_BASE_URL}/user-exists`,
      method: "get",
      params: { userKey },
    });
  }
}

export default AuthAPI;

/** 登录请求参数 */
export interface LoginData {
  /** 用户名 */
  username: string;
  /** 邮箱 */
  email: string;
  /** 手机号 */
  phone: string;
  /** 手机或邮箱验证码 */
  verifyCode: string;
  /** 密码 */
  password: string;
  /** 验证码key */
  captchaKey: string;
  /** 验证码code */
  captchaCode: string;
}

export interface RegisterData extends LoginData {
  passwordAgain: string;
  avatar: string;
}

/** 登录响应 */
export interface LoginResult {
  /** 访问token */
  token: string;
  /** 过期时间(单位：毫秒) */
  expire?: number;
  /** token 类型 */
  tokenHead?: string;
}

/** 验证码响应 */
export interface CaptchaResult {
  /** 验证码缓存key */
  captchaKey: string;
  /** 验证码图片Base64字符串 */
  captchaBase64: string;
}
