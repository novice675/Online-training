/**
 * 安全管理器
 * 验证用户权限，控制数据访问，确保查询安全
 */

const { databaseSchema, permissionLevels } = require('../../config/databaseSchema');

class SecurityManager {
  constructor() {
    this.permissionCache = new Map(); // 权限缓存
    this.securityRules = this.initializeSecurityRules();
  }

  /**
   * 初始化安全规则
   * @returns {Object} 安全规则配置
   */
  initializeSecurityRules() {
    return {
      // 默认权限映射
      defaultPermissions: {
        'read_own': ['appUser'],
        'read_own_company': ['employee', 'HeTong', 'TenantBill'],
        'read_all': ['Building', 'House', 'company', 'visitor']
      },
      
      // 敏感操作限制
      sensitiveOperations: {
        'delete': ['admin'],
        'update_sensitive': ['admin', 'manager'],
        'read_sensitive': ['admin', 'manager', 'user']
      },
      
      // 查询限制
      queryLimits: {
        'default': 100,
        'admin': 1000,
        'manager': 500,
        'user': 100
      },
      
      // 禁止的查询模式
      forbiddenPatterns: [
        /^\.\./,           // 禁止路径遍历
        /\$where/,         // 禁止$where操作
        /\$regex.*\^/,     // 禁止以^开头的正则
        /\$ne.*null/,      // 禁止$ne null查询
        /\$exists.*false/  // 禁止$exists false查询
      ]
    };
  }

  /**
   * 验证查询权限
   * @param {Object} queryPlan - 查询计划
   * @param {string} userId - 用户ID
   * @param {string} userRole - 用户角色
   * @returns {Object} 权限验证结果
   */
  async validateQuery(queryPlan, userId, userRole) {
    try {
      console.log('开始权限验证:', { userId, userRole, table: queryPlan.targetTable });

      // 1. 基础权限检查
      const basicPermission = await this.checkBasicPermission(queryPlan.targetTable, userRole);
      if (!basicPermission.allowed) {
        return {
          allowed: false,
          reason: `基础权限不足: ${basicPermission.reason}`,
          requiredPermission: basicPermission.required
        };
      }

      // 2. 查询安全检查
      const securityCheck = this.checkQuerySecurity(queryPlan);
      if (!securityCheck.allowed) {
        return {
          allowed: false,
          reason: `查询安全检查失败: ${securityCheck.reason}`,
          securityIssue: securityCheck.issue
        };
      }

      // 3. 数据访问范围检查
      const scopeCheck = await this.checkDataScope(queryPlan, userId, userRole);
      if (!scopeCheck.allowed) {
        return {
          allowed: false,
          reason: `数据访问范围限制: ${scopeCheck.reason}`,
          scope: scopeCheck.scope
        };
      }

      // 4. 查询限制检查
      const limitCheck = this.checkQueryLimits(queryPlan, userRole);
      if (!limitCheck.allowed) {
        return {
          allowed: false,
          reason: `查询限制检查失败: ${limitCheck.reason}`,
          limit: limitCheck.limit
        };
      }

      console.log('权限验证通过');
      return {
        allowed: true,
        reason: '权限验证通过',
        permissions: basicPermission.permissions,
        scope: scopeCheck.scope
      };

    } catch (error) {
      console.error('权限验证失败:', error);
      return {
        allowed: false,
        reason: `权限验证异常: ${error.message}`,
        error: error
      };
    }
  }

  /**
   * 检查基础权限
   * @param {string} tableName - 表名
   * @param {string} userRole - 用户角色
   * @returns {Object} 权限检查结果
   */
  async checkBasicPermission(tableName, userRole) {
    try {
      const tableSchema = databaseSchema[tableName];
      if (!tableSchema) {
        return {
          allowed: false,
          reason: `表 ${tableName} 不存在`,
          required: 'table_access'
        };
      }

      const requiredPermissions = tableSchema.permissions;
      if (!requiredPermissions || requiredPermissions.length === 0) {
        return {
          allowed: false,
          reason: `表 ${tableName} 未配置权限`,
          required: 'configured_permission'
        };
      }

      // 检查用户角色是否有足够权限
      const hasPermission = this.checkRolePermission(userRole, requiredPermissions);
      
      if (hasPermission) {
        return {
          allowed: true,
          reason: '基础权限检查通过',
          permissions: requiredPermissions,
          required: 'none'
        };
      } else {
        return {
          allowed: false,
          reason: `用户角色 ${userRole} 无权访问表 ${tableName}`,
          required: requiredPermissions.join(' 或 '),
          availablePermissions: requiredPermissions
        };
      }

    } catch (error) {
      console.error('基础权限检查失败:', error);
      return {
        allowed: false,
        reason: `权限检查异常: ${error.message}`,
        required: 'error_handling'
      };
    }
  }

