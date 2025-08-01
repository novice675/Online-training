import React, { useEffect, useState } from "react";
import http from "../../utils/axios";
import { Toast } from "antd-mobile";

interface Mo {
  _id: string;
  user_id: string;
  title: string;
  content?: string[];
  zan: number;
  eye: number;
  star: number;
  type: string;
  time: string;
  employee?:any;
  visitor?:any;
  picture:string
}
export default function Circle() {
  const [moments, setmoment] = useState<Mo[]>([]);
  const getlist = async () => {
    let res = await http.get("/WYQ/moment");
    if (res.code == 200) {
      setmoment(res.list);
    } else {
      Toast.show({
        icon: "field",
        content: "获取圈子失败请联系客服",
      });
    }
  };
  useEffect(() => {
    getlist();
  }, []);
  return  <div style={{ padding: '10px' }}>
  {moments.map((item) => (
    <div
      key={item._id}
      style={{
        background: '#fff',             
        borderRadius: '8px',            
        padding: '10px',                
        marginBottom: '10px',           
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)', 
      }}
    >
      {/* 顶部头像 + 名称 + 关注 */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex' }}>
          <img
            src={item.picture}                 
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              marginRight: '10px',
            }}
          />
          <div>
            <div style={{ fontWeight: 600 }}>{item.type=='员工'?item?.employee?.[0].name:item?.visitor?.[0].name}</div>
            <div style={{ fontSize: '12px', color: '#999',marginTop:'7px' }}>
              1小时前 来自金华市婺铜社区
            </div>
          </div>
        </div>
        <button
          style={{
            border: '1px solid #1677ff',
            color: '#1677ff',
            borderRadius: '4px',
            height: '24px',
            padding: '0 8px',
            background: 'transparent',
          }}
        >
          关注
        </button>
      </div>

      {/* 文本内容 */}
      <div style={{ marginTop: '10px', fontWeight: 500 }}>{item.title}</div>

      {/* 图片内容 */}
      {item.content && item.content.length > 0 && (
        <div style={{ display: 'flex', marginTop: '10px',flexWrap:'wrap' }}>
          {item.content.map((img, index) => (
            <img
              key={index}
              src={img}
              style={{
                width: '30%',
                marginRight: index !== 2 ? '5%' : '0', // 三图排布
                borderRadius: '6px',
                height: '80px',
                objectFit: 'cover',
                marginBottom:"10px"
              }}
            />
          ))}
        </div>
      )}

      {/* 点赞/浏览/收藏 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          fontSize: '14px',
          color: '#999',
          marginTop: '10px',
        }}
      >
        <div>👍 {item.zan}</div>
        <div>👁 {item.eye}</div>
        <div>⭐ {item.star}</div>
      </div>
    </div>
  ))}
</div>;
}
