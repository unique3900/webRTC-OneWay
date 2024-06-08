import { WebSocket, WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

let senderSocket: WebSocket | null = null;
let receiverSocket: WebSocket | null = null;

wss.on("connection", (socket) => {
    console.log('connection established')
  socket.on("message", (data: any) => {

    const message = JSON.parse(data);

    if(message.type==="identify-sender"){
        console.log("Sender joined")
        senderSocket=socket;
    }
    else if(message.type==="identify-receiver"){
        console.log('receiver joined')
        receiverSocket=socket;
    }
    else if(message.type==="create-offer"){
        console.log('Sender offering')
        if(socket!==senderSocket) return;
        senderSocket?.send(JSON.stringify({
            type:"create-answer",
            sdp:message.sdp
        }))
        console.log('answer from receiver')
    }
    else if(message.type==="ice-candidate"){
        if(socket===senderSocket){
            console.log('receiver candidate')
            receiverSocket?.send(JSON.stringify({
                type:"ice-candidate",
                candidate:message?.candidate
            }))
        }
        else if(socket===receiverSocket){
            console.log('sender candidate')
            senderSocket?.send(JSON.stringify({
                type:"ice-candidate",
                candidate:message?.candidate
            }))
        }
    }
  });
  
  socket.on("error", (err) => {
    console.log("Something went wrong", err);
  });
});