  /**
   * 检查角色权限
   * @param {string} userRole - 用户角色
   * @param {Array<string>} requiredPermissions - 所需权限
   * @returns {boolean} 是否有权限
   */
  checkRolePermission(userRole, requiredPermissions) {
    // 角色权限映射
    const rolePermissionMap = {
      'admin': ['read_all', 'read_own', 'read_own_company', 'write', 'admin'],
      'manager': ['read_all', 'read_own', 'read_own_company', 'write'],
      'user': ['read_own', 'read_own_company'], // 添加read_company权限
      'guest': ['read_own']
    };

    const userPermissions = rolePermissionMap[userRole] || ['read_own'];
    
    // 检查是否有任一所需权限
    return requiredPermissions.some(required => 
      userPermissions.includes(required)
    );
  }

  /**
   * 检查查询安全
   * @param {Object} queryPlan - 查询计划
   * @returns {Object} 安全检查结果
   */
  checkQuerySecurity(queryPlan) {
    try {
      // 1. 检查查询条件
      if (queryPlan.conditions) {
        const conditionCheck = this.checkQueryConditions(queryPlan.conditions);
        if (!conditionCheck.allowed) {
          return {
            allowed: false,
            reason: conditionCheck.reason,
            issue: 'dangerous_conditions'
          };
        }
      }

      // 2. 检查字段访问
      if (queryPlan.fields) {
        const fieldCheck = this.checkFieldAccess(queryPlan.fields, queryPlan.targetTable);
        if (!fieldCheck.allowed) {
          return {
            allowed: false,
            reason: fieldCheck.reason,
            issue: 'sensitive_fields'
          };
        }
      }

      // 3. 检查查询模式
      const patternCheck = this.checkQueryPatterns(queryPlan);
      if (!patternCheck.allowed) {
        return {
          allowed: false,
          reason: patternCheck.reason,
          issue: 'forbidden_patterns'
        };
      }

      return {
        allowed: true,
        reason: '查询安全检查通过'
      };

    } catch (error) {
      console.error('查询安全检查失败:', error);
      return {
        allowed: false,
        reason: `安全检查异常: ${error.message}`,
        issue: 'security_error'
      };
    }
  }

  /**
   * 检查查询条件
   * @param {Object} conditions - 查询条件
   * @returns {Object} 条件检查结果
   */
  checkQueryConditions(conditions) {
    const conditionString = JSON.stringify(conditions);
    
    // 检查禁止的模式
    for (const pattern of this.securityRules.forbiddenPatterns) {
      if (pattern.test(conditionString)) {
        return {
          allowed: false,
          reason: `查询条件包含禁止的模式: ${pattern.source}`
        };
      }
    }

    // 检查深度嵌套
    const depth = this.calculateObjectDepth(conditions);
    if (depth > 5) {
      return {
        allowed: false,
        reason: '查询条件嵌套过深，可能存在安全风险'
      };
    }

    return {
      allowed: true,
      reason: '查询条件检查通过'
    };
  }

  /**
   * 检查字段访问
   * @param {Array<string>} fields - 字段列表
   * @param {string} tableName - 表名
   * @returns {Object} 字段检查结果
   */
  checkFieldAccess(fields, tableName) {
    try {
      const tableSchema = databaseSchema[tableName];
      if (!tableSchema) {
        return {
          allowed: false,
          reason: `表 ${tableName} 不存在`
        };
      }

      const sensitiveFields = tableSchema.sensitiveFields || [];
      const requestedSensitiveFields = fields.filter(field => 
        sensitiveFields.includes(field)
      );

      if (requestedSensitiveFields.length > 0) {
        return {
          allowed: false,
          reason: `请求访问敏感字段: ${requestedSensitiveFields.join(', ')}`,
          sensitiveFields: requestedSensitiveFields
        };
      }

      return {
        allowed: true,
        reason: '字段访问检查通过'
      };

    } catch (error) {
      console.error('字段访问检查失败:', error);
      return {
        allowed: false,
        reason: `字段检查异常: ${error.message}`
      };
    }
  }

  /**
   * 检查查询模式
   * @param {Object} queryPlan - 查询计划
   * @returns {Object} 模式检查结果
   */
  checkQueryPatterns(queryPlan) {
    // 检查查询类型
    const allowedQueryTypes = ['select', 'count', 'aggregate', 'search'];
    if (!allowedQueryTypes.includes(queryPlan.queryType)) {
      return {
        allowed: false,
        reason: `不支持的查询类型: ${queryPlan.queryType}`
      };
    }

    // 检查关联查询数量
    if (queryPlan.joins && queryPlan.joins.length > 3) {
      return {
        allowed: false,
        reason: '关联查询数量过多，可能存在性能风险'
      };
    }

    return {
      allowed: true,
      reason: '查询模式检查通过'
    };
  }

