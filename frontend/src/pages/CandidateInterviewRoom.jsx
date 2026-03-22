import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import Editor from "@monaco-editor/react";
import API from "../services/api";

const socket = io("http://localhost:5000");

export default function CandidateInterviewRoom() {
  const { roomId } = useParams();
  const localRef = useRef();
  const remoteRef = useRef();
  const peer = useRef();
  const [code, setCode] = useState("");

  useEffect(() => {
    socket.emit("join-room", roomId);

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localRef.current.srcObject = stream;

        peer.current = new RTCPeerConnection();

        stream.getTracks().forEach(track => {
          peer.current.addTrack(track, stream);
        });

        peer.current.ontrack = (e) => {
          remoteRef.current.srcObject = e.streams[0];
        };

        peer.current.onicecandidate = (e) => {
          socket.emit("ice-candidate", { roomId, candidate: e.candidate });
        };
      });

    socket.on("offer", async (offer) => {
      await peer.current.setRemoteDescription(offer);
      const answer = await peer.current.createAnswer();
      await peer.current.setLocalDescription(answer);
      socket.emit("answer", { roomId, answer });
    });

    socket.on("ice-candidate", (candidate) => {
      peer.current.addIceCandidate(candidate);
    });

    socket.on("code-update", (newCode) => {
      setCode(newCode);
    });

  }, []);

  const handleCodeChange = (value) => {
    setCode(value);
    socket.emit("code-change", { roomId, code: value });
  };

  const submit = async () => {
    await API.post("/interview/submit", {
      interviewId: roomId,
      solution: code
    });
    alert("Submitted");
  };

  return (
    <div>
      <h2>Candidate Room</h2>

      <video ref={localRef} autoPlay muted width="200" />
      <video ref={remoteRef} autoPlay width="200" />

      <Editor height="400px" defaultLanguage="javascript" value={code} onChange={handleCodeChange} />

      <button onClick={submit}>Submit</button>
    </div>
  );
}