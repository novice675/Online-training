import React from "react";
import { useNavigate } from "react-router-dom";
import type { NewsItem } from "../../types/news";
import { RenderType, Channel } from "../../types/news";
import { useRealTimeNews } from "../../composables/useRealTimeNews";

export default function Policy() {
  const navigate = useNavigate();

  // 使用实时新闻Hook
  const {
    newsList,
    loading,
    error,
    refresh
  } = useRealTimeNews({
    channel: Channel.POLICY,
    page: 1,
    limit: 20,
    autoRefresh: true,
    status: '审核成功' // 只显示审核成功的新闻
  });

  // 处理新闻点击
  const handleNewsClick = (news: NewsItem) => {
    console.log("点击新闻:", news.title);
    // 跳转到详情页
    navigate(`/news/${news._id}`);
  };

  // 格式化日期
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // 渲染标签
  const renderTags = (tags: string[]) => {
    return tags.map((tag, index) => {
      const isTop = tag.includes('置顶');
      const isHot = tag.includes('热点');
      const className = `news-tag ${isTop ? 'top' : ''} ${isHot ? 'hot' : ''}`;
      
      return (
        <span key={index} className={className}>
          {tag}
        </span>
      );
    });
  };

  // 根据renderType渲染不同的新闻项
  const renderNewsItem = (news: NewsItem) => {
    switch (news.renderType) {
      case RenderType.TEXT_ONLY:
        return (
          <div
            className="news-item text-only"
            onClick={() => handleNewsClick(news)}
          >
            <h3 className="news-title">{news.title}</h3>
            <div className="news-footer">
              {renderTags(news.tags)}
              {news.authorId?.username && <span className="news-author">{news.authorId.username}</span>}
              <span className="news-date">{formatDate(news.publishTime)}</span>
              <span className="news-likes">{news.likeCount}</span>
            </div>
          </div>
        );

      case RenderType.IMAGE_FULL:
        return (
          <div
            className="news-item image-full"
            onClick={() => handleNewsClick(news)}
          >
            <h3 className="news-title">{news.title}</h3>
            {news.coverImage && (
              <div className="news-image">
                <img src={news.coverImage} alt={news.title} />
              </div>
            )}
            <div className="news-footer">
              {renderTags(news.tags)}
              {news.authorId?.username && <span className="news-author">{news.authorId.username}</span>}
              <span className="news-date">{formatDate(news.publishTime)}</span>
              <span className="news-likes">{news.likeCount}</span>
            </div>
          </div>
        );

      case RenderType.IMAGE_RIGHT:
  return (
          <div
            className="news-item image-right"
            onClick={() => handleNewsClick(news)}
          >
            <div className="news-content">
              <div className="news-main">
                <h3 className="news-title">{news.title}</h3>
                {news.detailContent && (
                  <p className="news-summary">
                    {news.detailContent.substring(0, 50)}...
                  </p>
                )}
              </div>
        <div className="news-footer">
                {renderTags(news.tags)}
                {news.authorId?.username && <span className="news-author">{news.authorId.username}</span>}
                <span className="news-date">
                  {formatDate(news.publishTime)}
                </span>
                <span className="news-likes">{news.likeCount}</span>
        </div>
      </div>
            {news.coverImage && (
              <div className="news-right-image">
                <img src={news.coverImage} alt={news.title} />
              </div>
            )}
          </div>
        );

      default:
        return (
                    <div
            className="news-item text-only"
            onClick={() => handleNewsClick(news)}
          >
            <h3 className="news-title">{news.title}</h3>
        <div className="news-footer">
              {renderTags(news.tags)}
              {news.authorId?.username && <span className="news-author">{news.authorId.username}</span>}
              <span className="news-date">{formatDate(news.publishTime)}</span>
              <span className="news-likes">{news.likeCount}</span>
            </div>
        </div>
        );
    }
  };

  // 加载状态
  if (loading) {
    return (
      <div className="content-area">
        <div className="loading">加载中...</div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="content-area">
        <div className="error">
          <p>{error}</p>
          <button onClick={refresh}>重试</button>
        </div>
      </div>
    );
  }

  // 空数据状态
  if (newsList.length === 0) {
    return (
      <div className="content-area">
        <div className="empty">暂无政策数据</div>
      </div>
    );
  }

  return (
    <div className="content-area">
      {newsList.map((news) => (
        <div key={news._id}>{renderNewsItem(news)}</div>
      ))}
    </div>
  );
}