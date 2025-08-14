import {useEffect,useRef,useState} from 'react'
export type WSHandlers = {
  onOpen?: () => void;
  onMessage?: (ev: MessageEvent) => void;
  onError?: (ev: Event) => void;
  onClose?: (ev: CloseEvent) => void;
}
export function useWsevent(url:string,momentid:string,handlers?:WSHandlers){
    const wsRef=useRef<WebSocket| null>(null)
    const idRef=useRef<string>(Math.random().toString(36).slice(2))
    const [readyState, setReadyState] = useState<number>(WebSocket.CLOSED)
    const [lastmsg, setlastmsg] = useState<any>(null)
    // let a=false
    useEffect(()=>{
        const wsurl=`${url}?momentid=${momentid}`
        const ws=new WebSocket(wsurl)
        wsRef.current=ws
        const id=idRef.current
        wsRef.current.onopen=()=>{
            console.log(id);
            try{
                if(ws.readyState==WebSocket.OPEN){
                    wsRef.current?.send('hello')
                }
            }catch(err){
                console.log(err);
            }
            handlers?.onOpen?.()
            if (wsRef.current) {
                setReadyState(wsRef.current.readyState)
              }
              
        }
        wsRef.current.onmessage = (ev: MessageEvent) => {
          const data = ev.data;
        //   console.log("onmesage", data, ws);
          handlers?.onMessage?.(ev);
          if (wsRef.current) {
            setReadyState(wsRef.current.readyState);
          }

          setlastmsg(data);
        };
        wsRef.current.onerror=(ev:Event)=>{
            console.error(ev)
            handlers?.onError?.(ev)
        }
        wsRef.current.onclose=(ev:CloseEvent)=>{
            console.log(ev.code,ev.reason);
            handlers?.onClose?.(ev)
            if (wsRef.current) {
                setReadyState(wsRef.current.readyState)
              }
              

            if(wsRef.current==ws){
                wsRef.current=null
            }
        }
        return ()=>{
            if(wsRef.current==ws){
                try{
                    ws.close(1000,'组件卸载')
                }catch{}
                wsRef.current=null
            }
        }
    },[url])
    // 面向对象的实例构造
    return{ wsRef,readyState,lastmsg}
}