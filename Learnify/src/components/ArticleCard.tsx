import React from 'react';
import './ArticleCard.css';

export interface Article {
  _id: string;
  title: string;
  detailContent: string;
  status: '未审核' | '审核成功' | '审核失败';
  publishTime: string;
  channel: string;
  renderType: string;
}

interface ArticleCardProps {
  article: Article;
  onEdit: (articleId: string) => void;
  onDelete: (articleId: string) => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, onEdit, onDelete }) => {
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(/\//g, '/');
    } catch {
      return dateString;
    }
  };

  const getStatusButton = (status: string) => {
    const statusConfig = {
      '未审核': { className: 'status-btn pending', text: '未审核' },
      '审核成功': { className: 'status-btn success', text: '审核成功' },
      '审核失败': { className: 'status-btn failed', text: '审核失败' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['未审核'];
    
    return (
      <button className={config.className} disabled>
        {config.text}
      </button>
    );
  };

  const getTitlePreview = (title: string, maxLength: number = 20) => {
    return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
  };

  const getContentPreview = (content: string, maxLength: number = 50) => {
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  };

  return (
    <div className="article-card">
      <div className="article-info">
        <h3 className="article-title" title={article.title}>
          {getTitlePreview(article.title)}
        </h3>
        <p className="article-preview" title={article.detailContent}>
          {getContentPreview(article.detailContent)}
        </p>
        <div className="article-meta">
          <span className="article-channel">{article.channel}</span>
          <span className="article-time">{formatDate(article.publishTime)}</span>
        </div>
      </div>
      <div className="article-actions">
        {getStatusButton(article.status)}
        <button className="edit-btn" onClick={() => onEdit(article._id)} title="编辑文章">
          编辑
        </button>
        <button className="delete-btn" onClick={() => onDelete(article._id)} title="删除文章">
          删除
        </button>
      </div>
    </div>
  );
};

export default ArticleCard; 