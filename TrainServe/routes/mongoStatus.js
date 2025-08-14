const express = require('express');
const router = express.Router();
const mongoWatcher = require('../services/mongoWatcher');

// 获取MongoDB监听服务状态
router.get('/status', (req, res) => {
  try {
    const status = mongoWatcher.getStatus();
    res.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('获取MongoDB状态失败:', error);
    res.status(500).json({
      success: false,
      error: '获取状态失败',
      message: error.message
    });
  }
});

// 手动启动监听服务
router.post('/start', async (req, res) => {
  try {
    if (mongoWatcher.isWatching) {
      return res.json({
        success: false,
        error: '监听服务已在运行'
      });
    }

    await mongoWatcher.connect();
    await mongoWatcher.startWatching();
    
    res.json({
      success: true,
      message: 'MongoDB监听服务已启动',
      status: mongoWatcher.getStatus()
    });
  } catch (error) {
    console.error('启动MongoDB监听服务失败:', error);
    res.status(500).json({
      success: false,
      error: '启动服务失败',
      message: error.message
    });
  }
});

// 手动停止监听服务
router.post('/stop', async (req, res) => {
  try {
    if (!mongoWatcher.isWatching) {
      return res.json({
        success: false,
        error: '监听服务未在运行'
      });
    }

    await mongoWatcher.stopWatching();
    
    res.json({
      success: true,
      message: 'MongoDB监听服务已停止',
      status: mongoWatcher.getStatus()
    });
  } catch (error) {
    console.error('停止MongoDB监听服务失败:', error);
    res.status(500).json({
      success: false,
      error: '停止服务失败',
      message: error.message
    });
  }
});

// 重新连接MongoDB
router.post('/reconnect', async (req, res) => {
  try {
    console.log('🔄 手动重新连接MongoDB...');
    
    // 先停止现有连接
    if (mongoWatcher.isWatching) {
      await mongoWatcher.stopWatching();
    }
    
    // 重新连接
    await mongoWatcher.connect();
    await mongoWatcher.startWatching();
    
    res.json({
      success: true,
      message: 'MongoDB重新连接成功',
      status: mongoWatcher.getStatus()
    });
  } catch (error) {
    console.error('重新连接MongoDB失败:', error);
    res.status(500).json({
      success: false,
      error: '重新连接失败',
      message: error.message
    });
  }
});

module.exports = router; 