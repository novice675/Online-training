import {createSlice} from "@reduxjs/toolkit"
const cart = createSlice({
    name:"cart",
    initialState:{
        // 数据
        num:0
    },
    // 方法
    reducers:{
        addcart(){}
    }
})

export const {addcart} = cart.actions
export default cart.reducer
