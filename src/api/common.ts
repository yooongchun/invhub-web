import request from "@/utils/request";

const COMMON_BASE_URL = "/api/v2/common";

class CommonAPI {
  /** 每日一句 接口*/
  static getDailyWords() {
    return request<any, DailyWordsResult>({
      url: `${COMMON_BASE_URL}/daily-words`,
      method: "get",
    });
  }
}

export default CommonAPI;

export interface DailyWordsResult {
  /** 内容（英文） */
  content: string;
  /** 译文 */
  note: string;
  /** 释意 */
  translation: string;
}
