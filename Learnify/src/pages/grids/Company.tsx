import React, { useEffect, useState } from 'react';
import { Form, Input, Button, ImageUploader, NavBar,  } from 'antd-mobile';
import { UploadOutline } from 'antd-mobile-icons';
import { useNavigate } from "react-router-dom";
import { Toast } from 'antd-mobile';
import http from '../../utils/axios';
import '@amap/amap-jsapi-types'
declare global{
  interface Window{
    _AMapSecurityConfig?:{
      // securityJsCode?:{
        securityJsCode?:string;
        serviceHost?:string
      // }
    }
  }
}

import AMapLoader from '@amap/amap-jsapi-loader'
const Company = () => {
  // 表单初始值
  const initialValues = {
    name: '',
    inaddress: '',
    house: '',
    type: '',
    // outaddress:'',
    logo:[] as string[],
  };
  const navigate=useNavigate()
  const submit=async()=>{
    let values=await form.validateFields()
    console.log(values);
    values.logo=values?.logo[0]?.url||''
    values.outaddress=position
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
  let map:AMap.Map| null=null
  const [position,setposition]=useState('')
  // let position=''
  useEffect(()=>{
    window._AMapSecurityConfig={
      serviceHost:"http://localhost:3008/_AMapService"
    }
    AMapLoader.load({
      key:"6fafb6c912df27afcabeab77931ad027",
      version:"2.0",
      plugins:["AMap.Scale","AMap.Geolocation",'AMap.Geocoder']
    })
    .then((AMap)=>{
      map=new AMap.Map("amapcontain",{
        viewMode:"2D",
        zoom:11,
      })
      let marker:AMap.Marker
      // map?.add(marker)
      AMap.plugin("AMap.Geolocation", () => {
        const geolocation = new AMap.Geolocation({
          enableHighAccuracy: true,
          timeout: 10000,
          buttonOffset: new AMap.Pixel(10, 20),
          zoomToAccuracy: true,
          buttonPosition: "RB",
          showMarker: false,
          showCircle:false,
          noIpLocate: 0
      })
        map?.addControl(geolocation);
        const handlelocate=()=>{
          geolocation.getCurrentPosition((status: string, result: any) => {
            if (status == "complete") {
              const position = result.position;
              map?.setZoomAndCenter(15, position);
            } else {
              console.error("定位失败", result);
            }
          })
        }
        handlelocate()
        AMap.plugin('AMap.Geocoder',()=>{
          const geocoder=new AMap.Geocoder({
            radius:1000,
            extensions:'all'
          })
          map?.on('click',(e:AMap.MapsEvent<'click',AMap.Map>)=>{
            const lnglat=e.lnglat
            if(!marker){
              marker=new AMap.Marker({
                position:lnglat,
                title:"点击位置"
              })
              map?.add(marker)
              map?.setCenter(lnglat)
              console.log("你惦记了标记点",marker.getPosition());
            }else{
              marker.setPosition(lnglat)
              map?.setCenter(lnglat)
              console.log("你点击了标记点",marker.getPosition());
            }
            geocoder.getAddress(lnglat,(status:string,result:any)=>{
              if(status=='complete'&&result.regeocode){
                const address=result.regeocode.formattedAddress
                const district=result.regeocode.addressComponent.district;
                const street=result.regeocode.addressComponent.street;
                const number=result.regeocode.addressComponent.streetNumber;
                console.log('经纬度',lnglat.getLng(),lnglat.getLat());
                console.log('详细地址',address)
                setposition(result.regeocode.addressComponent.province+result.regeocode.addressComponent.city+district+street+number)
                console.log('区域信息',district,street,number)
              }else{
                console.log("地址解析失败",result)
              }
            })
          })
          document.getElementById("searbtn")?.addEventListener('click',()=>{
            const value=(document.getElementById('searinput')as HTMLInputElement)?.value
            if(!value)return
            geocoder.getLocation(value,(status:any,result:any)=>{
              if(status=='complete'&&result.geocodes[0].location){
                const location=result.geocodes[0].location
                map?.setZoomAndCenter(11,location)
                new AMap.Marker({position:location,map})
              }
            })
          })
        })
      })
    })
    return ()=>{
      map?.destroy()
    }
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

        <div style={{ display: "flex", height: "40px", alignItems: "center" }}>
          <label style={{ width: "120px", marginLeft: "15px" }}>所属地址</label>
          <Input
            readOnly
            value={position}
            placeholder="请输入企业地址"
            style={{ marginLeft: "40px" }}
          />
        </div>
        <div style={{position:'relative'}}>
          <div
            id="amapcontain"
            style={{ height: "300px", width: "100%" }}
          ></div>
          <div style={{ display: "flex", position: "absolute", top:0,right:0 }}>
            <Input
              id="searinput"
              style={{ width: "120px", border: "1px solid black" }}
            ></Input>
            <div id="searbtn">
              <Button>搜索</Button>
            </div>
          </div>
        </div>

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
          <ImageUploader upload={uploadlogo} maxCount={1} accept="image/*">
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
}

export default Company;
