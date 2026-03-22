import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import Editor from "@monaco-editor/react";
import API from "../services/api";

const socket = io("http://localhost:5000");

export default function AdminInterviewRoom() {
  const { roomId } = useParams();

  const localRef = useRef();
  const remoteRef = useRef();
  const peer = useRef();

  const [code, setCode] = useState("");
  const [task, setTask] = useState("");
  const [submittedCode, setSubmittedCode] = useState("");

  useEffect(() => {
    socket.emit("join-room", roomId);

    // Fetch interview
    API.get(`/interview/room/${roomId}`).then(res => {
      setTask(res.data.task || "");
    });

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
          if (e.candidate) {
            socket.emit("ice-candidate", { roomId, candidate: e.candidate });
          }
        };

        peer.current.createOffer().then(offer => {
          peer.current.setLocalDescription(offer);
          socket.emit("offer", { roomId, offer });
        });
      });

    socket.on("answer", (answer) => {
      peer.current.setRemoteDescription(answer);
    });

    socket.on("ice-candidate", (candidate) => {
      peer.current.addIceCandidate(candidate);
    });

    socket.on("code-update", setCode);
    socket.on("task-update", setTask);

    // 🔥 Receive submitted solution
    socket.on("solution-submitted", (solution) => {
      setSubmittedCode(solution);
    });

  }, []);

  const sendTask = () => {
    socket.emit("task-update", { roomId, task });
  };

  const handleCodeChange = (value) => {
    setCode(value);
    socket.emit("code-change", { roomId, code: value });
  };

  return (
    <div style={{ display: "flex", gap: 20 }}>
      <div>
        <video ref={localRef} autoPlay muted width="200" />
        <video ref={remoteRef} autoPlay width="200" />
      </div>

      <div>
        <h3>Task</h3>
        <textarea value={task} onChange={(e) => setTask(e.target.value)} />
        <button onClick={sendTask}>Send Task</button>

        <h3>Live Code</h3>
        <Editor height="200px" value={code} onChange={handleCodeChange} />

        <h3>Candidate Answer</h3>
        <pre>{submittedCode || "Waiting..."}</pre>
      </div>
    </div>
  );
}