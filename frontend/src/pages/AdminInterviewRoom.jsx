import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import API from "../services/api";

const socket = io("https://real-time-coding-interview1.onrender.com");

export default function AdminInterviewRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const localRef = useRef();
  const remoteRef = useRef();
  const peer = useRef();

  const [task, setTask] = useState("");
  const [submittedCode, setSubmittedCode] = useState("");
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

        peer.current.createOffer().then(offer => {
          peer.current.setLocalDescription(offer);
          socket.emit("offer", { roomId, offer });
        });
      });

    socket.on("answer", (answer) => {
      peer.current?.setRemoteDescription(answer);
    });

    socket.on("ice-candidate", (candidate) => {
      peer.current?.addIceCandidate(candidate);
    });

    socket.on("task-update", setTask);

    socket.on("solution-submitted", (data) => {
      if (data?.solution) {
        setSubmittedCode(data.solution);
      }
    });

    socket.on("end-call", () => {
      navigate("/admin");
    });

    return () => {
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("task-update");
      socket.off("solution-submitted");
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

  const endCall = () => {
    socket.emit("end-call", roomId);
    navigate("/admin");
  };

  const sendTask = async () => {
    socket.emit("task-update", { roomId, task });

    await API.put("/interview/start", {
      interviewId,
      task
    });
  };

  return (
    <div style={styles.container}>

      {/* VIDEO SECTION */}
      <div style={styles.videoSection}>

        <div style={styles.videoBox}>
          <video ref={localRef} autoPlay muted style={styles.video} />
          <span style={styles.label}>You</span>
        </div>

        <div style={styles.videoBox}>
          <video ref={remoteRef} autoPlay style={styles.video} />
          <span style={styles.label}>Candidate</span>
        </div>

        {/* CONTROLS */}
        <div style={styles.controls}>
          <button style={styles.controlBtn} onClick={toggleMic}>
            {micOn ? "🎤" : "🔇"}
          </button>

          <button style={styles.controlBtn} onClick={toggleCamera}>
            {cameraOn ? "📷" : "🚫"}
          </button>

          <button style={styles.endBtn} onClick={endCall}>
            End ❌
          </button>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={styles.panel}>

        <h3>Assign Task</h3>

        <textarea
          value={task}
          onChange={(e) => setTask(e.target.value)}
          style={styles.textarea}
        />

        <button style={styles.primaryBtn} onClick={sendTask}>
          Send Task 🚀
        </button>

        <h3>Candidate Answer</h3>

        <div style={styles.codeBox}>
          {submittedCode || "Waiting for submission..."}
        </div>

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
    gap: "15px",
    marginTop: "10px"
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

  textarea: {
    width: "100%",
    height: "120px",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    marginBottom: "10px"
  },

  primaryBtn: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: "#ff4b2b",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
    marginBottom: "20px"
  },

  codeBox: {
    background: "#1e1e1e",
    color: "#0f0",
    padding: "15px",
    borderRadius: "10px",
    minHeight: "200px",
    fontFamily: "monospace",
    overflowX: "auto"
  }
};