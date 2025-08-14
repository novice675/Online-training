const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const cron = require('node-cron');
const FileInfo = require('../models/FileInfo');
const router = express.Router();

// 异步检查文件是否存在
const checkFileExists = async (filePath) => {
  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
    return true;
  } catch (error) {
    return false;
  }
};

// 定期清理无效文件记录
const cleanupOrphanedRecords = async () => {
  try {
    console.log('开始定期清理无效文件记录...');
    const allFiles = await FileInfo.find({});
    let cleanedCount = 0;
    
    for (const file of allFiles) {
      const filePath = path.join(uploadDir, file.filename);
      const fileExists = await checkFileExists(filePath);
      
      if (!fileExists) {
        await FileInfo.deleteOne({ _id: file._id });
        console.log(`清理无效记录: ${file.filename}`);
        cleanedCount++;
      }
    }
    
    console.log(`定期清理完成，共清理 ${cleanedCount} 个无效记录`);
  } catch (error) {
    console.error('定期清理失败:', error);
  }
};

// 启动定期清理任务（每天凌晨2点执行）
cron.schedule('0 2 * * *', cleanupOrphanedRecords, {
  scheduled: true,
  timezone: "Asia/Shanghai"
});

console.log('文件清理任务已启动，每天凌晨2点执行');

// 流式计算文件哈希
const calculateFileHash = (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('md5');
    const stream = fs.createReadStream(filePath);
    
    stream.on('data', (data) => {
      hash.update(data);
    });
    
    stream.on('end', () => {
      resolve(hash.digest('hex'));
    });
    
    stream.on('error', (error) => {
      reject(error);
    });
  });
};

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../upload');
const ensureUploadDir = async () => {
  try {
    await fs.promises.access(uploadDir, fs.constants.F_OK);
  } catch (error) {
    await fs.promises.mkdir(uploadDir, { recursive: true });
  }
};
ensureUploadDir();

// 配置 multer（异步友好）
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    try {
      await ensureUploadDir();
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: function (req, file, cb) {
    // 生成唯一文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: function (req, file, cb) {
    // 只允许图片文件
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'), false);
    }
  }
});

// 1. 文件预检API - 检查文件是否已存在
router.post('/check', async (req, res) => {
  try {
    const { hash, filename, size } = req.body;
    
    if (!hash) {
      return res.status(400).json({
        success: false,
        message: '缺少文件哈希值'
      });
    }

    // 查询数据库中的文件
    const existingFile = await FileInfo.findOne({ hash });
    
    if (existingFile) {
      // 检查物理文件是否存在
      const filePath = path.join(uploadDir, existingFile.filename);
      const fileExists = await checkFileExists(filePath);
      
      if (!fileExists) {
        // 物理文件不存在，删除数据库记录
        await FileInfo.deleteOne({ hash });
        console.log(`清理无效记录: ${existingFile.filename}`);
        
        return res.json({
          success: true,
          exists: false,
          message: '文件不存在，可以上传'
        });
      }
      
      // 物理文件存在，返回现有文件信息
      return res.json({
        success: true,
        exists: true,
        data: {
          url: existingFile.url,
          filename: existingFile.filename,
          originalName: existingFile.originalName,
          size: existingFile.size,
          hash: existingFile.hash
        },
        message: '文件已存在'
      });
    } else {
      return res.json({
        success: true,
        exists: false,
        message: '文件不存在，可以上传'
      });
    }
  } catch (error) {
    console.error('文件预检失败:', error);
    res.status(500).json({
      success: false,
      message: '文件预检失败',
      error: error.message
    });
  }
});

