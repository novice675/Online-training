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





// 获取文章列表
export const wenList = (params = {}) => {
    return api.get('/wen/list', { params })
}

// 添加文章
export const addWen = (data = {}) => {
    return api.post('/wen/add', data)
}

// 获取文章详情
export const wenDetail = (id) => {
    return api.get(`/wen/detail/${id}`)
}

// 更新文章
export const updateWen = (id, data = {}) => {
    return api.put(`/wen/update/${id}`, data)
}

// 删除单个文章
export const deleteWen = (id) => {
    return api.delete(`/wen/delete/${id}`)
}

// 批量删除文章
export const batchDeleteWen = (ids = []) => {
    return api.delete('/wen/batch-delete', {
        data: { ids }
    })
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

export default api 