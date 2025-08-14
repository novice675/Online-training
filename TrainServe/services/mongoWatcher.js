const { MongoClient } = require('mongodb');
const socketManager = require('../socket');
const config = require('../config/mongoWatcherConfig');

class MongoWatcher {
  constructor() {
    this.client = null;
    this.db = null;
    this.changeStreams = new Map();
    this.isWatching = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = config.watcher.maxReconnectAttempts;
    this.reconnectDelay = config.watcher.reconnectDelay;
    this.reconnectTimers = new Map(); // 防抖定时器
  }

  async connect() {
    try {
      // 使用配置文件中的数据库连接
      this.client = new MongoClient(config.database.uri, config.database.options);
      
      await this.client.connect();
      this.db = this.client.db();
      this.reconnectAttempts = 0; // 重置重连次数
      console.log('✅ MongoDB连接成功:', this.db.databaseName);
    } catch (error) {
      console.error('❌ MongoDB连接失败:', error);
      throw error;
    }
  }

  async startWatching() {
    if (this.isWatching) return;
    
    this.isWatching = true;
    console.log('🚀 开始监听MongoDB变化...');

    try {
      // 从配置文件读取要监听的集合
      const enabledCollections = config.collections.filter(col => col.enabled);
      
      for (const collection of enabledCollections) {
        await this.watchCollection(collection.name, collection.eventPrefix);
      }
      
      console.log(`✅ 已启动 ${enabledCollections.length} 个集合的监听`);
    } catch (error) {
      console.error('❌ 启动监听失败:', error);
      this.isWatching = false;
    }
  }

  async watchCollection(collectionName, eventPrefix) {
    try {
      const collection = this.db.collection(collectionName);
      
      // 检查集合是否存在
      const collections = await this.db.listCollections({ name: collectionName }).toArray();
      if (collections.length === 0) {
        console.log(`⚠️ 集合 ${collectionName} 不存在，跳过监听`);
        return;
      }
      
      // 如果已经存在Change Stream，先关闭它
      if (this.changeStreams.has(collectionName)) {
        try {
          await this.changeStreams.get(collectionName).close();
          this.changeStreams.delete(collectionName);
        } catch (error) {
          console.log(`清理旧的Change Stream: ${collectionName}`);
        }
      }
      
      // 创建Change Stream
      const changeStream = collection.watch([], {
        fullDocument: 'updateLookup',
        maxAwaitTimeMS: 1000
      });

      // 监听变化
      changeStream.on('change', (change) => {
        this.handleChange(change, eventPrefix, collectionName);
      });

      // 监听错误
      changeStream.on('error', (error) => {
        console.error(`❌ 监听集合 ${collectionName} 失败:`, error);
        this.handleStreamError(collectionName, error);
      });

      // 监听关闭
      changeStream.on('close', () => {
        console.log(`⚠️ 集合 ${collectionName} 的Change Stream已关闭`);
        this.handleStreamClose(collectionName);
      });

      this.changeStreams.set(collectionName, changeStream);
      console.log(`✅ 开始监听集合: ${collectionName}`);
      
    } catch (error) {
      console.error(`❌ 创建Change Stream失败 ${collectionName}:`, error);
    }
  }

  handleChange(change, eventPrefix, collectionName) {
    try {
      const { operationType, fullDocument, documentKey, updateDescription } = change;
      
      console.log(`📡 检测到变化: ${operationType} in ${collectionName}`, {
        operationType,
        collectionName,
        documentId: documentKey?._id,
        hasFullDocument: !!fullDocument
      });
      
      switch (operationType) {
        case 'insert':
          // 新文档插入
          this.notifyEvent(`${eventPrefix}_created`, fullDocument);
          break;
          
        case 'update':
          // 文档更新
          if (fullDocument) {
            this.notifyEvent(`${eventPrefix}_updated`, fullDocument);
          } else if (updateDescription) {
            // 如果没有完整文档，尝试获取更新后的文档
            this.handleUpdateWithoutFullDocument(documentKey._id, collectionName, eventPrefix);
          }
          break;
          
        case 'delete':
          // 文档删除
          this.notifyEvent(`${eventPrefix}_deleted`, {
            id: documentKey._id,
            collectionName: collectionName
          });
          break;
          
        case 'replace':
          // 文档替换
          this.notifyEvent(`${eventPrefix}_updated`, fullDocument);
          break;
          
        case 'drop':
          // 集合被删除
          console.log(`⚠️ 集合 ${collectionName} 被删除`);
          break;
          
        case 'rename':
          // 集合重命名
          console.log(`⚠️ 集合 ${collectionName} 被重命名`);
          break;
          
        default:
          console.log(`ℹ️ 未处理的操作类型: ${operationType} in ${collectionName}`);
      }
      
    } catch (error) {
      console.error('❌ 处理变化失败:', error);
    }
  }