// 2. 单图片上传API
router.post('/single', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请选择要上传的图片'
      });
    }

    const { hash } = req.body; // 从前端获取哈希值
    
    // 后端重新计算哈希进行验证
    const serverHash = await calculateFileHash(req.file.path);
    
    // 如果前端提供了哈希值，进行验证
    if (hash && hash !== serverHash) {
      // 删除上传的文件
      await fs.promises.unlink(req.file.path);
      return res.status(400).json({
        success: false,
        message: '文件哈希验证失败，文件可能已损坏'
      });
    }
    
    const finalHash = hash || serverHash;
    
    // 再次检查数据库（防止并发上传）
    const existingFile = await FileInfo.findOne({ hash: finalHash });
    
    if (existingFile) {
      // 检查物理文件是否存在
      const filePath = path.join(uploadDir, existingFile.filename);
      const fileExists = await checkFileExists(filePath);
      
      if (!fileExists) {
        // 物理文件不存在，删除数据库记录
        await FileInfo.deleteOne({ hash: finalHash });
        console.log(`清理无效记录: ${existingFile.filename}`);
      } else {
        // 物理文件存在，删除刚上传的重复文件
        await fs.promises.unlink(req.file.path);
        
        return res.json({
          success: true,
          data: {
            url: existingFile.url,
            filename: existingFile.filename,
            originalName: existingFile.originalName,
            size: existingFile.size,
            hash: existingFile.hash,
            isDuplicate: true
          },
          message: '文件已存在，使用现有文件'
        });
      }
    }

    // 保存文件信息到数据库
    const fileInfo = new FileInfo({
      hash: finalHash,
      filename: req.file.filename,
      originalName: req.file.originalname,
      url: `/upload/${req.file.filename}`,
      size: req.file.size,
      mimeType: req.file.mimetype
    });
    
    await fileInfo.save();

    const imageUrl = `/upload/${req.file.filename}`;
    
    res.json({
      success: true,
      data: {
        url: imageUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        hash: finalHash,
        isDuplicate: false
      },
      message: '图片上传成功'
    });
  } catch (error) {
    console.error('单图片上传失败:', error);
    // 清理上传的文件
    if (req.file) {
      try {
        await fs.promises.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('清理上传文件失败:', unlinkError);
      }
    }
    res.status(500).json({
      success: false,
      message: '图片上传失败',
      error: error.message
    });
  }
});

// 3. 获取所有文件信息API
router.get('/files', async (req, res) => {
  try {
    const files = await FileInfo.find({}).sort({ uploadTime: -1 });
    res.json({
      success: true,
      data: files
    });
  } catch (error) {
    console.error('获取文件列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取文件列表失败',
      error: error.message
    });
  }
});

// 4. 手动清理API
router.post('/cleanup', async (req, res) => {
  try {
    const { dryRun = false } = req.body;
    
    console.log('开始手动清理无效文件记录...');
    const allFiles = await FileInfo.find({});
    const orphanedFiles = [];
    let cleanedCount = 0;
    
    for (const file of allFiles) {
      const filePath = path.join(uploadDir, file.filename);
      const fileExists = await checkFileExists(filePath);
      
      if (!fileExists) {
        orphanedFiles.push({
          filename: file.filename,
          originalName: file.originalName,
          size: file.size,
          uploadTime: file.uploadTime
        });
        
        if (!dryRun) {
          await FileInfo.deleteOne({ _id: file._id });
          cleanedCount++;
        }
      }
    }
    
    const message = dryRun 
      ? `发现 ${orphanedFiles.length} 个无效记录（预览模式）`
      : `清理完成，共清理 ${cleanedCount} 个无效记录`;
    
    res.json({
      success: true,
      data: {
        totalFiles: allFiles.length,
        orphanedFiles,
        cleanedCount: dryRun ? 0 : cleanedCount,
        dryRun
      },
      message
    });
  } catch (error) {
    console.error('手动清理失败:', error);
    res.status(500).json({
      success: false,
      message: '手动清理失败',
      error: error.message
    });
  }
});

// 5. 删除文件API
router.delete('/delete/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    
    const fileInfo = await FileInfo.findOne({ hash });
    if (!fileInfo) {
      return res.status(404).json({
        success: false,
        message: '文件不存在'
      });
    }

    // 删除物理文件
    const filePath = path.join(uploadDir, fileInfo.filename);
    const fileExists = await checkFileExists(filePath);
    if (fileExists) {
      await fs.promises.unlink(filePath);
    }

    // 删除数据库记录
    await FileInfo.deleteOne({ hash });
    
    res.json({
      success: true,
      message: '文件删除成功'
    });
  } catch (error) {
    console.error('删除文件失败:', error);
    res.status(500).json({
      success: false,
      message: '删除文件失败',
      error: error.message
    });
  }
});

module.exports = router; 