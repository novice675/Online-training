import axios from 'axios'

// 创建axios实例
const api = axios.create({
    baseURL: 'http://localhost:3008',
    timeout: 5000
})

// 请求拦截器
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// 响应拦截器
api.interceptors.response.use(response => {
    return response
}, error => {
    return Promise.reject(error)
})

// ==================== 门禁设备相关接口 ====================

// 获取门禁设备列表
export const MenjinList = (params = {}) => {
    return api.get('/menjin/list', { params })
}

// 获取门禁设备详情
export const MenjinDetail = (id) => {
    return api.get(`/menjin/detail/${id}`)
}

// 添加门禁设备
export const addMenjin = (data = {}) => {
    return api.post('/menjin/add', data)
}

// 修改门禁设备
export const upMenjin = (id, data = {}) => {
    return api.put(`/menjin/update/${id}`, data)
}

// 删除门禁设备
export const delMenjin = (id) => {
    return api.delete(`/menjin/del/${id}`)
}

// 批量删除门禁设备
export const allDelMenjin = (ids = []) => {
    return api.delete('/menjin/AllDel', {
        data: { ids }
    })
}





// ==================== 新闻文章管理相关接口 ====================

// 获取新闻列表（管理端）
export const wenList = (params = {}) => {
    return api.get('/LCY/admin/news', { params })
}

// 获取新闻详情（管理端）
export const wenDetail = (id) => {
    return api.get(`/LCY/admin/news/${id}`)
}

// 删除单个新闻
export const deleteWen = (id) => {
    return api.delete(`/LCY/news/${id}`)
}

// 批量删除新闻
export const batchDeleteWen = (ids = []) => {
    return api.delete('/LCY/news/batch', {
        data: { ids }
    })
}

// 更新新闻审核状态
export const updateNewsStatus = (id, data) => {
    return api.put(`/LCY/admin/news/${id}/status`, data)
}

// 文件上传
export const uploadFile = (data) => {
    return api.post('/wen/upload', data)
}

// ==================== 评论管理相关接口 ====================

// 获取文章评论列表
export const getCommentsByNews = (newsId, params = {}) => {
    return api.get(`/LCYping/news/${newsId}/comments`, { params })
}

// 获取评论详情
export const getCommentDetail = (commentId) => {
    return api.get(`/LCYping/comments/${commentId}`)
}

// 删除评论
export const deleteComment = (commentId) => {
    return api.delete(`/LCYping/comments/${commentId}`)
}

// 批量删除评论
export const batchDeleteComments = (commentIds) => {
    return api.delete('/LCYping/comments/batch', {
        data: { ids: commentIds }
    })
}

// 获取评论回复列表
export const getCommentReplies = (commentId, params = {}) => {
    return api.get(`/LCYping/comments/${commentId}/replies`, { params })
}

// 更新评论状态（如隐藏/显示）
export const updateCommentStatus = (commentId, data) => {
    return api.put(`/LCYping/comments/${commentId}/status`, data)
}

// ==================== 合同管理相关接口 ====================

// 获取合同列表
export const hetongList = (params = {}) => {
    return api.get('/hetong/list', { params })
}

// 获取合同详情
export const hetongDetail = (id) => {
    return api.get(`/hetong/detail/${id}`)
}

// 添加合同
export const addHetong = (data = {}) => {
    return api.post('/hetong/add', data)
}

// 更新合同
export const updateHetong = (id, data = {}) => {
    return api.put(`/hetong/update/${id}`, data)
}

// 删除单个合同
export const deleteHetong = (id) => {
    return api.delete(`/hetong/delete/${id}`)
}

// 批量删除合同
export const batchDeleteHetong = (ids = []) => {
    return api.delete('/hetong/batch-delete', {
        data: { ids }
    })
}

// 获取合同统计信息
export const hetongStatistics = () => {
    return api.get('/hetong/statistics')
}

// 获取即将到期的合同
export const hetongExpiring = (params = {}) => {
    return api.get('/hetong/expiring', { params })
}

// 生成合同编号
export const generateHetongNumber = () => {
    return api.get('/hetong/generate-number')
}

// 注意：availableRooms 已移除，因为新的合同模型不再包含房间信息

// ==================== 客户管理相关接口 ====================

// 获取客户列表
export const kehuList = (params = {}) => {
    return api.get('/kehu', { params })
}

// 获取客户详情
export const kehuDetail = (id) => {
    return api.get(`/kehu/${id}`)
}

// 新增客户
export const addKehu = (data = {}) => {
    return api.post('/kehu', data)
}

// 更新客户
export const updateKehu = (id, data = {}) => {
    return api.put(`/kehu/${id}`, data)
}

// 删除客户
export const deleteKehu = (id) => {
    return api.delete(`/kehu/${id}`)
}

// 批量删除客户
export const batchDeleteKehu = (ids = []) => {
    return api.delete('/kehu/batch/delete', { data: { ids } })
}

// 获取客户统计信息
export const kehuStats = (params = {}) => {
    return api.get('/kehu/stats/overview', { params })
}

// ==================== 租户信息相关接口 ====================

// 获取租户信息列表
export const zuhuList = (params = {}) => {
    return api.get('/zuhuxinxi', { params })
}

// 获取租户信息详情
export const zuhuDetail = (id) => {
    return api.get(`/zuhuxinxi/${id}`)
}

// 添加租户信息
export const addZuhu = (data = {}) => {
    return api.post('/zuhuxinxi', data)
}

