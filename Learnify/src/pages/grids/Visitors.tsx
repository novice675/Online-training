import React, { useEffect, useState } from "react";
import { Grid, NavBar, Toast } from "antd-mobile";
import { useNavigate } from "react-router-dom";
import {
  UserOutline,
  BankcardOutline,
  TruckOutline,
  ClockCircleOutline,
} from "antd-mobile-icons";
import http from "../../utils/axios";
interface Vis {
  name: string;
  phone: string;
  sfz: string;
  picture: string;
  company_id: string;
  time: string;
  carcode?: string;
  cartype?: string;
  role: "访客";
 }
export default function Visitors() {
  const navigate = useNavigate();
  const [visitors, setvisitors] = useState<Vis[]>([]);
  const getlist = async () => {
    const comid = localStorage.getItem("com_id");
    let res = await http.get("/WYQ/visitors", { comid: comid, day: day });
    if (res.code == 200) {
      setvisitors(res.list);
    } else {
      Toast.show({
        icon: "warning",
        content: "访客查询错误,请联系客服",
      });
    }
  };
  const [day, setday] = useState(new Date().toISOString().slice(0, 10));
  const days = Array(7)
    .fill(0)
    .map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - 6 + i); // 取最近七天
      return {
        label: d.getDate().toString().padStart(2, "0"),
        week: "日一二三四五六"[d.getDay()],
        full: d.toISOString().slice(0, 10), // 可用于请求接口
      };
    });

  useEffect(() => {
    getlist();
  }, [day]);
  return (
    <div style={{backgroundColor:"white"}}>
      <NavBar
        onBack={() => {
          navigate(-1); // 返回上一页
        }}
      >
        访客记录
      </NavBar>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7,1fr)",
          gap: "6px",
          backgroundColor:'white',
          marginBottom:'10px'
        }}
      >
        {days.map((da) => (
          <div
            key={da.full}
            onClick={() => setday(da.full)}
            style={{
              padding: "8px 4px",
              textAlign: "center",
              borderRadius: "6px",
              background: day === da.full ? "#1677ff" : "#f2f2f2",
              color: day === da.full ? "#fff" : "#333",
            }}
          >
            <div>{da.week}</div>
            <div>{da.label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: 12, background: "white",borderTop:'10px solid #f2f2f2' }}>
        {visitors.map((v, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              alignItems: "center",
              background: "#fff",
              borderRadius: 6,
              padding: 10,
              marginBottom: 10,
            }}
          >
            {/* 左侧头像 */}
            <img
              src={v.picture}
              alt="avatar"
              style={{
                width: 90,
                height: 90,
                borderRadius: 6,
                objectFit: "cover",
                marginRight: 10,
              }}
            />

            {/* 中间信息 */}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: 13,
                  color: "black",
                }}
              >
                <UserOutline style={{ marginRight: 6, fontSize: 16 }} />
                {v.name}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: 13,
                  color: "black",
                }}
              >
                <BankcardOutline style={{ marginRight: 6, fontSize: 14 }} />
                {v.sfz}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: 13,
                  color: "black",
                }}
              >
                <TruckOutline style={{ marginRight: 6, fontSize: 14 }} />
                {v.carcode}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: 13,
                  color: "black",
                }}
              >
                <ClockCircleOutline style={{ marginRight: 6, fontSize: 14 }} />
                {new Date(v.time)
                  .toLocaleDateString()
                  .slice(5)
                  .replace("/", "-")}
              </div>
            </div>

            {/* 右侧二维码 */}
            <img
              src="/1.png"
              alt=""
              style={{ width: 56, height: 56, marginLeft: 8 }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
