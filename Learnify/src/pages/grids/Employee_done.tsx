import React from 'react';
import { Button, NavBar } from 'antd-mobile';
import { CheckCircleFill } from 'antd-mobile-icons';
import { useNavigate } from "react-router-dom";

const RegisterSuccess = () => {
  const navigate=useNavigate()

  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      {/* 顶部导航栏 */}
      <NavBar back="返回" onBack={()=>{navigate(-3)}}>人员入驻</NavBar>

      {/* 成功图标与文字 */}
      <div style={{ textAlign: 'center', marginTop: 80 }}>
        <CheckCircleFill style={{ fontSize: 64, color: 'green' }} />
        <div style={{ marginTop: 16, fontSize: 16, color: '#666' }}>
          人员入驻已经登记完成。
        </div>
      </div>

      {/* 返回按钮 */}
      <div style={{ textAlign: 'center', marginTop: 40 }}>
        <Button
          color='success'
          fill='outline'
          onClick={() => navigate(-3)}
          style={{ width: 100 }}
        >
          返回
        </Button>
      </div>
    </div>
  );
};

export default RegisterSuccess;
