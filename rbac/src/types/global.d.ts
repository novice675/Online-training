// 全局类型声明
declare global {
  // 全局类型声明
  interface Window {
    // 全局 window 对象扩展
    __INITIAL_STATE__?: any;
    // 可以添加全局方法
    [key: string]: any;
  }
}

// 确保这个文件被视为模块
export {}

// 扩展 Document 接口
declare interface Document {
    // 可以添加全局 document 属性
    [key: string]: any;
}

// 通用工具类型
declare type Nullable<T> = T | null;
declare type NonNullable<T> = T extends null | undefined ? never : T;
declare type Recordable<T = any> = Record<string, T>;
declare type ReadonlyRecordable<T = any> = {
    readonly [key: string]: T;
};

// 常用工具类型
declare type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

declare type TimeoutHandle = ReturnType<typeof setTimeout>;
declare type IntervalHandle = ReturnType<typeof setInterval>;

// 响应式类型
declare type UnwrapRef<T> = T extends Ref<infer P> ? P : T;
declare type UnwrapRefs<T> = {
    [P in keyof T]: UnwrapRef<T[P]>;
};

// 组件类型
declare type ComponentSize = 'default' | 'small' | 'large';
declare type ComponentStatus = 'success' | 'warning' | 'error' | 'info';

// 通用响应类型
declare interface ApiResponse<T = any> {
    code: number;
    data: T;
    message: string;
}

// 分页请求参数
declare interface PageParams {
    pageNum: number;
    pageSize: number;
}

// 分页响应数据
declare interface PageResult<T> {
    list: T[];
    total: number;
    pageNum: number;
    pageSize: number;
} 