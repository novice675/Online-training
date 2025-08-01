// 个人信息页面组件
import React, { useEffect, useMemo, useState } from "react";
import { Form, Input, Button, ImageUploader, NavBar, Toast,DatePicker } from "antd-mobile";
import { UploadOutline } from "antd-mobile-icons";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import http from "../../utils/axios";
const Visitor = () => {
  // 表单初始值
  const initialValues = {
    name: "",
    phone: "",
    sfz: "",
    picture: [],
    company:'',
    time:undefined,
    carcode:undefined,
    cartype:''
  };
  const [form]=Form.useForm()
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false)
  // const rawTime = form.getFieldValue("time"); 
  // const displaytime =useMemo(()=>{
  //   return  rawTime ? new Date(rawTime).toLocaleDateString() : "";
  // },[rawTime])
  const [showtime,setshowtime]=useState<Date>()
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

  const addvisitor=async()=>{
    let values=await form.validateFields()
    values.picture=values?.picture[0]?.url||''
    let res=await http.post('/WYQ/addvisitor',{...values,showtime:showtime})
    if(res.code==200){
      navigate("/visitor_done")
    }else if (res.code==400){
      Toast.show({
        icon:'fail',
        content:res.msg
      })
    }
    else{
      throw new Error("addcomem错误")
    }
  }


  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh" }}>
      {/* 顶部导航栏 */}
      <NavBar
        back="返回"
        onBack={() => {
          navigate(-1);
        }}
      >
        访客登记
      </NavBar>

      {/* 表单区域 */}
      <Form
        form={form}
        layout="horizontal"
        initialValues={initialValues}
        footer={
          <Button onClick={addvisitor} block color="primary" type="submit">
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
          请填写访客信息
        </div>

        {/* 姓名 */}
        <Form.Item name="name" label="人员姓名">
          <Input placeholder="请输入人员姓名" />
        </Form.Item>

        {/* 手机号 */}
        <Form.Item name="phone" label="联系方式">
          <Input placeholder="请输入联系方式" />
        </Form.Item>

        {/* 身份证号 */}
        <Form.Item name="sfz" label="身份证号">
          <Input placeholder="请输入身份证号" />
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
              marginTop: "12.5px",
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
          <Form.Item name="picture">
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
          </Form.Item>
        </div>

        {/* 上传提示 */}
        <div
          style={{
            padding: "12px 16px",
            fontSize: 12,
            textAlign: "center",
          }}
        >
          提示: 请保持五官清晰，以方便系统标准识别
        </div>

        {/* 方可公司 */}
        <Form.Item name="company" label="访客公司">
          <Input placeholder="请输入访客公司" />
        </Form.Item>

        <Form.Item label="造访时间">
          <Input
            placeholder="请输入造访时间"
            // readOnly
            onClick={() => {
              console.log(1);
              
              setVisible(true);
            }}
            value={showtime?new Date(showtime).toLocaleDateString():''}
          />
            
       
          <DatePicker
            title="时间选择"
            visible={visible}
            onClose={() => {
              setVisible(false);
            }}
            min={new Date()} // 从当前时间开始
            max={new Date(new Date().setMonth(new Date().getMonth() + 1))} // 未来一个月
            onConfirm={(val) => {
              console.log(val, typeof val);
              setshowtime(val)
              Toast.show(val.toDateString());
            }}
          />
        </Form.Item>

        <Form.Item name="carcode" label="车牌号码">
          <Input placeholder="请输入车牌号码" />
        </Form.Item>

        <Form.Item name="cartype" label="车辆类型">
          <Input placeholder="请输入车辆类型" />
        </Form.Item>
        <div
          style={{
            padding: "12px 16px",
            fontSize: 12,
            textAlign: "center",
          }}
        >
          提示:请埴写正确车牌号，以方便访客直接开车进入停车场
        </div>
      </Form>
    </div>
  );
};

export default Visitor;
