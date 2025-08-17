import { useState, useEffect, useCallback } from 'react';
import { useSocket } from './useSocket';
import type { CommentItem } from '../utils/commentApi';
import CommentAPI from '../utils/commentApi';

interface UseRealTimeCommentsOptions {
  newsId?: string;
  commentId?: string; // 用于回复详情页
  page?: number;
  limit?: number;
  autoRefresh?: boolean;
}

interface UseRealTimeCommentsReturn {
  comments: CommentItem[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addComment: (comment: CommentItem) => void;
  removeComment: (id: string) => void;
  updateComment: (id: string, updates: Partial<CommentItem>) => void;
}

export function useRealTimeComments(options: UseRealTimeCommentsOptions): UseRealTimeCommentsReturn {
  const { newsId, commentId, page = 1, limit = 20, autoRefresh = true } = options;
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { subscribeToComments, subscribeToCommentUpdates } = useSocket();

  // 添加评论到列表开头
  const addComment = useCallback((comment: CommentItem) => {
    setComments(prevList => {
      // 检查是否已存在
      if (prevList.find(item => item._id === comment._id)) {
        return prevList;
      }
      // 添加到列表开头
      return [comment, ...prevList].slice(0, limit);
    });
  }, [limit]);

  // 从列表中移除评论
  const removeComment = useCallback((id: string) => {
    setComments(prevList => prevList.filter(item => item._id !== id));
  }, []);

  // 更新评论信息
  const updateComment = useCallback((id: string, updates: Partial<CommentItem>) => {
    setComments(prevList => 
      prevList.map(item => 
        item._id === id ? { ...item, ...updates } : item
      )
    );
  }, []);

  // 刷新评论列表
  const refresh = useCallback(async () => {
    if (!newsId && !commentId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let response;
      
      if (commentId) {
        // 获取回复列表
        response = await CommentAPI.getReplies(commentId, {
          page,
          limit,
        });
      } else if (newsId) {
        // 获取评论列表
        response = await CommentAPI.getComments(newsId, {
          page,
          limit,
        });
      }
      
      if (response && response.success) {
        setComments(response.data.list);
      } else {
        setError("获取评论数据失败");
      }
    } catch (err) {
      console.error("获取评论数据错误:", err);
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  }, [newsId, commentId, page, limit]);

  // 订阅实时更新
  useEffect(() => {
    if (!autoRefresh) return;

    // 订阅评论创建事件
    const unsubscribeComments = subscribeToComments((comment: CommentItem) => {
      console.log('收到新评论，添加到列表:', comment.content);
      addComment(comment);
    });

    // 订阅评论更新事件
    const unsubscribeUpdates = subscribeToCommentUpdates((data) => {
      switch (data.action) {
        case 'created':
          console.log('评论被创建，添加到列表:', data.id);
          // 新评论会通过subscribeToComments处理
          break;
        case 'updated':
          console.log('评论被更新，刷新列表:', data.id);
          // 刷新整个列表以获取最新数据
          refresh();
          break;
        case 'deleted':
          console.log('评论被删除，从列表中移除:', data.id);
          removeComment(data.id);
          break;
        default:
          console.log('未知的评论操作:', data.action);
      }
    });

    return () => {
      unsubscribeComments();
      unsubscribeUpdates();
    };
  }, [autoRefresh, subscribeToComments, subscribeToCommentUpdates, addComment, removeComment, refresh]);

  // 初始化时刷新数据
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    comments,
    loading,
    error,
    refresh,
    addComment,
    removeComment,
    updateComment,
  };
} 