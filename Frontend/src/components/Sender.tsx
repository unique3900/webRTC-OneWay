import React, { useEffect, useState } from "react";

const Sender = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connection, setConnection] = useState<RTCPeerConnection | null>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    setSocket(socket);
    socket.onopen = async () => {
      socket.send(
        JSON.stringify({
          type: "identify-sender",
        })
      );
    };
  }, []);

  const startCall = async () => {
    const pc = new RTCPeerConnection();
    setConnection(pc);

    if (!socket) {
      alert("No Connection Found");
      return;
    }
    socket.onmessage = async (event) => {
      const message = event.data;
      if (message.type == "create-answer") {
        pc.setRemoteDescription(message.sdp);
      } else if (message.type == "ice-candidate") {
        pc.addIceCandidate(message.candidate);
      }
    };

    pc.onicecandidate=async(event)=>{
      if(event.candidate){
        socket?.send(JSON.stringify({
          type:'ice-candidate',
          candidate:event.candidate
        }))
      }
    }

    pc.onnegotiationneeded=async(event)=>{
      const offer=await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket?.send(JSON.stringify({
        type:'create-offer',
        sdp:pc.localDescription
      }))
    }

    accessCameraStream(pc);
  };

  const accessCameraStream=async(pc:RTCPeerConnection)=>{
    navigator.mediaDevices.getUserMedia({audio:false,video:true}).then((stream)=>{
      const videoBox=document.createElement('video');
      videoBox.srcObject=stream;

      videoBox.play();
      document.body.appendChild(videoBox);
      stream.getTracks().forEach((track) => {
        pc?.addTrack(track);
    });
    })

  }

  return <button onClick={startCall}>Sender</button>;
};

export default Sender;
