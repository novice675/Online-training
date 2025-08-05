import React, { useState } from 'react';
import { Form, Input, Button, ImageUploader, NavBar,  } from 'antd-mobile';
import { UploadOutline } from 'antd-mobile-icons';
import { useNavigate } from "react-router-dom";
import { Toast } from 'antd-mobile';
import http from '../../utils/axios';
const Company = () => {
  // 表单初始值
  const initialValues = {
    name: '',
    inaddress: '',
    house: '',
    type: '',
    outaddress:'',
    logo:[] as string[],
  };
  const navigate=useNavigate()
  const submit=async()=>{
    let values=await form.validateFields()
    console.log(values);
    values.logo=values?.logo[0]?.url||''
    let res=await http.post('/WYQ/addcom',values)
    if(res.code==200){
      console.log(res.id,'id');
      
      navigate(`/company_em?id=${res.id}`)
    }else if (res.code==400){
      Toast.show({
        icon:'fail',
        content:"企业名字已被占用"
      })
    }
  }
  const [form] = Form.useForm();
  const uploadlogo = async (file:File) => {
    console.log(file, "file");
    const formData = new FormData();
    formData.append("file", file);
    let res: { code: number; url: string  } = await http.post(
      "/WYQ/comupload",
      formData
    );
    if (res.code == 200) {
      // seturl(res.data.url)
      return Promise.resolve({
        url: res.url,
      });
    } else {
      throw new Error("上传失败");
    }
  };
  
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

        <Form.Item name="outaddress" label="企业地址">
          <Input placeholder="请输入企业地址" />
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

        <Form.Item name="logo">
          <ImageUploader
            upload={uploadlogo}
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
