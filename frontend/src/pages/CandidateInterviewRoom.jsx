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
    if (!roomId) return;

    socket.emit("join-room", roomId);
    console.log("👨‍💻 Candidate joined:", roomId);

    API.get(`/interview/room/${roomId}`).then(res => {
      setTask(res.data.task || "");
      setInterviewId(res.data._id);
    });

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

    socket.on("offer", async (offer) => {
      await peer.current.setRemoteDescription(offer);

      const answer = await peer.current.createAnswer();
      await peer.current.setLocalDescription(answer);

      socket.emit("answer", { roomId, answer });
    });

    socket.on("ice-candidate", (candidate) => {
      peer.current?.addIceCandidate(candidate);
    });

    socket.on("code-update", setCode);
    socket.on("task-update", setTask);

    socket.on("end-call", () => {
      alert("Call ended by admin");
      navigate("/candidate");
    });

    return () => {
      socket.off("offer");
      socket.off("ice-candidate");
      socket.off("code-update");
      socket.off("task-update");
      socket.off("end-call");
    };

  }, [roomId]);

  const toggleMic = () => {
    if (!stream) return;
    stream.getAudioTracks()[0].enabled = !micOn;
    setMicOn(!micOn);
  };

  const toggleCamera = () => {
    if (!stream) return;
    stream.getVideoTracks()[0].enabled = !cameraOn;
    setCameraOn(!cameraOn);
  };

  const leaveCall = () => {
    socket.emit("end-call", roomId);
    navigate("/candidate");
  };

  const handleCodeChange = (value) => {
    setCode(value);
    socket.emit("code-change", { roomId, code: value });
  };

  // ✅ FINAL CORRECT SUBMIT
  const submit = async () => {
    if (!interviewId) {
      return alert("Interview not loaded");
    }

    console.log("📤 Sending solution:", code);

    await API.post("/interview/submit", {
      interviewId,
      solution: code
    });

    alert("Answer submitted ✅");
  };

  return (
    <div style={{ display: "flex", gap: "20px", padding: "20px" }}>
      
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

      <div style={{ flex: 1 }}>
        <h3>Task</h3>
        <div style={{
          background: "#f5f5f5",
          padding: "10px",
          borderRadius: "8px"
        }}>
          {task || "Waiting for task..."}
        </div>

        <h3>Write Code</h3>
        <Editor
          height="250px"
          value={code}
          onChange={handleCodeChange}
        />

        <button onClick={submit}>
          Submit Answer 🚀
        </button>
      </div>
    </div>
  );
}