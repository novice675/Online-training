import http from '../utils/axios';
import type { 
  NewsListResponse, 
  NewsDetailResponse, 
  GetNewsParams 
} from '../types/news';
import { RenderType, Channel } from '../types/news';

// 新闻API服务类
export class NewsAPI {
  private static baseURL = `${import.meta.env.VITE_API_URL}/LCY`;

  /**
   * 获取新闻列表
   * @param params 查询参数
   */
  static async getNewsList(params: GetNewsParams = {}): Promise<NewsListResponse> {
    return http.get<NewsListResponse>(`${this.baseURL}/news`, params);
  }

  /**
   * 获取新闻详情
   * @param id 新闻ID
   */
  static async getNewsDetail(id: string): Promise<NewsDetailResponse> {
    return http.get<NewsDetailResponse>(`${this.baseURL}/news/${id}`);
  }

  /**
   * 根据渲染类型获取新闻
   * @param renderType 渲染类型
   * @param params 其他查询参数
   */
  static async getNewsByRenderType(
    renderType: RenderType, 
    params: Omit<GetNewsParams, 'renderType'> = {}
  ): Promise<NewsListResponse> {
    return this.getNewsList({ ...params, renderType });
  }

  /**
   * 根据标签获取新闻
   * @param tag 标签
   * @param params 其他查询参数
   */
  static async getNewsByTag(
    tag: string, 
    params: Omit<GetNewsParams, 'tag'> = {}
  ): Promise<NewsListResponse> {
    return this.getNewsList({ ...params, tag });
  }

  /**
   * 根据频道获取新闻
   * @param channel 频道
   * @param params 其他查询参数
   */
  static async getNewsByChannel(
    channel: Channel, 
    params: Omit<GetNewsParams, 'channel'> = {}
  ): Promise<NewsListResponse> {
    return this.getNewsList({ ...params, channel });
  }

  /**
   * 点赞/取消点赞新闻
   * @param id 新闻ID
   * @param action 操作类型：'like' 或 'unlike'
   */
  static async toggleLike(id: string, action: 'like' | 'unlike'): Promise<{ success: boolean; data: { likeCount: number } }> {
    return http.post(`${this.baseURL}/news/${id}/like`, { action });
  }

  /**
   * 发布新闻
   * @param newsData 新闻数据
   */
  static async publishNews(newsData: {
    title: string;
    channel: Channel;
    renderType: RenderType;
    authorId: string;
    rightImage?: string;
    detailContent: string;
    detailImages?: string[];
    publishTime: string;
    likeCount: number;
  }): Promise<{ success: boolean; data: { _id: string } }> {
    return http.post(`${this.baseURL}/news`, newsData);
  }
}

export default NewsAPI; 