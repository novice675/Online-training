/**
 * 结果处理器
 * 处理和格式化数据库查询结果，为AI分析做准备
 */

class ResultProcessor {
  constructor() {
    this.maxResultSize = 1000; // 最大结果大小限制
  }

  /**
   * 处理查询结果
   * @param {any} queryResult - 原始查询结果
   * @param {Object} queryPlan - 查询计划
   * @param {string} userMessage - 用户原始消息
   * @returns {Object} 处理后的结果
   */
  async process(queryResult, queryPlan, userMessage) {
    try {
      console.log('开始处理查询结果:', { 
        resultType: typeof queryResult, 
        resultSize: Array.isArray(queryResult) ? queryResult.length : 1 
      });

      // 1. 基础结果处理
      let processedResult = this.processBasicResult(queryResult, queryPlan);

      // 2. 数据脱敏
      processedResult = this.applyDataMasking(processedResult, queryPlan);

      // 3. 结果格式化
      processedResult = this.formatResult(processedResult, queryPlan);

      // 4. 结果验证
      processedResult = this.validateResult(processedResult, queryPlan);

      console.log('结果处理完成，最终结果大小:', 
        Array.isArray(processedResult) ? processedResult.length : 1
      );

      return processedResult;

    } catch (error) {
      console.error('结果处理失败:', error);
      return this.generateErrorResult(error, queryPlan);
    }
  }

  /**
   * 基础结果处理
   */
  processBasicResult(queryResult, queryPlan) {
    // 如果是统计查询结果
    if (queryPlan.queryType === 'count') {
      return {
        type: 'count',
        value: queryResult.count || queryResult,
        table: queryPlan.targetTable,
        conditions: queryPlan.conditions
      };
    }

    // 如果是聚合查询结果
    if (queryPlan.queryType === 'aggregate') {
      return {
        type: 'aggregate',
        data: queryResult,
        table: queryPlan.targetTable,
        aggregation: queryPlan.aggregation || 'default'
      };
    }

    // 如果是普通查询结果
    if (Array.isArray(queryResult)) {
      return {
        type: 'list',
        data: queryResult,
        count: queryResult.length,
        table: queryPlan.targetTable,
        fields: queryPlan.fields
      };
    }

    // 如果是单个对象
    if (typeof queryResult === 'object' && queryResult !== null) {
      return {
        type: 'single',
        data: queryResult,
        table: queryPlan.targetTable,
        fields: queryPlan.fields
      };
    }

    // 其他类型
    return {
      type: 'raw',
      data: queryResult,
      table: queryPlan.targetTable
    };
  }

  /**
   * 应用数据脱敏
   */
  applyDataMasking(processedResult, queryPlan) {
    const tableSchema = this.getTableSchema(queryPlan.targetTable);
    if (!tableSchema || !tableSchema.sensitiveFields) {
      return processedResult;
    }

    const sensitiveFields = tableSchema.sensitiveFields;
    
    if (processedResult.type === 'list' || processedResult.type === 'single') {
      const data = processedResult.data;
      if (Array.isArray(data)) {
        // 处理数组数据
        processedResult.data = data.map(item => this.maskSensitiveData(item, sensitiveFields));
      } else {
        // 处理单个对象
        processedResult.data = this.maskSensitiveData(data, sensitiveFields);
      }
    }

    return processedResult;
  }

  /**
   * 脱敏单个对象
   */
  maskSensitiveData(obj, sensitiveFields) {
    if (!obj || typeof obj !== 'object') return obj;

    const masked = { ...obj };
    
    sensitiveFields.forEach(field => {
      if (masked.hasOwnProperty(field)) {
        if (field === 'password') {
          masked[field] = '***';
        } else if (field === 'sfz') {
          // 身份证号脱敏：保留前4位和后4位
          const value = String(masked[field]);
          if (value.length > 8) {
            masked[field] = value.substring(0, 4) + '****' + value.substring(value.length - 4);
          } else {
            masked[field] = '****';
          }
        } else if (field === 'phone') {
          // 手机号脱敏：保留前3位和后4位
          const value = String(masked[field]);
          if (value.length > 7) {
            masked[field] = value.substring(0, 3) + '****' + value.substring(value.length - 4);
          } else {
            masked[field] = '****';
          }
        } else {
          // 其他敏感字段用星号替换
          masked[field] = '***';
        }
      }
    });

    return masked;
  }

  /**
   * 获取表模式信息
   */
  getTableSchema(tableName) {
    try {
      const { databaseSchema } = require('../../config/databaseSchema');
      return databaseSchema[tableName];
    } catch (error) {
      console.error('获取表模式失败:', error);
      return null;
    }
  }

  /**
   * 格式化结果
   */
  formatResult(processedResult, queryPlan) {
    // 添加元数据
    processedResult.metadata = {
      processedAt: new Date().toISOString(),
      queryPlan: {
        targetTable: queryPlan.targetTable,
        queryType: queryPlan.queryType,
        fields: queryPlan.fields
      },
      userMessage: queryPlan.intent || '未知查询'
    };

    // 添加统计信息
    if (processedResult.type === 'list') {
      processedResult.statistics = {
        totalCount: processedResult.count,
        returnedCount: Math.min(processedResult.count, queryPlan.limit || 100),
        hasMore: processedResult.count > (queryPlan.limit || 100)
      };
    }

    return processedResult;
  }

  /**
   * 验证结果
   */
  validateResult(processedResult, queryPlan) {
    // 检查结果大小限制
    if (processedResult.type === 'list' && processedResult.data.length > this.maxResultSize) {
      console.warn(`结果大小超过限制，截取前${this.maxResultSize}条记录`);
      processedResult.data = processedResult.data.slice(0, this.maxResultSize);
      processedResult.statistics.returnedCount = this.maxResultSize;
      processedResult.statistics.warning = `结果已截取，仅显示前${this.maxResultSize}条记录`;
    }

    // 检查必要字段
    if (!processedResult.type || !processedResult.table) {
      processedResult.type = 'unknown';
      processedResult.table = queryPlan.targetTable;
    }

    return processedResult;
  }

  /**
   * 生成错误结果
   */
  generateErrorResult(error, queryPlan) {
    return {
      type: 'error',
      error: {
        message: error.message || '未知错误',
        code: error.code || 'UNKNOWN_ERROR',
        timestamp: new Date().toISOString()
      },
      table: queryPlan.targetTable,
      metadata: {
        processedAt: new Date().toISOString(),
        queryPlan: {
          targetTable: queryPlan.targetTable,
          queryType: queryPlan.queryType
        }
      }
    };
  }

  /**
   * 生成结果摘要
   */
  generateSummary(processedResult) {
    if (processedResult.type === 'error') {
      return `查询失败：${processedResult.error.message}`;
    }

    if (processedResult.type === 'count') {
      return `查询到 ${processedResult.value} 条记录`;
    }

    if (processedResult.type === 'list') {
      return `查询到 ${processedResult.count} 条记录，返回 ${processedResult.statistics.returnedCount} 条`;
    }

    if (processedResult.type === 'single') {
      return '查询到 1 条记录';
    }

    if (processedResult.type === 'aggregate') {
      return `聚合查询完成，返回 ${processedResult.data.length} 个结果`;
    }

    return '查询完成';
  }
}

module.exports = ResultProcessor; 