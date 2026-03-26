import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const login = async () => {
    try {
      const res = await API.post("/auth/login", { email, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      if (res.data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/candidate");
      }
    } catch (err) {
      alert("Login failed ❌");
    }
  };

  return (
    <div style={styles.container}>
      
      {/* LEFT SIDE */}
      <div style={styles.left}>
        <div style={styles.overlay}></div>

        <h1 style={styles.title}>
          WELCOME TO <br /> WEBSPIRELABS
        </h1>

        <p style={styles.subtitle}>
          Smart Interview Platform for Real-Time Coding & Assessment
        </p>
      </div>

      {/* RIGHT SIDE */}
      <div style={styles.right}>
        <div style={styles.card}>
          <h2 style={styles.heading}>Sign In</h2>

          <input
            style={styles.input}
            placeholder="Email or Username"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button style={styles.button} onClick={login}>
            Sign In →
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    fontFamily: "Poppins, sans-serif"
  },

  // LEFT SIDE
  left: {
    flex: 1,
    position: "relative",
    background: "linear-gradient(135deg, #0f0f0f, #2c1e1e)",
    color: "white",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px",
    textAlign: "center",
    overflow: "hidden"
  },

  overlay: {
    position: "absolute",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.05)",
    filter: "blur(80px)",
    top: "20%",
    left: "20%"
  },

  title: {
  fontSize: "48px",
  fontWeight: "700",
  lineHeight: "1.2",
  zIndex: 1,
  background: "linear-gradient(90deg, #ff4b2b, #ff416c)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent"
},

  subtitle: {
    marginTop: "15px",
    fontSize: "14px",
    opacity: 0.7,
    zIndex: 1
  },

  // RIGHT SIDE
  right: {
    flex: 1,
    background: "#f3f3f3",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },

  card: {
    width: "360px",
    padding: "40px",
    borderRadius: "25px",
    background: "rgba(255,255,255,0.9)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
    textAlign: "center"
  },

  heading: {
    fontSize: "28px",
    marginBottom: "30px"
  },

  input: {
    width: "100%",
    padding: "14px",
    marginBottom: "15px",
    borderRadius: "30px",
    border: "1px solid #ddd",
    outline: "none",
    fontSize: "14px",
    transition: "0.3s"
  },

  button: {
    width: "100%",
    padding: "14px",
    borderRadius: "30px",
    border: "none",
    background: "linear-gradient(90deg, #ff416c, #ff4b2b)",
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
    transition: "0.3s",
    boxShadow: "0 5px 15px rgba(255,75,43,0.4)"
  }
};