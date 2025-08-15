/**
 * 数据库模式配置文件
 * 定义所有可查询的数据表结构和字段映射
 * 用于AI生成查询计划和权限控制
 */

const databaseSchema = {
  // 用户相关表
  appUser: {
    table: 'appUser',
    description: '应用用户信息表',
    fields: {
      _id: { type: 'ObjectId', description: '用户唯一标识' },
      username: { type: 'String', description: '用户名' },
      phone: { type: 'String', description: '手机号码' },
      nickname: { type: 'String', description: '昵称' },
      avatar: { type: 'String', description: '头像URL' },
      createTime: { type: 'Date', description: '创建时间' },
      updateTime: { type: 'Date', description: '更新时间' }
    },
    permissions: ['read_own', 'read_all'], // 权限配置
    sensitiveFields: ['password'] // 敏感字段
  },

  // 楼宇信息表
  Building: {
    table: 'Building',
    description: '楼宇基本信息表',
    fields: {
      _id: { type: 'ObjectId', description: '楼宇唯一标识' },
      name: { type: 'String', description: '楼宇名称' },
      address: { type: 'String', description: '楼宇地址' },
      floors: { type: 'Number', description: '总层数' },
      aboveGroundFloors: { type: 'Number', description: '地上楼层数' },
      undergroundFloors: { type: 'Number', description: '地下楼层数' },
      buildingArea: { type: 'Number', description: '建筑面积' },
      managedArea: { type: 'Number', description: '在管面积' },
      propertyFee: { type: 'Number', description: '物业费' },
      description: { type: 'String', description: '楼宇描述' },
      photo: { type: 'String', description: '楼宇照片' },
      created_at: { type: 'Date', description: '创建时间' },
      updated_at: { type: 'Date', description: '更新时间' }
    },
    permissions: ['read_all'],
    sensitiveFields: []
  },

  // 房屋信息表
  House: {
    table: 'House',
    description: '房屋详细信息表',
    fields: {
      _id: { type: 'ObjectId', description: '房屋唯一标识' },
      number: { type: 'String', description: '房间号' },
      floor: { type: 'Number', description: '楼层' },
      buildingId: { type: 'ObjectId', description: '所属楼宇ID', ref: 'Building' },
      area: { type: 'Number', description: '房间面积' },
      pricingArea: { type: 'Number', description: '计价面积' },
      rent: { type: 'Number', description: '租金金额' },
      propertyFee: { type: 'Number', description: '物业费用' },
      deposit: { type: 'Number', description: '押金金额' },
      status: { type: 'String', description: '房间状态', enum: ['空闲', '已租', '维修'] },
      description: { type: 'String', description: '房间描述' },
      created_at: { type: 'Date', description: '创建时间' },
      updated_at: { type: 'Date', description: '更新时间' }
    },
    permissions: ['read_all'],
    sensitiveFields: [],
    relationships: {
      building: { model: 'Building', field: 'buildingId', type: 'belongsTo' }
    }
  },

  // 企业信息表
  company: {
    table: 'company',
    description: '企业信息表',
    fields: {
      _id: { type: 'ObjectId', description: '企业唯一标识' },
      name: { type: 'String', description: '企业名称' },
      inaddress: { type: 'String', description: '所属楼宇' },
      type: { type: 'String', description: '企业类型' },
      logo: { type: 'String', description: '企业logo' },
      house: { type: 'String', description: '房间号或楼号' },
      outaddress: { type: 'String', description: '企业地址' },
      buildingId: { type: 'ObjectId', description: '所属楼宇ID', ref: 'Building' },
      houseId: { type: 'ObjectId', description: '所属房屋ID', ref: 'House' }
    },
    permissions: ['read_all'],
    sensitiveFields: [],
    relationships: {
      building: { model: 'Building', field: 'buildingId', type: 'belongsTo' },
      house: { model: 'House', field: 'houseId', type: 'belongsTo' }
    }
  },

  // 员工信息表
  employee: {
    table: 'employee',
    description: '员工信息表',
    fields: {
      _id: { type: 'ObjectId', description: '员工唯一标识' },
      company_id: { type: 'ObjectId', description: '所属企业ID', ref: 'company' },
      name: { type: 'String', description: '姓名' },
      sex: { type: 'String', description: '性别' },
      phone: { type: 'String', description: '手机号' },
      sfz: { type: 'String', description: '身份证号' },
      email: { type: 'String', description: '邮箱' },
      weixin: { type: 'String', description: '微信号' },
      picture: { type: 'String', description: '人脸照片' },
      role: { type: 'String', description: '角色', default: '员工' }
    },
    permissions: ['read_own_company', 'read_all'],
    sensitiveFields: ['sfz'],
    relationships: {
      company: { model: 'company', field: 'company_id', type: 'belongsTo' }
    }
  },

  // 访客记录表
  visitor: {
    table: 'visitor',
    description: '访客记录表',
    fields: {
      _id: { type: 'ObjectId', description: '访客唯一标识' },
      name: { type: 'String', description: '访客姓名' },
      phone: { type: 'String', description: '手机号' },
      sfz: { type: 'String', description: '身份证号' },
      picture: { type: 'String', description: '人脸照片地址' },
      company_id: { type: 'ObjectId', description: '要访问的企业ID', ref: 'company' },
      time: { type: 'Date', description: '到访时间' },
      carcode: { type: 'String', description: '车牌号' },
      cartype: { type: 'String', description: '车辆类型' },
      role: { type: 'String', description: '角色', default: '访客' }
    },
    permissions: ['read_all'],
    sensitiveFields: ['sfz'],
    relationships: {
      company: { model: 'company', field: 'company_id', type: 'belongsTo' }
    }
  },

  // 合同信息表
  HeTong: {
    table: 'HeTong',
    description: '合同信息表',
    fields: {
      _id: { type: 'ObjectId', description: '合同唯一标识' },
      title: { type: 'String', description: '合同标题' },
      content: { type: 'String', description: '合同内容' },
      status: { type: 'String', description: '合同状态' },
      startDate: { type: 'Date', description: '开始日期' },
      endDate: { type: 'Date', description: '结束日期' },
      amount: { type: 'Number', description: '合同金额' },
      companyId: { type: 'ObjectId', description: '企业ID', ref: 'company' },
      created_at: { type: 'Date', description: '创建时间' },
      updated_at: { type: 'Date', description: '更新时间' }
    },
    permissions: ['read_own_company', 'read_all'],
    sensitiveFields: ['content'],
    relationships: {
      company: { model: 'company', field: 'companyId', type: 'belongsTo' }
    }
  },

  // 租户账单表
  TenantBill: {
    table: 'TenantBill',
    description: '租户账单表',
    fields: {
      _id: { type: 'ObjectId', description: '账单唯一标识' },
      tenantId: { type: 'ObjectId', description: '租户ID', ref: 'company' },
      houseId: { type: 'ObjectId', description: '房屋ID', ref: 'House' },
      billType: { type: 'String', description: '账单类型' },
      amount: { type: 'Number', description: '账单金额' },
      dueDate: { type: 'Date', description: '到期日期' },
      status: { type: 'String', description: '账单状态' },
      description: { type: 'String', description: '账单描述' },
      created_at: { type: 'Date', description: '创建时间' },
      updated_at: { type: 'Date', description: '更新时间' }
    },
    permissions: ['read_own_company', 'read_all'],
    sensitiveFields: [],
    relationships: {
      tenant: { model: 'company', field: 'tenantId', type: 'belongsTo' },
      house: { model: 'House', field: 'houseId', type: 'belongsTo' }
    }
  },

  // 聊天会话表
  ChatSession: {
    table: 'chatsessions',
    description: '聊天会话表',
    fields: {
      _id: { type: 'ObjectId', description: '会话唯一标识' },
      sessionId: { type: 'String', description: '会话ID' },
      userId: { type: 'ObjectId', description: '用户ID', ref: 'appUser' },
      messages: { type: 'Array', description: '消息数组' },
      createdAt: { type: 'Date', description: '创建时间' },
      updatedAt: { type: 'Date', description: '更新时间' }
    },
    permissions: ['read_own', 'read_all'],
    sensitiveFields: [],
    relationships: {
      user: { model: 'appUser', field: 'userId', type: 'belongsTo' }
    }
  },

  // 聊天消息表
  Message: {
    table: 'messages',
    description: '聊天消息表',
    fields: {
      _id: { type: 'ObjectId', description: '消息唯一标识' },
      content: { type: 'String', description: '消息内容' },
      isUser: { type: 'Boolean', description: '是否为用户消息' },
      timestamp: { type: 'Date', description: '消息时间' },
      sessionId: { type: 'String', description: '会话ID' }
    },
    permissions: ['read_own', 'read_all'],
    sensitiveFields: [],
    relationships: {
      session: { model: 'ChatSession', field: 'sessionId', type: 'belongsTo' }
    }
  }
};

// 查询类型定义
const queryTypes = {
  SELECT: 'select',
  COUNT: 'count',
  AGGREGATE: 'aggregate',
  SEARCH: 'search'
};

// 权限级别定义
const permissionLevels = {
  READ_OWN: 'read_own',
  READ_OWN_COMPANY: 'read_own_company',
  READ_ALL: 'read_all',
  WRITE: 'write',
  ADMIN: 'admin'
};

module.exports = {
  databaseSchema,
  queryTypes,
  permissionLevels
}; 