const express = require('express');
const router = express.Router();
const { generatePDF, generateScreenshot } = require('../utils/pdf');
const path = require('path');

// 生成PDF的路由
router.post('/generate-pdf', async (req, res) => {
  try {
    // 从请求体获取要导出的网页URL
    const { url } = req.body;
    if (!url) {
      // 如果没有提供URL，返回400错误
      return res.status(400).json({ error: 'URL is required' });
    }

    // 构造导出PDF的文件路径，文件名带时间戳防止冲突
    const outputPath = path.join(__dirname, '../public', `export-${Date.now()}.pdf`);
    // 调用工具方法，使用puppeteer生成PDF
    await generatePDF(url, outputPath);
    
    // 返回成功响应，包含PDF文件路径
    res.json({ 
      success: true, 
      message: 'PDF generated successfully',
      filePath: outputPath
    });
  } catch (error) {
    // 捕获异常并返回500错误
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// 生成截图的路由
router.post('/generate-screenshot', async (req, res) => {
  try {
    // 从请求体获取要截图的网页URL
    const { url } = req.body;
    if (!url) {
      // 如果没有提供URL，返回400错误
      return res.status(400).json({ error: 'URL is required' });
    }

    // 构造导出图片的文件路径，文件名带时间戳防止冲突
    const outputPath = path.join(__dirname, '../public', `screenshot-${Date.now()}.png`);
    // 调用工具方法，使用puppeteer生成网页截图
    await generateScreenshot(url, outputPath);
    
    // 返回成功响应，包含图片文件路径
    res.json({ 
      success: true, 
      message: 'Screenshot generated successfully',
      filePath: outputPath
    });
  } catch (error) {
    // 捕获异常并返回500错误
    console.error('Screenshot generation error:', error);
    res.status(500).json({ error: 'Failed to generate screenshot' });
  }
});

module.exports = router; 