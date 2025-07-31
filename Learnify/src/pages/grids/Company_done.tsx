// 登记成功页面组件
import React from 'react';
import { Button, NavBar } from 'antd-mobile';
import { CheckCircleFill } from 'antd-mobile-icons';
import { useNavigate } from "react-router-dom";

const RegisterSuccess = () => {
  const navigate=useNavigate()

  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      {/* 顶部导航栏 */}
      <NavBar back="返回" onBack={()=>{navigate('/shou')}}>企业登记</NavBar>

      {/* 步骤条 */}
      <div style={{ display: 'flex', justifyContent: 'space-around', margin: '24px 0' }}>
        <div style={{ textAlign: 'center', color: '#1677ff' }}>
          <div>✔</div>
          <div style={{ fontSize: 12 }}>企业信息</div>
        </div>
        <div style={{ textAlign: 'center', color: '#1677ff' }}>
          <div>✔</div>
          <div style={{ fontSize: 12 }}>个人信息</div>
        </div>
        <div style={{ textAlign: 'center', color: '#1677ff' }}>
          <div style={{ fontWeight: 'bold' }}>3</div>
          <div style={{ fontSize: 12 }}>登记成功</div>
        </div>
      </div>

      {/* 成功图标与文字 */}
      <div style={{ textAlign: 'center', marginTop: 80 }}>
        <CheckCircleFill style={{ fontSize: 64, color: 'green' }} />
        <div style={{ marginTop: 16, fontSize: 16, color: '#666' }}>
          企业信息已经登记完成。
        </div>
      </div>

      {/* 返回按钮 */}
      <div style={{ textAlign: 'center', marginTop: 40 }}>
        <Button
          color='success'
          fill='outline'
          onClick={() => navigate('/shou')}
          style={{ width: 100 }}
        >
          返回
        </Button>
      </div>
    </div>
  );
};

export default RegisterSuccess;
