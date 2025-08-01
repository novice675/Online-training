import { Swiper, Grid } from "antd-mobile";
import styles from '../cssmodule/recommend.module.css'
import { useNavigate } from "react-router-dom";
export default function Serve() {
  const navigate=useNavigate()
  const items = ["/images/3.png", "/images/2.png", "/images/1.png"];
  return (
    <div style={{ backgroundColor: "white",height:'100%' }}>
      <Swiper autoplay loop>
        {items.map((src, index) => (
          <Swiper.Item key={index}>
            <img src={src} alt="" style={{ width: "100%", display: "block" }} />
          </Swiper.Item>
        ))}
      </Swiper>
      <div>
        <span
          style={{
            display: "inline-block",
            width: "8px",
            backgroundColor: "blue",
            height: "15px",
            marginLeft: "10px",
            marginTop: "10px",
            verticalAlign: "middle",
          }}
        ></span>
        <span
          style={{
            display: "inline-block",
            marginLeft: "10px",
            fontSize: "16px",
            verticalAlign: "middle",
            marginTop: "8px",
          }}
        >
          常用服务
        </span>
      </div>
      <Grid
        columns={4}
        gap={15}
        style={{ marginTop: "15px", marginBottom: "15px" }}
      >
        <Grid.Item className={styles["grid-demo-item-block"]}>
          <div style={{ textAlign: "center" }}>
            <img src="/grids2/1.png" alt="" className={styles.img} />
            疫情防控
          </div>
        </Grid.Item>
        <Grid.Item
          onClick={() => {
            navigate("/visitor");
          }}
          className={styles["grid-demo-item-block"]}
        >
          <div style={{ textAlign: "center" }}>
            <img src="/grids2/2.png" alt="" className={styles.img} />
            访客登记
          </div>
        </Grid.Item>
        <Grid.Item className={styles["grid-demo-item-block"]}>
          <div style={{ textAlign: "center" }}>
            <img src="/grids2/3.png" alt="" className={styles.img} />
            送水服务
          </div>
        </Grid.Item>
        <Grid.Item className={styles["grid-demo-item-block"]}>
          <div style={{ textAlign: "center" }}>
            <img src="/grids2/4.png" alt="" className={styles.img} />
            设备报修
          </div>
        </Grid.Item>
      </Grid>

      <div>
        <span
          style={{
            display: "inline-block",
            width: "8px",
            backgroundColor: "blue",
            height: "15px",
            marginLeft: "10px",
            marginTop: "10px",
            verticalAlign: "middle",
          }}
        ></span>
        <span
          style={{
            display: "inline-block",
            marginLeft: "10px",
            fontSize: "16px",
            verticalAlign: "middle",
            marginTop: "8px",
          }}
        >
          园区服务
        </span>
      </div>
      <Grid
        columns={4}
        gap={15}
        style={{ marginTop: "15px", marginBottom: "15px" }}
      >
        <Grid.Item onClick={()=>{navigate('/company')}} className={styles["grid-demo-item-block"]}>
          <div style={{ textAlign: "center" }}>
            <img src="/grids2/5.png" alt="" className={styles.img} />
            企业入驻
          </div>
        </Grid.Item>
        <Grid.Item onClick={()=>{navigate('/employee_com')}} className={styles["grid-demo-item-block"]}>
          <div style={{ textAlign: "center" }}>
            <img src="/grids2/6.png" alt="" className={styles.img} />
            人员入驻
          </div>
        </Grid.Item>
        <Grid.Item onClick={()=>{navigate('/mima')}} className={styles["grid-demo-item-block"]}>
          <div style={{ textAlign: "center" }}>
            <img src="/grids2/7.png" alt="" className={styles.img} />
            缴费服务
          </div>
        </Grid.Item>
        <Grid.Item className={styles["grid-demo-item-block"]}>
          <div style={{ textAlign: "center" }}>
            <img src="/grids2/8.png" alt="" className={styles.img} />
            停车包月
          </div>
        </Grid.Item>
        <Grid.Item className={styles["grid-demo-item-block"]}>
          <div style={{ textAlign: "center" }}>
            <img src="/grids2/10.png" alt="" className={styles.img} />
            场地预约
          </div>
        </Grid.Item>
        <Grid.Item className={styles["grid-demo-item-block"]}>
          <div style={{ textAlign: "center" }}>
            <img src="/grids2/11.png" alt="" className={styles.img} />
            装修备案
          </div>
        </Grid.Item>
        <Grid.Item className={styles["grid-demo-item-block"]}>
          <div style={{ textAlign: "center" }}>
            <img src="/grids2/12.png" alt="" className={styles.img} />
            绿植服务
          </div>
        </Grid.Item>
        <Grid.Item className={styles["grid-demo-item-block"]}>
          <div style={{ textAlign: "center" }}>
            <img src="/grids2/9.png" alt="" className={styles.img} />
            保洁服务
          </div>
        </Grid.Item>
        
      </Grid>
    </div>
  );
}
