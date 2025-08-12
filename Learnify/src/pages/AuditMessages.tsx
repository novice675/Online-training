import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import ArticleCard from '../components/ArticleCard';
import type { Article } from '../components/ArticleCard';
import NewsAPI from '../api/news';
import './AuditMessages.css';

const AuditMessages: React.FC = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('全部');
  const [searchKeyword, setSearchKeyword] = useState('');
  const userId = localStorage.getItem('user_id');
  
  // 防抖定时器引用
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // 搜索状态引用，用于防抖
  const searchKeywordRef = useRef<string>('');

  const fetchUserArticles = useCallback(async (page: number = 1, reset: boolean = false) => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page,
        limit: pageSize,
        status: statusFilter === '全部' ? undefined : statusFilter,
        search: searchKeywordRef.current || undefined
      };
      
      const response = await NewsAPI.getUserArticles(userId, params);
      
      if (response.success) {
        const articles = response.data.list;
        const pagination = response.data.pagination;
        
        if (reset) {
          setArticles(articles);
          setCurrentPage(1);
        } else {
          setArticles(articles);
        }
        setTotal(pagination.total);
      } else {
        setError('获取文章列表失败');
      }
    } catch (err) {
      console.error('获取文章列表失败:', err);
      setError('获取文章列表失败，请重试');
    } finally {
      setLoading(false);
    }
  }, [userId, statusFilter, pageSize]);

  // 防抖搜索函数
  const debouncedSearch = useCallback((keyword: string) => {
    // 清除之前的定时器
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // 设置新的定时器，500ms后执行搜索
    searchTimeoutRef.current = setTimeout(() => {
      searchKeywordRef.current = keyword;
      fetchUserArticles(1, true);
    }, 500);
  }, [fetchUserArticles]);

  // 处理搜索输入变化
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchKeyword(value);
    debouncedSearch(value);
  };

  // 处理搜索按钮点击
  const handleSearchClick = () => {
    // 立即搜索，不使用防抖
    searchKeywordRef.current = searchKeyword;
    fetchUserArticles(1, true);
  };

  // 处理状态筛选变化
  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
    // 重置搜索关键词
    setSearchKeyword('');
    searchKeywordRef.current = '';
  };

  // 处理分页变化
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchUserArticles(page);
  };

  // 处理编辑
  const handleEdit = (articleId: string) => {
    navigate('/publish-news', {
      state: {
        editMode: true,
        articleId: articleId
      }
    });
  };

  // 处理删除
  const handleDelete = async (articleId: string) => {
    if (!confirm('确定要删除这篇文章吗？删除后无法恢复。')) {
      return;
    }

    try {
      const response = await NewsAPI.deleteNews(articleId);
      if (response.success) {
        // 从本地列表中移除文章
        setArticles(prev => prev.filter(article => article._id !== articleId));
        // 更新总数
        setTotal(prev => prev - 1);
        alert('删除成功');
      } else {
        alert(response.message || '删除失败，请重试');
      }
    } catch (err) {
      console.error('删除失败:', err);
      alert('删除失败，请重试');
    }
  };

  // 初始加载
  useEffect(() => {
    fetchUserArticles(1, true);
  }, [fetchUserArticles]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // 计算分页信息
  const totalPages = Math.ceil(total / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  return (
    <div className="audit-messages">
      {/* 页面头部 */}
      <div className="page-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ←
        </button>
        <h1>审核消息</h1>
      </div>

      {/* 筛选和搜索区域 */}
      <div className="filter-section">
        {/* 状态筛选 */}
        <div className="status-filter">
          <div className="filter-buttons">
            {['全部', '未审核', '审核成功', '审核失败'].map((status) => (
              <button
                key={status}
                className={`filter-btn ${statusFilter === status ? 'active' : ''}`}
                onClick={() => handleStatusFilterChange(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* 搜索区域 */}
        <div className="search-section">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              className="search-input"
              placeholder="搜索文章标题或内容..."
              value={searchKeyword}
              onChange={handleSearchInputChange}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchClick()}
            />
            <button className="search-btn" onClick={handleSearchClick}>
              搜索
            </button>
          </div>
        </div>
      </div>

      {/* 文章列表 */}
      <div className="articles-list">
        {loading ? (
          <div className="loading">加载中...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : articles.length === 0 ? (
          <div className="empty-state">
            <p>暂无文章</p>
          </div>
        ) : (
          articles.map((article) => (
            <ArticleCard
              key={article._id}
              article={article}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            上一页
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`page-btn ${currentPage === page ? 'active' : ''}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}
          
          <button
            className="page-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            下一页
          </button>
        </div>
      )}

      {/* 统计信息 */}
      {total > 0 && (
        <div className="stats-info">
          显示第 {startItem}-{endItem} 条，共 {total} 条
        </div>
      )}
    </div>
  );
};

export default AuditMessages; 