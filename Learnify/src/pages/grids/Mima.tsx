import React from 'react';
import { Card,NavBar } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';

export default function Mima() {
  const iconList = [
    { name: '水费', img: '/mimad/1.png' },
    { name: '电费', img: '/mimad/2.png' },
    { name: '宽带', img: '/mimad/3.png' },
    { name: '物业费', img: '/mimad/4.png' }
  ];
  const navigate=useNavigate()
  const billList = [
    { name: '水费', img: '/mimad/1.png' },
    { name: '电费', img: '/mimad/2.png' },
    { name: '物业费', img: '/mimad/3.png' }
  ];

  return (
    <div style={{ background: "white", height:'660px' }}>
      <NavBar
        onBack={() => {
          navigate(-1);
        }}
      >
        缴费服务
      </NavBar>
      {/* 顶部背景图区域 */}
      <div
        style={{
          width: "100%",
          height: 140,
          backgroundImage: "url(/mimad/5.png)",
          backgroundSize: "cover",
        }}
      />

      {/* 四个缴费类型图标 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          background: "#fff",
          padding: "16px 0",
        }}
      >
        {iconList.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              fontSize: 14,
            }}
          >
            <img
              src={item.img}
              style={{ width: 32, height: 32, marginBottom: 8 }}
            />
            <div>{item.name}</div>
          </div>
        ))}
      </div>

      {/* 账单信息 */}
      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 500 }}>7月</div>
        <div style={{ color: "#999", marginBottom: 12 }}>总支出：21234元</div>

        {billList.map((item, i) => (
          <Card key={i} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <img
                src={item.img}
                style={{ width: 36, height: 36, marginRight: 12 }}
              />
              <div style={{ flex: 1 }}>
                <div>7月份{item.name}</div>
                <div style={{ fontSize: 12, color: "#999" }}>
                  2020.04.27 08:15
                </div>
              </div>
              <div style={{ textAlign: "right", fontSize: 12 }}>
                <div style={{ color: "green" }}>已缴费</div>
                <div>金额：234.67元</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}