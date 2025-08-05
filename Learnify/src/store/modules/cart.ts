import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

// 定义初始状态类型
interface CartState {
    num: number
}

// 定义初始状态
const initialState: CartState = {
    num: 0
}

const cart = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addcart: (state, action: PayloadAction<number>) => {
            state.num += action.payload
        },
        // 可以添加更多action
        resetCart: (state) => {
            state.num = 0
        }
    }
})

export const { addcart, resetCart } = cart.actions
export default cart.reducer 