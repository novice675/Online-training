// MongoDB监听配置
module.exports = {
  // 数据库连接配置
  database: {
    uri: 'mongodb+srv://mariadigo45566:sJj2QDWGxaBpltgW@cluster0.ke8hvn6.mongodb.net/OnlineTraining',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }
  },

  // 要监听的集合配置
  collections: [
    {
      name: 'news',           // 集合名称
      eventPrefix: 'article', // 事件前缀
      enabled: true,          // 是否启用监听
      description: '新闻文章表'
    },
    {
      name: 'comments',       // 集合名称
      eventPrefix: 'comment', // 事件前缀
      enabled: true,          // 是否启用监听
      description: '评论表'
    },
    {
      name: 'zuhuxinxis',      // 集合名称
      eventPrefix: 'tenant',  // 事件前缀
      enabled: true,          // 是否启用监听
      description: '租户信息表'
    },
    {
      name: 'zuhupeople',     // 集合名称
      eventPrefix: 'person',  // 事件前缀
      enabled: true,          // 是否启用监听
      description: '人员表'
    },
    // 你可以在这里添加更多要监听的表
    {
      name: 'company',        // 企业表
      eventPrefix: 'company', // 事件前缀
      enabled: false,         // 暂时不监听
      description: '企业信息表'
    },
    {
      name: 'Building',       // 建筑表
      eventPrefix: 'building', // 事件前缀
      enabled: false,         // 暂时不监听
      description: '建筑信息表'
    },
    {
      name: 'House',          // 房屋表
      eventPrefix: 'house',   // 事件前缀
      enabled: false,         // 暂时不监听
      description: '房屋信息表'
    },
    {
      name: 'Vehicle',        // 车辆表
      eventPrefix: 'vehicle', // 事件前缀
      enabled: false,         // 暂时不监听
      description: '车辆信息表'
    }
  ],

  // 监听服务配置
  watcher: {
    maxReconnectAttempts: 5,    // 最大重连次数
    reconnectDelay: 5000,       // 重连延迟(毫秒)
    autoStart: true,            // 是否自动启动
    startupDelay: 2000,        // 启动延迟(毫秒)
  },

  // 日志配置
  logging: {
    enabled: true,              // 是否启用日志
    level: 'info',              // 日志级别: debug, info, warn, error
    showTimestamps: true,       // 是否显示时间戳
    showCollectionChanges: true // 是否显示集合变化详情
  }
}; 