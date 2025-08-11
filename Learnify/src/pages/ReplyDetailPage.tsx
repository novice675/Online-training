import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, MessageCircle, ThumbsUp, Reply, Send } from "lucide-react";
import CommentAPI, { type CommentItem } from "../utils/commentApi.ts";
import UserAPI from "../api/user.ts";
import "./ReplyDetailPage.css";

interface ReplyDetailPageProps {}

export default function ReplyDetailPage({}: ReplyDetailPageProps) {
  const { newsId } = useParams<{ newsId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const commentId = searchParams.get('commentId');
  const [mainComment, setMainComment] = useState<CommentItem | null>(null);
  const [replies, setReplies] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [replyTo, setReplyTo] = useState<CommentItem | null>(null);
  const [commentContent, setCommentContent] = useState("");

  const repliesListRef = useRef<HTMLDivElement>(null);

  // 滚动到新评论
  const scrollToNewComment = (domKey: string) => {
    const id = `reply-${domKey}`;
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const targetTop = window.pageYOffset + rect.top - window.innerHeight * 0.3;
      window.scrollTo({ top: targetTop, behavior: 'smooth' });
      el.style.backgroundColor = '#fff3cd';
      el.style.transition = 'background-color 0.3s';
      setTimeout(() => { el.style.backgroundColor = ''; }, 1600);
    });
  };

  // 获取主评论
  const fetchMainComment = async () => {
    if (!newsId) return;
    
    try {
      if (commentId) {
        // 如果有commentId参数，直接获取该评论作为主评论
        const response = await CommentAPI.getComments(newsId, { page: 1, limit: 100 });
        if (response.success) {
          const targetComment = response.data.list.find(comment => comment._id === commentId);
          if (targetComment) {
            setMainComment(targetComment);
          }
        }
      } else {
        // 否则获取第一条评论作为主评论
        const response = await CommentAPI.getComments(newsId, { page: 1, limit: 1 });
        if (response.success && response.data.list.length > 0) {
          setMainComment(response.data.list[0]);
        }
      }
    } catch (err) {
      console.error("获取主评论失败:", err);
    }
  };

  // 获取回复列表
  const fetchReplies = async () => {
    if (!newsId || !mainComment) return;
    
    try {
      setLoading(true);
      const response = await CommentAPI.getReplies(mainComment._id, { 
        page: 1, 
        limit: 1000 // 获取所有回复，不使用分页
      });
      
      if (response.success) {
        setReplies(response.data.list);
      }
    } catch (err) {
      console.error("获取回复失败:", err);
      setError("获取回复失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时获取数据
  useEffect(() => {
    const initData = async () => {
      await fetchMainComment();
    };
    initData();
  }, [newsId]);

  // 主评论获取后加载回复
  useEffect(() => {
    if (mainComment) {
      fetchReplies();
    }
  }, [mainComment]);



  // 发布回复
  const handleSubmitReply = async () => {
    if (!commentContent.trim() || !mainComment) {
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
      const tempClientKey = `ck-${Date.now()}`;
      const tempReply: CommentItem = {
        _id: `temp-${Date.now()}`,
        clientKey: tempClientKey,
        newsId: newsId || '',
        content: commentContent,
        userId: {
          _id: user_id,
          username: userInfo.username,
          avatar: userInfo.avatar || ''
        },
        replyToAuthor: mainComment.userId.username,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likeCount: 0,
        replyCount: 0,
        floor: 1,
        parentId: mainComment._id,
        rootId: mainComment._id
      };

      // 立即添加到回复列表末尾（乐观渲染）
      setReplies(prev => [...prev, tempReply]);
      
      // 立即滚动到新位置
      scrollToNewComment(tempReply.clientKey || tempReply._id);
      
      // 清空表单
      setCommentContent("");
      setShowCommentForm(false);

      // 后台发送请求
      const response = await CommentAPI.replyComment(mainComment._id, {
        content: commentContent,
        userId: user_id,
        replyToAuthor: mainComment.userId.username
      });

      // 用真实数据替换临时数据
      if (response.success) {
        setReplies(prev => 
          prev.map(reply => 
            reply._id === tempReply._id 
              ? { ...response.data, clientKey: tempReply.clientKey }
              : reply
          )
        );
      } else {
        // 如果失败，移除临时数据
        setReplies(prev => 
          prev.filter(reply => reply._id !== tempReply._id)
        );
        alert("发布失败，请重试");
      }
    } catch (err) {
      console.error("发布回复失败:", err);
      // 移除临时数据
      setReplies(prev => 
        prev.filter(reply => reply._id.startsWith('temp-'))
      );
      alert("发布回复失败，请重试");
    }
  };

  // 回复其他回复
  const handleReplyToReply = async () => {
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
        newsId: newsId || '',
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

      // 立即添加到回复列表末尾（乐观渲染）
      setReplies(prev => [...prev, tempReply]);
      
      // 立即滚动到新位置
      scrollToNewComment(tempReply.clientKey || tempReply._id);
      
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
        setReplies(prev => 
          prev.map(reply => 
            reply._id === tempReply._id ? { ...response.data, clientKey: tempReply.clientKey } : reply
          )
        );
      } else {
        // 如果失败，移除临时数据
        setReplies(prev => 
          prev.filter(reply => reply._id !== tempReply._id)
        );
        alert("回复失败，请重试");
      }
    } catch (err) {
      console.error("回复失败:", err);
      // 移除临时数据
      setReplies(prev => 
        prev.filter(reply => reply._id.startsWith('temp-'))
      );
      alert("回复失败，请重试");
    }
  };

  // 点赞回复
  const handleLikeReply = async (reply: CommentItem) => {
    try {
      const response = await CommentAPI.toggleLikeComment(reply._id, {
        action: 'like'
      });

      if (response.success) {
        setReplies(prev => 
          prev.map(item => 
            item._id === reply._id 
              ? { ...item, likeCount: response.data.likeCount }
              : item
          )
        );
      }
    } catch (err) {
      console.error("点赞失败:", err);
    }
  };

  // 渲染单个回复
  const renderReply = (reply: CommentItem) => (
    <div 
      key={reply.clientKey || reply._id}
      id={`reply-${reply.clientKey || reply._id}`}
      className="reply-item"
    >
      <div className="reply-header">
        <div className="reply-author">
          <img 
            src={reply.userId.avatar && reply.userId.avatar.trim() ? reply.userId.avatar : "/images/1.png"} 
            alt={reply.userId.username}
            className="author-avatar"
            onError={(e) => {
              e.currentTarget.src = "/images/1.png";
            }}
          />
          <span className="author-name">{reply.userId.username}</span>
          <span className="reply-time">{new Date(reply.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
      
      <div className="reply-content">
        {reply.replyToAuthor && (
          <span className="reply-to">@{reply.replyToAuthor}：</span>
        )}
        {reply.content}
      </div>
      
      <div className="reply-actions">
        <button
          className={`action-btn like-btn`}
          onClick={() => handleLikeReply(reply)}
        >
          <ThumbsUp size={16} />
          <span>{reply.likeCount || 0}</span>
        </button>
        
        <button
          className="action-btn reply-btn"
          onClick={() => {
            setReplyTo(reply);
            setShowCommentForm(true);
          }}
        >
          <Reply size={16} />
          <span>回复</span>
        </button>
      </div>
    </div>
  );

  const handleBack = () => {
    navigate(-1);
  };

  if (!newsId) {
    return <div className="reply-detail-page"><div className="error">新闻ID不存在</div></div>;
  }

  return (
    <div className="reply-detail-page">
      {/* 头部 */}
      <div className="reply-detail-header">
        <button className="back-button" onClick={handleBack}>
          <ArrowLeft size={20} />
        </button>
        <h1>回复详情</h1>
      </div>

      {/* 主评论 */}
      {mainComment && (
        <div className="main-comment">
          <div className="comment-header">
            <div className="comment-author">
              <img 
                src={mainComment.userId.avatar && mainComment.userId.avatar.trim() ? mainComment.userId.avatar : "/images/1.png"} 
                alt={mainComment.userId.username}
                className="author-avatar"
                onError={(e) => {
                  e.currentTarget.src = "/images/1.png";
                }}
              />
              <div className="author-info">
                <span className="author-name">{mainComment.userId.username}</span>
                <span className="comment-time">{new Date(mainComment.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <div className="comment-content">
            {mainComment.content}
          </div>
          
          <div className="comment-actions">
            <button className="action-btn like-btn">
              <ThumbsUp size={16} />
              <span>{mainComment.likeCount || 0}</span>
            </button>
            
            <button className="action-btn reply-btn">
              <Reply size={16} />
              <span>回复</span>
            </button>
          </div>
        </div>
      )}

      {/* 回复统计 */}
      <div className="replies-header">
        <span className="replies-count">相关回复共{replies.length}条</span>
        <span className="sort-option">按时间</span>
      </div>

      {/* 回复列表 */}
      <div className="replies-list" ref={repliesListRef}>
        {loading ? (
          <div className="loading">加载中...</div>
        ) : error ? (
          <div className="error">
            <p>{error}</p>
            <button onClick={() => fetchReplies()}>重试</button>
          </div>
        ) : replies.length === 0 ? (
          <div className="empty">暂无回复，快来抢沙发吧！</div>
        ) : (
          <>
            {replies.map((reply) => (
              renderReply(reply)
            ))}
          </>
        )}
      </div>

      {/* 固定在底部的写回复输入框 */}
      <div className="fixed-bottom-actions">
        <div
          className="comment-input-trigger"
          onClick={() => setShowCommentForm(true)}
        >
          <input
            type="text"
            placeholder="这里需要一条查重率0%的回复"
            readOnly
            className="comment-trigger-input"
          />
          <MessageCircle size={20} className="trigger-icon" />
        </div>
      </div>

      {/* 固定在底部的回复表单 */}
      {showCommentForm && (
        <div className="fixed-comment-form">
          <div className="form-header">
            <span>{replyTo ? `回复 @${replyTo.userId.username}` : '写回复'}</span>
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
              placeholder="写下你的回复..."
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              className="content-textarea"
              rows={4}
            />
          </div>
          
          <div className="form-actions">
            <button
              className="submit-btn"
              onClick={replyTo ? handleReplyToReply : handleSubmitReply}
              disabled={!commentContent.trim()}
            >
              <Send size={16} />
              发送
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 