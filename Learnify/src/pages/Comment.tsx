import React, { useEffect, useState } from "react";
import http from "../utils/axios";
import { Toast, NavBar, Input, List, Button, Popup } from "antd-mobile";
import { useLocation, useNavigate } from "react-router-dom";
import { CommentTree } from "./CommentTree";
import { useWsevent } from "./grids/Wsevent";
interface Co {
  _id: string;
  time: string;
  content: string;
  moment_id: string;
  type: string;
  user_id: string;
  employee?: any;
  visitor?: any;
  user?: any;
  replies?:any;
  pname:string;
  pid:string
}
export default function Comment() {
  const navigate = useNavigate();
  const [visible1, setVisible1] = useState(false);
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const moment_id = query.get("moid");
  const [info, setinfo] = useState({
    content: "",
  });

  const [comment, setcomment] = useState<Co[]>([]);
  const [pid, setpid] = useState("");
  const {wsRef}=useWsevent('ws://localhost:3008',moment_id as string,{
    onMessage:(ev)=>{
      const data=JSON.parse(ev.data)
      if(data.type=='add'){
        getlist()
      }else if (data.type=='del'){
        getlist()
      }
    }
  })
  
  const getlist = async () => {
    let res = await http.get("/WYQ/comment", { moment_id });
    if (res.code == 200) {
      setcomment(res.list);
    } else {
      Toast.show({
        icon: "field",
        content: "获取评论错误,",
      });
    }
  };

  // const [content,setcontent]=useState('')
  const addcomment = async () => {
    const user_id = localStorage.getItem("user_id");
    const role = localStorage.getItem("role");
    let res = await http.post("/WYQ/addcomment", {
      ...info,
      moment_id: moment_id,
      type: role,
      user_id: user_id,
      pid: pid ? pid : null,
    });
    if (res.code == 200) {
      Toast.show({
        icon: "success",
        content: "发布成功",
      });
      setVisible1(false)
      setpid('')
      getlist();
    }
  };
  const del=async(id:string)=>{
    let res= await http.delete('/WYQ/delcomment',{_id:id,moment_id})
    if(res.code==200){
      Toast.show({
        icon:"success",
        content:"删除成功"
      })
      getlist()
    }else{
      Toast.show({
        icon:"field",
        content:"删除错误请联系客服"
      })
    }
  }
  useEffect(() => {
    getlist();


  }, []);

  return (
    <div>
      <NavBar
        onBack={() => {
          navigate(-1);
        }}
      >
        评论区
      </NavBar>

      <div style={{ display: "flex" }}>
        <Input
          placeholder="说点什么呢"
          value={info.content}
          onChange={(val) => {
            setinfo((i) => ({ ...i, content: val }));
          }}
          style={{
            height: "40px",
            border: "1px solid black",
            paddingLeft: "10px",
            marginBottom: "20px",
            width: "80%",
          }}
        />
        <Button onClick={addcomment} style={{ width: "18%", height: "40px" }}>
          发布
        </Button>
      </div>

      {/* <div>
        {comment.map((i) => (
          <div key={i._id}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                width: "90%",
                margin: "0 auto",
                borderBottom: "1px solid #eee",
                padding: "10px 0",
              }}
            >
              <div style={{ width: "20%" }}>
                <img
                  src={i.user.picture}
                  alt=""
                  style={{ width: "50px", height: "50px", borderRadius: "50%" }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "bold" }}>{`${i.user.name}回复${i.pname}`}</div>
                <div>{i.content}</div>
                <div style={{ fontSize: "12px", color: "#888" }}>
                  {new Date(i.time).toLocaleString()}
                  &emsp;
                  <button
                    onClick={() => {
                      setVisible1(true);
                      setpid(i._id);
                    }}
                  >
                    回复
                  </button>
                </div>
              </div>
              <div style={{ width: "15%", color: "red", fontSize: "25px" }}>
                ♥
              </div>
            </div>

            {
              i.replies.map((j:Co)=>(
                <div
                key={j._id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  width: "84%",
                  marginLeft:'10%',
                  margin: "0 auto",
                  borderBottom: "1px solid #eee",
                  padding: "10px 0",
                }}
              >
                <div style={{ width: "20%" }}>
                  <img
                    src={j.user.picture}
                    alt=""
                    style={{ width: "50px", height: "50px", borderRadius: "50%" }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "bold" }}>{`${j.user.name}回复${j.pname}`}</div>
                  <div>{j.content}</div>
                  <div style={{ fontSize: "12px", color: "#888" }}>
                    {new Date(j.time).toLocaleString()}
                    &emsp;
                    <button
                      onClick={() => {
                        setVisible1(true);
                        setpid(j._id);
                      }}
                    >
                      回复
                    </button>
                  </div>
                </div>
                <div style={{ width: "15%", color: "red", fontSize: "25px" }}>
                  ♥
                </div>
              </div>
              ))
            }
          </div>
        ))}
      </div> */}

      <div>
        <CommentTree comment={comment} setVisible1={setVisible1} setpid={setpid} del={del}/>
      </div>
      <Popup
        visible={visible1}
        onMaskClick={() => {
          setVisible1(false);
        }}
        onClose={() => {
          setVisible1(false);
        }}
        bodyStyle={{ height: "40vh" }}
      >
        <Input
          placeholder="说点什么呢"
          value={info.content}
          onChange={(val) => {
            setinfo((i) => ({ ...i, content: val }));
          }}
          style={{
            height: "40px",
            border: "1px solid black",
            paddingLeft: "10px",
            marginBottom: "20px",
            width: "80%",
          }}
        />
        <Button onClick={addcomment} style={{ width: "18%", height: "40px" }}>
          发布
        </Button>
      </Popup>
    </div>
  );
}
