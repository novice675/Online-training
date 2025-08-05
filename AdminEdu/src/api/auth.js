import axios from 'axios'

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
export const uploadFile = (data = {}) => {
    return api.post('/wen/upload', data)
}




export default api