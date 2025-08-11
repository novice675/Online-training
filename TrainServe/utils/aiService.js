/**
 * AI服务调用工具
 * 封装通义千问API调用，提供统一的AI服务接口
 */

const axios = require('axios');

// 通义千问API配置
const QWEN_API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
const QWEN_API_KEY = 'sk-4f71e382f5ed4c32a80041e645862980';

// 默认参数配置
const DEFAULT_PARAMS = {
  model: 'qwen-turbo',
  parameters: {
    temperature: 0.7,
    max_tokens: 1000,
    top_p: 0.8,
    repetition_penalty: 1.1
  }
};

/**
 * 调用通义千问API
 * @param {string} prompt - 提示词
 * @param {Object} options - 可选参数
 * @returns {Promise<string>} AI回复内容
 */
async function callQwenAPI(prompt, options = {}) {
  try {
    console.log('开始调用通义千问API，提示词长度:', prompt.length);

    // 合并参数
    const params = {
      ...DEFAULT_PARAMS,
      ...options,
      input: {
        messages: [
          {
            role: 'system',
            content: '你是一个智能助手，请根据用户的问题提供准确、有用的回答。'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      }
    };

    // 调用API
    const response = await axios.post(QWEN_API_URL, params, {
      headers: {
        'Authorization': `Bearer ${QWEN_API_KEY}`,
        'Content-Type': 'application/json',
        'User-Agent': 'HybridQuerySystem/1.0'
      },
      timeout: 30000 // 30秒超时
    });

    // 检查响应
    if (response.data && response.data.output && response.data.output.text) {
      const result = response.data.output.text.trim();
      console.log('通义千问API调用成功，回复长度:', result.length);
      return result;
    } else {
      throw new Error('API响应格式异常');
    }

  } catch (error) {
    console.error('通义千问API调用失败:', error);
    
    // 根据错误类型提供不同的降级处理
    if (error.code === 'ECONNABORTED') {
      throw new Error('AI服务响应超时，请稍后重试');
    } else if (error.response && error.response.status === 401) {
      throw new Error('AI服务认证失败，请联系管理员');
    } else if (error.response && error.response.status === 429) {
      throw new Error('AI服务请求过于频繁，请稍后重试');
    } else if (error.response && error.response.status >= 500) {
      throw new Error('AI服务暂时不可用，请稍后重试');
    } else {
      throw new Error(`AI服务调用失败: ${error.message}`);
    }
  }
}

/**
 * 批量调用AI服务（用于并发处理）
 * @param {Array<string>} prompts - 提示词数组
 * @param {Object} options - 可选参数
 * @returns {Promise<Array<string>>} AI回复数组
 */
async function batchCallQwenAPI(prompts, options = {}) {
  try {
    console.log('开始批量调用AI服务，任务数量:', prompts.length);

    // 限制并发数量，避免API限流
    const concurrency = options.concurrency || 3;
    const results = [];
    
    for (let i = 0; i < prompts.length; i += concurrency) {
      const batch = prompts.slice(i, i + concurrency);
      const batchPromises = batch.map(prompt => 
        callQwenAPI(prompt, options).catch(error => ({
          error: true,
          message: error.message,
          prompt: prompt
        }))
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // 批次间延迟，避免API限流
      if (i + concurrency < prompts.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log('批量AI服务调用完成，成功数量:', results.filter(r => !r.error).length);
    return results;

  } catch (error) {
    console.error('批量AI服务调用失败:', error);
    throw new Error(`批量AI服务调用失败: ${error.message}`);
  }
}

/**
 * 智能重试机制
 * @param {Function} apiCall - API调用函数
 * @param {number} maxRetries - 最大重试次数
 * @param {number} baseDelay - 基础延迟时间（毫秒）
 * @returns {Promise<any>} API调用结果
 */
async function retryAPICall(apiCall, maxRetries = 3, baseDelay = 1000) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      console.warn(`AI服务调用失败，第${attempt}次尝试:`, error.message);
      
      if (attempt < maxRetries) {
        // 指数退避策略
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`等待${delay}ms后重试...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new Error(`AI服务调用失败，已重试${maxRetries}次: ${lastError.message}`);
}

/**
 * 内容安全检查
 * @param {string} content - 待检查内容
 * @returns {Promise<boolean>} 是否安全
 */
async function checkContentSafety(content) {
  try {
    const safetyPrompt = `请判断以下内容是否包含不当、违法、政治敏感或色情信息。请严格按照以下格式回答：
    
内容：${content}

请只回答"安全"或"不安全"，不要添加任何其他内容。`;

    const response = await callQwenAPI(safetyPrompt, {
      parameters: {
        temperature: 0.1,
        max_tokens: 10
      }
    });

    const result = response.trim();
    console.log('内容安全检查结果:', result);
    
    return result === '安全';
  } catch (error) {
    console.error('内容安全检查失败:', error);
    // 如果检查失败，默认允许发送（避免误杀）
    return true;
  }
}

/**
 * 获取AI服务状态
 * @returns {Object} 服务状态信息
 */
async function getAIServiceStatus() {
  try {
    // 发送一个简单的测试请求
    const testPrompt = '请回答"正常"';
    const response = await callQwenAPI(testPrompt, {
      parameters: {
        temperature: 0.1,
        max_tokens: 5
      }
    });

    return {
      status: 'healthy',
      response: response.trim(),
      timestamp: new Date().toISOString(),
      apiKey: QWEN_API_KEY ? 'configured' : 'missing'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
      apiKey: QWEN_API_KEY ? 'configured' : 'missing'
    };
  }
}

module.exports = {
  callQwenAPI,
  batchCallQwenAPI,
  retryAPICall,
  checkContentSafety,
  getAIServiceStatus
}; 