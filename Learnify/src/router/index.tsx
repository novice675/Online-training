import  React,{ Suspense}from "react"
import { createBrowserRouter, Navigate}  from "react-router-dom"
import Shou from '../pages/Shou';
import Serve from '../pages/Serve';
import Organize from '../pages/Organize';
import Main from '../pages/Main';
import AutoChat from '../pages/chat/AutoChat';

const  App= React.lazy(()=>import("../App"))
const  Login= React.lazy(()=>import("../pages/Login"))


// 定义路由类型
interface RouteConfig {
  path: string;
  element: React.ReactNode;
}

//
const Islogin = ({ children }: { children: React.ReactElement }) => {
   
  let Com = children.type  
  console.log(Com);
  return sessionStorage.getItem("token") ? <Com /> : <Navigate to="/login" />

}

const routes =  createBrowserRouter([
  {path:"/",element:<Islogin><App></App></Islogin>,
    children:[
     {path:"/shou",element:<Shou></Shou>},
    {
      path: '/service',
      element: <Serve />,
    },
    {
      path: '/organization',
      element: <Organize />,
    },
    {
      path: '/me',
      element: <Main />,
    },
    
     
     {path:"/",element:<Navigate to="/shou"></Navigate>}
  ]},
  {path:"/login",element:<Login></Login>},
  {
    path: '/autochat',
    element: <AutoChat />,
  },
])


export default routes;
export type { RouteConfig };
