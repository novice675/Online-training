import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import { Suspense } from 'react'
import 'antd-mobile/es/global';
import './index.css'
import router from './router'
import store from './store'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <Suspense fallback={<div>loading...</div>}>
        <RouterProvider router={router} />
      </Suspense>
    </Provider>
  </React.StrictMode>
)

