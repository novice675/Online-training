import React from "react";
import { Grid, NavBar, Toast,Form,ImageUploader,Button,Input } from "antd-mobile";
import { useNavigate } from "react-router-dom";
import { UploadOutline } from 'antd-mobile-icons';
import http from "../utils/axios";
const initialValues={
    title:'',
    content:[],
}
export default function Sendmement() {
  const navigate = useNavigate();
  const [form]=Form.useForm()
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

  const submit=async()=>{
    let values=await form.validateFields()
    values.content=values?.content.map((i:{url:string})=>(i.url))
    console.log(values);
    const type=localStorage.getItem('role')
    const user_id=localStorage.getItem('user_id')
    console.log(type,user_id,4444);
    
    let res=await http.post('/WYQ/addmoment',{...values,type:type,user_id:user_id})
    if(res.code==200){
      console.log(res.id,'id');
      Toast.show({
        icon:"success",
        content:"发布成功"
      })
      navigate(-1)
    }else{
      Toast.show({
        icon:'fail',
        content:"发布错误请联系客服"
      })
    }
  }
  return (
    <div>
      <NavBar
        onBack={() => {
          navigate(-1); // 返回上一页
        }}
      >
        添加动态
      </NavBar>
      <Form
        layout="horizontal"
        initialValues={initialValues}
        form={form}
        footer={
          <Button onClick={submit} block color="primary" type="submit">
            发布动态
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
        >请填写标题
        </div>

        <Form.Item name="title" label="标题">
          <Input placeholder="请输入标题" />
        </Form.Item>


        <div
          style={{
            padding: "12px 16px",
            background: "#f0f0f0",
            fontWeight: "bold",
          }}
        >
          内容
        </div>

        <Form.Item name="content">
          <ImageUploader
            upload={uploadlogo}
            // maxCount={3}
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
              <div style={{ fontSize: 10, marginTop: 4 }}>
                支持JPG、PNG，≤5MB
              </div>
            </div>
          </ImageUploader>
        </Form.Item>
      </Form>

    </div>
  );
}
