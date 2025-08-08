import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import CommentSection from "../components/CommentSection";
import "./CommentPage.css";

export default function CommentPage() {
  const { newsId } = useParams<{ newsId: string }>();
  const navigate = useNavigate();

  // 处理返回
  const handleBack = () => {
    navigate(-1);
  };

  if (!newsId) {
    return (
      <div className="comment-page">
        <div className="error">新闻ID不存在</div>
      </div>
    );
  }

  return (
    <div className="comment-page">
      {/* 头部 */}
      <div className="comment-page-header">
        <button className="back-button" onClick={handleBack}>
          <ArrowLeft size={20} />
        </button>
        <h1>评论</h1>
      </div>

      {/* 评论区域 */}
      <CommentSection newsId={newsId} />
    </div>
  );
} 