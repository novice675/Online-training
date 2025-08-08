import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NewsAPI from "../api/news";
import type { NewsItem } from "../types/news";
import { ArrowLeft, Share, MessageCircle, ThumbsUp } from "lucide-react";
import "./NewsDetail.css";

export default function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // 获取新闻详情
  const fetchNewsDetail = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await NewsAPI.getNewsDetail(id);
      
      if (response.success) {
        setNews(response.data);
        setLikeCount(response.data.likeCount);
        // 从localStorage检查是否已点赞
        const likedNews = JSON.parse(localStorage.getItem('likedNews') || '[]');
        setIsLiked(likedNews.includes(response.data._id));
      } else {
        setError("获取新闻详情失败");
      }
    } catch (err) {
      console.error("获取新闻详情错误:", err);
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  // 格式化日期
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-CN", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).replace(/\//g, '-');
  };

  // 处理返回
  const handleBack = () => {
    navigate(-1);
  };

  // 处理分享
  const handleShare = () => {
    // 这里可以实现分享功能
    console.log("分享新闻:", news?.title);
  };

  // 处理评论
  const handleComment = () => {
    // 跳转到评论页面
    navigate(`/comments/${news?._id}`);
  };

  // 处理点赞
  const handleLike = async () => {
    if (!news) return;
    
    try {
      const action = isLiked ? 'unlike' : 'like';
      const response = await NewsAPI.toggleLike(news._id, action);
      
      if (response.success) {
        // 更新点赞状态
        setIsLiked(!isLiked);
        setLikeCount(response.data.likeCount);
        
        // 更新localStorage
        const likedNews = JSON.parse(localStorage.getItem('likedNews') || '[]');
        if (isLiked) {
          // 取消点赞，从数组中移除
          const newLikedNews = likedNews.filter((id: string) => id !== news._id);
          localStorage.setItem('likedNews', JSON.stringify(newLikedNews));
        } else {
          // 点赞，添加到数组
          likedNews.push(news._id);
          localStorage.setItem('likedNews', JSON.stringify(likedNews));
        }
      }
    } catch (err) {
      console.error("点赞操作失败:", err);
    }
  };

  // 组件挂载时获取数据
  useEffect(() => {
    fetchNewsDetail();
  }, [id]);

  // 加载状态
  if (loading) {
    return (
      <div className="news-detail-container">
        <div className="loading">加载中...</div>
      </div>
    );
  }

  // 错误状态
  if (error || !news) {
    return (
      <div className="news-detail-container">
        <div className="error">
          <p>{error || "新闻不存在"}</p>
          <button onClick={handleBack}>返回</button>
        </div>
      </div>
    );
  }

  return (
    <div className="news-detail-container">
      {/* 头部 */}
      <div className="news-detail-header">
        <button className="back-button" onClick={handleBack}>
          <ArrowLeft size={20} />
        </button>
        <div className="header-content">
          <div className="profile-info">
            <div className="profile-avatar">
              <img 
                src={news.authorId?.avatar || "/images/default-avatar.png"} 
                alt="头像" 
                onError={(e) => {
                  e.currentTarget.src = "/images/default-avatar.png";
                }}
              />
            </div>
            <div className="profile-details">
              <div className="profile-name">
                {news.authorId?.username || "官方发布"}
                <span className="verified-badge">II</span>
              </div>
              <div className="profile-meta">
                {formatDate(news.publishTime)}
                <span className="edited-tag">已编辑</span>
              </div>
            </div>
          </div>
          <button className="follow-button">
            <span>+</span>
            关注
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="news-detail-content">
        {/* 标签 */}
        {news.tags && news.tags.length > 0 && (
          <div className="news-tags">
            {news.tags.map((tag, index) => (
              <span key={index} className="news-tag">
                #{tag}#
              </span>
            ))}
          </div>
        )}

        {/* 标题 */}
        <h1 className="news-title">{news.title}</h1>

        {/* 正文内容 */}
        <div className="news-body">
          <p>{news.detailContent}</p>
        </div>

        {/* 图片内容 */}
        {news.coverImage && (
          <div className="news-image">
            <img src={news.coverImage} alt={news.title} />
          </div>
        )}

        {/* 详情图片 */}
        {news.detailImages && news.detailImages.length > 0 && (
          <div className="news-detail-images">
            {news.detailImages.map((image, index) => (
              <div key={index} className="detail-image">
                <img src={image} alt={`详情图片${index + 1}`} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 底部操作栏 */}
      <div className="news-detail-actions">
        <button className="action-button" onClick={handleShare}>
          <Share size={20} />
          <span>转发</span>
        </button>
        <button className="action-button" onClick={handleComment}>
          <MessageCircle size={20} />
          <span>评论</span>
        </button>
        <button 
          className={`action-button ${isLiked ? 'liked' : ''}`} 
          onClick={handleLike}
        >
          <ThumbsUp size={20} />
          <span>赞 {likeCount > 0 ? `(${likeCount})` : ''}</span>
        </button>
      </div>
    </div>
  );
} 