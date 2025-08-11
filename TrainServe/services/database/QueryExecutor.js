/**
 * 查询执行器
 * 执行各种类型的数据库查询，处理查询结果和错误
 */

const DatabaseConnector = require('./DatabaseConnector');
const QueryBuilder = require('../../utils/queryBuilder');

class QueryExecutor {
  constructor() {
    this.dbConnector = new DatabaseConnector();
    this.queryBuilder = new QueryBuilder();
    this.queryCache = new Map(); // 简单的内存缓存
    this.maxCacheSize = 100; // 最大缓存条目数
  }

  /**
   * 执行查询
   * @param {Object} queryPlan - 查询计划
   * @returns {Promise<any>} 查询结果
   */
  async execute(queryPlan) {
    try {
      console.log('开始执行数据库查询:', {
        table: queryPlan.targetTable,
        type: queryPlan.queryType,
        fields: queryPlan.fields?.length || 0
      });

      // 1. 验证查询计划
      const validation = this.queryBuilder.validateQueryPlan(queryPlan);
      if (!validation.isValid) {
        throw new Error(`查询计划验证失败: ${validation.errors.join(', ')}`);
      }

      // 2. 检查缓存
      const cacheKey = this.generateCacheKey(queryPlan);
      const cachedResult = this.getFromCache(cacheKey);
      if (cachedResult) {
        console.log('返回缓存结果');
        return cachedResult;
      }

      // 3. 根据查询类型执行
      let result;
      switch (queryPlan.queryType) {
        case 'select':
          result = await this.executeSelect(queryPlan);
          break;
        case 'count':
          result = await this.executeCount(queryPlan);
          break;
        case 'aggregate':
          result = await this.executeAggregate(queryPlan);
          break;
        case 'search':
          result = await this.executeSearch(queryPlan);
          break;
        default:
          throw new Error(`不支持的查询类型: ${queryPlan.queryType}`);
      }

      // 4. 缓存结果
      this.addToCache(cacheKey, result);

      console.log('查询执行完成，结果类型:', typeof result, '结果大小:', 
        Array.isArray(result) ? result.length : 1
      );

      return result;

    } catch (error) {
      console.error('查询执行失败:', error);
      throw new Error(`查询执行失败: ${error.message}`);
    }
  }

