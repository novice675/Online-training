import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NewsAPI } from '../api/news';
import { Channel, RenderType } from '../types/news';
import SingleImageUploader from '../components/SingleImageUploader';
import MultipleImageUploader from '../components/MultipleImageUploader';
import './PublishNews.css';

interface PublishFormData {
  title: string;
  channel: Channel;
  renderType: RenderType;
  rightImage: string;
  detailContent: string;
  detailImages: string[];
}

const PublishNews: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<PublishFormData>({
    title: '',
    channel: Channel.RECOMMEND,
    renderType: RenderType.TEXT_ONLY,
    rightImage: '',
    detailContent: '',
    detailImages: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 文件信息管理
  const [fileInfos, setFileInfos] = useState<Array<{ hash: string; url: string }>>([]);
  
  // 获取所有已上传文件的哈希值
  const existingHashes = fileInfos.map(info => info.hash);

  const handleInputChange = (field: keyof PublishFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 获取用户ID
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        setError('请先登录');
        return;
      }

      // 构建提交数据
      const submitData = {
        title: formData.title,
        channel: formData.channel,
        renderType: formData.renderType,
        authorId: userId,
        detailContent: formData.detailContent,
        publishTime: new Date().toISOString(),
        likeCount: 0,
        // 只在非纯文本布局时包含图片字段
        ...(formData.renderType !== RenderType.TEXT_ONLY && {
          rightImage: formData.rightImage,
          detailImages: formData.detailImages
        })
      };

      // 调用API发布新闻
      await NewsAPI.publishNews(submitData);
      
      // 发布成功后跳转到推荐页面
      navigate('/');
    } catch (err) {
      setError('发布失败，请重试');
      console.error('发布新闻失败:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="publish-news">
      <div className="publish-header">
        <button 
          className="back-button"
          onClick={() => navigate(-1)}
        >
          ← 返回
        </button>
        <h1>发布新闻</h1>
      </div>

      <form className="publish-form" onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <label>标题 *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="请输入新闻标题"
            required
          />
        </div>

        <div className="form-group">
          <label>发布渠道 *</label>
          <select
            value={formData.channel}
            onChange={(e) => handleInputChange('channel', e.target.value)}
            required
          >
            <option value={Channel.RECOMMEND}>推荐</option>
            <option value={Channel.POLICY}>政策</option>
          </select>
        </div>

        <div className="form-group">
          <label>布局类型 *</label>
          <select
            value={formData.renderType}
            onChange={(e) => handleInputChange('renderType', e.target.value)}
            required
          >
            <option value={RenderType.TEXT_ONLY}>纯文本布局</option>
            <option value={RenderType.IMAGE_RIGHT}>左右布局</option>
            <option value={RenderType.IMAGE_FULL}>大图片布局</option>
          </select>
        </div>

        {/* 只在非纯文本布局时显示图片相关字段 */}
        {formData.renderType !== RenderType.TEXT_ONLY && (
          <>
            <div className="form-group">
              <label>右侧图片</label>
              <SingleImageUploader
                value={formData.rightImage}
                onChange={(url) => handleInputChange('rightImage', url)}
                placeholder="点击或拖拽上传右侧图片"
                existingHashes={existingHashes}
                existingFiles={fileInfos}
                onFileInfo={(fileInfo) => {
                  setFileInfos(prev => [...prev, fileInfo]);
                }}
              />
            </div>

            <div className="form-group">
              <label>详情图片</label>
              <MultipleImageUploader
                value={formData.detailImages}
                onChange={(urls) => handleInputChange('detailImages', urls)}
                placeholder="点击或拖拽上传详情图片"
                maxCount={10}
                existingHashes={existingHashes}
                existingFiles={fileInfos}
                onFileInfo={(newFileInfos) => {
                  setFileInfos(prev => [...prev, ...newFileInfos]);
                }}
              />
            </div>
          </>
        )}

        <div className="form-group">
          <label>详细内容 *</label>
          <textarea
            value={formData.detailContent}
            onChange={(e) => handleInputChange('detailContent', e.target.value)}
            placeholder="请输入新闻详细内容"
            rows={8}
            required
          />
        </div>



        <div className="form-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            取消
          </button>
          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? '发布中...' : '发布'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PublishNews; 