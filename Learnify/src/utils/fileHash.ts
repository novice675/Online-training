import SparkMD5 from 'spark-md5';

/**
 * 计算文件MD5哈希值
 * @param file 文件对象
 * @param chunkSize 分块大小，默认2MB
 * @returns Promise<string> 文件哈希值
 */
export const calculateFileHash = (file: File, chunkSize: number = 2 * 1024 * 1024): Promise<string> => {
  return new Promise((resolve, reject) => {
    const spark = new SparkMD5.ArrayBuffer();
    const reader = new FileReader();
    const chunks = Math.ceil(file.size / chunkSize);
    let currentChunk = 0;

    reader.onload = (e) => {
      if (e.target?.result) {
        spark.append(e.target.result as ArrayBuffer);
        currentChunk++;

        if (currentChunk < chunks) {
          // 继续读取下一个分块
          loadNext();
        } else {
          // 所有分块读取完成，计算最终哈希
          resolve(spark.end());
        }
      }
    };

    reader.onerror = (e) => {
      reject(new Error('文件读取失败'));
    };

    const loadNext = () => {
      const start = currentChunk * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);
      reader.readAsArrayBuffer(chunk);
    };

    // 开始读取第一个分块
    loadNext();
  });
};

/**
 * 检查文件是否已存在（基于哈希值）
 * @param file 文件对象
 * @param existingHashes 已存在的哈希值数组
 * @returns Promise<boolean> 是否已存在
 */
export const checkFileExists = async (file: File, existingHashes: string[]): Promise<boolean> => {
  try {
    const fileHash = await calculateFileHash(file);
    return existingHashes.includes(fileHash);
  } catch (error) {
    console.error('计算文件哈希失败:', error);
    return false;
  }
};

/**
 * 获取文件信息（包括哈希值）
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