const express = require('express');
const router = express.Router();
const { generatePDF, generateScreenshot } = require('../utils/pdf');
const path = require('path');

// 生成PDF的路由
router.post('/generate-pdf', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const outputPath = path.join(__dirname, '../public', `export-${Date.now()}.pdf`);
    await generatePDF(url, outputPath);
    
    res.json({ 
      success: true, 
      message: 'PDF generated successfully',
      filePath: outputPath
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// 生成截图的路由
router.post('/generate-screenshot', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const outputPath = path.join(__dirname, '../public', `screenshot-${Date.now()}.png`);
    await generateScreenshot(url, outputPath);
    
    res.json({ 
      success: true, 
      message: 'Screenshot generated successfully',
      filePath: outputPath
    });
  } catch (error) {
    console.error('Screenshot generation error:', error);
    res.status(500).json({ error: 'Failed to generate screenshot' });
  }
});

module.exports = router; 