/**
 * 混合查询系统核心类
 * 智能识别用户意图，选择合适的处理方式
 */

const IntentRecognizer = require('./IntentRecognizer');
const QueryPlanner = require('./QueryPlanner');
const ResultProcessor = require('./ResultProcessor');
const UniversalQueryProcessor = require('./UniversalQueryProcessor');
const SecurityManager = require('../database/SecurityManager');
const { callQwenAPI } = require('../../utils/aiService');

class HybridQuerySystem {
  constructor() {
    this.intentRecognizer = new IntentRecognizer();
    this.queryPlanner = new QueryPlanner();
    this.resultProcessor = new ResultProcessor();
    this.universalQueryProcessor = new UniversalQueryProcessor();
    this.securityManager = new SecurityManager();
  }

  /**
   * 处理用户查询的主入口
   * @param {string} userMessage - 用户消息
   * @param {string} userId - 用户ID
   * @param {string} userRole - 用户角色
   * @param {Array} conversationHistory - 对话历史
   * @returns {Promise<Object>} 处理结果
   */
  async processQuery(userMessage, userId, userRole, conversationHistory = []) {
    try {
      console.log('开始处理用户查询:', { userMessage, userId, userRole });

      // 1. 快速意图判断
      const intent = await this.intentRecognizer.quickCheck(userMessage);
      console.log('快速意图判断结果:', intent);

      // 2. 根据意图选择处理方式
      if (intent.type === 'simple') {
        // 简单对话：直接AI回复
        return await this.handleSimpleConversation(userMessage, conversationHistory);
      } else {
        // 复杂查询：AI生成查询计划 + 执行查询 + 生成回复
        return await this.handleComplexQuery(userMessage, userId, userRole, conversationHistory);
      }
    } catch (error) {
      console.error('查询处理失败:', error);
      return await this.handleError(error, userMessage);
    }
  }

  /**
   * 处理简单对话
   */
  async handleSimpleConversation(userMessage, conversationHistory) {
    const { aiPrompts } = require('../../config/aiPrompts');
    const prompt = aiPrompts.simpleConversation
      .replace('{userQuestion}', userMessage)
      .replace('{conversationHistory}', JSON.stringify(conversationHistory));

    const response = await callQwenAPI(prompt);
    
    return {
      type: 'conversation',
      content: response,
      needsData: false,
      explanation: '这是一个简单的对话回复，无需查询数据库'
    };
  }

  /**
   * 处理复杂查询
   */
  async handleComplexQuery(userMessage, userId, userRole, conversationHistory) {
    console.log('开始处理复杂查询');

    // 1. AI生成查询计划
    const queryPlan = await this.queryPlanner.generatePlan(
      userMessage, 
      userId, 
      userRole
    );
    console.log('生成的查询计划:', queryPlan);

    // 2. 安全验证
    const securityCheck = await this.securityManager.validateQuery(queryPlan, userId, userRole);
    if (!securityCheck.allowed) {
      return {
        type: 'error',
        content: `抱歉，您没有权限执行此查询：${securityCheck.reason}`,
        needsData: false,
        securityIssue: securityCheck.securityIssue
      };
    }

    // 3. 执行真实数据库查询
    const queryResult = await this.universalQueryProcessor.processQuery(queryPlan);
    console.log('数据库查询执行结果:', queryResult);

    // 4. 处理查询结果
    const processedResult = await this.resultProcessor.process(
      queryResult, 
      queryPlan, 
      userMessage
    );

    // 5. AI生成最终回复
    const finalResponse = await this.generateFinalResponse(
      userMessage, 
      processedResult, 
      queryPlan, 
      conversationHistory
    );

    return {
      type: 'query',
      content: finalResponse,
      needsData: true,
      data: processedResult,
      queryPlan: queryPlan,
      explanation: '这是基于真实数据库查询结果的AI回复'
    };
  }



  /**
   * 生成最终AI回复
   */
  async generateFinalResponse(userMessage, processedResult, queryPlan, conversationHistory) {
    const { aiPrompts } = require('../../config/aiPrompts');
    const prompt = aiPrompts.resultAnalysis
      .replace('{userQuestion}', userMessage)
      .replace('{queryResult}', JSON.stringify(processedResult))
      .replace('{queryPlan}', JSON.stringify(queryPlan));

    try {
      const response = await callQwenAPI(prompt);
      return response;
    } catch (error) {
      console.error('AI回复生成失败:', error);
      // 降级处理：直接返回处理后的结果
      return this.formatFallbackResponse(processedResult, queryPlan);
    }
  }

  /**
   * 降级回复格式化
   */
  formatFallbackResponse(processedResult, queryPlan) {
    const summary = this.resultProcessor.generateSummary(processedResult);
    const tableName = queryPlan.targetTable;
    
    return `${summary}。查询表：${tableName}，查询类型：${queryPlan.queryType}。如需更详细的分析，请稍后重试。`;
  }

  /**
   * 错误处理
   */
  async handleError(error, userMessage) {
    console.error('错误处理:', error);
    
    const { aiPrompts } = require('../../config/aiPrompts');
    const errorPrompt = aiPrompts.errorHandling
      .replace('{errorType}', error.name || 'UnknownError')
      .replace('{errorDetails}', error.message || '未知错误')
      .replace('{userQuestion}', userMessage);

    try {
      const errorResponse = await callQwenAPI(errorPrompt);
      return {
        type: 'error',
        content: errorResponse,
        needsData: false
      };
    } catch (aiError) {
      // 如果AI也出错，返回通用错误信息
      return {
        type: 'error',
        content: '抱歉，系统暂时无法处理您的请求，请稍后重试。',
        needsData: false
      };
    }
  }

  /**
   * 获取系统状态
   */
  getSystemStatus() {
    return {
      status: 'running',
      modules: {
        intentRecognizer: 'active',
        queryPlanner: 'active',
        resultProcessor: 'active'
      },
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = HybridQuerySystem; 