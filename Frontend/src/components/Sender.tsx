import React, { useEffect, useState } from "react";

const Sender = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connection, setConnection] = useState<RTCPeerConnection | null>(null);

  useEffect(() => {
    const newSocket = new WebSocket("ws://localhost:8080");
    setSocket(newSocket);

    newSocket.onopen = () => {
      newSocket.send(
        JSON.stringify({
          type: "identify-sender",
        })
      );
    };

    newSocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      newSocket.close();
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
      const message = JSON.parse(event.data);
      switch (message.type) {
        case "create-answer":
          await pc.setRemoteDescription(new RTCSessionDescription(message.sdp));
          break;
        case "ice-candidate":
          await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
          break;
        default:
          console.warn(`Unknown message type: ${message.type}`);
      }
    };

    pc.onnegotiationneeded = async () => {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.send(
        JSON.stringify({
          type: "create-offer",
          sdp: pc.localDescription,
        })
      );
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.send(
          JSON.stringify({
            type: "ice-candidate",
            candidate: event.candidate,
          })
        );
      }
    };

    try {
      await accessCameraStream(pc);
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const accessCameraStream = async (pc: RTCPeerConnection) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement("video");
      video.srcObject = stream;
      video.autoplay = true;
      video.controls = false;
      document.body.appendChild(video);

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  return <button onClick={startCall}>Start Call</button>;
};

export default Sender;
