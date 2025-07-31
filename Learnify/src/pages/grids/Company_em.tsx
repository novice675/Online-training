// 个人信息页面组件
import React from 'react';
import { Form, Input, Button, ImageUploader, NavBar } from 'antd-mobile';
import { UploadOutline } from 'antd-mobile-icons';
import { useNavigate } from "react-router-dom";
const PersonalInfo = () => {
  // 表单初始值
  const initialValues = {
    name: '',
    gender: '',
    phone: '',
    idCard: '',
    email: '',
    wechat: '',
    photo: []
  };
  const navigate=useNavigate()
  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      {/* 顶部导航栏 */}
      <NavBar back="返回" onBack={()=>{navigate('/shou')}}>企业登记</NavBar>

      {/* 步骤指示条 */}
      <div style={{ display: 'flex', justifyContent: 'space-around', margin: '16px 0' }}>
        <div style={{ textAlign: 'center', color: '#1677ff' }}>
          <div>✔</div>
          <div style={{ fontSize: 12 }}>企业信息</div>
        </div>
        <div style={{ textAlign: 'center', color: '#1677ff' }}>
          <div style={{ fontWeight: 'bold' }}>2</div>
          <div style={{ fontSize: 12 }}>个人信息</div>
        </div>
        <div style={{ textAlign: 'center', color: '#ccc' }}>
          <div>3</div>
          <div style={{ fontSize: 12 }}>登记成功</div>
        </div>
      </div>

      {/* 表单区域 */}
      <Form
        layout='horizontal'
        initialValues={initialValues}
        footer={
          <Button onClick={()=>{navigate('/company_done')}} block color='primary' type='submit'>
            提交
          </Button>
        }
      >
        {/* 表单标题 */}
        <div style={{ padding: '12px 16px', background: '#f0f0f0', fontWeight: 'bold' }}>
          请填写相关信息
        </div>

        {/* 姓名 */}
        <Form.Item name='name' label='人员姓名'>
          <Input placeholder='请输入人员姓名' />
        </Form.Item>

        {/* 性别 */}
        <Form.Item name='gender' label='人员性别'>
          <Input placeholder='请输入人员性别' />
        </Form.Item>

        {/* 手机号 */}
        <Form.Item name='phone' label='手机号码'>
          <Input placeholder='请输入手机号码' />
        </Form.Item>

        {/* 身份证号 */}
        <Form.Item name='idCard' label='身份证号'>
          <Input placeholder='请输入身份证号' />
        </Form.Item>

        {/* 邮箱 */}
        <Form.Item name='email' label='邮箱号码'>
          <Input placeholder='请输入邮箱号码' />
        </Form.Item>

        {/* 绑定微信 */}
        <Form.Item name='wechat' label='绑定微信'>
          <Input placeholder='请输入绑定微信号' />
        </Form.Item>

        {/* 上传照片标题 */}
        <div style={{ padding: '12px 16px', background: '#f0f0f0', fontWeight: 'bold' }}>
          请上传照片
        </div>

        {/* 上传照片区域 */}
        <Form.Item name='photo'>
          <div style={{ display: 'flex', gap: 16, padding: '0 16px' }}>
            {/* 示例图 */}
            <div
              style={{
                width: 120,
                height: 120,
                background: '#fff',
                border: '1px solid #ccc',
                borderRadius: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                // color: '#666',
                marginLeft:'20px'
              }}
            >
              <img
                src='/9.png'
                alt='示例头像'
                style={{ width: 48, height: 48, marginBottom: 4 }}
              />
              <span style={{fontSize:'10px'}}>正确实例：五官清晰</span>
            </div>

            {/* 上传图 */}
            <ImageUploader
              upload={file =>
                Promise.resolve({
                  url: URL.createObjectURL(file),
                })
              }
              maxCount={1}
              accept='image/*'
            >
              <div
                style={{
                  width: 120,
                  height: 120,
                  border: '1px dashed #ccc',
                  borderRadius: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#999',
                  fontSize: 12,
                  background: '#fafafa',
                  marginLeft:'10px'

                }}
              >
                <UploadOutline style={{ fontSize: 28, marginBottom: 8 }} />
                点击上传照片
              </div>
            </ImageUploader>
          </div>
        </Form.Item>

        {/* 上传提示 */}
        <div style={{ padding: '12px 16px', fontSize: 12, color: '#999',textAlign:'center' }}>
          提示: 请保持五官清晰，以方便系统标准识别
          <br />
          <span style={{ color: '#1677ff' }}>
            *申请企业入驻的用户将成为企业首位管理员
          </span>
        </div>
      </Form>
    </div>
  );
};

export default PersonalInfo;
