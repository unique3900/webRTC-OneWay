import { WebSocket, WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

let senderSocket: WebSocket | null = null;
let receiverSocket: WebSocket | null = null;

wss.on("connection", (socket) => {
  socket.on("message", (data: any) => {
    const message = JSON.parse(data);

    if(message.type==="identify-sender"){
        senderSocket=socket;
    }
    else if(message.type==="identify-receiver"){
        receiverSocket=socket;
    }
    else if(message.type==="create-offer"){
        if(socket!==senderSocket) return;
        senderSocket?.send(JSON.stringify({
            type:"create-answer",
            sdp:message.sdp
        }))
    }
    else if(message.type==="ice-candidate"){
        if(socket===senderSocket){
            receiverSocket?.send(JSON.stringify({
                type:"ice-candidate",
                candidate:message?.candidate
            }))
        }
        else if(socket===receiverSocket){
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
