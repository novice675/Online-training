import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Middle() {
  const location = useLocation();
  const navigate=useNavigate()
  const { text, type } = location.state || "";
  useEffect(()=>{
    if(type=='url'){
      window.location.replace(text)
    }
  },[])
  return <div>{type=='text'?text:''}
    </div>;
}
