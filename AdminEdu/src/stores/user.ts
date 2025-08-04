import { defineStore } from 'pinia'
import type { UserState } from '../types/interfaces/user'

// 定义 actions 的类型
interface UserActions {
    setUserInfo(userInfo: UserState): void
}

// 定义用户状态管理store
export const useUserStore = defineStore<'user', UserState, {}, UserActions>('user', {
    state: (): UserState => ({
        username: '',
        roleName: [],
        menuPermissions: [],
        buttonPermissions: []
    }),
    actions: {
        // 设置用户信息
        setUserInfo(userInfo: UserState) {
            this.username = userInfo.username
            this.roleName = userInfo.roleName
            this.menuPermissions = userInfo.menuPermissions
            this.buttonPermissions = userInfo.buttonPermissions
        }
    },
    // Pinia 持久化插件的简写配置
    persist: true
    // persist: {
    //     // 开启持久化
    //     enabled: true,
    //     // 自定义持久化的key
    //     key: 'user-store',
    //     // 自定义持久化的存储方式
    //     storage: localStorage,
    //     // 指定要持久化的数据
    //     paths: ['username', 'roleName', 'menuPermissions', 'buttonPermissions']
    // }
}) 