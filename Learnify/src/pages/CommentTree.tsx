import styles from '../cssmodule/comment.module.css'

interface Co {
  _id: string;
  time: string;
  content: string;
  moment_id: string;
  type: string;
  user_id: string;
  employee?: any;
  visitor?: any;
  user?: any;
  replies?:any;
  pname:string;
  pid:string
}

interface Coprops {
  comment:Co[],
  setVisible1:(visible:boolean)=>void,
  setpid:(pid:string)=>void,
  del:(id:string)=>void
}
export const CommentTree:React.FC<Coprops> = ({ comment,setVisible1,setpid,del}) => {
  return (
    <div className={styles["comment-container"]}>
      {comment.map((i: Co) => (
        <div key={i._id}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              width: "90%",
              margin: "0 auto",
              borderBottom: "1px solid #eee",
              padding: "10px 0",
              minWidth: "290px",
            }}
             className={i.pid ? styles.childcomment : ""}
          >
            {/* 头像 */}
            <div style={{ width: "20%" }}>
              <img
                src={i.user.picture}
                alt=""
                style={{ width: "50px", height: "50px", borderRadius: "50%" }}
              />
            </div>
            {/* 右侧 */}
            <div style={{ flex: "1 1 250px" }}>
              {/* 姓名 */}
              <div style={{ fontWeight: "bold",display:'flex',alignItems:'center',justifyContent:'space-between' }}>
                {i.pid ? `${i.user.name}回复${i.pname}` : i.user.name}
                <div
                  style={{
                    width: "20px",
                    color: "red",
                    fontSize: "25px",
                    textAlign: "right",
                  }}
                >
                  ♥
                </div>
              </div>
              {/* 回复 */}
              <div>{i.content}</div>
              {/* 时间按钮 */}
              <div style={{ fontSize: "12px", color: "#888" }}>
                {new Date(i.time).toLocaleString()}
                &emsp;
                <button
                  onClick={() => {
                    setVisible1(true);
                    setpid(i._id);
                  }}
                >
                  回复
                </button>
                <button onClick={() => del(i._id)}>删除</button>
              </div>
            </div>
          </div>

          <div>
            {i.replies.length > 0 && (
              <CommentTree
                comment={i.replies}
                setVisible1={setVisible1}
                setpid={setpid}
                del={del}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
