/**
 * 计算文件的哈希值（基于文件名、大小和最后修改时间）
 * @param file 文件对象
 * @returns Promise<string> 哈希值
 */
export const calculateFileHash = async (file: File): Promise<string> => {
  // 使用文件名、大小和最后修改时间作为唯一标识
  const fileInfo = `${file.name}_${file.size}_${file.lastModified}`;
  
  // 简单的哈希算法
  let hash = 0;
  for (let i = 0; i < fileInfo.length; i++) {
    const char = fileInfo.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转换为32位整数
  }
  
  return hash.toString(16);
};

/**
 * 检查文件是否已存在
 * @param file 文件对象
 * @param existingFiles 已存在的文件列表
 * @returns Promise<boolean> 是否存在
 */
export const isFileExists = async (
  file: File, 
  existingFiles: Array<{ hash: string; url: string }>
): Promise<{ exists: boolean; existingUrl?: string }> => {
  const fileHash = await calculateFileHash(file);
  const existingFile = existingFiles.find(f => f.hash === fileHash);
  
  return {
    exists: !!existingFile,
    existingUrl: existingFile?.url
  };
};

/**
 * 获取文件信息
 * @param file 文件对象
 * @returns Promise<{hash: string, size: number, name: string}>
 */
export const getFileInfo = async (file: File) => {
  const hash = await calculateFileHash(file);
  return {
    hash,
    size: file.size,
    name: file.name,
    type: file.type
  };
}; 