// 更新租户信息
export const updateZuhu = (id, data = {}) => {
    return api.put(`/zuhuxinxi/${id}`, data)
}

// 删除租户信息
export const deleteZuhu = (id) => {
    return api.delete(`/zuhuxinxi/${id}`)
}

// 批量删除租户信息
export const batchDeleteZuhu = (ids = []) => {
    return api.delete('/zuhuxinxi/batch', { data: { ids } })
}

// 获取合同列表
export const getContracts = (params = {}) => {
    return api.get('/zuhuxinxi/contracts', { params })
}

// 获取企业列表
export const getCompanies = (params = {}) => {
    return api.get('/zuhuxinxi/companies', { params })
}

// 获取企业员工列表
export const getCompanyEmployees = (companyId) => {
    return api.get(`/zuhuxinxi/employees/${companyId}`)
}

// 获取租户统计信息
export const zuhuStats = (params = {}) => {
    return api.get('/zuhuxinxi/stats/overview', { params })
}

// ==================== 租户人员管理相关接口 ====================

// 获取租户人员列表
export const employeeList = (params = {}) => {
    return api.get('/WYQ/employee/list', { params })
}

// 获取指定企业的员工列表 
export const getEmployeesByCompany = (companyId) => {
    return api.get('/WYQ/employee', { params: { comid: companyId } })
}

// 添加员工
export const addEmployee = (data = {}) => {
    return api.post('/WYQ/addcomem', data)
}

// 上传员工头像
export const uploadEmployeePhoto = (data) => {
    return api.post('/WYQ/uploadcomem', data)
}

// 删除员工
export const deleteEmployee = (id) => {
    return api.delete(`/WYQ/employee/delete/${id}`)
}

// 批量删除员工
export const batchDeleteEmployee = (ids) => {
    return api.delete('/WYQ/employee/batchDelete', { data: { ids } })
}

// ==================== 楼宇管理相关接口 ====================

// 获取楼栋列表
export const getBuildingList = (params = {}) => {
    return api.get('/Building', { params })
}

// 获取楼宇详情
export const getBuildingDetail = (id) => {
    return api.get(`/Building/detail/${id}`)
}

// 添加楼栋
export const addBuilding = (data = {}) => {
    return api.post('/Building/add', data)
}

// 更新楼栋
export const updateBuilding = (id, data = {}) => {
    return api.put(`/Building/update/${id}`, data)
}

// 删除楼栋
export const deleteBuilding = (id) => {
    return api.delete(`/Building/delete/${id}`)
}

// 获取楼宇统计信息
export const getBuildingStats = () => {
    return api.get('/Building/stats')
}

// ==================== 房间管理相关接口 ====================

// 获取房间列表
export const getHouseList = (params = {}) => {
    return api.get('/House', { params })
}

// 根据楼栋ID获取房间列表
export const getHousesByBuilding = (buildingId) => {
    return api.get(`/House/building/${buildingId}`)
}

// 根据楼栋ID和楼层获取房间列表
export const getHousesByBuildingAndFloor = (buildingId, floor) => {
    return api.get(`/House/building/${buildingId}/floor/${floor}`)
}

// 添加房间
export const addHouse = (data = {}) => {
    return api.post('/House/add', data)
}

// 更新房间
export const updateHouse = (id, data = {}) => {
    return api.put(`/House/update/${id}`, data)
}

// 删除房间
export const deleteHouse = (id) => {
    return api.delete(`/House/delete/${id}`)
}

// 获取楼宇的楼层信息
export const getBuildingFloors = (buildingId) => {
    return api.get(`/House/building/${buildingId}/floors`)
}

// 批量生成房间
export const batchGenerateHouses = (data = {}) => {
    return api.post('/House/batch-generate', data)
}

// 获取房间统计信息
export const getHouseStats = () => {
    return api.get('/House/stats')
}

// ==================== 租户账单管理相关接口 ====================

// 获取租户账单列表
export const getTenantBillList = (params = {}) => {
    return api.get('/tenantbill', { params })
}

// 获取企业列表（用于下拉选择）
export const getTenantBillCompanies = (params = {}) => {
    return api.get('/tenantbill/companies', { params })
}

// 新增租户账单
export const addTenantBill = (data = {}) => {
    return api.post('/tenantbill', data)
}

// 更新租户账单
export const updateTenantBill = (id, data = {}) => {
    return api.put(`/tenantbill/${id}`, data)
}

// 删除租户账单
export const deleteTenantBill = (id) => {
    return api.delete(`/tenantbill/${id}`)
}

// 批量删除租户账单
export const batchDeleteTenantBill = (ids = []) => {
    return api.delete('/tenantbill/batch', {
        data: { ids }
    })
}

// 更新缴费状态
export const updateTenantBillPayment = (id, data = {}) => {
    return api.put(`/tenantbill/${id}/payment`, data)
}

// 运营总览相关API
export const getOperationOverview = () => {
  return api.get('/operation/overview')
}

export const getOperationStats = () => {
  return api.get('/operation/stats')
}

export const getRecentContracts = (params = {}) => {
  return api.get('/hetong/list', { params: { ...params, page: 1, size: 5 } })
}

export const getRecentTenantBills = (params = {}) => {
  return api.get('/tenantbill', { params: { ...params, page: 1, size: 10 } })
}

export const getBuildingOccupancy = () => {
  return api.get('/Building/occupancy')
}

export const getRevenueStats = (timeRange = '30days') => {
  return api.get('/operation/revenue', { params: { timeRange } })
}

export default api 