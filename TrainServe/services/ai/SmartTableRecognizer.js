/**
 * 智能表名识别器
 * 自动识别用户查询中的表名，无需硬编码
 */

const { callQwenAPI } = require('../../utils/aiService');

class SmartTableRecognizer {
  constructor() {
    // 预定义的表名映射（作为备选方案）
    this.tableSynonyms = {
      '用户': ['appUser', 'user', 'users'],
      '公司': ['company', 'companies', 'enterprise', 'business'],
      '楼宇': ['Building', 'building', 'buildings'],
      '房屋': ['House', 'house', 'houses'],
      '员工': ['employee', 'employees', 'staff'],
      '访客': ['visitor', 'visitors', 'guest'],
      '合同': ['HeTong', 'contract', 'contracts'],
      '账单': ['TenantBill', 'bill', 'bills'],
      '聊天': ['ChatSession', 'chat', 'message'],
      '消息': ['Message', 'message', 'messages']
    };
  }

  /**
   * 智能识别表名
   * @param {string} userMessage - 用户消息
   * @param {Object} availableTables - 可用的表信息
   * @returns {Promise<string>} 识别出的表名
   */
  async recognizeTable(userMessage, availableTables = {}) {
    try {
      console.log('开始智能识别表名:', { userMessage, availableTables: Object.keys(availableTables) });

      // 1. 快速关键词匹配
      const quickMatch = this.quickKeywordMatch(userMessage);
      if (quickMatch) {
        console.log('快速关键词匹配成功:', quickMatch);
        return quickMatch;
      }

      // 2. AI智能识别
      const aiMatch = await this.aiTableRecognition(userMessage, availableTables);
      if (aiMatch) {
        console.log('AI智能识别成功:', aiMatch);
        return aiMatch;
      }

      // 3. 模糊匹配
      const fuzzyMatch = this.fuzzyTableMatch(userMessage, Object.keys(availableTables));
      if (fuzzyMatch) {
        console.log('模糊匹配成功:', fuzzyMatch);
        return fuzzyMatch;
      }

      // 4. 默认返回
      console.log('使用默认表: appUser');
      return 'appUser';

    } catch (error) {
      console.error('表名识别失败:', error);
      return 'appUser'; // 默认表
    }
  }

  /**
   * 快速关键词匹配
   * @param {string} userMessage - 用户消息
   * @returns {string|null} 匹配的表名
   */
  quickKeywordMatch(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    
    for (const [keyword, tables] of Object.entries(this.tableSynonyms)) {
      if (lowerMessage.includes(keyword)) {
        return tables[0]; // 返回第一个匹配的表名
      }
    }
    
    return null;
  }

  /**
   * AI智能识别表名
   * @param {string} userMessage - 用户消息
   * @param {Object} availableTables - 可用的表信息
   * @returns {Promise<string|null>} 识别出的表名
   */
  async aiTableRecognition(userMessage, availableTables) {
    try {
      const tableList = Object.keys(availableTables).join(', ');
      
      const prompt = `请根据用户的问题，从以下可用表中选择最合适的表：

用户问题：${userMessage}

可用表：${tableList}

请只回答表名，不要添加任何其他内容。如果无法确定，请回答"无法确定"。`;

      const response = await callQwenAPI(prompt);
      const tableName = response.trim();
      
      // 验证返回的表名是否在可用表中
      if (tableName && tableName !== '无法确定' && availableTables[tableName]) {
        return tableName;
      }
      
      return null;
    } catch (error) {
      console.warn('AI表名识别失败:', error.message);
      return null;
    }
  }

  /**
   * 模糊表名匹配
   * @param {string} userMessage - 用户消息
   * @param {Array} availableTables - 可用的表名列表
   * @returns {string|null} 匹配的表名
   */
  fuzzyTableMatch(userMessage, availableTables) {
    const lowerMessage = userMessage.toLowerCase();
    
    // 计算每个表的匹配度
    const tableScores = availableTables.map(tableName => {
      const lowerTable = tableName.toLowerCase();
      let score = 0;
      
      // 完全包含
      if (lowerMessage.includes(lowerTable)) {
        score += 10;
      }
      
      // 部分包含
      if (lowerTable.includes(lowerMessage) || lowerMessage.includes(lowerTable)) {
        score += 5;
      }
      
      // 字符相似度
      const commonChars = this.calculateCommonCharacters(lowerMessage, lowerTable);
      score += commonChars * 0.1;
      
      return { tableName, score };
    });
    
    // 按分数排序，返回最高分的表
    tableScores.sort((a, b) => b.score - a.score);
    
    if (tableScores.length > 0 && tableScores[0].score > 0) {
      return tableScores[0].tableName;
    }
    
    return null;
  }

  /**
   * 计算两个字符串的公共字符数
   * @param {string} str1 - 字符串1
   * @param {string} str2 - 字符串2
   * @returns {number} 公共字符数
   */
  calculateCommonCharacters(str1, str2) {
    const set1 = new Set(str1.split(''));
    const set2 = new Set(str2.split(''));
    
    let common = 0;
    for (const char of set1) {
      if (set2.has(char)) {
        common++;
      }
    }
    
    return common;
  }

  /**
   * 获取表的描述信息
   * @param {string} tableName - 表名
   * @param {Object} availableTables - 可用的表信息
   * @returns {string} 表的描述
   */
  getTableDescription(tableName, availableTables) {
    if (availableTables[tableName] && availableTables[tableName].description) {
      return availableTables[tableName].description;
    }
    
    // 返回默认描述
    const defaultDescriptions = {
      'appUser': '用户信息表',
      'company': '公司信息表',
      'Building': '楼宇信息表',
      'House': '房屋信息表',
      'employee': '员工信息表',
      'visitor': '访客信息表',
      'HeTong': '合同信息表',
      'TenantBill': '账单信息表',
      'ChatSession': '聊天会话表',
      'Message': '消息记录表'
    };
    
    return defaultDescriptions[tableName] || '数据表';
  }

  /**
   * 验证表名是否有效
   * @param {string} tableName - 表名
   * @param {Object} availableTables - 可用的表信息
   * @returns {boolean} 是否有效
   */
  isValidTable(tableName, availableTables) {
    return availableTables && availableTables[tableName];
  }
}

module.exports = SmartTableRecognizer; 