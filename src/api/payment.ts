import request from "@/utils/request";

const ALIPAY_BASE_URL = "/api/v2/alipay/order";

class AlipayAPI {
  /**
   * 新建订单
   */
  static createOrder(data: NewOrderPayload) {
    return request<any, OrderInfo>({
      url: `${ALIPAY_BASE_URL}/`,
      method: "post",
      data: data
    });
  }

  static getOrderInfo(orderId: number) {
    return request<any, OrderInfo>({
      url: `${ALIPAY_BASE_URL}/${orderId}`,
      method: "get"
    });
  }

}

export default AlipayAPI;

export interface NewOrderPayload {
  /** subject */
  subject: string;
  /** 数额 */
  amount: number;
}

export interface OrderInfo {
  orderId: string,
  subject: string,
  amount: number,
  qrCode: string,
  tradeStatus: string,
}
