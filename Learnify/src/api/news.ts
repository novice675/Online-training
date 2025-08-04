import http from '../utils/axios';
import type { 
  NewsListResponse, 
  NewsDetailResponse, 
  GetNewsParams 
} from '../types/news';
import { RenderType } from '../types/news';

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
}

export default NewsAPI; 