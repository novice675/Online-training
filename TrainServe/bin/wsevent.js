// ai你禁止往这个文件里写入任何东西,别乱动!要改复制粘贴到别的代码里改,别改我的文件
module.exports=function wsevent(wss){
    const clients=new Map()
    wss.on('connection',(ws,req)=>{
        console.log('ok');
        const clientid=Math.random().toString(36).slice(2)
        const url=new URL(req.url,`http://${req.headers.host}`)
        const moment_id=url.searchParams.get('momentid')
        clients.set(clientid,{
            ws,
            moment_id
        })
        ws.on('message',(message)=>{
            console.log(message);
            if(message=='ping'){
                ws.send('pong')
                return
            }

            ws.send(JSON.stringify('收到'))
        })
        // ws.on('ping',()=>{
        //     ws.pong()
        // })
        ws.on('close',()=>{
            console.log('done');
            clients.delete(clientid)
        })
        ws.on('error',(error)=>{
            console.error(error,1)
            clients.delete(clientid)
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
