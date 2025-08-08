import http from '../utils/axios';

// 图片上传API服务类
export class UploadAPI {
  private static baseURL = `${import.meta.env.VITE_API_URL}/upload`;

  /**
   * 文件预检 - 检查文件是否已存在
   * @param hash 文件哈希值
   * @param filename 文件名
   * @param size 文件大小
   */
  static async checkFileExists(hash: string, filename: string, size: number): Promise<{
    success: boolean;
    exists: boolean;
    data?: {
      url: string;
      filename: string;
      originalName: string;
      size: number;
      hash: string;
    };
    message: string;
  }> {
    return http.post(`${this.baseURL}/check`, { hash, filename, size });
  }

  /**
   * 单图片上传
   * @param file 图片文件
   * @param hash 文件哈希值
   */
  static async uploadSingleImage(file: File, hash?: string): Promise<{
    success: boolean;
    data: {
      url: string;
      filename: string;
      originalName: string;
      size: number;
      hash?: string;
      isDuplicate?: boolean;
    };
    message: string;
  }> {
    const formData = new FormData();
    formData.append('image', file);
    if (hash) {
      formData.append('hash', hash);
    }

    return http.upload(`${this.baseURL}/single`, formData);
  }

  /**
   * 多图片上传
   * @param files 图片文件数组
   */
  static async uploadMultipleImages(files: File[]): Promise<{
    success: boolean;
    data: {
      urls: Array<{
        url: string;
        filename: string;
        originalName: string;
        size: number;
      }>;
      count: number;
    };
    message: string;
  }> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append('images', file);
    });

    return http.upload(`${this.baseURL}/multiple`, formData);
  }

  /**
   * 删除图片
   * @param filename 文件名
   */
  static async deleteImage(filename: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return http.delete(`${this.baseURL}/image/${filename}`);
  }
}

export default UploadAPI; 