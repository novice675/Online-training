// 用户状态接口
export interface UserState {
    username: string;      // 用户名
    roleName: string[];    // 用户角色列表
    menuPermissions: string[];  // 菜单权限列表
    buttonPermissions: string[]; // 按钮权限列表
}

// 用户信息接口
export interface UserInfo {
    username: string;
    roleName: string[];
    menuPermissions: string[];
    buttonPermissions: string[];
    token?: string;
}

// 登录参数接口
export interface LoginParams {
    username: string;
    password: string;
    remember?: boolean;
} 