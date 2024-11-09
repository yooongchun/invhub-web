import request from "@/utils/request";

const INV_BASE_URL = "/api/v2/inv/info";
const INV_DETAIL_URL = "/api/v2/inv/detail";

class InvAPI {
  /**
   * 获取发票分页列表
   */
  static getPage(queryParams: InvPageQuery) {
    return request<any, InvQueryResult>({
      url: `${INV_BASE_URL}/list`,
      method: "get",
      params: queryParams,
    });
  }

  static getInvData(id: number) {
    return request<any, InvData>({
      url: `${INV_BASE_URL}/${id}`,
      method: "get",
    });
  }

  static update(data: InvData) {
    return request({
      url: `${INV_BASE_URL}/${data.id}`,
      method: "put",
      data: data,
    });
  }

  static add(data: InvData) {
    return request({
      url: `${INV_BASE_URL}`,
      method: "post",
      data: data,
    });
  }

  static deleteByIds(ids: string) {
    return request({
      url: `${INV_BASE_URL}/${ids}`,
      method: "delete",
    });
  }

  static parseData(fileId: number) {
    return request({
      url: `${INV_DETAIL_URL}/parse?fileId=${fileId}`,
      method: "post",
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
  /** 查验状态*/
  invChecked: number;
}

export interface InvQueryResult {
  records: InvData[];
  total: number;
}

export interface InvData {
  /** 发票ID */
  id: number;
  /** 发票号 */
  invNum: string;
  /** 发票代码 */
  invCode: string;
  /** 开票日期 */
  invDate: string;
  /** 税额 */
  tax: string;
  /** 金额 */
  amount: number;
  /** 校验码 */
  checkCode: string;
  /** 校验状态 */
  checked: number;
  /** 报销状态 */
  reimbursed: number;
  /** 报销人 */
  owner: string;
  /** 查验结果 */
  invChecked: number;
  fileId?: number;
}
