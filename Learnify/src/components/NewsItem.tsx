import React from 'react';
import type { NewsItem } from '../types/news';
import { RenderType } from '../types/news';

interface NewsItemProps {
  news: NewsItem;
  onClick?: (news: NewsItem) => void;
}

// 格式化日期
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// 纯文字样式组件
const TextOnlyNews: React.FC<NewsItemProps> = ({ news, onClick }) => (
  <div className="news-item text-only" onClick={() => onClick?.(news)}>
    <h3 className="news-title">{news.title}</h3>
    <div className="news-footer">
      {news.tags.map((tag, index) => (
        <span key={index} className="news-tag">{tag}</span>
      ))}
      <span className="news-date">{formatDate(news.publishTime)}</span>
      <span className="news-likes">{news.likeCount}</span>
    </div>
  </div>
);

// 大图样式组件
const ImageFullNews: React.FC<NewsItemProps> = ({ news, onClick }) => (
  <div className="news-item image-full" onClick={() => onClick?.(news)}>
    <h3 className="news-title">{news.title}</h3>
    {news.coverImage && (
      <div className="news-image">
        <img src={news.coverImage} alt={news.title} />
      </div>
    )}
    <div className="news-footer">
      {news.tags.map((tag, index) => (
        <span key={index} className="news-tag">{tag}</span>
      ))}
      <span className="news-date">{formatDate(news.publishTime)}</span>
      <span className="news-likes">{news.likeCount}</span>
    </div>
  </div>
);

// 右侧小图样式组件
const ImageRightNews: React.FC<NewsItemProps> = ({ news, onClick }) => (
  <div className="news-item image-right" onClick={() => onClick?.(news)}>
    <div className="news-content">
      <h3 className="news-title">{news.title}</h3>
      {news.detailContent && (
        <p className="news-summary">{news.detailContent.substring(0, 100)}...</p>
      )}
      <div className="news-footer">
        {news.tags.map((tag, index) => (
          <span key={index} className="news-tag">{tag}</span>
        ))}
        <span className="news-date">{formatDate(news.publishTime)}</span>
        <span className="news-likes">{news.likeCount}</span>
      </div>
    </div>
    {news.rightImage && (
      <div className="news-right-image">
        <img src={news.rightImage} alt={news.title} />
      </div>
    )}
  </div>
);

// 主新闻项组件
const NewsItemComponent: React.FC<NewsItemProps> = ({ news, onClick }) => {
  // 根据渲染类型选择不同的组件
  switch (news.renderType) {
    case RenderType.TEXT_ONLY:
      return <TextOnlyNews news={news} onClick={onClick} />;
    
    case RenderType.IMAGE_FULL:
      return <ImageFullNews news={news} onClick={onClick} />;
    
    case RenderType.IMAGE_RIGHT:
      return <ImageRightNews news={news} onClick={onClick} />;
    
    default:
      return <TextOnlyNews news={news} onClick={onClick} />;
  }
};

export default NewsItemComponent; 