import React, { useEffect, useState } from "react";
import { Grid, NavBar, Toast } from "antd-mobile";
import { useNavigate } from "react-router-dom";
import http from "../../utils/axios";
import pinyin from "pinyin";

interface em {
  company_id: string;
  name: string;
  sex: string;
  phone: string;
  sfz: string;
  email: string;
  weixin: string;
  picture: string;
  role: string;
  title?:string
}

export default function Phones() {
  const navigate = useNavigate();
  const [employ, setemploy] = useState<{ title: string; group: em[] }[]>([]);
  const getpinyin = (name: string) => {
    const result = pinyin(name[0], {
      style: pinyin.STYLE_FIRST_LETTER,
      heteronym: false,
    });
    console.log(result[0][0], name);

    return result[0][0].toUpperCase();
  };
  const getemploy = async () => {
    const comid = localStorage.getItem("com_id");
    console.log(comid);

    let res = await http.get("/WYQ/employee", { comid: comid });
    if (res.code == 200) {
      // console.log(res.list);
      let list: em[] = res.list;
      let newlist = list.map((i) => ({ ...i, title: getpinyin(i.name) }));
      console.log(newlist);
      let aaa:Record<string, em[]>={}
      newlist.forEach(i=>{
        aaa[i.title]=newlist.filter(j=>j.title==i.title)
      })
      let entries=Object.entries(aaa).sort((a,b)=>a[0].localeCompare(b[0])).map(([i,j])=>({title:i,group:j}))
      console.log(entries);
      setemploy(entries);
    } else {
      Toast.show({
        icon: "warning",
        content: "查询电话错误请联系客服",
      });
    }
  };
  useEffect(() => {
    getemploy();
  }, []);
  return (
    <div>
      <NavBar
        onBack={() => {
          navigate(-1); // 返回上一页
        }}
      >
        员工通讯录
      </NavBar>

      {/* 联系人列表渲染 */}
      <div>
        {employ.map((group) => (
          <div key={group.title}>
            {/* 分组字母标题 */}
            <div
              style={{ background: "#f3f3f3", padding: "6px 12px" }}
            >
              <b style={{ fontSize: 14 }}>{group.title}</b>
            </div>

            {/* 每组的联系人 */}
            {group.group.map((person, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px",
                  background: "#fff",
                  borderBottom: "1px solid #eee",
                }}
              >
                {/* 头像 */}
                <img
                  src={person.picture || "/1.png"} // 默认头像占位
                  alt="avatar"
                  style={{ width: 40, height: 40, borderRadius: "50%" }}
                />

                {/* 信息区域 */}
                <div style={{ flex: 1, marginLeft: 10 }}>
                  <div style={{ fontSize: 16, color: "#333" }}>{person.name}</div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginTop: 4,
                      fontSize: 12,
                      color: "#888",
                    }}
                  >
                    <span style={{ marginRight: 6 }}>📱</span>
                    <span>{person.phone}</span>
                    <span
                      onClick={() =>
                        navigator.clipboard.writeText(person.phone)
                      }
                      style={{ marginLeft: 8, cursor: "pointer" }}
                    >
                      📋
                    </span>
                  </div>
                </div>

                {/* 右侧箭头 */}
                <span style={{ color: "#bbb",fontSize:'40px',lineHeight:'40px'}}>›</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
