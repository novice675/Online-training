import http from '../utils/axios';

// 用户信息接口
export interface UserInfo {
  _id: string;
  username: string;
  avatar?: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 用户API响应接口
export interface UserResponse {
  success: boolean;
  data: UserInfo;
  message?: string;
}

// 用户API服务类
export class UserAPI {
  private static baseURL = `${import.meta.env.VITE_API_URL}/LCY`;

  /**
   * 获取用户信息
   * @param userId 用户ID
   */
  static async getUserInfo(userId: string): Promise<UserResponse> {
    return http.get<UserResponse>(`${this.baseURL}/user/${userId}`);
  }
}

export default UserAPI; 