  /**
   * 执行SELECT查询
   * @param {Object} queryPlan - 查询计划
   * @returns {Promise<Array>} 查询结果
   */
  async executeSelect(queryPlan) {
    const model = this.dbConnector.getModel(queryPlan.targetTable);
    
    // 构建查询条件
    const query = this.queryBuilder.buildQuery(queryPlan.conditions);
    
    // 构建查询选项
    const options = this.queryBuilder.buildQueryOptions(queryPlan);
    
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
   * @param {Object} queryPlan - 查询计划
   * @returns {Promise<Object>} 统计结果
   */
  async executeCount(queryPlan) {
    const model = this.dbConnector.getModel(queryPlan.targetTable);
    const query = this.queryBuilder.buildQuery(queryPlan.conditions);
    
    console.log('执行COUNT查询:', { query });
    
    const count = await model.countDocuments(query);
    
    return {
      table: queryPlan.targetTable,
      count: count,
      conditions: queryPlan.conditions,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 执行聚合查询
   * @param {Object} queryPlan - 查询计划
   * @returns {Promise<Array>} 聚合结果
   */
  async executeAggregate(queryPlan) {
    const model = this.dbConnector.getModel(queryPlan.targetTable);
    
    // 构建聚合管道
    const pipeline = this.queryBuilder.buildAggregationPipeline(queryPlan);
    
    console.log('执行聚合查询，管道长度:', pipeline.length);
    
    const result = await model.aggregate(pipeline);
    
    return result;
  }

  /**
   * 执行搜索查询
   * @param {Object} queryPlan - 查询计划
   * @returns {Promise<Array>} 搜索结果
   */
  async executeSearch(queryPlan) {
    const model = this.dbConnector.getModel(queryPlan.targetTable);
    
    // 构建搜索条件
    const searchQuery = this.buildSearchQuery(queryPlan);
    
    console.log('执行搜索查询:', { searchQuery });
    
    // 执行搜索
    const options = this.queryBuilder.buildQueryOptions(queryPlan);
    const result = await model.find(searchQuery, options.projection, options);
    
    return result;
  }

  /**
   * 构建搜索查询
   * @param {Object} queryPlan - 查询计划
   * @returns {Object} 搜索查询条件
   */
  buildSearchQuery(queryPlan) {
    const searchQuery = {};
    
    // 如果有搜索关键词，构建文本搜索
    if (queryPlan.searchText) {
      const textSearch = {};
      const searchableFields = this.getSearchableFields(queryPlan.targetTable);
      
      searchableFields.forEach(field => {
        textSearch[field] = { $regex: queryPlan.searchText, $options: 'i' };
      });
      
      if (Object.keys(textSearch).length > 0) {
        searchQuery.$or = [textSearch];
      }
    }
    
    // 合并其他查询条件
    if (queryPlan.conditions) {
      Object.assign(searchQuery, this.queryBuilder.buildQuery(queryPlan.conditions));
    }
    
    return searchQuery;
  }

  /**
   * 获取可搜索字段
   * @param {string} tableName - 表名
   * @returns {Array<string>} 可搜索字段列表
   */
  getSearchableFields(tableName) {
    const searchableFieldPatterns = [
      'name', 'title', 'description', 'content', 'username', 'email', 'phone'
    ];
    
    try {
      const { databaseSchema } = require('../../config/databaseSchema');
      const tableSchema = databaseSchema[tableName];
      
      if (!tableSchema) return [];
      
      return Object.keys(tableSchema.fields).filter(field => 
        searchableFieldPatterns.some(pattern => field.includes(pattern))
      );
    } catch (error) {
      console.warn('获取可搜索字段失败:', error.message);
      return ['name', 'title', 'description']; // 默认字段
    }
  }

  /**
   * 处理关联查询
   * @param {Array} results - 查询结果
   * @param {Array} joins - 关联配置
   * @returns {Promise<Array>} 处理后的结果
   */
  async processJoins(results, joins) {
    if (!Array.isArray(results) || results.length === 0) {
      return results;
    }

    console.log('处理关联查询，关联数量:', joins.length);

    for (const join of joins) {
      try {
        const relatedModel = this.dbConnector.getModel(join.table);
        
        // 为每个结果添加关联数据
        for (const result of results) {
          if (result[join.localField]) {
            try {
              const relatedData = await relatedModel.findById(result[join.localField]);
              result[join.as || join.table] = relatedData;
            } catch (error) {
              console.warn(`关联查询失败: ${error.message}`);
              result[join.as || join.table] = null;
            }
          }
        }
      } catch (error) {
        console.error(`处理关联查询失败: ${error.message}`);
      }
    }

    return results;
  }

  /**
   * 生成缓存键
   * @param {Object} queryPlan - 查询计划
   * @returns {string} 缓存键
   */
  generateCacheKey(queryPlan) {
    const keyData = {
      table: queryPlan.targetTable,
      type: queryPlan.queryType,
      fields: queryPlan.fields?.sort() || [],
      conditions: queryPlan.conditions || {},
      limit: queryPlan.limit || 0,
      skip: queryPlan.skip || 0
    };
    
    return JSON.stringify(keyData);
  }

  /**
   * 从缓存获取结果
   * @param {string} key - 缓存键
   * @returns {any|null} 缓存结果
   */
  getFromCache(key) {
    const cached = this.queryCache.get(key);
    
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) { // 5分钟过期
      return cached.data;
    }
    
    // 清理过期缓存
    if (cached) {
      this.queryCache.delete(key);
    }
    
    return null;
  }

  /**
   * 添加结果到缓存
   * @param {string} key - 缓存键
   * @param {any} data - 缓存数据
   */
  addToCache(key, data) {
    // 检查缓存大小
    if (this.queryCache.size >= this.maxCacheSize) {
      // 删除最旧的缓存条目
      const oldestKey = this.queryCache.keys().next().value;
      this.queryCache.delete(oldestKey);
    }
    
    this.queryCache.set(key, {
      data: data,
      timestamp: Date.now()
    });
  }

  /**
   * 清理缓存
   */
  clearCache() {
    this.queryCache.clear();
    console.log('查询缓存已清理');
  }

  /**
   * 获取缓存统计信息
   * @returns {Object} 缓存统计
   */
  getCacheStats() {
    return {
      size: this.queryCache.size,
      maxSize: this.maxCacheSize,
      hitRate: this.calculateHitRate(),
      entries: Array.from(this.queryCache.entries()).map(([key, value]) => ({
        key: key.substring(0, 50) + '...',
        timestamp: new Date(value.timestamp).toISOString(),
        dataSize: JSON.stringify(value.data).length
      }))
    };
  }

  /**
   * 计算缓存命中率
   * @returns {number} 命中率
   */
  calculateHitRate() {
    // 这里可以实现更复杂的命中率计算
    return 0.8; // 示例值
  }

  /**
   * 执行批量查询
   * @param {Array<Object>} queryPlans - 查询计划数组
   * @returns {Promise<Array>} 查询结果数组
   */
  async executeBatch(queryPlans) {
    console.log('开始执行批量查询，数量:', queryPlans.length);
    
    const results = [];
    const errors = [];
    
    for (let i = 0; i < queryPlans.length; i++) {
      try {
        const result = await this.execute(queryPlans[i]);
        results.push({
          index: i,
          success: true,
          data: result
        });
      } catch (error) {
        errors.push({
          index: i,
          success: false,
          error: error.message
        });
      }
    }
    
    console.log('批量查询完成，成功:', results.length, '失败:', errors.length);
    
    return {
      results,
      errors,
      summary: {
        total: queryPlans.length,
        success: results.length,
        failed: errors.length
      }
    };
  }

  /**
   * 获取查询性能统计
   * @returns {Object} 性能统计
   */
  getPerformanceStats() {
    return {
      cacheSize: this.queryCache.size,
      cacheHitRate: this.calculateHitRate(),
      databaseConnector: this.dbConnector.getConnectionStats(),
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = QueryExecutor; 