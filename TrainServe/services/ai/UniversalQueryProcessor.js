/**
 * 通用查询处理器
 * 自动处理任何表的查询，无需硬编码特定表的逻辑
 */

const DatabaseConnector = require('../database/DatabaseConnector');
const QueryBuilder = require('../../utils/queryBuilder');

class UniversalQueryProcessor {
  constructor() {
    this.dbConnector = new DatabaseConnector();
    this.queryBuilder = new QueryBuilder();
    this.queryCache = new Map();
  }

  /**
   * 通用查询入口
   * @param {Object} queryPlan - 查询计划
   * @returns {Promise<any>} 查询结果
   */
  async processQuery(queryPlan) {
    try {
      console.log('通用查询处理器开始处理:', {
        table: queryPlan.targetTable,
        type: queryPlan.queryType,
        conditions: queryPlan.conditions
      });

      // 1. 验证表是否存在
      const tableExists = await this.validateTable(queryPlan.targetTable);
      if (!tableExists) {
        return this.createErrorResult(`表 ${queryPlan.targetTable} 不存在或无法访问`);
      }

      // 2. 清理和验证查询条件
      const cleanedConditions = this.cleanQueryConditions(queryPlan.conditions);
      
      // 3. 根据查询类型执行查询
      let result;
      switch (queryPlan.queryType) {
        case 'select':
          result = await this.executeSelect(queryPlan, cleanedConditions);
          break;
        case 'count':
          result = await this.executeCount(queryPlan, cleanedConditions);
          break;
        case 'search':
          result = await this.executeSearch(queryPlan, cleanedConditions);
          break;
        case 'aggregate':
          result = await this.executeAggregate(queryPlan, cleanedConditions);
          break;
        default:
          result = await this.executeSelect(queryPlan, cleanedConditions);
      }

      // 4. 处理查询结果
      return this.processQueryResult(result, queryPlan);

    } catch (error) {
      console.error('通用查询处理器执行失败:', error);
      return this.createErrorResult(`查询执行失败: ${error.message}`);
    }
  }

  /**
   * 验证表是否存在
   */
  async validateTable(tableName) {
    try {
      const model = this.dbConnector.getModel(tableName);
      if (!model) {
        console.warn(`表 ${tableName} 的模型不存在`);
        return false;
      }

      // 尝试查询一条记录来验证表是否可访问
      const count = await model.countDocuments().limit(1);
      return true;
    } catch (error) {
      console.warn(`验证表 ${tableName} 失败:`, error.message);
      return false;
    }
  }

  /**
   * 清理查询条件
   */
  cleanQueryConditions(conditions) {
    if (!conditions || typeof conditions !== 'object') {
      return {};
    }

    const cleaned = {};
    
    Object.entries(conditions).forEach(([key, value]) => {
      // 跳过空键和空值
      if (!key || key === '' || value === '' || value === null || value === undefined) {
        return;
      }

      // 如果是复杂条件对象，验证其有效性
      if (typeof value === 'object' && value !== null) {
        const { field, operator, value: conditionValue } = value;
        if (field && operator && conditionValue !== '' && conditionValue !== null && conditionValue !== undefined) {
          cleaned[key] = value;
        }
      } else {
        // 简单条件
        cleaned[key] = value;
      }
    });

    return cleaned;
  }

  /**
   * 执行SELECT查询
   */
  async executeSelect(queryPlan, conditions) {
    const model = this.dbConnector.getModel(queryPlan.targetTable);
    
    // 构建查询条件
    const query = this.queryBuilder.buildQuery(conditions);
    
    // 构建查询选项
    const options = this.buildQueryOptions(queryPlan);
    
    console.log('执行SELECT查询:', { query, options });
    
    // 执行查询
    let result = await model.find(query, options.projection, options);
    
    // 处理关联查询
    if (queryPlan.joins && queryPlan.joins.length > 0) {
      result = await this.processJoins(result, queryPlan.joins);
    }
    
    return result;
  }

