/**
 * 意图识别器
 * 快速判断用户查询类型，选择合适的处理方式
 */

const { callQwenAPI } = require('../../utils/aiService');

class IntentRecognizer {
  constructor() {
    // 简单意图关键词
    this.simpleKeywords = [
      '你好', '谢谢', '再见', '天气', '时间', '帮助', '说明', '介绍',
      '怎么', '如何', '为什么', '什么是', '在哪里'
    ];
    
    // 查询意图关键词
    this.queryKeywords = [
      '查询', '查找', '搜索', '显示', '统计', '计算', '分析',
      '数量', '信息', '详情', '记录', '数据', '报表', '趋势'
    ];
    
    // 数据实体关键词
    this.entityKeywords = [
      '用户', '楼宇', '房屋', '企业', '员工', '访客', '合同', '账单',
      '公司', '房间', '建筑', '人员', '客户'
    ];
  }

  /**
   * 快速意图检查
   * @param {string} message - 用户消息
   * @returns {Object} 意图识别结果
   */
  async quickCheck(message) {
    const lowerMessage = message.toLowerCase();
    
    // 1. 检查是否包含查询关键词
    const hasQueryKeywords = this.queryKeywords.some(keyword => 
      lowerMessage.includes(keyword)
    );
    
    // 2. 检查是否包含数据实体关键词
    const hasEntityKeywords = this.entityKeywords.some(keyword => 
      lowerMessage.includes(keyword)
    );
    
    // 3. 检查是否包含简单对话关键词
    const hasSimpleKeywords = this.simpleKeywords.some(keyword => 
      lowerMessage.includes(keyword)
    );
    
    // 4. 基于规则快速判断
    if (hasQueryKeywords && hasEntityKeywords) {
      return {
        type: 'complex',
        confidence: 0.9,
        reason: '包含明确的查询意图和数据实体'
      };
    } else if (hasQueryKeywords && !hasEntityKeywords) {
      return {
        type: 'complex',
        confidence: 0.7,
        reason: '包含查询意图，但数据实体不明确'
      };
    } else if (hasSimpleKeywords && !hasQueryKeywords && !hasEntityKeywords) {
      return {
        type: 'simple',
        confidence: 0.8,
        reason: '简单的对话或帮助请求'
      };
    } else {
      // 5. 使用AI进行精确判断
      return await this.aiIntentCheck(message);
    }
  }

  /**
   * AI意图检查
   * @param {string} message - 用户消息
   * @returns {Object} AI判断结果
   */
  async aiIntentCheck(message) {
    try {
      const prompt = `请判断以下用户消息的意图类型：

用户消息：${message}

请从以下选项中选择：
1. simple - 简单对话、问候、帮助请求等
2. complex - 需要查询数据库的复杂问题

请只回答"simple"或"complex"，不要添加任何其他内容。`;

      const response = await callQwenAPI(prompt);
      const intent = response.trim().toLowerCase();
      
      if (intent === 'simple') {
        return {
          type: 'simple',
          confidence: 0.9,
          reason: 'AI判断为简单对话'
        };
      } else {
        return {
          type: 'complex',
          confidence: 0.9,
          reason: 'AI判断为复杂查询'
        };
      }
    } catch (error) {
      console.error('AI意图检查失败:', error);
      // 默认返回复杂查询，确保功能完整
      return {
        type: 'complex',
        confidence: 0.6,
        reason: 'AI检查失败，默认按复杂查询处理'
      };
    }
  }

  /**
   * 详细意图分析（用于复杂查询）
   * @param {string} message - 用户消息
   * @returns {Object} 详细意图分析
   */
  async detailedAnalysis(message) {
    try {
      const prompt = `请分析以下用户消息的详细意图：

用户消息：${message}

请分析：
1. 查询类型（select/count/aggregate/search）
2. 目标数据表
3. 查询条件
4. 需要的字段
5. 排序和限制要求

请用JSON格式回复，包含上述分析结果。`;

      const response = await callQwenAPI(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('详细意图分析失败:', error);
      return null;
    }
  }
}

module.exports = IntentRecognizer; 