import request from "@/utils/request";

const INV_BASE_URL = "/api/v2/inv";

class InvAPI {
  /**
   * 获取发票分页列表
   */
  static getPage(queryParams: InvPageQuery) {
    return request<any, InvData>({
      url: `${INV_BASE_URL}/list`,
      method: "get",
      params: queryParams,
    });
  }
}

export default InvAPI;

/**
 * 发票分页查询对象
 */
export interface InvPageQuery extends PageQuery {
  /** 搜索关键字 */
  keywords?: string;
  /** 状态 */
  status?: number;
  /** 开始时间 */
  startTime?: string;
  /** 结束时间 */
  endTime?: string;
  /** 已校验 */
  checked?: number;
  /** 已入账报销 */
  reimbursed?: number;
  /** 最小金额 */
  minAmount?: number;
  /** 最大金额 */
  maxAmount?: number;
}

export interface InvData {
  /** 发票ID */
  id: number;
  /** 发票号 */
  invNum: string;
  /** 发票代码 */
  invCode: string;
  invTax: string,
  /** 开票日期 */
  invDate: string;
  /** 金额 */
  amount: number;
  /** 校验码 */
  invCheckCode: string;
  /** 发票类型 */
  invType : string;
  /** 校验状态 */
  checked: number;
  /** 报销状态 */
  reimbursed: number;
  /** 报销人 */
  owner: string;
  /** 是否已查验 */
  invChecked: number;
  /** 查验结果 */
  invCheckResult: string;
}
