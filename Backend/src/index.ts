import { WebSocketServer } from "ws";

const sockets = new WebSocketServer({ port: 8080 });

let senderSocket: WebSocket | null = null;
let receiverSocket: WebSocket | null = null;

sockets.on("connection", (socket:any) => {
  socket.on("error", console.error);

  socket.on("message", function message(data:any) {
    const message = JSON.parse(data);
    switch (message.type) {
      case "identify-sender":
        console.log("Sender added");
        senderSocket = socket;
        break;
      case "identify-receiver":
        console.log("Receiver added");
        receiverSocket = socket;
        break;
      case "create-offer":
        if (socket !== senderSocket) return;
        console.log("Sending offer");
        receiverSocket?.send(JSON.stringify({ type: "create-offer", sdp: message.sdp }));
        break;
      case "create-answer":
        if (socket !== receiverSocket) return;
        console.log("Sending answer");
        senderSocket?.send(JSON.stringify({ type: "create-answer", sdp: message.sdp }));
        break;
      case "ice-candidate":
        console.log("Sending ICE candidate");
        if (socket === senderSocket) {
          receiverSocket?.send(JSON.stringify({ type: "ice-candidate", candidate: message.candidate }));
        } else if (socket === receiverSocket) {
          senderSocket?.send(JSON.stringify({ type: "ice-candidate", candidate: message.candidate }));
        }
        break;
      default:
        console.warn(`Unknown message type: ${message.type}`);
    }
  });

  socket.on("close", () => {
    if (socket === senderSocket) {
      console.log("Sender disconnected");
      senderSocket = null;
    } else if (socket === receiverSocket) {
      console.log("Receiver disconnected");
      receiverSocket = null;
    }
  });
});
