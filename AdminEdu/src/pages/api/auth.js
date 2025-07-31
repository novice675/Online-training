import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:3000',
    timeout: 5000
})


api.interceptors.request.use(config => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

api.interceptors.response.use(response => {
    return response
}, error => {
    return Promise.reject(error)
})

// 智能门禁相关接口



export default api