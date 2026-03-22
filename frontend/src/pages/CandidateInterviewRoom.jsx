import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import Editor from "@monaco-editor/react";
import API from "../services/api";

const socket = io("http://localhost:5000");

export default function CandidateInterviewRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const localRef = useRef();
  const remoteRef = useRef();
  const peer = useRef();

  const [code, setCode] = useState("");
  const [task, setTask] = useState("");
  const [interviewId, setInterviewId] = useState("");

  const [stream, setStream] = useState(null);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);

  useEffect(() => {
    socket.emit("join-room", roomId);

    // 🔥 Fetch interview data
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
      });

    // 🔁 Receive offer
    socket.on("offer", async (offer) => {
      await peer.current.setRemoteDescription(offer);

      const answer = await peer.current.createAnswer();
      await peer.current.setLocalDescription(answer);

      socket.emit("answer", { roomId, answer });
    });

    socket.on("ice-candidate", (candidate) => {
      peer.current.addIceCandidate(candidate);
    });

    // 💻 Code sync
    socket.on("code-update", setCode);

    // 📝 Task sync
    socket.on("task-update", (newTask) => {
      setTask(newTask);
    });

    // ❌ End call
    socket.on("end-call", () => {
      alert("Call ended by admin");
      navigate("/candidate");
    });

  }, []);

  // 🎤 Mic toggle
  const toggleMic = () => {
    if (!stream) return;
    stream.getAudioTracks()[0].enabled = !micOn;
    setMicOn(!micOn);
  };

  // 📷 Camera toggle
  const toggleCamera = () => {
    if (!stream) return;
    stream.getVideoTracks()[0].enabled = !cameraOn;
    setCameraOn(!cameraOn);
  };

  // ❌ Leave call
  const leaveCall = () => {
    socket.emit("end-call", roomId);
    navigate("/candidate");
  };

  // 💻 Code sync
  const handleCodeChange = (value) => {
    setCode(value);
    socket.emit("code-change", { roomId, code: value });
  };

  // 📤 Submit answer
  const submit = async () => {
    if (!interviewId) return alert("Interview not loaded");

    await API.post("/interview/submit", {
      interviewId,
      solution: code
    });

    alert("Answer submitted ✅");
  };

  return (
    <div style={{ display: "flex", gap: "20px", padding: "20px" }}>

      {/* 🎥 VIDEO PANEL */}
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

          <button onClick={leaveCall}>
            Leave Call ❌
          </button>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{ flex: 1 }}>

        {/* TASK */}
        <h3>Task</h3>
        <div style={{
          background: "#f5f5f5",
          padding: "10px",
          borderRadius: "8px"
        }}>
          {task || "Waiting for task..."}
        </div>

        {/* CODE EDITOR */}
        <h3>Write Code</h3>
        <Editor
          height="250px"
          value={code}
          onChange={handleCodeChange}
        />

        {/* SUBMIT */}
        <button onClick={submit}>
          Submit Answer 🚀
        </button>

      </div>
    </div>
  );
}
const submit = async () => {
  console.log("Submitting:", code);

  await API.post("/interview/submit", {
    interviewId,
    solution: code
  });

  alert("Submitted ✅");
};