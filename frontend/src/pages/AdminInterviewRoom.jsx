import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import Editor from "@monaco-editor/react";

const socket = io("http://localhost:5000");

export default function AdminInterviewRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const localRef = useRef();
  const remoteRef = useRef();
  const peer = useRef();

  const [code, setCode] = useState("");
  const [task, setTask] = useState("");
  const [stream, setStream] = useState(null);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);

  useEffect(() => {
    socket.emit("join-room", roomId);

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
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

    socket.on("end-call", () => {
      alert("Call ended by candidate");
      navigate("/admin");
    });

  }, []);

  // 🎤 Mic Toggle
  const toggleMic = () => {
    stream.getAudioTracks()[0].enabled = !micOn;
    setMicOn(!micOn);
  };

  // 📷 Camera Toggle
  const toggleCamera = () => {
    stream.getVideoTracks()[0].enabled = !cameraOn;
    setCameraOn(!cameraOn);
  };

  // ❌ End Call
  const endCall = () => {
    socket.emit("end-call", roomId);
    navigate("/admin");
  };

  // 📝 Send Task
  const sendTask = () => {
    socket.emit("task-update", { roomId, task });
  };

  const handleCodeChange = (value) => {
    setCode(value);
    socket.emit("code-change", { roomId, code: value });
  };

  return (
    <div>
      <h2>Admin Interview Room</h2>

      <video ref={localRef} autoPlay muted width="200" />
      <video ref={remoteRef} autoPlay width="200" />

      <div>
        <button onClick={toggleMic}>{micOn ? "Mute Mic" : "Unmute Mic"}</button>
        <button onClick={toggleCamera}>{cameraOn ? "Turn Off Camera" : "Turn On Camera"}</button>
        <button onClick={endCall}>End Call ❌</button>
      </div>

      <h3>Assign Task</h3>
      <textarea value={task} onChange={(e) => setTask(e.target.value)} />
      <button onClick={sendTask}>Send Task</button>

      <Editor height="300px" value={code} onChange={handleCodeChange} />
    </div>
  );
}