import React, { useState, useRef } from 'react';
import { UploadAPI } from '../api/upload';
import { calculateFileHash, checkFileExists } from '../utils/fileHash';
import './SingleImageUploader.css';

interface SingleImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  placeholder?: string;
  className?: string;
  onFileInfo?: (fileInfo: { hash: string; url: string }) => void;
  existingHashes?: string[];
  existingFiles?: Array<{ hash: string; url: string }>;
}

const SingleImageUploader: React.FC<SingleImageUploaderProps> = ({
  value,
  onChange,
  placeholder = '点击或拖拽上传图片',
  className = '',
  onFileInfo,
  existingHashes = [],
  existingFiles = []
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件');
      return;
    }

    // 验证文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('图片大小不能超过5MB');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // 计算文件哈希
      const fileHash = await calculateFileHash(file);
      
      // 1. 先进行预检，检查文件是否已存在
      const checkResponse = await UploadAPI.checkFileExists(fileHash, file.name, file.size);
      
      if (checkResponse.success && checkResponse.exists && checkResponse.data) {
        // 文件已存在，直接使用现有URL
        const fullUrl = `${import.meta.env.VITE_API_URL}${checkResponse.data.url}`;
        onChange(fullUrl);
        
        if (onFileInfo) {
          onFileInfo({
            hash: fileHash,
            url: fullUrl
          });
        }
        return;
      }
      
      // 2. 文件不存在，执行上传
      const response = await UploadAPI.uploadSingleImage(file, fileHash);
      if (response.success) {
        // 构建完整的图片URL
        const fullUrl = `${import.meta.env.VITE_API_URL}${response.data.url}`;
        onChange(fullUrl);
        
        // 通知父组件文件信息
        if (onFileInfo) {
          onFileInfo({
            hash: fileHash,
            url: fullUrl
          });
        }
      } else {
        setError(response.message || '上传失败');
      }
    } catch (err: any) {
      console.error('上传失败:', err);
      setError(err.message || '上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    handleFileSelect(e.dataTransfer.files);
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div className={`single-image-uploader ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files)}
        style={{ display: 'none' }}
      />
      
      {value ? (
        <div className="image-preview">
          <img src={value} alt="预览" className="preview-image" />
          <div className="image-actions">
            <button
              type="button"
              className="change-btn"
              onClick={handleClick}
              disabled={uploading}
            >
              {uploading ? '上传中...' : '更换图片'}
            </button>
            <button
              type="button"
              className="remove-btn"
              onClick={handleRemove}
              disabled={uploading}
            >
              删除
            </button>
          </div>
        </div>
      ) : (
        <div
          className="upload-area"
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {uploading ? (
            <div className="uploading">
              <div className="spinner"></div>
              <p>上传中...</p>
            </div>
          ) : (
            <>
              <div className="upload-icon">📷</div>
              <p className="upload-text">{placeholder}</p>
              <p className="upload-hint">支持 JPG、PNG、GIF 格式，最大 5MB</p>
            </>
          )}
        </div>
      )}

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default SingleImageUploader; 