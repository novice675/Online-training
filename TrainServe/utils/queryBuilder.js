/**
 * 查询构建工具
 * 将AI生成的查询计划转换为MongoDB查询语句
 */

class QueryBuilder {
  constructor() {
    // 支持的操作符映射
    this.operators = {
      eq: '$eq',      // 等于
      ne: '$ne',      // 不等于
      gt: '$gt',      // 大于
      gte: '$gte',    // 大于等于
      lt: '$lt',      // 小于
      lte: '$lte',    // 小于等于
      in: '$in',      // 包含在数组中
      nin: '$nin',    // 不包含在数组中
      regex: '$regex', // 正则表达式
      exists: '$exists', // 字段存在
      type: '$type'   // 字段类型
    };

    // 支持的数据类型
    this.dataTypes = {
      string: 2,
      number: 1,
      boolean: 8,
      date: 9,
      objectId: 7,
      array: 4
    };
  }

  /**
   * 清理和验证查询条件
   * @param {Object} conditions - 原始查询条件
   * @returns {Object} 清理后的查询条件
   */
  cleanConditions(conditions) {
    if (!conditions || typeof conditions !== 'object') {
      return {};
    }

    const cleaned = {};
    
    Object.entries(conditions).forEach(([key, value]) => {
      // 跳过空键
      if (!key || key === '') {
        return;
      }
      
      // 跳过空值
      if (value === '' || value === null || value === undefined) {
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
   * 构建MongoDB查询条件
   * @param {Object} conditions - 查询条件
   * @returns {Object} MongoDB查询对象
   */
  buildQuery(conditions) {
    // 先清理条件
    const cleanedConditions = this.cleanConditions(conditions);
    
    if (Object.keys(cleanedConditions).length === 0) {
      return {};
    }

    const query = {};

    Object.entries(cleanedConditions).forEach(([field, condition]) => {
      if (typeof condition === 'object' && condition !== null) {
        // 复杂条件
        const complexCondition = this.buildComplexCondition(condition);
        if (complexCondition !== null) {
          query[field] = complexCondition;
        }
      } else {
        // 简单条件（等于）
        query[field] = condition;
      }
    });

    return query;
  }

  /**
   * 构建复杂查询条件
   * @param {Object} condition - 复杂条件对象
   * @returns {Object|null} MongoDB条件对象，无效时返回null
   */
  buildComplexCondition(condition) {
    const { operator, value, field, description } = condition;

    // 验证必要字段
    if (!operator || !this.operators[operator]) {
      console.warn(`不支持的操作符或操作符为空: ${operator}`);
      return null;
    }

    // 验证字段名
    if (!field || field === '') {
      console.warn('字段名为空，跳过此条件');
      return null;
    }

    // 验证值
    if (value === '' || value === null || value === undefined) {
      console.warn(`字段 ${field} 的值为空，跳过此条件`);
      return null;
    }

    const mongoOperator = this.operators[operator];

    switch (operator) {
      case 'eq':
        return value;
      
      case 'ne':
        return { [mongoOperator]: value };
      
      case 'gt':
      case 'gte':
      case 'lt':
      case 'lte':
        return { [mongoOperator]: this.convertValue(value, field) };
      
      case 'in':
      case 'nin':
        if (!Array.isArray(value)) {
          console.warn(`操作符${operator}需要数组值，但收到: ${typeof value}`);
          return null;
        }
        return { [mongoOperator]: value.map(v => this.convertValue(v, field)) };
      
      case 'regex':
        return { [mongoOperator]: value, $options: 'i' }; // 不区分大小写
      
      case 'exists':
        return { [mongoOperator]: Boolean(value) };
      
      case 'type':
        const typeValue = this.dataTypes[value] || value;
        return { [mongoOperator]: typeValue };
      
      default:
        throw new Error(`未实现的操作符: ${operator}`);
    }
  }

  /**
   * 转换值类型
   * @param {any} value - 原始值
   * @param {string} field - 字段名
   * @returns {any} 转换后的值
   */
  convertValue(value, field) {
    if (value === null || value === undefined) {
      return value;
    }

    // 根据字段名猜测类型
    if (field.includes('id') && field !== 'id') {
      // 可能是ObjectId
      try {
        const mongoose = require('mongoose');
        return mongoose.Types.ObjectId.isValid(value) ? value : value;
      } catch (error) {
        return value;
      }
    }

    if (field.includes('date') || field.includes('time')) {
      // 日期类型
      if (value instanceof Date) {
        return value;
      }
      if (typeof value === 'string') {
        const date = new Date(value);
        return isNaN(date.getTime()) ? value : date;
      }
      if (typeof value === 'number') {
        return new Date(value);
      }
    }

    if (field.includes('number') || field.includes('count') || field.includes('amount')) {
      // 数字类型
      const num = Number(value);
      return isNaN(num) ? value : num;
    }

    if (field.includes('boolean') || field.includes('is') || field.includes('has')) {
      // 布尔类型
      if (typeof value === 'boolean') {
        return value;
      }
      if (typeof value === 'string') {
        return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
      }
      if (typeof value === 'number') {
        return value !== 0;
      }
    }

    return value;
  }

  /**
   * 构建排序选项
   * @param {Object} orderBy - 排序配置
   * @returns {Object} MongoDB排序对象
   */
  buildSort(orderBy) {
    if (!orderBy || !orderBy.field) {
      return {};
    }

    const direction = orderBy.direction === 'desc' ? -1 : 1;
    return { [orderBy.field]: direction };
  }

  /**
   * 构建投影选项
   * @param {Array<string>} fields - 字段列表
   * @returns {Object} MongoDB投影对象
   */
  buildProjection(fields) {
    if (!fields || fields.length === 0) {
      return {};
    }

    const projection = {};
    fields.forEach(field => {
      projection[field] = 1;
    });

    return projection;
  }

  /**
   * 构建聚合管道
   * @param {Object} queryPlan - 查询计划
   * @returns {Array} MongoDB聚合管道
   */
  buildAggregationPipeline(queryPlan) {
    const pipeline = [];

    // 1. 匹配阶段
    if (queryPlan.conditions && Object.keys(queryPlan.conditions).length > 0) {
      pipeline.push({
        $match: this.buildQuery(queryPlan.conditions)
      });
    }

    // 2. 关联查询
    if (queryPlan.joins && queryPlan.joins.length > 0) {
      queryPlan.joins.forEach(join => {
        pipeline.push({
          $lookup: {
            from: join.table,
            localField: join.on.split('.')[0],
            foreignField: join.on.split('.')[1],
            as: join.table
          }
        });
      });
    }

    // 3. 投影阶段
    if (queryPlan.fields && queryPlan.fields.length > 0) {
      const projection = {};
      queryPlan.fields.forEach(field => {
        projection[field] = 1;
      });
      pipeline.push({ $project: projection });
    }

    // 4. 排序阶段
    if (queryPlan.orderBy) {
      pipeline.push({ $sort: this.buildSort(queryPlan.orderBy) });
    }

    // 5. 限制阶段
    if (queryPlan.limit) {
      pipeline.push({ $limit: parseInt(queryPlan.limit) });
    }

    return pipeline;
  }

  /**
   * 构建完整的查询选项
   * @param {Object} queryPlan - 查询计划
   * @returns {Object} MongoDB查询选项
   */
  buildQueryOptions(queryPlan) {
    const options = {};

    // 排序
    if (queryPlan.orderBy) {
      options.sort = this.buildSort(queryPlan.orderBy);
    }

    // 投影
    if (queryPlan.fields && queryPlan.fields.length > 0) {
      options.projection = this.buildProjection(queryPlan.fields);
    }

    // 限制
    if (queryPlan.limit) {
      options.limit = parseInt(queryPlan.limit);
    }

    // 跳过
    if (queryPlan.skip) {
      options.skip = parseInt(queryPlan.skip);
    }

    // 分页
    if (queryPlan.page && queryPlan.pageSize) {
      const page = parseInt(queryPlan.page);
      const pageSize = parseInt(queryPlan.pageSize);
      options.skip = (page - 1) * pageSize;
      options.limit = pageSize;
    }

    return options;
  }

  /**
   * 验证查询计划
   * @param {Object} queryPlan - 查询计划
   * @returns {Object} 验证结果
   */
  validateQueryPlan(queryPlan) {
    const errors = [];
    const warnings = [];

    // 检查必要字段
    if (!queryPlan.targetTable) {
      errors.push('缺少目标表名');
    }

    if (!queryPlan.queryType) {
      errors.push('缺少查询类型');
    }

    // 检查查询类型
    const validQueryTypes = ['select', 'count', 'aggregate', 'search'];
    if (queryPlan.queryType && !validQueryTypes.includes(queryPlan.queryType)) {
      errors.push(`无效的查询类型: ${queryPlan.queryType}`);
    }

    // 检查字段
    if (queryPlan.fields && !Array.isArray(queryPlan.fields)) {
      errors.push('字段列表必须是数组');
    }

    // 检查条件
    if (queryPlan.conditions && typeof queryPlan.conditions !== 'object') {
      errors.push('查询条件必须是对象');
    }

    // 检查限制
    if (queryPlan.limit && (isNaN(queryPlan.limit) || queryPlan.limit < 0)) {
      errors.push('限制数量必须是正整数');
    }

    // 检查排序
    if (queryPlan.orderBy) {
      if (!queryPlan.orderBy.field) {
        errors.push('排序配置缺少字段名');
      } else if (queryPlan.orderBy.direction && !['asc', 'desc'].includes(queryPlan.orderBy.direction)) {
        errors.push('排序方向必须是asc或desc');
      }
    }
    
    // 对于COUNT查询，排序字段不是必需的
    if (queryPlan.queryType === 'count' && queryPlan.orderBy && !queryPlan.orderBy.field) {
      // 移除排序配置，因为COUNT查询不需要排序
      delete queryPlan.orderBy;
    }

    // 警告检查
    if (queryPlan.limit && queryPlan.limit > 1000) {
      warnings.push('查询限制数量过大，可能影响性能');
    }

    if (queryPlan.joins && queryPlan.joins.length > 3) {
      warnings.push('关联查询过多，可能影响性能');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 生成查询统计信息
   * @param {Object} queryPlan - 查询计划
   * @returns {Object} 统计信息
   */
  generateQueryStats(queryPlan) {
    return {
      table: queryPlan.targetTable,
      type: queryPlan.queryType,
      fields: queryPlan.fields ? queryPlan.fields.length : 0,
      conditions: queryPlan.conditions ? Object.keys(queryPlan.conditions).length : 0,
      joins: queryPlan.joins ? queryPlan.joins.length : 0,
      hasSorting: !!queryPlan.orderBy,
      hasLimit: !!queryPlan.limit,
      estimatedComplexity: this.estimateQueryComplexity(queryPlan)
    };
  }

  /**
   * 估算查询复杂度
   * @param {Object} queryPlan - 查询计划
   * @returns {string} 复杂度级别
   */
  estimateQueryComplexity(queryPlan) {
    let score = 0;

    // 基础分数
    score += 1;

    // 字段数量
    if (queryPlan.fields && queryPlan.fields.length > 5) {
      score += 1;
    }

    // 条件数量
    if (queryPlan.conditions && Object.keys(queryPlan.conditions).length > 3) {
      score += 1;
    }

    // 关联查询
    if (queryPlan.joins && queryPlan.joins.length > 0) {
      score += queryPlan.joins.length;
    }

    // 排序
    if (queryPlan.orderBy) {
      score += 1;
    }

    // 限制
    if (queryPlan.limit && queryPlan.limit > 100) {
      score += 1;
    }

    if (score <= 2) return 'low';
    if (score <= 4) return 'medium';
    return 'high';
  }
}

module.exports = QueryBuilder; 