/**
 * 数据库连接器
 * 管理MongoDB连接和动态加载数据模型
 */

const mongoose = require('../../db'); // 使用现有的数据库连接
const { databaseSchema } = require('../../config/databaseSchema');

class DatabaseConnector {
  constructor() {
    this.connection = null;
    this.models = {};
    this.connectionStatus = 'disconnected';
    this.lastHealthCheck = null;
    this.initializeModels();
  }

  /**
   * 初始化数据模型
   */
  initializeModels() {
    try {
      console.log('开始初始化数据模型...');
      
      // 动态加载所有模型，优先使用现有模型
      Object.keys(databaseSchema).forEach(tableName => {
        try {
          // 优先检查模型是否已经存在
          if (mongoose.models[tableName]) {
            console.log(`模型 ${tableName} 已存在，直接使用`);
            this.models[tableName] = mongoose.models[tableName];
          } else {
            // 尝试创建新模型
            try {
              const tableInfo = databaseSchema[tableName];
              this.models[tableName] = mongoose.model(tableName, this.createSchema(tableInfo));
              console.log(`模型 ${tableName} 初始化完成`);
            } catch (createError) {
              console.warn(`创建模型 ${tableName} 失败:`, createError.message);
              // 如果创建失败，尝试获取现有模型
              if (mongoose.models[tableName]) {
                this.models[tableName] = mongoose.models[tableName];
                console.log(`使用现有模型 ${tableName}`);
              } else {
                console.error(`无法获取模型 ${tableName}`);
              }
            }
          }
        } catch (modelError) {
          console.warn(`处理模型 ${tableName} 时出错:`, modelError.message);
          // 最后的尝试：直接获取模型
          try {
            if (mongoose.models[tableName]) {
              this.models[tableName] = mongoose.models[tableName];
              console.log(`成功获取现有模型 ${tableName}`);
            }
          } catch (finalError) {
            console.error(`最终无法获取模型 ${tableName}:`, finalError.message);
          }
        }
      });
      
      console.log('所有数据模型初始化完成:', Object.keys(this.models));
    } catch (error) {
      console.error('数据模型初始化失败:', error);
      throw new Error(`数据模型初始化失败: ${error.message}`);
    }
  }

  /**
   * 创建Mongoose Schema
   * @param {Object} tableInfo - 表信息
   * @returns {mongoose.Schema} Mongoose Schema
   */
  createSchema(tableInfo) {
    const schemaDefinition = {};
    
    // 添加字段定义
    Object.entries(tableInfo.fields).forEach(([fieldName, fieldInfo]) => {
      schemaDefinition[fieldName] = this.mapFieldType(fieldInfo);
    });
    
    // 添加时间戳字段
    if (!schemaDefinition.created_at) {
      schemaDefinition.created_at = { type: Date, default: Date.now };
    }
    if (!schemaDefinition.updated_at) {
      schemaDefinition.updated_at = { type: Date, default: Date.now };
    }
    
    const schema = new mongoose.Schema(schemaDefinition, {
      collection: tableInfo.table,
      timestamps: false,
      strict: false // 允许动态字段
    });
    
    // 添加更新时间中间件
    schema.pre('save', function(next) {
      this.updated_at = new Date();
      next();
    });
    
    // 添加索引
    this.addSchemaIndexes(schema, tableInfo);
    
    return schema;
  }

  /**
   * 映射字段类型
   * @param {Object} fieldInfo - 字段信息
   * @returns {Object} Mongoose字段定义
   */
  mapFieldType(fieldInfo) {
    const { type, required, unique, default: defaultValue, enum: enumValues } = fieldInfo;
    
    let fieldDefinition = {};
    
    switch (type) {
      case 'String':
        fieldDefinition.type = String;
        fieldDefinition.trim = true;
        break;
      case 'Number':
        fieldDefinition.type = Number;
        break;
      case 'Date':
        fieldDefinition.type = Date;
        break;
      case 'ObjectId':
        fieldDefinition.type = mongoose.Schema.Types.ObjectId;
        break;
      case 'Boolean':
        fieldDefinition.type = Boolean;
        break;
      case 'Array':
        fieldDefinition.type = Array;
        break;
      case 'Mixed':
        fieldDefinition.type = mongoose.Schema.Types.Mixed;
        break;
      default:
        fieldDefinition.type = String;
        fieldDefinition.trim = true;
    }
    
    // 添加其他属性
    if (required) fieldDefinition.required = required;
    if (unique) fieldDefinition.unique = unique;
    if (defaultValue !== undefined) fieldDefinition.default = defaultValue;
    if (enumValues) fieldDefinition.enum = enumValues;
    
    return fieldDefinition;
  }

  /**
   * 添加Schema索引
   * @param {mongoose.Schema} schema - Schema对象
   * @param {Object} tableInfo - 表信息
   */
  addSchemaIndexes(schema, tableInfo) {
    try {
      // 为_id字段添加索引
      schema.index({ _id: 1 });
      
      // 为时间字段添加索引
      if (tableInfo.fields.created_at) {
        schema.index({ created_at: -1 });
      }
      if (tableInfo.fields.updated_at) {
        schema.index({ updated_at: -1 });
      }
      
      // 为常用查询字段添加索引
      const commonIndexFields = ['name', 'username', 'phone', 'email', 'status'];
      commonIndexFields.forEach(field => {
        if (tableInfo.fields[field]) {
          schema.index({ [field]: 1 });
        }
      });
      
      // 为外键字段添加索引
      Object.entries(tableInfo.fields).forEach(([fieldName, fieldInfo]) => {
        if (fieldInfo.type === 'ObjectId' && fieldInfo.ref) {
          schema.index({ [fieldName]: 1 });
        }
      });
      
    } catch (error) {
      console.warn(`为表 ${tableInfo.table} 添加索引失败:`, error.message);
    }
  }

