import React from 'react'
import { useNavigate } from 'react-router-dom'
export default function Login() {
    const navigate = useNavigate()
    const goLogin = () =>{
        sessionStorage.setItem('token','1234')
        navigate('/')
    }
  return (
    <div>
        <button onClick={goLogin}>登录</button>
        Login</div>
  )
}
