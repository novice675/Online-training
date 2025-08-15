import React, { useState, useRef, useEffect } from 'react';
import { UploadAPI } from '../api/upload';
import { calculateFileHash, checkFileExists } from '../utils/fileHash';
import './MultipleImageUploader.css';

interface MultipleImageUploaderProps {
  value?: string[];
  onChange: (urls: string[]) => void;
  placeholder?: string;
  className?: string;
  maxCount?: number;
  onFileInfo?: (fileInfo: Array<{ hash: string; url: string }>) => void;
  existingHashes?: string[];
  existingFiles?: Array<{ hash: string; url: string }>;
}

const MultipleImageUploader: React.FC<MultipleImageUploaderProps> = ({
  value = [],
  onChange,
  placeholder = '点击或拖拽上传多张图片',
  className = '',
  maxCount = 10,
  onFileInfo,
  existingHashes = [],
  existingFiles = []
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 防止浏览器默认的拖拽行为
  useEffect(() => {
    const preventDefault = (e: DragEvent) => {
      e.preventDefault();
    };

    document.addEventListener('dragover', preventDefault);
    document.addEventListener('drop', preventDefault);

    return () => {
      document.removeEventListener('dragover', preventDefault);
      document.removeEventListener('drop', preventDefault);
    };
  }, []);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // 检查文件数量限制
    if (value.length + files.length > maxCount) {
      setError(`最多只能上传 ${maxCount} 张图片`);
      return;
    }

    // 验证文件类型和大小
    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!file.type.startsWith('image/')) {
        setError('请选择图片文件');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('图片大小不能超过5MB');
        return;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setUploading(true);
    setError('');

    try {
      const newUrls: string[] = [];
      const newFileInfos: Array<{ hash: string; url: string }> = [];
      const duplicates: string[] = [];
      
      for (const file of validFiles) {
        // 计算文件哈希
        const fileHash = await calculateFileHash(file);
        
        // 1. 先进行预检，检查文件是否已存在
        const checkResponse = await UploadAPI.checkFileExists(fileHash, file.name, file.size);
        
        if (checkResponse.success && checkResponse.exists && checkResponse.data) {
          // 文件已存在，直接使用现有URL
          const fullUrl = `${import.meta.env.VITE_API_URL}${checkResponse.data.url}`;
          newUrls.push(fullUrl);
          newFileInfos.push({
            hash: fileHash,
            url: fullUrl
          });
          duplicates.push(file.name);
          continue;
        }
        
        // 2. 文件不存在，执行上传
        const response = await UploadAPI.uploadSingleImage(file, fileHash);
        if (response.success) {
          const fullUrl = `${import.meta.env.VITE_API_URL}${response.data.url}`;
          newUrls.push(fullUrl);
          newFileInfos.push({
            hash: fileHash,
            url: fullUrl
          });
        }
      }
      
      if (newUrls.length > 0) {
        onChange([...value, ...newUrls]);
        
        // 通知父组件文件信息
        if (onFileInfo) {
          onFileInfo(newFileInfos);
        }
        

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

  const handleRemove = (index: number) => {
    const newUrls = value.filter((_, i) => i !== index);
    onChange(newUrls);
  };

  const handleRemoveAll = () => {
    onChange([]);
  };

  return (
    <div className={`multiple-image-uploader ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFileSelect(e.target.files)}
        style={{ display: 'none' }}
      />
      
      <div className="images-container">
        {/* 已上传的图片 */}
        {value.map((url, index) => (
          <div key={index} className="image-item">
            <img src={url} alt={`图片 ${index + 1}`} className="preview-image" />
            <button
              type="button"
              className="remove-btn"
              onClick={() => handleRemove(index)}
              title="删除图片"
            >
              ×
            </button>
          </div>
        ))}

        {/* 上传区域 */}
        {value.length < maxCount && (
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
                <p className="upload-hint">
                  已上传 {value.length}/{maxCount} 张图片
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* 批量操作 */}
      {value.length > 0 && (
        <div className="batch-actions">
          <button
            type="button"
            className="add-more-btn"
            onClick={handleClick}
            disabled={uploading || value.length >= maxCount}
          >
            {uploading ? '上传中...' : '继续添加'}
          </button>
          <button
            type="button"
            className="clear-all-btn"
            onClick={handleRemoveAll}
            disabled={uploading}
          >
            清空所有
          </button>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default MultipleImageUploader; 