  /**
   * 检查数据访问范围
   * @param {Object} queryPlan - 查询计划
   * @param {string} userId - 用户ID
   * @param {string} userRole - 用户角色
   * @returns {Object} 范围检查结果
   */
  async checkDataScope(queryPlan, userId, userRole) {
    try {
      const tableSchema = databaseSchema[queryPlan.targetTable];
      if (!tableSchema) {
        return {
          allowed: false,
          reason: `表 ${queryPlan.targetTable} 不存在`
        };
      }

      const permissions = tableSchema.permissions;
      
      // 如果是管理员，允许访问所有数据
      if (userRole === 'admin') {
        return {
          allowed: true,
          reason: '管理员权限，可访问所有数据',
          scope: 'all'
        };
      }

      // 检查是否需要限制数据范围
      if (permissions.includes('read_own_company')) {
        // 需要添加公司级别的过滤条件
        const scopeFilter = await this.buildCompanyScopeFilter(userId, userRole);
        if (scopeFilter) {
          // 将范围过滤添加到查询条件中
          if (!queryPlan.conditions) {
            queryPlan.conditions = {};
          }
          Object.assign(queryPlan.conditions, scopeFilter);
          
          return {
            allowed: true,
            reason: '已添加公司范围过滤',
            scope: 'company',
            filter: scopeFilter
          };
        }
      }

      if (permissions.includes('read_own')) {
        // 需要添加用户级别的过滤条件
        const scopeFilter = await this.buildUserScopeFilter(userId, userRole);
        if (scopeFilter) {
          if (!queryPlan.conditions) {
            queryPlan.conditions = {};
          }
          Object.assign(queryPlan.conditions, scopeFilter);
          
          return {
            allowed: true,
            reason: '已添加用户范围过滤',
            scope: 'user',
            filter: scopeFilter
          };
        }
      }

      return {
        allowed: true,
        reason: '数据范围检查通过',
        scope: 'default'
      };

    } catch (error) {
      console.error('数据范围检查失败:', error);
      return {
        allowed: false,
        reason: `范围检查异常: ${error.message}`,
        scope: 'error'
      };
    }
  }

  /**
   * 构建公司范围过滤
   * @param {string} userId - 用户ID
   * @param {string} userRole - 用户角色
   * @returns {Object|null} 过滤条件
   */
  async buildCompanyScopeFilter(userId, userRole) {
    try {
      // 这里需要根据实际的用户-公司关系来构建过滤条件
      // 暂时返回null，表示不需要过滤
      return null;
    } catch (error) {
      console.error('构建公司范围过滤失败:', error);
      return null;
    }
  }

  /**
   * 构建用户范围过滤
   * @param {string} userId - 用户ID
   * @param {string} userRole - 用户角色
   * @returns {Object|null} 过滤条件
   */
  async buildUserScopeFilter(userId, userRole) {
    try {
      // 这里需要根据实际的用户关系来构建过滤条件
      // 暂时返回null，表示不需要过滤
      return null;
    } catch (error) {
      console.error('构建用户范围过滤失败:', error);
      return null;
    }
  }

  /**
   * 检查查询限制
   * @param {Object} queryPlan - 查询计划
   * @param {string} userRole - 用户角色
   * @returns {Object} 限制检查结果
   */
  checkQueryLimits(queryPlan, userRole) {
    const userLimit = this.securityRules.queryLimits[userRole] || 
                     this.securityRules.queryLimits.default;
    
    const requestedLimit = queryPlan.limit || 100;
    
    if (requestedLimit > userLimit) {
      return {
        allowed: false,
        reason: `查询限制 ${requestedLimit} 超过用户角色 ${userRole} 的限制 ${userLimit}`,
        limit: userLimit
      };
    }

    return {
      allowed: true,
      reason: '查询限制检查通过',
      limit: userLimit
    };
  }

  /**
   * 计算对象深度
   * @param {Object} obj - 对象
   * @returns {number} 深度
   */
  calculateObjectDepth(obj, currentDepth = 0) {
    if (typeof obj !== 'object' || obj === null) {
      return currentDepth;
    }

    let maxDepth = currentDepth;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const depth = this.calculateObjectDepth(obj[key], currentDepth + 1);
        maxDepth = Math.max(maxDepth, depth);
      }
    }

    return maxDepth;
  }

  /**
   * 获取安全统计信息
   * @returns {Object} 安全统计
   */
  getSecurityStats() {
    return {
      permissionCacheSize: this.permissionCache.size,
      securityRules: Object.keys(this.securityRules),
      forbiddenPatterns: this.securityRules.forbiddenPatterns.length,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 清理权限缓存
   */
  clearPermissionCache() {
    this.permissionCache.clear();
    console.log('权限缓存已清理');
  }
}

module.exports = SecurityManager; 