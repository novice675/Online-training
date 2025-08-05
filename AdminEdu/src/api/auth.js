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

// 获取可用房间列表
export const availableRooms = (params = {}) => {
    return api.get('/hetong/available-rooms', { params })
}

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

// 获取租户统计信息
export const zuhuStats = (params = {}) => {
    return api.get('/zuhuxinxi/stats/overview', { params })
}

export default api 