  /**
   * 执行COUNT查询
   */
  async executeCount(queryPlan, conditions) {
    const model = this.dbConnector.getModel(queryPlan.targetTable);
    const query = this.queryBuilder.buildQuery(conditions);
    
    console.log('执行COUNT查询:', { query });
    
    const count = await model.countDocuments(query);
    
    return {
      table: queryPlan.targetTable,
      count: count,
      conditions: conditions,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 执行搜索查询
   */
  async executeSearch(queryPlan, conditions) {
    const model = this.dbConnector.getModel(queryPlan.targetTable);
    
    // 构建搜索条件
    const searchQuery = this.buildSearchQuery(queryPlan, conditions);
    
    console.log('执行搜索查询:', { searchQuery });
    
    // 执行搜索
    const options = this.buildQueryOptions(queryPlan);
    const result = await model.find(searchQuery, options.projection, options);
    
    return result;
  }

  /**
   * 执行聚合查询
   */
  async executeAggregate(queryPlan, conditions) {
    const model = this.dbConnector.getModel(queryPlan.targetTable);
    
    // 构建聚合管道
    const pipeline = this.buildAggregationPipeline(queryPlan, conditions);
    
    console.log('执行聚合查询，管道长度:', pipeline.length);
    
    const result = await model.aggregate(pipeline);
    
    return result;
  }

  /**
   * 构建查询选项
   */
  buildQueryOptions(queryPlan) {
    const options = {};
    
    // 字段投影
    if (queryPlan.fields && queryPlan.fields.length > 0) {
      const projection = {};
      queryPlan.fields.forEach(field => {
        projection[field] = 1;
      });
      options.projection = projection;
    }
    
    // 排序
    if (queryPlan.orderBy && queryPlan.orderBy.field) {
      options.sort = {};
      options.sort[queryPlan.orderBy.field] = queryPlan.orderBy.direction === 'desc' ? -1 : 1;
    }
    
    // 限制数量
    if (queryPlan.limit && queryPlan.limit > 0) {
      options.limit = queryPlan.limit;
    }
    
    return options;
  }

  /**
   * 构建搜索查询
   */
  buildSearchQuery(queryPlan, conditions) {
    const searchQuery = {};
    
    // 合并基本条件
    Object.assign(searchQuery, this.queryBuilder.buildQuery(conditions));
    
    // 如果有搜索关键词，构建文本搜索
    if (queryPlan.searchText) {
      const textSearch = {};
      const searchableFields = this.getSearchableFields(queryPlan.targetTable);
      
      searchableFields.forEach(field => {
        textSearch[field] = { $regex: queryPlan.searchText, $options: 'i' };
      });
      
      // 使用 $or 操作符组合搜索
      if (Object.keys(textSearch).length > 0) {
        searchQuery.$or = Object.values(textSearch);
      }
    }
    
    return searchQuery;
  }

  /**
   * 获取可搜索字段
   */
  getSearchableFields(tableName) {
    try {
      const model = this.dbConnector.getModel(tableName);
      if (!model) return [];
      
      // 获取表的字段信息
      const schema = model.schema;
      if (!schema) return [];
      
      // 返回字符串类型的字段作为可搜索字段
      const searchableFields = [];
      Object.keys(schema.paths).forEach(field => {
        if (schema.paths[field].instance === 'String') {
          searchableFields.push(field);
        }
      });
      
      return searchableFields.slice(0, 5); // 限制字段数量
    } catch (error) {
      console.warn(`获取表 ${tableName} 的可搜索字段失败:`, error.message);
      return [];
    }
  }

  /**
   * 构建聚合管道
   */
  buildAggregationPipeline(queryPlan, conditions) {
    const pipeline = [];
    
    // 添加匹配阶段
    if (Object.keys(conditions).length > 0) {
      pipeline.push({ $match: this.queryBuilder.buildQuery(conditions) });
    }
    
    // 添加分组阶段
    if (queryPlan.groupBy) {
      const groupStage = { $group: { _id: `$${queryPlan.groupBy}` } };
      
      // 添加聚合字段
      if (queryPlan.aggregateFields) {
        queryPlan.aggregateFields.forEach(field => {
          if (field.operation === 'count') {
            groupStage.$group[field.name] = { $sum: 1 };
          } else if (field.operation === 'sum') {
            groupStage.$group[field.name] = { $sum: `$${field.field}` };
          } else if (field.operation === 'avg') {
            groupStage.$group[field.name] = { $avg: `$${field.field}` };
          }
        });
      }
      
      pipeline.push(groupStage);
    }
    
    // 添加排序阶段
    if (queryPlan.orderBy && queryPlan.orderBy.field) {
      pipeline.push({
        $sort: {
          [queryPlan.orderBy.field]: queryPlan.orderBy.direction === 'desc' ? -1 : 1
        }
      });
    }
    
    // 添加限制阶段
    if (queryPlan.limit && queryPlan.limit > 0) {
      pipeline.push({ $limit: queryPlan.limit });
    }
    
    return pipeline;
  }

  /**
   * 处理关联查询
   */
  async processJoins(results, joins) {
    // 这里可以实现关联查询逻辑
    // 暂时返回原结果
    return results;
  }

  /**
   * 处理查询结果
   */
  processQueryResult(result, queryPlan) {
    if (queryPlan.queryType === 'count') {
      return {
        success: true,
        type: 'count',
        data: result,
        message: `查询成功，共找到 ${result.count} 条记录`
      };
    } else {
      return {
        success: true,
        type: 'data',
        data: result,
        count: Array.isArray(result) ? result.length : 1,
        message: `查询成功，共找到 ${Array.isArray(result) ? result.length : 1} 条记录`
      };
    }
  }

  /**
   * 创建错误结果
   */
  createErrorResult(message) {
    return {
      success: false,
      type: 'error',
      message: message,
      data: null
    };
  }
}

module.exports = UniversalQueryProcessor; 