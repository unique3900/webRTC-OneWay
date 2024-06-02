import { WebSocketServer } from "ws";

const wss=new WebSocketServer({port:8080});


wss.on("connection",(socket)=>{
    console.log("Connected")
    socket.on("error",(err)=>{
        console.log(err)
    })
    socket.on("message",(data)=>{
        console.log({...data})
    })
})