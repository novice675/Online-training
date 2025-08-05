import React, { useState, useEffect } from "react";
import NewsAPI from "../../api/news";
import type { NewsItem } from "../../types/news";
import { RenderType } from "../../types/news";
import { Swiper, Grid } from "antd-mobile";
import styles from '../../cssmodule/recommend.module.css'
import { useNavigate } from "react-router-dom";

export default function Recommend() {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate=useNavigate()
  const items = ["/images/3.png", "/images/2.png", "/images/1.png"];

    // 获取新闻数据
  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await NewsAPI.getNewsList({
        page: 1,
        limit: 20,
      });
      
      if (response.success) {
        // 对新闻列表进行排序：置顶的排在前面
        const sortedNews = response.data.list.sort((a, b) => {
          const aIsTop = a.tags.some(tag => tag.includes('置顶'));
          const bIsTop = b.tags.some(tag => tag.includes('置顶'));
          
          if (aIsTop && !bIsTop) return -1; // a置顶，b不置顶，a排在前面
          if (!aIsTop && bIsTop) return 1;  // a不置顶，b置顶，b排在前面
          return 0; // 都置顶或都不置顶，保持原有顺序
        });
        
        setNewsList(sortedNews);
      } else {
        setError("获取新闻数据失败");
      }
    } catch (err) {
      console.error("获取新闻数据错误:", err);
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  // 处理新闻点击
  const handleNewsClick = (news: NewsItem) => {
    console.log("点击新闻:", news.title);
    // 这里可以添加跳转到详情页的逻辑
    // 例如：navigate(`/news/${news._id}`);
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
              {news.author && <span className="news-author">{news.author}</span>}
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
              {news.author && <span className="news-author">{news.author}</span>}
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
                {news.author && <span className="news-author">{news.author}</span>}
                <span className="news-date">
                  {formatDate(news.publishTime)}
                </span>
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

      default:
        return (
          <div
            className="news-item text-only"
            onClick={() => handleNewsClick(news)}
          >
            <h3 className="news-title">{news.title}</h3>
            <div className="news-footer">
              {renderTags(news.tags)}
              {news.author && <span className="news-author">{news.author}</span>}
              <span className="news-date">{formatDate(news.publishTime)}</span>
              <span className="news-likes">{news.likeCount}</span>
            </div>
          </div>
        );
    }
  };

  // 组件挂载时获取数据
  useEffect(() => {
    fetchNews();
  }, []);

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
          <button onClick={fetchNews}>重试</button>
        </div>
      </div>
    );
  }

  // 空数据状态
  if (newsList.length === 0) {
    return (
      <div className="content-area">
        <div className="empty">暂无新闻数据</div>
      </div>
    );
  }

  return (
    <div>
      <Swiper autoplay loop>
        {items.map((src, index) => (
          <Swiper.Item key={index}>
            <img src={src} alt="" style={{ width: "100%", display: "block" }} />
          </Swiper.Item>
        ))}
      </Swiper>
      <Grid columns={4} gap={15} style={{marginTop:'15px',marginBottom:'15px'}}>
        <Grid.Item className={styles['grid-demo-item-block']}>
          <div style={{textAlign:'center'}}>
            <img src="/1.png" alt="" className={styles.img}/>
            可租房源
          </div>
        </Grid.Item>
        <Grid.Item onClick={()=>{navigate('/visitor')}} className={styles['grid-demo-item-block']}>
          <div style={{textAlign:'center'}}>
            <img src="/2.png" alt="" className={styles.img}/>
            访客登记
          </div>
        </Grid.Item>
        <Grid.Item className={styles['grid-demo-item-block']}>
          <div style={{textAlign:'center'}}>
            <img src="3.png" alt="" className={styles.img}/>
            政策申报
          </div>
        </Grid.Item>
        <Grid.Item onClick={()=>{navigate('/company')}} className={styles['grid-demo-item-block']}>
          <div style={{textAlign:'center'}}>
            <img src="4.png" alt="" className={styles.img}/>
            企业入驻
          </div>
        </Grid.Item>
        <Grid.Item className={styles['grid-demo-item-block']}>
          <div style={{textAlign:'center'}}>
            <img src="5.png" alt="" className={styles.img}/>
            公寓入住
          </div>
        </Grid.Item>
        <Grid.Item className={styles['grid-demo-item-block']}>
          <div style={{textAlign:'center'}}>
            <img src="6.png" alt="" className={styles.img}/>
            圈子活动
          </div>
        </Grid.Item>
        <Grid.Item  className={styles['grid-demo-item-block']}>
          <div style={{textAlign:'center'}}>
            <img src="7.png" alt="" className={styles.img}/>
            场地预约
          </div>
        </Grid.Item>
        <Grid.Item className={styles['grid-demo-item-block']}>
          <div style={{textAlign:'center'}}>
            <img src="8.png" alt="" className={styles.img}/>
            园区信息
          </div>
        </Grid.Item>
        
      </Grid>
      <div className="content-area">
      {newsList.map((news) => (
        <div key={news._id}>{renderNewsItem(news)}</div>
      ))}

    </div>
    </div>
    
  );
}
