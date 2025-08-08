import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import CommentAPI, { type CommentItem } from "../utils/commentApi.ts";
import UserAPI from "../api/user.ts";
import { MessageCircle, ThumbsUp, Reply, Send, ChevronRight } from "lucide-react";
import "./CommentSection.css";

interface CommentSectionProps {
  newsId: string;
}

export default function CommentSection({ newsId }: CommentSectionProps) {
  const navigate = useNavigate();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [replyTo, setReplyTo] = useState<CommentItem | null>(null);
  const [commentContent, setCommentContent] = useState("");

  const commentsListRef = useRef<HTMLDivElement>(null);

  // 获取评论列表
  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await CommentAPI.getComments(newsId, {
        page: 1,
        limit: 20,
        sort: 'newest'
      });
      
      if (response.success) {
        setComments(response.data.list);
      } else {
        setError("获取评论失败");
      }
    } catch (err) {
      console.error("获取评论错误:", err);
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  // 跳转到回复详情页面
  const handleViewMoreReplies = (commentId: string) => {
    navigate(`/news/${newsId}/replies?commentId=${commentId}`);
  };

  // 发布评论
  const handleSubmitComment = async () => {
    if (!commentContent.trim()) {
      alert("请输入评论内容");
      return;
    }

    try {
      // 获取用户ID
      const user_id = localStorage.getItem('user_id');
      if (!user_id) {
        alert("请先登录");
        return;
      }

      // 获取用户信息
      const userResponse = await UserAPI.getUserInfo(user_id);
      if (!userResponse.success) {
        alert("获取用户信息失败");
        return;
      }
      const userInfo = userResponse.data;

      // 创建临时评论对象
      const tempComment: CommentItem = {
        _id: `temp-${Date.now()}`,
        newsId: newsId,
        content: commentContent,
        userId: {
          _id: user_id,
          username: userInfo.username,
          avatar: userInfo.avatar || ''
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likeCount: 0,
        replyCount: 0,
        floor: comments.length + 1,
        replies: []
      };

      // 立即添加到UI
      setComments(prev => [...prev, tempComment]);
      
      // 立即滚动到新位置
      scrollToNewComment(tempComment._id);
      
      // 清空表单
      setCommentContent("");
      setShowCommentForm(false);

      // 后台发送请求
      const response = await CommentAPI.createComment(newsId, {
        content: commentContent,
        userId: user_id
      });

      // 用真实数据替换临时数据
      if (response.success) {
        setComments(prev => 
          prev.map(comment => 
            comment._id === tempComment._id 
              ? response.data 
              : comment
          )
        );
      } else {
        // 如果失败，移除临时数据
        setComments(prev => 
          prev.filter(comment => comment._id !== tempComment._id)
        );
        alert("发布失败，请重试");
      }
    } catch (err) {
      console.error("发布评论失败:", err);
      // 移除临时数据
      setComments(prev => 
        prev.filter(comment => comment._id.startsWith('temp-'))
      );
      alert("发布评论失败，请重试");
    }
  };

  // 回复评论
  const handleReplyComment = async () => {
    if (!commentContent.trim() || !replyTo) {
      alert("请输入回复内容");
      return;
    }

    try {
      // 获取用户ID
      const user_id = localStorage.getItem('user_id');
      if (!user_id) {
        alert("请先登录");
        return;
      }

      // 获取用户信息
      const userResponse = await UserAPI.getUserInfo(user_id);
      if (!userResponse.success) {
        alert("获取用户信息失败");
        return;
      }
      const userInfo = userResponse.data;

      // 创建临时回复对象
      const tempReply: CommentItem = {
        _id: `temp-${Date.now()}`,
        newsId: newsId,
        content: commentContent,
        userId: {
          _id: user_id,
          username: userInfo.username,
          avatar: userInfo.avatar || ''
        },
        replyToAuthor: replyTo.userId.username,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likeCount: 0,
        replyCount: 0,
        floor: 1,
        parentId: replyTo._id,
        rootId: replyTo.rootId || replyTo._id
      };

      // 立即添加到对应评论的回复列表
      setComments(prev => 
        prev.map(comment => 
          comment._id === replyTo._id || comment._id === replyTo.rootId
            ? {
                ...comment,
                replies: [...(comment.replies || []), tempReply],
                replyCount: (comment.replyCount || 0) + 1
              }
            : comment
        )
      );
      
      // 立即滚动到新位置
      scrollToNewComment(tempReply._id);
      
      // 清空表单
      setCommentContent("");
      setReplyTo(null);
      setShowCommentForm(false);

      // 后台发送请求
      const response = await CommentAPI.replyComment(replyTo._id, {
        content: commentContent,
        userId: user_id,
        replyToAuthor: replyTo.userId.username
      });

      // 用真实数据替换临时数据
      if (response.success) {
        setComments(prev => 
          prev.map(comment => 
            comment._id === replyTo._id || comment._id === replyTo.rootId
              ? {
                  ...comment,
                  replies: comment.replies?.map(reply => 
                    reply._id === tempReply._id ? response.data : reply
                  ) || []
                }
              : comment
          )
        );
      } else {
        // 如果失败，移除临时数据
        setComments(prev => 
          prev.map(comment => 
            comment._id === replyTo._id || comment._id === replyTo.rootId
              ? {
                  ...comment,
                  replies: comment.replies?.filter(reply => reply._id !== tempReply._id) || [],
                  replyCount: Math.max(0, (comment.replyCount || 0) - 1)
                }
              : comment
          )
        );
        alert("回复失败，请重试");
      }
    } catch (err) {
      console.error("回复评论失败:", err);
      // 移除临时数据
      setComments(prev => 
        prev.map(comment => 
          comment._id === replyTo._id || comment._id === replyTo.rootId
            ? {
                ...comment,
                replies: comment.replies?.filter(reply => !reply._id.startsWith('temp-')) || [],
                replyCount: Math.max(0, (comment.replyCount || 0) - 1)
              }
            : comment
        )
      );
      alert("回复评论失败，请重试");
    }
  };

  // 点赞评论
  const handleLikeComment = async (comment: CommentItem) => {
    try {
      const action = comment.likeCount > 0 ? 'unlike' : 'like';
      const response = await CommentAPI.toggleLikeComment(comment._id, { action });

      if (response.success) {
        // 更新本地状态
        setComments(prevComments => 
          prevComments.map(c => 
            c._id === comment._id 
              ? { ...c, likeCount: response.data.likeCount }
              : c
          )
        );
      }
    } catch (err) {
      console.error("点赞评论失败:", err);
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
    });
  };

  // 滚动到新评论
  const scrollToNewComment = (commentId: string) => {
    console.log('开始滚动到评论:', commentId);
    
    // 立即滚动，不需要等待DOM更新
    setTimeout(() => {
      const commentElement = document.getElementById(`comment-${commentId}`);
      console.log('查找元素:', commentElement);
      
      if (commentElement) {
        // 计算元素相对于当前视口的位置
        const elementRect = commentElement.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const currentScrollTop = window.pageYOffset;
        
        // 计算需要滚动的距离，让元素显示在视口中心偏下位置
        const targetScrollTop = currentScrollTop + elementRect.top - (viewportHeight * 0.3);
        
        // 平滑滚动到目标位置
        window.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth'
        });
        
        // 添加高亮效果
        commentElement.style.backgroundColor = '#fff3cd';
        commentElement.style.transition = 'background-color 0.3s';
        setTimeout(() => {
          commentElement.style.backgroundColor = '';
        }, 2000);
        
        console.log('滚动完成');
      } else {
        console.log('未找到元素，滚动到页面底部');
        // 如果找不到元素，滚动到页面底部
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 50); // 减少延迟，立即滚动
  };

  // 组件挂载时获取数据
  useEffect(() => {
    fetchComments();
  }, [newsId]);



  // 渲染单个评论
  const renderComment = (comment: CommentItem, isReply = false) => (
    <div 
      key={comment._id} 
      id={`comment-${comment._id}`}
      className={`comment-item ${isReply ? 'reply' : ''}`}
    >
      <div className="comment-header">
        <div className="comment-author">
          <img 
            src={comment.userId.avatar && comment.userId.avatar.trim() ? comment.userId.avatar : "/images/1.png"} 
            alt="头像" 
            className="author-avatar"
            onError={(e) => {
              e.currentTarget.src = "/images/1.png";
            }}
          />
          <span className="author-name">{comment.userId.username}</span>
        </div>
        <span className="comment-time">{formatDate(comment.createdAt)}</span>
      </div>
      
      <div className="comment-content">
        {comment.replyToAuthor && (
          <span className="reply-to">@{comment.replyToAuthor}：</span>
        )}
        {comment.content}
      </div>
      
      <div className="comment-actions">
        <button 
          className="action-btn like-btn"
          onClick={() => handleLikeComment(comment)}
        >
          <ThumbsUp size={16} />
          <span>{comment.likeCount || 0}</span>
        </button>
        
        <button 
          className="action-btn reply-btn"
          onClick={() => {
            setReplyTo(comment);
            setShowCommentForm(true);
          }}
        >
          <Reply size={16} />
          <span>回复</span>
        </button>
      </div>
      
      {/* 显示回复列表 */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="replies-container">
          {/* 只显示前2条回复 */}
          {comment.replies.slice(0, 2).map((reply: CommentItem) => renderComment(reply, true))}
          
          {/* 如果回复数量超过2条，显示查看更多按钮 */}
          {comment.replyCount > 2 && (
            <div className="view-more-replies">
              <button 
                className="view-more-btn"
                onClick={() => handleViewMoreReplies(comment._id)}
              >
                <span>查看全部{comment.replyCount}条回复</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="comment-section">
      {/* 评论列表 */}
      <div className="comments-list" ref={commentsListRef}>
        {loading ? (
          <div className="loading">加载中...</div>
        ) : error ? (
          <div className="error">
            <p>{error}</p>
            <button onClick={fetchComments}>重试</button>
          </div>
        ) : comments.length === 0 ? (
          <div className="empty">暂无评论，快来抢沙发吧！</div>
        ) : (
          comments.map(comment => renderComment(comment))
        )}
      </div>

      {/* 固定在底部的写评论输入框 */}
      <div className="fixed-bottom-actions">
        <div 
          className="comment-input-trigger"
          onClick={() => setShowCommentForm(true)}
        >
          <input
            type="text"
            placeholder="哎呦，不错哦，快来写条评论吧"
            readOnly
            className="comment-trigger-input"
          />
          <MessageCircle size={20} className="trigger-icon" />
        </div>
      </div>

      {/* 固定在底部的评论表单 */}
      {showCommentForm && (
        <div className="fixed-comment-form">
          <div className="form-header">
            <span>
              {replyTo ? `回复 @${replyTo.userId.username}` : '发表评论'}
            </span>
            <button 
              className="close-btn"
              onClick={() => {
                setShowCommentForm(false);
                setReplyTo(null);
                setCommentContent("");
              }}
            >
              ×
            </button>
          </div>
          
          <div className="form-content">
            <textarea
              placeholder="请输入评论内容..."
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              className="content-input"
              rows={4}
            />
            <div className="form-actions">
              <button 
                className="submit-btn"
                onClick={replyTo ? handleReplyComment : handleSubmitComment}
                disabled={!commentContent.trim()}
              >
                <Send size={16} />
                发送
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 