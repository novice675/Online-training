import { useCallback, useEffect, useState } from "react";
import { Input,NavBar } from "antd-mobile";
import { SearchOutline, EnvironmentOutline ,AppOutline} from "antd-mobile-icons";
import { useNavigate } from "react-router-dom";
import  {debounce}  from "lodash";
import http from "../../utils/axios";

interface Com {
  name: string;
  inaddress: string;
  type: string;
  logo: string;
  house: string;
  outaddress: string;
  _id:string
}

export default function Employee_com() {
  const [companys, setcompanys] = useState<Com[]>([]);
  const [search, setsearch] = useState("");
  const navigate = useNavigate();

  const getlist = async () => {
    const res = await http.get("/WYQ/company", {
      params: search ? { name: search } : {} 
    });
  
    if (res.code === 200) {
      setcompanys(res.list);
    }
  };

  const debouncesearch=useCallback(debounce(()=>{
    getlist()
  },1500),[])

  useEffect(() => {
    if(search==''){
        getlist()
    }else{
        debouncesearch() 

    }
  }, [search]);

  return (
    <div
      style={{
        background: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
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
          backgroundImage: "url(/images/1.png)",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
        //   padding: "48px 16px 24px",
          color: "#fff",
          fontSize: 18,
          textAlign: "left",
          height:'96px'
        }}
      >
        <b style={{marginLeft:'20px',marginTop:'10px'}}>关联您的企业</b>
      </div>

      <div style={{ padding: "12px" }}>
        <Input
          value={search}
          onChange={(val) => setsearch(val)}
          placeholder="搜索企业名称"
          style={{
            borderRadius: 20,
            backgroundColor: "#fff",
            paddingLeft: 8,
          }}
        />
      </div>

      <div style={{ padding: "0 12px 24px" }}>
        {companys
          .filter((item) => item.name.includes(search))
          .map((item, index) => (
            <div
              key={index}
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: 12,
                marginBottom: 12,
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
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
                  style={{ width: 45, height: 45, borderRadius: '50%' }}
                />
                <div
                  style={{ color: "#1677ff", fontSize: 14,marginRight:'13px' }}
                  onClick={() => navigate(`/employee/company/${index}`)}
                >
                  详情
                </div>
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
                  color: "#666",
                  fontSize: 12,
                }}
              >
                <EnvironmentOutline style={{ marginRight: 4 }} />
                {item.outaddress}
              </div>

              <div style={{ textAlign: "right", marginTop: 8 }}>
                <div
                  style={{
                    display: "inline-block",
                    background: "#1677ff",
                    color: "#fff",
                    borderRadius: 16,
                    padding: "4px 16px",
                    fontSize: 12,
                  }}
                  onClick={()=>{navigate(`/employee?id=${item._id}`)}}
                >
                  关联
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
