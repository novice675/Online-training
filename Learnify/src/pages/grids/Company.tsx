import React from 'react';
import { Form, Input, Button, ImageUploader, NavBar,  } from 'antd-mobile';
import { UploadOutline } from 'antd-mobile-icons';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
axios.defaults.baseURL='http://localhost:3008'
const Company = () => {
  // 表单初始值
  const initialValues = {
    name: '',
    inaddress: '',
    house: '',
    type: '',
    outaddress:'',
    logo:'',
  };
  const navigate=useNavigate()
  const submit=async()=>{
    let values=await form.validateFields()
    console.log(values);
  
    let res=await axios.post('/WYQ/addcom',values)
    if(res.data.code==200){
      console.log('ok');
    }
  }
  const [form] = Form.useForm()
  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh" }}>
      {/* 顶部导航栏 */}
      <NavBar
        back="返回"
        onBack={() => {
          navigate(-1);
        }}
      >
        企业登记
      </NavBar>

      {/* 顶部步骤条 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          margin: "16px 0",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ color: "#1677ff" }}>●</div>
          <div style={{ fontSize: 12 }}>企业信息</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ color: "#ccc" }}>●</div>
          <div style={{ fontSize: 12 }}>个人信息</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ color: "#ccc" }}>●</div>
          <div style={{ fontSize: 12 }}>登记成功</div>
        </div>
      </div>

      {/* 表单区域 */}
      <Form
        layout="horizontal"
        initialValues={initialValues}
        form={form}
        footer={
          <Button onClick={submit} block color="primary" type="submit">
            下一步
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

        <Form.Item name="name" label="企业名称">
          <Input placeholder="请输入企业名称" />
        </Form.Item>

        <Form.Item name="inaddress" label="入住楼宇">
          <Input placeholder="请输入入住楼宇" />
        </Form.Item>

        <Form.Item name="house" label="入住房号">
          <Input placeholder="请输入入住房号" />
        </Form.Item>

        <Form.Item name="type" label="所属行业">
          <Input placeholder="请输入所属行业" />
        </Form.Item>

        <Form.Item name="building" label="入驻楼宇">
          <Input placeholder="请输入入驻楼宇" />
        </Form.Item>

        <div
          style={{
            padding: "12px 16px",
            background: "#f0f0f0",
            fontWeight: "bold",
          }}
        >
          企业logo
        </div>

        <Form.Item name="license">
          <ImageUploader
            upload={async (file) => {
              console.log(file, "file");
              const formData = new FormData();
              formData.append("file", file);
              let res:{data:{code:number,url:string}} = await axios.post("/WYQ/comupload", formData);
              if (res.data.code == 200) {
                return Promise.resolve({
                  url: res.data.url,
                });
              }else{
                throw new Error('上传失败')
              }
            }}
            maxCount={1}
            accept="image/*"
          >
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: 8,
                border: "1px solid #ccc",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "#999",
                fontSize: 12,
                background: "#fafafa",
              }}
            >
              <UploadOutline style={{ fontSize: 32, marginBottom: 8 }} />
              企业logo
              <div style={{ fontSize: 10, marginTop: 4 }}>
                支持JPG、PNG，≤5MB
              </div>
            </div>
          </ImageUploader>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Company;
