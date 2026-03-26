import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import Editor from "@monaco-editor/react";
import API from "../services/api";

const socket = io("https://real-time-coding-interview1.onrender.com");

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

  const submit = async () => {
    if (!interviewId) return alert("Interview not loaded");

    await API.post("/interview/submit", {
      interviewId,
      solution: code
    });

    alert("Answer submitted ✅");
  };

  return (
    <div style={styles.container}>

      {/* 🎥 VIDEO SECTION */}
      <div style={styles.videoSection}>

        <div style={styles.videoBox}>
          <video ref={localRef} autoPlay muted style={styles.video} />
          <span style={styles.label}>You</span>
        </div>

        <div style={styles.videoBox}>
          <video ref={remoteRef} autoPlay style={styles.video} />
          <span style={styles.label}>Interviewer</span>
        </div>

        {/* CONTROLS */}
        <div style={styles.controls}>
          <button style={styles.controlBtn} onClick={toggleMic}>
            {micOn ? "🎤" : "🔇"}
          </button>

          <button style={styles.controlBtn} onClick={toggleCamera}>
            {cameraOn ? "📷" : "🚫"}
          </button>

          <button style={styles.endBtn} onClick={leaveCall}>
            Leave ❌
          </button>
        </div>
      </div>

      {/* 💻 RIGHT PANEL */}
      <div style={styles.panel}>

        <h3>Task</h3>
        <div style={styles.taskBox}>
          {task || "Waiting for task..."}
        </div>

        <h3>Code Editor</h3>
        <div style={styles.editorWrapper}>
          <Editor
            height="250px"
            value={code}
            onChange={handleCodeChange}
            theme="vs-dark"
          />
        </div>

        <button style={styles.submitBtn} onClick={submit}>
          Submit Answer 🚀
        </button>

      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    fontFamily: "Poppins, sans-serif",
    background: "#f4f6f9"
  },

  videoSection: {
    flex: 2,
    background: "#1e1e1e",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "20px"
  },

  videoBox: {
    position: "relative"
  },

  video: {
    width: "320px",
    height: "220px",
    borderRadius: "12px",
    background: "#000"
  },

  label: {
    position: "absolute",
    bottom: "8px",
    left: "10px",
    color: "#fff",
    fontSize: "12px"
  },

  controls: {
    display: "flex",
    gap: "15px"
  },

  controlBtn: {
    padding: "12px",
    borderRadius: "50%",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    background: "#2d2d2d",
    color: "#fff"
  },

  endBtn: {
    padding: "12px 20px",
    borderRadius: "25px",
    border: "none",
    background: "#ff4b2b",
    color: "#fff",
    cursor: "pointer"
  },

  panel: {
    flex: 1,
    padding: "20px",
    background: "#fff",
    overflowY: "auto"
  },

  taskBox: {
    background: "#f5f5f5",
    padding: "12px",
    borderRadius: "10px",
    marginBottom: "20px"
  },

  editorWrapper: {
    borderRadius: "10px",
    overflow: "hidden",
    marginBottom: "20px"
  },

  submitBtn: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: "#ff4b2b",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer"
  }
};