import request from "@/utils/request";

const STATS_BASE_URL = "/api/v2/stats";

class StatsAPI {
  /** 统计数据 */
  static getStatsData() {
    return request<StatsRecords>({
      url: `${STATS_BASE_URL}/data`,
      method: "get",
    });
  }

  /** meta数据 */
  static getMataData() {
    return request<MetaData>({
      url: `${STATS_BASE_URL}/meta`,
      method: "get",
    });
  }
}

export default StatsAPI;

export interface StatsData {
  /** 用户数 */
  userNum: number;
  /** 支付订单数 */
  orderNum: number;
  /** 订单数 */
  consumeNum: number;
  /** IP数 */
  ipNum: number;
  /** 订单金额 */
  orderAmount: number;
  /** 消费金额 */
  consumeAmount: number;
}

export interface StatsRecords {
  NOW: StatsData;
  DAY: StatsData;
  WEEK: StatsData;
  MONTH: StatsData;
  YEAR: StatsData;
  ALL: StatsData;
}

export interface MetaData {
  /** 订单额 */
  orderAmount: number;
  /** 消费额 */
  consumeAmount: number;
  /** 余额 */
  balanceAmount: number;
}
