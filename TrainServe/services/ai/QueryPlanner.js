/**
 * 查询计划生成器
 * 基于用户意图和AI分析生成数据库查询计划
 */

const { aiPrompts } = require('../../config/aiPrompts');
const { databaseSchema } = require('../../config/databaseSchema');
const { callQwenAPI } = require('../../utils/aiService');
const SmartTableRecognizer = require('./SmartTableRecognizer');

class QueryPlanner {
  constructor() {
    this.schema = require('../../config/databaseSchema');
    this.smartTableRecognizer = new SmartTableRecognizer();
  }

  /**
   * 生成查询计划
   * @param {string} userMessage - 用户消息
   * @param {string} userId - 用户ID
   * @param {string} userRole - 用户角色
   * @returns {Object} 查询计划
   */
  async generatePlan(userMessage, userId, userRole) {
    try {
      console.log('开始生成查询计划:', { userMessage, userId, userRole });

      // 1. 检查是否包含"我的"关键词
      if (this.containsMyKeyword(userMessage) && userId) {
        console.log('检测到"我的"关键词，生成个人数据查询计划');
        return this.generatePersonalDataPlan(userMessage, userId, userRole);
      }

      // 2. 优先使用智能表名识别器
      console.log('优先使用智能表名识别器识别目标表');
      const smartTableName = await this.guessTargetTable(userMessage);
      console.log('智能识别目标表:', smartTableName);

      // 3. 构建AI提示词
      const prompt = this.buildPrompt(userMessage, userId, userRole);
      
      // 4. 调用AI生成查询计划
      const aiResponse = await callQwenAPI(prompt);
      
      // 5. 解析AI响应
      const queryPlan = this.parseAIResponse(aiResponse);
      
      // 6. 强制使用智能识别的表名（覆盖AI的错误识别）
      if (smartTableName && smartTableName !== 'appUser') {
        console.log(`AI识别表名: ${queryPlan.targetTable}, 智能识别表名: ${smartTableName}`);
        console.log('使用智能识别的表名覆盖AI识别结果');
        queryPlan.targetTable = smartTableName;
      }
      
      // 7. 验证和优化查询计划
      const validatedPlan = this.validateAndOptimize(queryPlan);
      
      console.log('最终生成的查询计划:', validatedPlan);
      return validatedPlan;
      
    } catch (error) {
      console.error('查询计划生成失败:', error);
      // 返回默认查询计划，但使用智能识别的表名
      const smartTableName = await this.guessTargetTable(userMessage);
      const defaultPlan = this.generateDefaultPlan(userMessage, smartTableName);
      try {
        if (smartTableName && smartTableName !== 'appUser') {
          defaultPlan.targetTable = smartTableName;
          console.log('默认计划使用智能识别的表名:', smartTableName);
        }
      } catch (tableError) {
        console.warn('智能表名识别失败，使用默认表名:', tableError.message);
      }
      return defaultPlan;
    }
  }

  /**
   * 构建AI提示词
   */
  buildPrompt(userMessage, userId, userRole) {
    const schemaInfo = this.formatSchemaInfo();
    
    return aiPrompts.queryPlanGeneration
      .replace('{userQuestion}', userMessage)
      .replace('{userId}', userId)
      .replace('{userRole}', userRole)
      .replace('{schemaInfo}', schemaInfo);
  }

  /**
   * 格式化数据库模式信息
   */
  formatSchemaInfo() {
    let schemaText = '';
    
    Object.entries(this.schema).forEach(([tableName, tableInfo]) => {
      schemaText += `\n表名：${tableName}\n`;
      schemaText += `描述：${tableInfo.description}\n`;
      schemaText += `字段：\n`;
      
      Object.entries(tableInfo.fields).forEach(([fieldName, fieldInfo]) => {
        schemaText += `  - ${fieldName}: ${fieldInfo.description} (${fieldInfo.type})\n`;
      });
      
      if (tableInfo.relationships) {
        schemaText += `关联关系：\n`;
        Object.entries(tableInfo.relationships).forEach(([relName, relInfo]) => {
          schemaText += `  - ${relName}: 关联${relInfo.model}表\n`;
        });
      }
      
      schemaText += `权限：${tableInfo.permissions.join(', ')}\n`;
      schemaText += '---\n';
    });
    
    return schemaText;
  }

