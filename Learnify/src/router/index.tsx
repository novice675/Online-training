import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import Shou from "../pages/Shou";
import Serve from "../pages/Serve";
import Organize from "../pages/Organize";
import Main from "../pages/Main";
import Company from "../pages/grids/Company";
import Company_em from '../pages/grids/Company_em'
import Company_done from '../pages/grids/Company_done'

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
        path: "/service",
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
]);

export default routes;
export type { RouteConfig };
