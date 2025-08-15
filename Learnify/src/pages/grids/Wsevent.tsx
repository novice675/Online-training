import { current } from '@reduxjs/toolkit';
import {useCallback, useEffect,useRef,useState} from 'react'
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

    const pingtimeRef=useRef<NodeJS.Timeout|null>(null)
    const pongoutRef=useRef<NodeJS.Timeout|null>(null)
    const startping=()=>{   
        if(pingtimeRef.current){
            clearInterval(pingtimeRef.current)
            // pingtimeRef.current=null
        }
        pingtimeRef.current=setInterval(()=>{
            if(wsRef.current?.readyState==WebSocket.OPEN){
                wsRef.current.send('ping')
            }
            if(pongoutRef.current){
                clearInterval(pongoutRef.current)
            }
            pongoutRef.current=setTimeout(()=>{
                console.log('不跳了')
                wsRef.current?.close()
            },10000)
        },25000)
    }
    const clearping=()=>{
        if(pingtimeRef.current){
            clearInterval(pingtimeRef.current)
            pingtimeRef.current=null
        }
    }
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
                    // pingtimeRef.current=setInterval(()=>{
                        // if(wsRef.current?.readyState==1){
                            startping()
                        // }
                    // })
                }
            }catch(err){
                console.log(err);
            }
            handlers?.onOpen?.()
            if (wsRef.current) {
              setReadyState(wsRef.current.readyState);
            }
        }
        wsRef.current.onmessage = (ev: MessageEvent) => {
          const data = ev.data;
          if(data=='pong'){
            console.log('pong');
            
            if(pongoutRef.current){
                clearTimeout(pongoutRef.current)
                pongoutRef.current=null
            }
            return
          }
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
            clearping()
            if(pongoutRef.current){
                clearTimeout(pongoutRef.current)
                pongoutRef.current=null
            }
            handlers?.onClose?.(ev)
            if (wsRef.current) {
                setReadyState(wsRef.current.readyState)
              }
            if(wsRef.current==ws){
                wsRef.current=null
            }

        }
        return ()=>{
            clearping()
            // if(wsRef.current==ws){
                try{
                    ws.close(1000,'组件卸载')
                }catch{}
                wsRef.current=null
            // }
        }
    },[url,momentid])
    return{ wsRef,readyState,lastmsg}
}