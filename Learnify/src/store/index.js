import {configureStore} from '@reduxjs/toolkit'
import cart from './modules/cart'

const store = configureStore({
    reducer:{
        cart:cart
    }
})
export default store