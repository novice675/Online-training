import { useState, useEffect, useCallback } from 'react';
import { useSocket } from './useSocket';
import type { NewsItem } from '../types/news';
import { Channel } from '../types/news';
import NewsAPI from '../api/news';

interface UseRealTimeNewsOptions {
  channel: Channel;
  page?: number;
  limit?: number;
  autoRefresh?: boolean;
}

interface UseRealTimeNewsReturn {
  newsList: NewsItem[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addNews: (news: NewsItem) => void;
  removeNews: (id: string) => void;
  updateNews: (id: string, updates: Partial<NewsItem>) => void;
}

export function useRealTimeNews(options: UseRealTimeNewsOptions): UseRealTimeNewsReturn {
  const { channel, page = 1, limit = 20, autoRefresh = true } = options;
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { subscribeToNews, subscribeToArticleUpdates } = useSocket();

  // 添加新闻到列表开头
  const addNews = useCallback((news: NewsItem) => {
    setNewsList(prevList => {
      // 检查是否已存在
      if (prevList.find(item => item._id === news._id)) {
        return prevList;
      }
      // 添加到列表开头
      return [news, ...prevList].slice(0, limit);
    });
  }, [limit]);

  // 从列表中移除新闻
  const removeNews = useCallback((id: string) => {
    setNewsList(prevList => prevList.filter(item => item._id !== id));
  }, []);

  // 更新新闻信息
  const updateNews = useCallback((id: string, updates: Partial<NewsItem>) => {
    setNewsList(prevList => 
      prevList.map(item => 
        item._id === id ? { ...item, ...updates } : item
      )
    );
  }, []);

  // 刷新新闻列表
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 调用API获取新闻数据
      const response = await NewsAPI.getNewsByChannel(channel, {
        page,
        limit,
      });
      
      if (response.success) {
        setNewsList(response.data.list);
      } else {
        setError("获取新闻数据失败");
      }
    } catch (err) {
      console.error("获取新闻数据错误:", err);
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  }, [channel, page, limit]);

  // 订阅实时更新
  useEffect(() => {
    if (!autoRefresh) return;

    // 订阅新闻创建事件
    const unsubscribeNews = subscribeToNews((news: NewsItem) => {
      console.log('收到新文章，添加到列表:', news.title);
      addNews(news);
    });

    // 订阅文章更新事件
    const unsubscribeUpdates = subscribeToArticleUpdates((data) => {
      switch (data.action) {
        case 'created':
          console.log('文章被创建，添加到列表:', data.id);
          // 新文章会通过subscribeToNews处理
          break;
        case 'updated':
          console.log('文章被更新，刷新列表:', data.id);
          // 刷新整个列表以获取最新数据
          refresh();
          break;
        case 'deleted':
          console.log('文章被删除，从列表中移除:', data.id);
          removeNews(data.id);
          break;
        default:
          console.log('未知的文章操作:', data.action);
      }
    });

    return () => {
      unsubscribeNews();
      unsubscribeUpdates();
    };
  }, [autoRefresh, subscribeToNews, subscribeToArticleUpdates, addNews, removeNews, refresh]);

  // 初始化时刷新数据
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    newsList,
    loading,
    error,
    refresh,
    addNews,
    removeNews,
    updateNews,
  };
} 