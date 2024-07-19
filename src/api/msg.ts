import request from "@/utils/request";

const MSG_URL = "/api/v2/msg";

class MsgAPI {
  /**
   * 消息通知
   */
  static getNotifyNew() {
    return request<any, MsgData[]>({
      url: `${MSG_URL}/list/notify`,
      method: "get",
    });
  }
  static markRead() {
    return request<any, null>({
      url: `${MSG_URL}/mark-read`,
      method: "patch",
    });
  }
}

export default MsgAPI;

export interface MsgData {
  id: number;
  text: string;
  createTime: Date;
}
