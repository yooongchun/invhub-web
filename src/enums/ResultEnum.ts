/**
 * 响应码枚举
 */
export const enum ResultEnum {
  SUCCESS = 0, // 业务成功
  HTTP_OK = 200, // http请求成功
  INTERNAL_SERVER_ERROR = 500, // 服务器内部错误
  UNAUTHORIZED = 401, // 未授权
  FORBIDDEN = 403, // 禁止访问
  NOT_FOUND = 404, // 未找到
  BAD_REQUEST = 400, // 参数错误
}
