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
  static getMsgList(params: MsgPageQuery) {
    return request<any, MsgDetail[]>({
      url: `${MSG_URL}/list`,
      method: "get",
      params: params,
    });
  }
  static getMsg(id: number) {
    return request<any, MsgDetail>({
      url: `${MSG_URL}/${id}`,
      method: "get",
    });
  }
  static removeList(ids: string) {
    return request<any, null>({
      url: `${MSG_URL}/${ids}`,
      method: "delete",
    });
  }
  static addMsg(data: MsgDetail) {
    return request<any, null>({
      url: `${MSG_URL}/`,
      method: "post",
      data: data,
    });
  }
  static editMsg(data: MsgDetail) {
    return request<any, null>({
      url: `${MSG_URL}/`,
      method: "put",
      data: data,
    });
  }
}

export default MsgAPI;

export interface MsgData {
  id: number;
  text: string;
  createTime: Date;
}

export interface MsgDetail extends MsgData {
  type: number;
  parentId: number;
  deleted: number;
}

export interface MsgPageQuery extends PageQuery {
  keywords?: string;
  type?: number;
}
