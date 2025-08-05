// 个人信息页面组件
import React, { useEffect, useState } from "react";
import { Form, Input, Button, ImageUploader, NavBar, Toast } from "antd-mobile";
import { UploadOutline,EnvironmentOutline ,AppOutline } from "antd-mobile-icons";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import http from "../../utils/axios";
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
  // 表单初始值
  const initialValues = {
    name: "",
    sex: "",
    phone: "",
    sfz: "",
    email: "",
    weixin: "",
    picture: [],
  };
  const [form]=Form.useForm()
  const navigate = useNavigate();
  const {search}=useLocation()
  const query=new URLSearchParams(search)

  const uploadcomem = async (file:File) => {
    let formdata=new FormData()
    formdata.append('file',file)
    let res=await http.post('/WYQ/uploadcomem',formdata)
    if(res.code==200){
      return Promise.resolve({
        url: res.url,
      });
    }else{
      throw new Error("em上传错误")
    }
  };
  const addcomem=async()=>{
    console.log(query);
    
    let values=await form.validateFields()
    const id=query.get('id')
    console.log(id,'id');
    
    values.picture=values?.picture[0]?.url||''
    let res=await http.post('/WYQ/addcomem',{...values,company_id:id})
    console.log(res);
    
    if(res.code==200){
      navigate("/employee_done")
    }else{
      throw new Error("addcomem错误")
    }
  }
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
    <div style={{ background: "#f5f5f5", minHeight: "100vh" }}>
      {/* 顶部导航栏 */}
      <NavBar
        back="返回"
        onBack={() => {
          navigate(-1);
        }}
      >
        人员入驻
      </NavBar>

      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 12,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          backgroundImage: "url(/images/1.png)",
          height:'150px'
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

      {/* 表单区域 */}
      <Form
        form={form}
        layout="horizontal"
        initialValues={initialValues}
        footer={
          <Button onClick={addcomem} block color="primary" type="submit">
            提交
          </Button>
        }
      >
        {/* 表单标题 */}
        <div
          style={{
            padding: "12px 16px",
            background: "#f0f0f0",
            fontWeight: "bold",
          }}
        >
          请填写相关信息
        </div>

        {/* 姓名 */}
        <Form.Item name="name" label="人员姓名">
          <Input placeholder="请输入人员姓名" />
        </Form.Item>

        {/* 性别 */}
        <Form.Item name="sex" label="人员性别">
          <Input placeholder="请输入人员性别" />
        </Form.Item>

        {/* 手机号 */}
        <Form.Item name="phone" label="手机号码">
          <Input placeholder="请输入手机号码" />
        </Form.Item>

        {/* 身份证号 */}
        <Form.Item name="sfz" label="身份证号">
          <Input placeholder="请输入身份证号" />
        </Form.Item>

        {/* 邮箱 */}
        <Form.Item name="email" label="邮箱号码">
          <Input placeholder="请输入邮箱号码" />
        </Form.Item>

        {/* 绑定微信 */}
        <Form.Item name="weixin" label="绑定微信">
          <Input placeholder="请输入绑定微信号" />
        </Form.Item>

        {/* 上传照片标题 */}
        <div
          style={{
            padding: "12px 16px",
            background: "#f0f0f0",
            fontWeight: "bold",
          }}
        >
          请上传照片
        </div>

        {/* 上传照片区域 */}
        <Form.Item name="picture">
          <div style={{ display: "flex", gap: 16, padding: "0 16px" }}>
            {/* 示例图 */}
            <div
              style={{
                width: 120,
                height: 120,
                background: "#fff",
                border: "1px solid #ccc",
                borderRadius: 8,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                // color: '#666',
                marginLeft: "20px",
              }}
            >
              <img
                src="/9.png"
                alt="示例头像"
                style={{ width: 48, height: 48, marginBottom: 4 }}
              />
              <span style={{ fontSize: "10px" }}>正确实例：五官清晰</span>
            </div>

            {/* 上传图 */}
            <ImageUploader upload={uploadcomem} maxCount={1} accept="image/*">
              <div
                style={{
                  width: 120,
                  height: 120,
                  border: "1px dashed #ccc",
                  borderRadius: 8,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#999",
                  fontSize: 12,
                  background: "#fafafa",
                  marginLeft: "10px",
                }}
              >
                <UploadOutline style={{ fontSize: 28, marginBottom: 8 }} />
                点击上传照片
              </div>
            </ImageUploader>
          </div>
        </Form.Item>

        {/* 上传提示 */}
        <div
          style={{
            padding: "12px 16px",
            fontSize: 12,
            color: "#999",
            textAlign: "center",
          }}
        >
          提示: 请保持五官清晰，以方便系统标准识别
        </div>
      </Form>
    </div>
  );
};

export default PersonalInfo;
