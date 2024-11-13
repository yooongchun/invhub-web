import request from "@/utils/request";
import { UploadUserFile } from "element-plus";

const FILE_BASE_URL = "/api/v2/file";
class FileAPI {
  /**
   * 上传文件
   *
   * @param file
   */
  static upload(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return request<any, FileInfo>({
      url: `${FILE_BASE_URL}/upload`,
      method: "post",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  /**
   * 删除文件
   */
  static deleteByPath(fileId: string) {
    return request({
      url: `${FILE_BASE_URL}`,
      method: "delete",
      params: { id: fileId },
    });
  }

  static previewFile(fileId: number) {
    return request<any, FilePreview>({
      url: `${FILE_BASE_URL}/${fileId}/preview`,
      method: "get",
    });
  }
}

export default FileAPI;

/**
 * 文件API类型声明
 */
export interface FileInfo {
  id: number;
  /** 文件名 */
  fileName: string;
  /** 文件类型 */
  fileType: string;
  /** Upload组件维护的文件对象 */
  file?: UploadUserFile;
  /** 任务失败、成功、异常等原因 */
  taskReason: string;
}

export interface FilePreview {
  fileType: string;
  url: string;
}
