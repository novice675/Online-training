import React from 'react'
import { useNavigate } from 'react-router-dom'
export default function Login() {
    const navigate = useNavigate()
    const goLogin = () =>{
      sessionStorage.setItem('token','1234')

      //wyq需要登陆的用户(员工或者访客)的company_id和role和_id
      let user:{company_id?:string,role?:string,_id?:string}={}
      localStorage.setItem('com_id',user.company_id||'688b06dc52db26ae1e69b4b6')
      localStorage.setItem('role',user.role||'员工')
      localStorage.setItem('user_id',user._id||'688b258c82e870e203e576d0')



      navigate('/')
    }
  return (
    <div>
        <button onClick={goLogin}>登录</button>
        Login</div>
  )
}