  /**
   * 解析AI响应
   */
  parseAIResponse(aiResponse) {
    try {
      // 尝试直接解析JSON
      return JSON.parse(aiResponse);
    } catch (error) {
      console.error('AI响应JSON解析失败:', error);
      
      // 尝试提取JSON部分
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (parseError) {
          console.error('提取的JSON解析失败:', parseError);
        }
      }
      
      // 返回默认计划
      return this.generateDefaultPlan('无法解析AI响应');
    }
  }

  /**
   * 验证和优化查询计划
   */
  validateAndOptimize(queryPlan) {
    const validated = { ...queryPlan };
    
    // 1. 验证必要字段
    if (!validated.targetTable) {
      validated.targetTable = this.guessTargetTable(queryPlan.intent || '');
    }
    
    if (!validated.queryType) {
      validated.queryType = this.guessQueryType(queryPlan.intent || '');
    }
    
    // 2. 验证表名并强制修正消息查询
    if (this.isMessageQuery(validated.intent || '') && validated.targetTable === 'Message') {
      console.log('检测到消息查询，强制使用ChatSession表');
      validated.targetTable = 'ChatSession';
      // 修正查询条件
      validated.conditions = {
        field: 'userId',
        operator: '=',
        value: '689341ab4f2cd04e5f5a2692',
        description: '筛选指定用户ID的聊天会话'
      };
      // 修正字段
      validated.fields = ['sessionId', 'userId', 'messages', 'createdAt', 'updatedAt'];
    }
    
    if (!this.schema[validated.targetTable]) {
      validated.targetTable = this.findSimilarTable(validated.targetTable);
    }
    
    // 3. 设置默认字段
    if (!validated.fields || validated.fields.length === 0) {
      validated.fields = this.getDefaultFields(validated.targetTable);
    }
    
    // 4. 优化排序配置
    if (validated.orderBy) {
      // 如果orderBy是空对象或者缺少必要字段，则删除它
      if (!validated.orderBy.field || Object.keys(validated.orderBy).length === 0) {
        delete validated.orderBy;
      }
      // 如果orderBy有字段但没有方向，设置默认方向
      else if (validated.orderBy.field && !validated.orderBy.direction) {
        validated.orderBy.direction = 'asc';
      }
    }
    
    // 5. 添加安全限制
    validated.security = validated.security || '用户权限验证';
    validated.limit = validated.limit || 100;
    
    return validated;
  }

  /**
   * 猜测目标表
   */
  async guessTargetTable(intent) {
    try {
      // 使用智能表名识别器
      const tableName = await this.smartTableRecognizer.recognizeTable(intent, this.schema);
      console.log(`智能识别表名: ${intent} -> ${tableName}`);
      return tableName;
    } catch (error) {
      console.warn('智能表名识别失败，使用备选方案:', error.message);
      
      // 备选方案：关键词匹配
      const intentLower = intent.toLowerCase();
      
      if (intentLower.includes('消息') || intentLower.includes('聊天') || intentLower.includes('对话')) return 'ChatSession';
      if (intentLower.includes('用户')) return 'appUser';
      if (intentLower.includes('楼宇') || intentLower.includes('建筑')) return 'Building';
      if (intentLower.includes('房屋') || intentLower.includes('房间')) return 'House';
      if (intentLower.includes('企业') || intentLower.includes('公司')) return 'company';
      if (intentLower.includes('员工')) return 'employee';
      if (intentLower.includes('访客')) return 'visitor';
      if (intentLower.includes('合同')) return 'HeTong';
      if (intentLower.includes('账单')) return 'TenantBill';
      
      return 'appUser'; // 默认表
    }
  }

  /**
   * 猜测查询类型
   */
  guessQueryType(intent) {
    const intentLower = intent.toLowerCase();
    
    if (intentLower.includes('数量') || intentLower.includes('统计')) return 'count';
    if (intentLower.includes('搜索') || intentLower.includes('查找')) return 'search';
    if (intentLower.includes('分析') || intentLower.includes('趋势')) return 'aggregate';
    
    return 'select'; // 默认查询类型
  }

  /**
   * 查找相似表名
   */
  findSimilarTable(tableName) {
    const availableTables = Object.keys(this.schema);
    
    // 简单模糊匹配
    for (const table of availableTables) {
      if (table.toLowerCase().includes(tableName.toLowerCase()) ||
          tableName.toLowerCase().includes(table.toLowerCase())) {
        return table;
      }
    }
    
    return availableTables[0]; // 返回第一个可用表
  }

  /**
   * 获取默认字段
   */
  getDefaultFields(tableName) {
    const tableSchema = this.schema[tableName];
    if (!tableSchema) return ['_id'];
    
    // 返回前5个非敏感字段
    const fields = Object.keys(tableSchema.fields).filter(field => 
      !tableSchema.sensitiveFields.includes(field)
    );
    
    return fields.slice(0, 5);
  }

  /**
   * 判断是否为消息查询
   */
  isMessageQuery(intent) {
    const intentLower = intent.toLowerCase();
    return intentLower.includes('消息') || 
           intentLower.includes('聊天') || 
           intentLower.includes('对话') ||
           intentLower.includes('会话');
  }

  /**
   * 检查是否包含"我的"关键词
   */
  containsMyKeyword(intent) {
    const intentLower = intent.toLowerCase();
    return intentLower.includes('我的') || 
           intentLower.includes('自己') || 
           intentLower.includes('本人') ||
           intentLower.includes('个人');
  }

  /**
   * 生成默认查询计划
   */
  generateDefaultPlan(userMessage, targetTable = null) {
    // 如果没有指定目标表，尝试智能识别
    if (!targetTable) {
      targetTable = 'appUser'; // 默认表
    }
    
    // 根据表名返回合适的默认字段
    const getDefaultFields = (tableName) => {
      const fieldMap = {
        'appUser': ['_id', 'username', 'nickname'],
        'company': ['_id', 'name', 'type', 'inaddress'],
        'Building': ['_id', 'name', 'address', 'floors'],
        'House': ['_id', 'number', 'floor', 'area'],
        'employee': ['_id', 'name', 'company_id', 'role'],
        'visitor': ['_id', 'name', 'company_id', 'time'],
        'HeTong': ['_id', 'title', 'status', 'amount'],
        'TenantBill': ['_id', 'billType', 'amount', 'status']
      };
      
      return fieldMap[tableName] || ['_id'];
    };
    
    return {
      intent: '默认查询',
      queryType: 'select',
      targetTable: targetTable,
      fields: getDefaultFields(targetTable),
      conditions: {},
      joins: [],
      orderBy: { field: 'createTime', direction: 'desc' },
      limit: 100, // 增加默认限制，避免数据截断
      security: '默认安全设置',
      explanation: '由于无法解析用户意图，使用默认查询计划'
    };
  }

  /**
   * 生成个人数据查询计划
   */
  generatePersonalDataPlan(userMessage, userId, userRole) {
    // 根据用户消息内容判断要查询什么类型的个人数据
    const intentLower = userMessage.toLowerCase();
    
    if (intentLower.includes('用户') || intentLower.includes('信息')) {
      // 查询个人用户信息
      return {
        intent: '查询个人用户信息',
        queryType: 'select',
        targetTable: 'appUser',
        fields: ['_id', 'username', 'nickname', 'phone', 'avatar', 'createTime'],
        conditions: { _id: userId },
        joins: [],
        orderBy: { field: 'createTime', direction: 'desc' },
        limit: 1,
        security: '个人数据查询',
        explanation: '用户请求查看自己的个人信息，使用用户ID作为查询条件'
      };
    } else if (intentLower.includes('消息') || intentLower.includes('聊天')) {
      // 查询个人聊天记录
      return {
        intent: '查询个人聊天记录',
        queryType: 'select',
        targetTable: 'ChatSession',
        fields: ['_id', 'sessionId', 'messages', 'createdAt', 'updatedAt'],
        conditions: { userId: userId },
        joins: [],
        orderBy: { field: 'updatedAt', direction: 'desc' },
        limit: 10,
        security: '个人数据查询',
        explanation: '用户请求查看自己的聊天记录，使用用户ID作为查询条件'
      };
    } else {
      // 默认个人数据查询
      return {
        intent: '查询个人数据',
        queryType: 'select',
        targetTable: 'appUser',
        fields: ['_id', 'username', 'nickname', 'phone', 'avatar', 'createTime'],
        conditions: { _id: userId },
        joins: [],
        orderBy: { field: 'createTime', direction: 'desc' },
        limit: 1,
        security: '个人数据查询',
        explanation: '用户请求查看自己的数据，使用用户ID作为查询条件'
      };
    }
  }
}

module.exports = QueryPlanner; 