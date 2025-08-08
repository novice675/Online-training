import http from './axios';

// 用户信息接口
export interface UserInfo {
  _id: string;
  username: string;
  avatar?: string;
}

// 评论数据接口
export interface CommentItem {
  _id: string;
  newsId: string;
  content: string;
  userId: UserInfo;
  parentId?: string;
  rootId?: string;
  replyTo?: string;
  replyToAuthor?: string;
  likeCount: number;
  replyCount: number;
  floor: number;
  createdAt: string;
  updatedAt: string;
  replies?: CommentItem[];
}

// 分页信息接口
export interface CommentPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// 评论列表响应接口
export interface CommentListResponse {
  success: boolean;
  data: {
    list: CommentItem[];
    pagination: CommentPagination;
  };
}

// 评论详情响应接口
export interface CommentDetailResponse {
  success: boolean;
  data: CommentItem;
}

// 获取评论列表参数接口
export interface GetCommentsParams {
  page?: number;
  limit?: number;
  sort?: 'newest' | 'oldest' | 'hot';
}

// 发布评论参数接口
export interface CreateCommentParams {
  content: string;
  userId: string;
}

// 回复评论参数接口
export interface ReplyCommentParams {
  content: string;
  userId: string;
  replyToAuthor?: string;
}

// 点赞评论参数接口
export interface LikeCommentParams {
  action: 'like' | 'unlike';
}

// 评论API服务类
export class CommentAPI {
  private static baseURL = `${import.meta.env.VITE_API_URL}/LCYping`;

  /**
   * 获取新闻评论列表
   * @param newsId 新闻ID
   * @param params 查询参数
   */
  static async getComments(
    newsId: string, 
    params: GetCommentsParams = {}
  ): Promise<CommentListResponse> {
    return http.get<CommentListResponse>(`${this.baseURL}/news/${newsId}/comments`, params);
  }

  /**
   * 获取评论的回复列表
   * @param commentId 评论ID
   * @param params 查询参数
   */
  static async getReplies(
    commentId: string, 
    params: GetCommentsParams = {}
  ): Promise<CommentListResponse> {
    return http.get<CommentListResponse>(`${this.baseURL}/comments/${commentId}/replies`, params);
  }

  /**
   * 发布评论（楼主）
   * @param newsId 新闻ID
   * @param params 评论参数
   */
  static async createComment(
    newsId: string, 
    params: CreateCommentParams
  ): Promise<CommentDetailResponse> {
    return http.post<CommentDetailResponse>(`${this.baseURL}/news/${newsId}/comments`, params);
  }

  /**
   * 回复评论
   * @param commentId 评论ID
   * @param params 回复参数
   */
  static async replyComment(
    commentId: string, 
    params: ReplyCommentParams
  ): Promise<CommentDetailResponse> {
    return http.post<CommentDetailResponse>(`${this.baseURL}/comments/${commentId}/replies`, params);
  }

  /**
   * 点赞/取消点赞评论
   * @param commentId 评论ID
   * @param params 点赞参数
   */
  static async toggleLikeComment(
    commentId: string, 
    params: LikeCommentParams
  ): Promise<{ success: boolean; data: { likeCount: number } }> {
    return http.post(`${this.baseURL}/comments/${commentId}/like`, params);
  }
}

export default CommentAPI; 