  async handleUpdateWithoutFullDocument(documentId, collectionName, eventPrefix) {
    try {
      const collection = this.db.collection(collectionName);
      const updatedDoc = await collection.findOne({ _id: documentId });
      if (updatedDoc) {
        this.notifyEvent(`${eventPrefix}_updated`, updatedDoc);
      }
    } catch (error) {
      console.error('❌ 获取更新后文档失败:', error);
    }
  }

  notifyEvent(eventType, data) {
    try {
      console.log(`📤 发送Socket事件: ${eventType}`, {
        eventType,
        dataId: data._id || data.id,
        collectionName: data.collectionName
      });

      switch (eventType) {
        case 'article_created':
          socketManager.notifyArticleCreated(data);
          break;
        case 'article_updated':
          socketManager.notifyArticleUpdated(data);
          break;
        case 'article_deleted':
          socketManager.notifyArticleDeleted(data.id, data.title || '未知标题');
          break;
        case 'comment_created':
          socketManager.notifyCommentCreated(data);
          break;
        case 'comment_updated':
          socketManager.notifyCommentUpdated(data);
          break;
        case 'comment_deleted':
          socketManager.notifyCommentDeleted(data.id);
          break;
        case 'tenant_created':
          socketManager.notifyTenantCreated(data);
          break;
        case 'tenant_updated':
          socketManager.notifyTenantUpdated(data);
          break;
        case 'tenant_deleted':
          socketManager.notifyTenantDeleted(data.id, data.name || '未知租户');
          break;
        case 'person_created':
          socketManager.notifyPersonCreated(data);
          break;
        case 'person_updated':
          socketManager.notifyPersonUpdated(data);
          break;
        case 'person_deleted':
          socketManager.notifyPersonDeleted(data.id, data.name || '未知人员');
          break;
        default:
          console.log(`ℹ️ 未处理的事件类型: ${eventType}`);
      }
    } catch (error) {
      console.error('❌ 发送Socket事件失败:', error);
    }
  }

  handleStreamError(collectionName, error) {
    console.error(`❌ 集合 ${collectionName} 的Change Stream错误:`, error);
    
    // 尝试重新创建Change Stream
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 尝试重新连接集合 ${collectionName} (第${this.reconnectAttempts}次)`);
      
      setTimeout(async () => {
        try {
          await this.watchCollection(collectionName, this.getEventPrefix(collectionName));
        } catch (reconnectError) {
          console.error(`❌ 重新连接集合 ${collectionName} 失败:`, reconnectError);
        }
      }, this.reconnectDelay);
    } else {
      console.error(`❌ 集合 ${collectionName} 重连次数已达上限，停止重连`);
    }
  }

  handleStreamClose(collectionName) {
    console.log(`⚠️ 集合 ${collectionName} 的Change Stream已关闭`);
    
    // 防止无限重连，只有在明确需要时才重连
    if (this.isWatching && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 尝试重新连接集合 ${collectionName} (第${this.reconnectAttempts}次)`);
      
      // 清除之前的定时器，防止重复重连
      if (this.reconnectTimers.has(collectionName)) {
        clearTimeout(this.reconnectTimers.get(collectionName));
      }
      
      // 设置新的重连定时器
      const timer = setTimeout(async () => {
        try {
          await this.watchCollection(collectionName, this.getEventPrefix(collectionName));
          this.reconnectAttempts = 0; // 重连成功后重置计数
          this.reconnectTimers.delete(collectionName); // 清理定时器
        } catch (error) {
          console.error(`❌ 重新连接集合 ${collectionName} 失败:`, error);
        }
      }, this.reconnectDelay);
      
      this.reconnectTimers.set(collectionName, timer);
    } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`❌ 集合 ${collectionName} 重连次数已达上限，停止重连`);
    }
  }

  getEventPrefix(collectionName) {
    // 从配置文件查找事件前缀
    const collection = config.collections.find(col => col.name === collectionName);
    return collection ? collection.eventPrefix : 'document';
  }

  async stopWatching() {
    console.log('🛑 正在停止MongoDB监听...');
    this.isWatching = false;
    
    // 清理所有重连定时器
    for (const [collectionName, timer] of this.reconnectTimers) {
      clearTimeout(timer);
      console.log(`🧹 清理重连定时器: ${collectionName}`);
    }
    this.reconnectTimers.clear();
    
    // 关闭所有Change Streams
    for (const [collectionName, changeStream] of this.changeStreams) {
      try {
        await changeStream.close();
        console.log(`✅ 停止监听集合: ${collectionName}`);
      } catch (error) {
        console.error(`❌ 关闭Change Stream失败 ${collectionName}:`, error);
      }
    }
    
    this.changeStreams.clear();
    
    // 关闭MongoDB连接
    if (this.client) {
      try {
        await this.client.close();
        console.log('✅ MongoDB连接已关闭');
      } catch (error) {
        console.error('❌ 关闭MongoDB连接失败:', error);
      }
    }
  }

  // 获取监听状态
  getStatus() {
    return {
      isWatching: this.isWatching,
      connected: !!this.client && this.client.topology?.isConnected(),
      watchedCollections: Array.from(this.changeStreams.keys()),
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

module.exports = new MongoWatcher(); 