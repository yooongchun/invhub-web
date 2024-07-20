import request from "@/utils/request";

const TRANSACTION_BASE_URL = "/api/v2/transaction";

class TransactionAPI {
  static getTransactionPage(queryParams: TransactionPageQuery) {
    return request<any, TransactionInfo[]>({
      url: `${TRANSACTION_BASE_URL}/list`,
      method: "get",
      params: queryParams,
    });
  }
}

export default TransactionAPI;

export interface TransactionPageQuery extends PageQuery {
  keywords?: string;
}

export interface TransactionInfo {
  id: number;
  transactionId: number;
  transactionAmount: number;
  transactionStatus: string;
  transactionTime: Date;
  transactionType: string;
  createTime: Date;
  remark: string;
  username: string;
}
