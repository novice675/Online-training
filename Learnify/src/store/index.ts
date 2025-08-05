import { configureStore } from '@reduxjs/toolkit'
import cart from './modules/cart'

const store = configureStore({
    reducer: {
        cart: cart
    }
})

// 从 store 本身推断 `RootState` 和 `AppDispatch` 类型
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store 