import React, { useEffect } from "react";

export const Receiver = () => {
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");

    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          type: "identify-receiver",
        })
      );
    };

    startReceiving(socket);

    // Clean up on component unmount
    return () => {
      socket.close();
    };
  }, []);

  const startReceiving = (socket:any) => {
    const video = document.createElement("video");
    document.body.appendChild(video);
    video.autoplay = true;
    video.controls = false;

    const pc = new RTCPeerConnection();

    pc.ontrack = (event) => {
      const [stream] = event.streams;
      video.srcObject = stream;
    };

    socket.onmessage = (event:any) => {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case "create-offer":
          handleOfferMessage(pc, socket, message.sdp);
          break;
        case "ice-candidate":
          pc.addIceCandidate(new RTCIceCandidate(message.candidate)).catch(console.error);
          break;
        default:
          console.warn(`Unknown message type: ${message.type}`);
      }
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

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === "disconnected") {
        video.pause();
        video.srcObject = null;
        document.body.removeChild(video);
      }
    };
  };

  const handleOfferMessage = async (pc:any, socket:any, sdp:any) => {
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.send(
        JSON.stringify({
          type: "create-answer",
          sdp: answer,
        })
      );
    } catch (error) {
      console.error("Error handling offer message:", error);
    }
  };

  return <div></div>;
};
