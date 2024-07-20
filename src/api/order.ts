import request from "@/utils/request";

const ALIPAY_BASE_URL = "/api/v2/order";

class AlipayAPI {
  /**
   * 新建订单
   */
  static createOrder(data: NewOrderPayload) {
    return request<any, OrderInfo>({
      url: `${ALIPAY_BASE_URL}/`,
      method: "post",
      data: data,
    });
  }

  static getOrderInfo(orderId: number) {
    return request<any, OrderInfo>({
      url: `${ALIPAY_BASE_URL}/${orderId}`,
      method: "get",
    });
  }
  static getOrderPage(queryParams: OrderPageQuery) {
    return request<any, OrderInfo[]>({
      url: `${ALIPAY_BASE_URL}/list`,
      method: "get",
      params: queryParams,
    });
  }
}

export default AlipayAPI;

export interface OrderPageQuery extends PageQuery {
  keywords?: string;
}

export interface NewOrderPayload {
  /** subject */
  subject: string;
  /** 数额 */
  amount: number;
}

export interface OrderInfo {
  id: number;
  orderId: string;
  subject: string;
  amount: number;
  qrCode: string;
  tradeStatus: string;
  username: string;
  tradeNo: string;
  createTime: Date; // 订单创建时间
  gmtPayment: Date; //交易付款时间
}
