import { useEffect, useRef, useCallback } from 'react';
import socketClient from '../utils/socketClient';
import type { NewsItem } from '../types/news';

interface UseSocketOptions {
  autoConnect?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

interface UseSocketReturn {
  connected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  subscribeToNews: (callback: (news: NewsItem) => void) => () => void;
  subscribeToComments: (callback: (comment: any) => void) => () => void;
  subscribeToArticleUpdates: (callback: (data: { id: string; action: 'created' | 'updated' | 'deleted' | 'statusChanged' }) => void) => () => void;
  subscribeToTenantUpdates: (callback: (data: { id: string; action: 'created' | 'updated' | 'deleted' }) => void) => () => void;
  subscribeToPersonUpdates: (callback: (data: { id: string; action: 'created' | 'updated' | 'deleted' }) => void) => () => void;
}

export function useSocket(options: UseSocketOptions = {}): UseSocketReturn {
  const { autoConnect = true, onConnect, onDisconnect } = options;
  const isConnectedRef = useRef(false);
  const eventCleanupRef = useRef<(() => void)[]>([]);

  // 连接Socket
  const connect = useCallback(async () => {
    try {
      await socketClient.connect();
      isConnectedRef.current = true;
      onConnect?.();
    } catch (error) {
      console.error('Socket连接失败:', error);
    }
  }, [onConnect]);

  // 断开连接
  const disconnect = useCallback(() => {
    socketClient.disconnect();
    isConnectedRef.current = false;
    onDisconnect?.();
  }, [onDisconnect]);

  // 订阅新闻事件
  const subscribeToNews = useCallback((callback: (news: NewsItem) => void) => {
    const handleArticleCreated = (data: NewsItem) => {
      console.log('收到新文章:', data);
      callback(data);
    };

    const handleArticleDeleted = (data: { id: string; title: string }) => {
      console.log('文章被删除:', data);
      // 这里可以触发重新获取新闻列表
      callback({ _id: data.id, title: data.title } as NewsItem);
    };

    socketClient.on('article_created', handleArticleCreated);
    socketClient.on('article_deleted', handleArticleDeleted);

    // 返回清理函数
    const cleanup = () => {
      socketClient.off('article_created', handleArticleCreated);
      socketClient.off('article_deleted', handleArticleDeleted);
    };

    eventCleanupRef.current.push(cleanup);
    return cleanup;
  }, []);

  // 订阅评论事件
  const subscribeToComments = useCallback((callback: (comment: any) => void) => {
    const handleCommentCreated = (data: any) => {
      console.log('收到新评论:', data);
      callback(data);
    };

    const handleCommentDeleted = (data: { id: string }) => {
      console.log('评论被删除:', data);
      callback({ _id: data.id, deleted: true });
    };

    socketClient.on('comment_created', handleCommentCreated);
    socketClient.on('comment_deleted', handleCommentDeleted);

    // 返回清理函数
    const cleanup = () => {
      socketClient.off('comment_created', handleCommentCreated);
      socketClient.off('comment_deleted', handleCommentDeleted);
    };

    eventCleanupRef.current.push(cleanup);
    return cleanup;
  }, []);

  // 订阅文章更新事件
  const subscribeToArticleUpdates = useCallback((callback: (data: { id: string; action: 'created' | 'updated' | 'deleted' | 'statusChanged' }) => void) => {
    const handleArticleCreated = (data: NewsItem) => {
      callback({ id: data._id, action: 'created' });
    };

    const handleArticleUpdated = (data: NewsItem) => {
      callback({ id: data._id, action: 'updated' });
    };

    const handleArticleDeleted = (data: { id: string; title: string }) => {
      callback({ id: data.id, action: 'deleted' });
    };

    socketClient.on('article_created', handleArticleCreated);
    socketClient.on('article_updated', handleArticleUpdated);
    socketClient.on('article_deleted', handleArticleDeleted);

    // 返回清理函数
    const cleanup = () => {
      socketClient.off('article_created', handleArticleCreated);
      socketClient.off('article_updated', handleArticleUpdated);
      socketClient.off('article_deleted', handleArticleDeleted);
    };

    eventCleanupRef.current.push(cleanup);
    return cleanup;
  }, []);

  // 自动连接
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    // 清理函数
    return () => {
      eventCleanupRef.current.forEach(cleanup => cleanup());
      eventCleanupRef.current = [];
    };
  }, [autoConnect, connect]);

  // 订阅租户更新事件
  const subscribeToTenantUpdates = useCallback((callback: (data: { id: string; action: 'created' | 'updated' | 'deleted' }) => void) => {
    const handleTenantCreated = (data: any) => {
      callback({ id: data._id, action: 'created' });
    };

    const handleTenantUpdated = (data: any) => {
      callback({ id: data._id, action: 'updated' });
    };

    const handleTenantDeleted = (data: { id: string; name: string }) => {
      callback({ id: data.id, action: 'deleted' });
    };

    socketClient.on('tenant_created', handleTenantCreated);
    socketClient.on('tenant_updated', handleTenantUpdated);
    socketClient.on('tenant_deleted', handleTenantDeleted);

    // 返回清理函数
    const cleanup = () => {
      socketClient.off('tenant_created', handleTenantCreated);
      socketClient.off('tenant_updated', handleTenantUpdated);
      socketClient.off('tenant_deleted', handleTenantDeleted);
    };

    eventCleanupRef.current.push(cleanup);
    return cleanup;
  }, []);

  // 订阅人员更新事件
  const subscribeToPersonUpdates = useCallback((callback: (data: { id: string; action: 'created' | 'updated' | 'deleted' }) => void) => {
    const handlePersonCreated = (data: any) => {
      callback({ id: data._id, action: 'created' });
    };

    const handlePersonUpdated = (data: any) => {
      callback({ id: data._id, action: 'updated' });
    };

    const handlePersonDeleted = (data: { id: string; name: string }) => {
      callback({ id: data.id, action: 'deleted' });
    };

    socketClient.on('person_created', handlePersonCreated);
    socketClient.on('person_updated', handlePersonUpdated);
    socketClient.on('person_deleted', handlePersonDeleted);

    // 返回清理函数
    const cleanup = () => {
      socketClient.off('person_created', handlePersonCreated);
      socketClient.off('person_updated', handlePersonUpdated);
      socketClient.off('person_deleted', handlePersonDeleted);
    };

    eventCleanupRef.current.push(cleanup);
    return cleanup;
  }, []);

  return {
    connected: socketClient.connected,
    connect,
    disconnect,
    subscribeToNews,
    subscribeToComments,
    subscribeToArticleUpdates,
    subscribeToTenantUpdates,
    subscribeToPersonUpdates,
  };
} 