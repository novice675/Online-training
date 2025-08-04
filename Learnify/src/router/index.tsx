import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import Shou from "../pages/Shou";
import Serve from "../pages/Serve";
import Organize from "../pages/Organize";
import Main from "../pages/Main";
import Company from "../pages/grids/Company";
import Company_em from '../pages/grids/Company_em'
import Company_done from '../pages/grids/Company_done'
import Visitor from '../pages/grids/Visitor'
import Visitor_done from "../pages/grids/Visitor_done";
import Employee from "../pages/grids/Employee";
import Employee_com from "../pages/grids/Employee_com";
import Employee_done from "../pages/grids/Employee_done";
import Mima from "../pages/grids/Mima";
import Mycom from '../pages/Mycom'
import Haoni from "../pages/grids/Haoni"
import Phones from "../pages/grids/Phones";
import Visitors from "../pages/grids/Visitors";
import Sendmement from "../pages/Sendmement";
import Comment from "../pages/Comment";
const App = React.lazy(() => import("../App"));
const Login = React.lazy(() => import("../pages/Login"));

// 定义路由类型
interface RouteConfig {
  path: string;
  element: React.ReactNode;
}

//
const Islogin = (zu) => {
  let Com = zu.children.type;
  console.log(Com);
  return sessionStorage.getItem("token") ? (
    <Com></Com>
  ) : (
    <Navigate to="/login"></Navigate>
  );
};

const routes = createBrowserRouter([
  {
    path: "/",
    element: (
      <Islogin>
        <App></App>
      </Islogin>
    ),
    children: [
      { path: "/shou", element: <Shou></Shou> },
      {
        path: "/serve",
        element: <Serve />,
      },
      {
        path: "/organization",
        element: <Organize />,
      },
      {
        path: "/me",
        element: <Main />,
      },

      { path: "/", element: <Navigate to="/shou"></Navigate> },
    ],
  },
  { path: "/login", element: <Login></Login> },
  {path:'/company',element:<Company></Company>},
  {path:'/company_em',element:<Company_em></Company_em>},
  {path:'/company_done',element:<Company_done></Company_done>},
  {path:'/visitor',element:<Visitor></Visitor>},
  {path:'/visitor_done',element:<Visitor_done></Visitor_done>},
  {path:'/employee',element:<Employee></Employee>},
  {path:'/employee_com',element:<Employee_com></Employee_com>},
  {path:'/employee_done',element:<Employee_done></Employee_done>},
  { path: "/mima", element: <Mima></Mima> },
  { path: "/mycom", element: <Mycom></Mycom> },
  { path: "/haoni", element: <Haoni></Haoni> },
  { path: "/phones", element: <Phones></Phones> },
  { path: "/visitors", element: <Visitors></Visitors> },
  { path: "/sendmement", element: <Sendmement></Sendmement> },
  { path: "/comment", element: <Comment></Comment> },

  
]);

export default routes;
export type { RouteConfig };