  /**
   * 获取模型
   * @param {string} tableName - 表名
   * @returns {mongoose.Model} Mongoose模型
   */
  getModel(tableName) {
    if (!this.models[tableName]) {
      throw new Error(`模型 ${tableName} 不存在`);
    }
    return this.models[tableName];
  }

  /**
   * 检查表是否存在
   * @param {string} tableName - 表名
   * @returns {Promise<boolean>} 表是否存在
   */
  async tableExists(tableName) {
    try {
      const model = this.getModel(tableName);
      if (!model) return false;
      
      // 尝试查询一条记录
      const count = await model.countDocuments().limit(1);
      return true;
    } catch (error) {
      console.error(`检查表${tableName}存在性失败:`, error);
      return false;
    }
  }

  /**
   * 获取表结构信息
   * @param {string} tableName - 表名
   * @returns {Promise<Object>} 表结构信息
   */
  async getTableInfo(tableName) {
    try {
      const model = this.getModel(tableName);
      if (!model) return null;
      
      // 获取表的统计信息
      const stats = await model.collection.stats();
      const tableSchema = databaseSchema[tableName];
      
      return {
        tableName,
        collectionName: tableSchema?.table || tableName,
        documentCount: stats.count,
        size: stats.size,
        avgObjSize: stats.avgObjSize,
        fields: Object.keys(tableSchema?.fields || {}),
        permissions: tableSchema?.permissions || [],
        sensitiveFields: tableSchema?.sensitiveFields || [],
        relationships: tableSchema?.relationships || {}
      };
    } catch (error) {
      console.error(`获取表${tableName}信息失败:`, error);
      return null;
    }
  }

  /**
   * 获取所有表信息
   * @returns {Promise<Array>} 所有表信息
   */
  async getAllTablesInfo() {
    const tablesInfo = [];
    
    for (const tableName of Object.keys(this.models)) {
      const info = await this.getTableInfo(tableName);
      if (info) {
        tablesInfo.push(info);
      }
    }
    
    return tablesInfo;
  }

    /**
   * 健康检查
   * @returns {Promise<Object>} 健康状态
   */
  async healthCheck() {
    try {
      const status = mongoose.connection.readyState;
      const statusMap = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
      };

      const currentStatus = statusMap[status] || 'unknown';
      this.connectionStatus = currentStatus;
      this.lastHealthCheck = new Date();

      // 测试数据库连接
      let dbTest = 'unknown';
      if (status === 1) {
        try {
          // 尝试执行一个简单的查询
          const testModel = this.models[Object.keys(this.models)[0]];
          if (testModel) {
            await testModel.countDocuments().limit(1);
            dbTest = 'success';
          }
        } catch (error) {
          dbTest = 'failed';
        }
      }

      const result = {
        status: currentStatus,
        readyState: status,
        models: Object.keys(this.models),
        modelCount: Object.keys(this.models).length,
        databaseTest: dbTest,
        timestamp: this.lastHealthCheck.toISOString(),
        connectionString: mongoose.connection.host ?
          `${mongoose.connection.host}:${mongoose.connection.port}/${mongoose.connection.name}` :
          'unknown',
        // 添加更多连接信息
        databaseName: mongoose.connection.name,
        host: mongoose.connection.host,
        port: mongoose.connection.port
      };

      return result;
    } catch (error) {
      console.error('数据库健康检查失败:', error);
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 获取连接统计信息
   * @returns {Object} 连接统计
   */
  getConnectionStats() {
    const connection = mongoose.connection;
    
    return {
      host: connection.host,
      port: connection.port,
      name: connection.name,
      readyState: connection.readyState,
      models: Object.keys(this.models),
      connectionStatus: this.connectionStatus,
      lastHealthCheck: this.lastHealthCheck?.toISOString() || 'never'
    };
  }

  /**
   * 清理连接
   */
  async cleanup() {
    try {
      console.log('开始清理数据库连接...');
      
      // 关闭所有模型连接
      Object.keys(this.models).forEach(modelName => {
        delete this.models[modelName];
      });
      
      // 关闭Mongoose连接
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
        console.log('Mongoose连接已关闭');
      }
      
      this.connectionStatus = 'disconnected';
      console.log('数据库连接清理完成');
      
    } catch (error) {
      console.error('数据库连接清理失败:', error);
    }
  }

  /**
   * 重新初始化模型
   */
  async reinitializeModels() {
    try {
      console.log('开始重新初始化数据模型...');
      
      // 清理现有模型
      this.models = {};
      
      // 重新初始化
      this.initializeModels();
      
      console.log('数据模型重新初始化完成');
      return true;
      
    } catch (error) {
      console.error('数据模型重新初始化失败:', error);
      return false;
    }
  }
}

module.exports = DatabaseConnector; 