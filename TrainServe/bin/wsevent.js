
module.exports=function wsevent(wss){
    const clients=new Map()
    wss.on('connection',(ws,req)=>{
        // wss是websocket的服务实例,ws是本次链接的客户端对象
        console.log('ok');
        const clientid=Math.random().toString(36).slice(2)
        // const interval=setInterval(()=>{
        //     if(ws.readyState==wss.OPEN){
        //         ws.ping()
        //     }
        // },3000)
        const url=new URL(req.url,`http://${req.headers.host}`)
        const moment_id=url.searchParams.get('momentid')
        clients.set(clientid,{
            ws,
            moment_id
        })
        ws.on('message',(message)=>{
            // message是客户端发来的消息,默认buffer,也可以是字符串
            console.log(message);
            ws.send(JSON.stringify('收到'))
            // ws.send(...) 会沿着同一条 TCP 连接，把数据再发送回这个客户端。
        })
        ws.on('close',()=>{
            console.log('done');
            // clearInterval(interval)
        })
        ws.on('error',(error)=>{
            console.error(error,1)
            // clearInterval(interval)
        })

    })
    function broadcast(moment_id,data){
        clients.forEach((client)=>{
            if(client.moment_id==moment_id){
                client.ws.send(JSON.stringify(data))
            }
        })
    }
    wss.broadcast=broadcast
}