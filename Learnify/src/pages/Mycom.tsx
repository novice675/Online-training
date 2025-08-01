// 个人信息页面组件
import React, { useEffect, useState } from "react";
import { Grid, NavBar, Toast } from "antd-mobile";
import { UploadOutline,EnvironmentOutline ,AppOutline } from "antd-mobile-icons";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import http from "../utils/axios";
import styles from '../cssmodule/recommend.module.css'
interface Com {
  name?: string;
  inaddress?: string;
  type?: string;
  logo?: string;
  house?: string;
  outaddress?: string;
  _id?:string
}
const PersonalInfo = () => {
 
  const navigate = useNavigate();
  const {search}=useLocation()
  const query=new URLSearchParams(search)

  const [item,setitem]=useState<Com>({})
  const getitem=async()=>{
    const id=query.get('id')
    let res=await http.get('/WYQ/comitem',{_id:id})
    if(res.code==200){
      setitem(res.item)
    }else{
      Toast.show({
        icon:'warning',
        content:'企业id传递错误请联系客服'
      })
    }
  }
  useEffect(()=>{
    getitem()
  },[])
  return (
    <div style={{ background: "white", minHeight: "100vh" }}>
      {/* 顶部导航栏 */}
      <NavBar
        onBack={() => {
          navigate(-1);
        }}
      >
        我的企业
      </NavBar>

      <div style={{ marginBottom: "10px" }}>
        <span
          style={{
            display: "inline-block",
            width: "8px",
            backgroundColor: "blue",
            height: "15px",
            marginLeft: "10px",
            marginTop: "10px",
            verticalAlign: "middle",
          }}
        ></span>
        <span
          style={{
            display: "inline-block",
            marginLeft: "10px",
            fontSize: "16px",
            verticalAlign: "middle",
            marginTop: "8px",
          }}
        >
          企业基本信息
        </span>
      </div>
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 12,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          backgroundImage: "url(/images/1.png)",
          height: "150px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <img
            src={item.logo}
            alt="logo"
            style={{ width: 45, height: 45, borderRadius: "50%" }}
          />
          {/* <div
            style={{ color: "#1677ff", fontSize: 14, marginRight: "13px" }}
            onClick={() => navigate(`/employee/company/${index}`)}
          >
            详情
          </div> */}
        </div>

        <div style={{ fontSize: 16, fontWeight: 500, marginTop: 8 }}>
          <AppOutline />
          {item.name}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: 6,
            // color: "#666",
            fontSize: 12,
          }}
        >
          <EnvironmentOutline style={{ marginRight: 4 }} />
          {item.outaddress}
        </div>
      </div>
      <div>
        <span
          style={{
            display: "inline-block",
            width: "8px",
            backgroundColor: "blue",
            height: "15px",
            marginLeft: "10px",
            marginTop: "10px",
            verticalAlign: "middle",
          }}
        ></span>
        <span
          style={{
            display: "inline-block",
            marginLeft: "10px",
            fontSize: "16px",
            verticalAlign: "middle",
            marginTop: "8px",
          }}
        >
          企业应用
        </span>
      </div>
      <Grid
        columns={4}
        gap={15}
        style={{ marginTop: "15px", marginBottom: "15px" }}
      >
        <Grid.Item className={styles["grid-demo-item-block"]}>
          <div style={{ textAlign: "center" }}>
            <img src="/dayed/1.png" alt="" className={styles.img} />
            员工通信录
          </div>
        </Grid.Item>
        <Grid.Item
          onClick={() => {
            navigate("/visitor");
          }}
          className={styles["grid-demo-item-block"]}
        >
          <div style={{ textAlign: "center" }}>
            <img src="/dayed/2.png" alt="" className={styles.img} />
            退出企业
          </div>
        </Grid.Item>
      </Grid>

      <div>
        <span
          style={{
            display: "inline-block",
            width: "8px",
            backgroundColor: "blue",
            height: "15px",
            marginLeft: "10px",
            marginTop: "10px",
            verticalAlign: "middle",
          }}
        ></span>
        <span
          style={{
            display: "inline-block",
            marginLeft: "10px",
            fontSize: "16px",
            verticalAlign: "middle",
            marginTop: "8px",
          }}
        >
          企业管理应用
        </span>
      </div>
      <Grid
        columns={4}
        gap={15}
        style={{ marginTop: "15px", marginBottom: "15px" }}
      >
        <Grid.Item className={styles["grid-demo-item-block"]}>
          <div style={{ textAlign: "center" }}>
            <img src="/dayed/3.png" alt="" className={styles.img} />
            访客记录
          </div>
        </Grid.Item>
        <Grid.Item
          onClick={() => {
            navigate("/visitor");
          }}
          className={styles["grid-demo-item-block"]}
        >
          <div style={{ textAlign: "center" }}>
            <img src="/dayed/4.png" alt="" className={styles.img} />
            通讯录管理
          </div>
        </Grid.Item>
        <Grid.Item onClick={()=>{navigate('/haoni')}} className={styles["grid-demo-item-block"]}>
          <div style={{ textAlign: "center" }}>
            <img src="/dayed/5.png" alt="" className={styles.img} />
            能耗查询
          </div>
        </Grid.Item>
        <Grid.Item className={styles["grid-demo-item-block"]}>
          <div style={{ textAlign: "center" }}>
            <img src="/dayed/6.png" alt="" className={styles.img} />
            场地预约
          </div>
        </Grid.Item>
      </Grid>
    </div>
  );
};

export default PersonalInfo;
