import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import Editor from "@monaco-editor/react";
import API from "../services/api";

const socket = io("http://localhost:5000");

export default function AdminInterviewRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const localRef = useRef();
  const remoteRef = useRef();
  const peer = useRef();

  const [code, setCode] = useState("");
  const [task, setTask] = useState("");
  const [submittedCode, setSubmittedCode] = useState("");
  const [interviewId, setInterviewId] = useState("");
  const [stream, setStream] = useState(null);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);

  useEffect(() => {
    socket.emit("join-room", roomId);

    // 🔥 Fetch interview
    API.get(`/interview/room/${roomId}`).then(res => {
      setTask(res.data.task || "");
      setInterviewId(res.data._id);
    });

    // 🎥 Video setup
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

    // Socket listeners
    socket.on("answer", (answer) => {
      peer.current.setRemoteDescription(answer);
    });

    socket.on("ice-candidate", (candidate) => {
      peer.current.addIceCandidate(candidate);
    });

    socket.on("code-update", setCode);
    socket.on("task-update", setTask);

    socket.on("solution-submitted", (data) => {
      setSubmittedCode(data.solution);
      alert("Candidate submitted answer ✅");
    });

    socket.on("end-call", () => {
      alert("Call ended");
      navigate("/admin");
    });

  }, []);

  // 🎤 Mic Toggle
  const toggleMic = () => {
    if (!stream) return;
    stream.getAudioTracks()[0].enabled = !micOn;
    setMicOn(!micOn);
  };

  // 📷 Camera Toggle
  const toggleCamera = () => {
    if (!stream) return;
    stream.getVideoTracks()[0].enabled = !cameraOn;
    setCameraOn(!cameraOn);
  };

  // ❌ End Call
  const endCall = () => {
    socket.emit("end-call", roomId);
    navigate("/admin");
  };

  // 📝 Send Task (REALTIME + SAVE)
  const sendTask = async () => {
    socket.emit("task-update", { roomId, task });

    await API.put("/interview/start", {
      interviewId,
      task
    });
  };

  // 💻 Code Sync
  const handleCodeChange = (value) => {
    setCode(value);
    socket.emit("code-change", { roomId, code: value });
  };

  return (
    <div style={{ display: "flex", gap: "20px", padding: "20px" }}>

      {/* 🎥 VIDEO */}
      <div>
        <h3>Video</h3>
        <video ref={localRef} autoPlay muted width="220" />
        <video ref={remoteRef} autoPlay width="220" />

        <div>
          <button onClick={toggleMic}>
            {micOn ? "Mute Mic" : "Unmute Mic"}
          </button>

          <button onClick={toggleCamera}>
            {cameraOn ? "Turn Off Camera" : "Turn On Camera"}
          </button>

          <button onClick={endCall}>End Call ❌</button>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{ flex: 1 }}>

        {/* TASK */}
        <h3>Assign Task</h3>
        <textarea
          value={task}
          onChange={(e) => setTask(e.target.value)}
          style={{ width: "100%", height: "100px" }}
        />
        <button onClick={sendTask}>Send Task</button>

        {/* LIVE CODE */}
        <h3>Live Coding</h3>
        <Editor height="200px" value={code} onChange={handleCodeChange} />

        {/* SUBMISSION */}
        <h3>Candidate Submission</h3>
        <pre style={{ background: "#eee", padding: "10px" }}>
          {submittedCode || "Waiting for submission..."}
        </pre>

      </div>
    </div>
  );
}