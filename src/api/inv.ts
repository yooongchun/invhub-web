import request from "@/utils/request";

const INV_BASE_URL = "/api/v2/inv";

class InvAPI {}

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
