import React, { useEffect, useState,useRef } from "react";
import { useLoaderData, useNavigate, useLocation } from "react-router-dom";
import { Grid, NavBar, Toast } from "antd-mobile";
import http from "../../utils/axios";
import { BrowserQRCodeReader } from "@zxing/browser";
import { method } from "lodash";
interface Vis {
  _id: string;
  name: string;
  phone: string;
  sfz: string;
  picture: string;
  company_id: any;
  time: string;
  carcode?: string;
  cartype?: string;
  role: "访客";
}
export default function Visitors_detail() {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const id = query.get("id");
  console.log(query, id);
  const [info, setinfo] = useState<Partial<Vis>>({});
  const getinfo = async () => {
    let res = await http.get("/WYQ/infovisitor", { _id: id });
    if (res.code == 200) {
      setinfo(res.info);
    }
  };

  const videoRef=useRef<HTMLVideoElement>(null)
  // 判断类型
  const detectType=(text)=>{
    if(/^https?:\/\//.test(text))return 'url'
    return 'text'
  }
  // 
  const validateurl=(text)=>{
    try{
      new URL(text);
      return true;
    }catch{
      return false;
    }
  }

  const saoma=async()=>{
    const codeReader=new BrowserQRCodeReader()
    const stream =await navigator.mediaDevices.getUserMedia({video:true})
    if(!videoRef.current)return
    videoRef.current.srcObject=stream
    await videoRef.current.play()
    codeReader.decodeFromVideoDevice('',videoRef.current,(result,error,controls)=>{
      if(result){
        console.log(1111);
        
        console.log('解码结果',result.getText());
        const text=result.getText()
        controls.stop()
        const type=detectType(text)
        switch(type){
          case 'url':
            if(validateurl(text)&&confirm(`检测到链接:${text}\n是否跳转`)){
              navigate('/middle',{
                state:{
                  text:text,
                  type:'url'
                }
              })
            }
            break;
          case 'text':
            navigate('/middle',{
              state:{
                text:text,
                type:'text'
              }
            })
            break;
        }
      }
      if(error){
        console.log(222);
        
        console.log(error);
        
      }
      
    })
  }
  
  useEffect(() => {
    getinfo();
    saoma()

  }, []);
  return (
    <div>
      <div style={{ padding: "12px" }}>
        <h3>{info.name || "（无姓名）"}</h3>
        <p>📱 手机号：{info.phone || "（无手机号）"}</p>
        <p>🪪 身份证号：{info.sfz || "（无身份证）"}</p>
        <p>🏢 公司ID：{info.company_id?.name || "（无公司ID）"}</p>
        <p>
          🕒 访问时间：
          {info.time ? new Date(info.time).toLocaleDateString() : ""}
        </p>
        <p>🚗 车牌号：{info.carcode || "（无车牌）"}</p>
        <p>🚙 车型：{info.cartype || "（无车型）"}</p>
        <p>👤 角色：{info.role || "（无角色）"}</p>
      </div>

      <div>
        <video ref={videoRef} style={{width:'300px'}} ></video>
        <button onClick={saoma}>扫码</button>
      </div>
    </div>
  );
}
