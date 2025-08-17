// 新闻渲染类型枚举
export enum RenderType {
  TEXT_ONLY = 'TEXT_ONLY',       // 纯文字样式
  IMAGE_FULL = 'IMAGE_FULL',     // 大图图文样式
  IMAGE_RIGHT = 'IMAGE_RIGHT'    // 右侧小图/头像样式
}

// 新闻频道枚举
export enum Channel {
  RECOMMEND = '推荐',
  POLICY = '政策'
}

// 作者信息接口
export interface AuthorInfo {
  _id: string;
  username: string;
  nickname?: string;
  avatar?: string;
}

// 新闻数据接口
export interface NewsItem {
  _id: string;
  title: string;
  renderType: RenderType;
  channel: Channel;
  tags: string[];
  authorId?: AuthorInfo;
  publishTime: string;
  likeCount: number;
  coverImage?: string;
  detailContent: string;
  detailImages?: string[];
  status?: string; // 添加状态字段
  createdAt: string;
  updatedAt: string;
}

// 分页信息接口
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// 新闻列表响应接口
export interface NewsListResponse {
  success: boolean;
  data: {
    list: NewsItem[];
    pagination: Pagination;
  };
}

// 新闻详情响应接口
export interface NewsDetailResponse {
  success: boolean;
  data: NewsItem;
}

// 获取新闻列表参数接口
export interface GetNewsParams {
  page?: number;
  limit?: number;
  renderType?: RenderType;
  tag?: string;
  channel?: Channel;
  status?: string; // 添加状态过滤参数
} 