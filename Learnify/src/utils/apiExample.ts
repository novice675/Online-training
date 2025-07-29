import http from './axios';

// 示例接口定义
interface User {
  id: number;
  name: string;
  email: string;
}

interface LoginParams {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

// API 接口封装示例
export const userApi = {
  // 获取用户列表
  getUserList: () => {
    return http.get<User[]>('/users');
  },
  
  // 获取用户详情
  getUserDetail: (id: number) => {
    return http.get<User>(`/users/${id}`);
  },
  
  // 创建用户
  createUser: (data: Omit<User, 'id'>) => {
    return http.post<User>('/users', data);
  },
  
  // 更新用户
  updateUser: (id: number, data: Partial<User>) => {
    return http.put<User>(`/users/${id}`, data);
  },
  
  // 删除用户
  deleteUser: (id: number) => {
    return http.delete(`/users/${id}`);
  },
  
  // 用户登录
  login: (params: LoginParams) => {
    return http.post<LoginResponse>('/login', params);
  },
  
  // 上传头像
  uploadAvatar: (userId: number, file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return http.upload<{avatarUrl: string}>(`/users/${userId}/avatar`, formData);
  },
  
  // 导出用户数据
  exportUserData: () => {
    return http.download('/users/export');
  }
};

// 使用示例
async function example() {
  try {
    // 登录
    const loginRes = await userApi.login({
      username: 'test@example.com',
      password: 'password123'
    });
    console.log('登录成功:', loginRes);
    
    // 获取用户列表
    const users = await userApi.getUserList();
    console.log('用户列表:', users);
    
    // 获取用户详情
    const user = await userApi.getUserDetail(1);
    console.log('用户详情:', user);
    
    // 创建用户
    const newUser = await userApi.createUser({
      name: '张三',
      email: 'zhangsan@example.com'
    });
    console.log('新建用户:', newUser);
    
    // 更新用户
    const updatedUser = await userApi.updateUser(1, {
      name: '李四'
    });
    console.log('更新用户:', updatedUser);
    
    // 删除用户
    await userApi.deleteUser(2);
    console.log('删除用户成功');
    
  } catch (error) {
    console.error('API调用出错:', error);
  }
}