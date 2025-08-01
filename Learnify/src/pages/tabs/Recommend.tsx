import { Swiper, Grid } from "antd-mobile";
import styles from '../../cssmodule/recommend.module.css'
import { useNavigate } from "react-router-dom";
export default function Recommend() {
  const navigate=useNavigate()
  const items = ["/images/3.png", "/images/2.png", "/images/1.png"];
  return (
    <div style={{backgroundColor:'white'}}>
      <Swiper autoplay loop>
        {items.map((src, index) => (
          <Swiper.Item key={index}>
            <img src={src} alt="" style={{ width: "100%", display: "block" }} />
          </Swiper.Item>
        ))}
      </Swiper>
      <Grid columns={4} gap={15} style={{marginTop:'15px',marginBottom:'15px'}}>
        <Grid.Item className={styles['grid-demo-item-block']}>
          <div style={{textAlign:'center'}}>
            <img src="/1.png" alt="" className={styles.img}/>
            可租房源
          </div>
        </Grid.Item>
        <Grid.Item onClick={()=>{navigate('/visitor')}} className={styles['grid-demo-item-block']}>
          <div style={{textAlign:'center'}}>
            <img src="/2.png" alt="" className={styles.img}/>
            访客登记
          </div>
        </Grid.Item>
        <Grid.Item className={styles['grid-demo-item-block']}>
          <div style={{textAlign:'center'}}>
            <img src="3.png" alt="" className={styles.img}/>
            政策申报
          </div>
        </Grid.Item>
        <Grid.Item onClick={()=>{navigate('/company')}} className={styles['grid-demo-item-block']}>
          <div style={{textAlign:'center'}}>
            <img src="4.png" alt="" className={styles.img}/>
            企业入驻
          </div>
        </Grid.Item>
        <Grid.Item className={styles['grid-demo-item-block']}>
          <div style={{textAlign:'center'}}>
            <img src="5.png" alt="" className={styles.img}/>
            公寓入住
          </div>
        </Grid.Item>
        <Grid.Item className={styles['grid-demo-item-block']}>
          <div style={{textAlign:'center'}}>
            <img src="6.png" alt="" className={styles.img}/>
            圈子活动
          </div>
        </Grid.Item>
        <Grid.Item  className={styles['grid-demo-item-block']}>
          <div style={{textAlign:'center'}}>
            <img src="7.png" alt="" className={styles.img}/>
            场地预约
          </div>
        </Grid.Item>
        <Grid.Item className={styles['grid-demo-item-block']}>
          <div style={{textAlign:'center'}}>
            <img src="8.png" alt="" className={styles.img}/>
            园区信息
          </div>
        </Grid.Item>
        
      </Grid>
      <div className="content-area">
        <div className="news-item">
          <h3>上海中福世福汇大酒店列为中风险地区。</h3>
          <div className="image-placeholder shanghai-img"></div>
          <div className="news-footer">
            <span>夏季</span>
            <span>2022-02-10</span>
            <span>1239</span>
          </div>
        </div>
        <div className="news-item">
          <h3>唐山市公安局路北分局局长马爱军等人接受审查调查</h3>
          <div className="news-footer">
            <span>夕阳</span>
            <span>2022-02-10</span>
            <span>1239</span>
          </div>
        </div>
        <div className="news-item">
          <h3>厦金大桥议题讨论升温，台民众呼吁民进党勿阻挡</h3>
          <div className="image-placeholder bridge-img"></div>
          <div className="news-footer">
            <span>夏季</span>
            <span>2022-02-10</span>
            <span>1239</span>
          </div>
        </div>
      </div>
    </div>
  );
}
