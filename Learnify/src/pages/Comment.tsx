import React, { useEffect, useState } from "react";
import http from "../utils/axios";
import { Toast, NavBar, Input, List, Button, Popup } from "antd-mobile";
import { useLocation, useNavigate } from "react-router-dom";
import { CommentTree } from "./CommentTree";
import { useRealTimeComments } from "../composables/useRealTimeComments";
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
  const [pid, setpid] = useState("");
  
  // 使用实时评论Hook
  const {
    comments,
    loading,
    error,
    refresh
  } = useRealTimeComments({
    newsId: moment_id || undefined,
    page: 1,
    limit: 100,
    autoRefresh: true
  });

  // 将新的评论数据结构转换为旧的格式以保持兼容性
  const comment = comments.map((item: any) => ({
    _id: item._id,
    time: item.createdAt,
    content: item.content,
    moment_id: item.newsId,
    type: item.userId?.username || '',
    user_id: item.userId?._id || '',
    user: {
      name: item.userId?.username || '',
      picture: item.userId?.avatar || '/images/1.png'
    },
    replies: item.replies || [],
    pname: item.replyToAuthor || '',
    pid: item.parentId || ''
  })) as Co[];

  // const [content,setcontent]=useState('')
  const addcomment = async () => {
    if (!info.content.trim()) {
      Toast.show({
        icon: "fail",
        content: "请输入评论内容",
      });
      return;
    }

    const user_id = localStorage.getItem("user_id");
    if (!user_id) {
      Toast.show({
        icon: "fail",
        content: "请先登录",
      });
      return;
    }

    try {
      let res;
      if (pid) {
        // 回复评论
        res = await http.post("/LCYping/comments/" + pid + "/replies", {
          content: info.content,
          userId: user_id,
          replyToAuthor: "用户" // 这里可以根据实际情况获取被回复者的用户名
        });
      } else {
        // 发布主评论
        res = await http.post("/LCYping/news/" + moment_id + "/comments", {
          content: info.content,
          userId: user_id
        });
      }

      if (res.success) {
        Toast.show({
          icon: "success",
          content: "发布成功",
        });
        setVisible1(false);
        setpid('');
        setinfo({ content: "" });
        // 实时更新会自动处理，不需要手动刷新
      } else {
        Toast.show({
          icon: "fail",
          content: "发布失败",
        });
      }
    } catch (error) {
      console.error("发布评论失败:", error);
      Toast.show({
        icon: "fail",
        content: "发布失败，请重试",
      });
    }
  };
  const del = async (id: string) => {
    try {
      // 这里需要根据实际的删除API来调整
      // 由于没有看到删除评论的API，暂时保留原来的逻辑
      let res = await http.delete('/WYQ/delcomment', { _id: id, moment_id });
      if (res.code == 200) {
        Toast.show({
          icon: "success",
          content: "删除成功"
        });
        // 实时更新会自动处理，不需要手动刷新
      } else {
        Toast.show({
          icon: "fail",
          content: "删除错误请联系客服"
        });
      }
    } catch (error) {
      console.error("删除评论失败:", error);
      Toast.show({
        icon: "fail",
        content: "删除失败，请重试"
      });
    }
  };
  // 实时更新会自动处理数据加载，不需要手动调用
  // useEffect(() => {
  //   getlist();
  // }, []);

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
