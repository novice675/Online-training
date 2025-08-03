// 个人信息页面组件
import React, { useEffect, useState } from "react";
import { Form, Input, Button, ImageUploader, NavBar, Toast } from "antd-mobile";
import {
  UploadOutline,
  EnvironmentOutline,
  AppOutline,
} from "antd-mobile-icons";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import http from "../utils/axios";
interface Com {
  name?: string;
  inaddress?: string;
  type?: string;
  logo?: string;
  house?: string;
  outaddress?: string;
  _id?: string;
}
const PersonalInfo = () => {
  const navigate = useNavigate();
  const [item, setitem] = useState<Com>({});
  const getitem = async () => {
    // const id = query.get("id");
    const com_id=localStorage.getItem('com_id')
    const role=localStorage.getItem('role')
    console.log(com_id,role,'3333333');
    
    let res = await http.get("/WYQ/comitem", { _id: com_id });
    if (res.code == 200) {
      setitem(res.item);
    } else {
      Toast.show({
        icon: "warning",
        content: "企业id传递错误请联系客服",
      });
    }
  };
  useEffect(() => {
    getitem();
  }, []);
  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh" }}>
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 12,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          backgroundImage: "url(/images/1.png)",
          height: "180px",
          width:'92%',
          margin:'0 auto'
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
          <div
            style={{ color: "#1677ff", fontSize: 14, marginRight: "13px" }}
            onClick={() => navigate(`/mycom?id=${item._id}`)}
          >
            <button 
            style={{color:'white',width:'80px',borderRadius:'10px',backgroundColor:'blue',border:0,height:'30px',lineHeight:'30px'}}>
              进入企业</button>
          </div>
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

      <div style={{ padding: 16, background: "#f5f5f5" }}>
        {/* 第一条资讯卡片 */}
        <div
          style={{
            background: "#fff",
            borderRadius: 8,
            overflow: "hidden",
            marginBottom: 16,
          }}
        >
          <img src="images/2.png" style={{ width: "100%", display: "block" }} />
          <div
            style={{
              padding: 12,
              fontSize: 14,
              color: "#333",
              lineHeight: "22px",
            }}
          >
            我国第一本专属研究智慧园区理论和实践的《智慧园区》首次发布。该书由樊荣主编，陕西出版传媒集团、陕西科学技术出版社联合出版发行。
          </div>
        </div>

        {/* 第二条资讯卡片 */}
        <div
          style={{ background: "#fff", borderRadius: 8, overflow: "hidden" }}
        >
          <img src="images/3.png" style={{ width: "100%", display: "block" }} />
          <div
            style={{
              padding: 12,
              fontSize: 14,
              color: "#333",
              lineHeight: "22px",
            }}
          >
            助力产业园区智慧化也成为了各地政府与园区管理者的当务之急。IDC指出，2019年中国智慧园区的数字化投资超过1600亿元。而未来三年，这一数字的年复合增长率将超过20%。
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;
