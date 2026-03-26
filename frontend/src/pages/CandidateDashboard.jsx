import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

export default function CandidateDashboard() {
  const [interviews, setInterviews] = useState([]);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);

    fetchInterviews();

    const interval = setInterval(fetchInterviews, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchInterviews = async () => {
    const res = await API.get("/interview/candidate");
    setInterviews(res.data);
  };

  return (
    <div style={styles.container}>
      
      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <h2 style={styles.logo}>WSL</h2>

        <div style={styles.menu}>
          <p style={styles.active}>Dashboard</p>
         
        </div>
      </div>

      {/* MAIN */}
      <div style={styles.main}>

        {/* HEADER */}
        <div style={styles.header}>
          <h2>Candidate Dashboard</h2>
          <p>Welcome back 👋</p>
        </div>

        {/* PROFILE CARD */}
        {user && (
          <div style={styles.card}>
            <h3>My Profile</h3>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
          </div>
        )}

        {/* INTERVIEWS */}
        <div style={styles.card}>
          <h3>My Interviews</h3>

          {interviews.length === 0 ? (
            <p>No interviews assigned</p>
          ) : (
            interviews.map((i) => (
              <div key={i._id} style={styles.interviewCard}>
                
                <p><strong>Task:</strong> {i.task}</p>

                <p>
                  <strong>Status:</strong>{" "}
                  <span style={{
                    color:
                      i.status === "completed"
                        ? "green"
                        : i.status === "ongoing"
                        ? "#007bff"
                        : "orange"
                  }}>
                    {i.status}
                  </span>
                </p>

                <p>
                  <strong>Interviewer:</strong>{" "}
                  {i.adminId?.name || "Admin"}
                </p>

                {/* JOIN BUTTON */}
                {i.status === "ongoing" && (
                  <button
                    style={styles.btn}
                    onClick={() =>
                      navigate(`/candidate-room/${i.roomId}`)
                    }
                  >
                    Join Now 🎥
                  </button>
                )}

                {i.status === "scheduled" && (
                  <p style={{ color: "gray" }}>
                    Waiting for admin...
                  </p>
                )}

                {i.status === "completed" && (
                  <p style={{ color: "green" }}>
                    Completed ✅
                  </p>
                )}
              </div>
            ))
          )}
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

  sidebar: {
    width: "220px",
    background: "#111",
    color: "#fff",
    padding: "20px"
  },

  logo: {
    color: "#ff4b2b",
    marginBottom: "30px"
  },

  menu: {
    lineHeight: "2"
  },

  active: {
    color: "#ff4b2b",
    fontWeight: "bold"
  },

  main: {
    flex: 1,
    background: "#f6f7fb",
    padding: "20px",
    overflowY: "auto"
  },

  header: {
    marginBottom: "20px"
  },

  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "15px",
    marginBottom: "20px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)"
  },

  interviewCard: {
    border: "1px solid #eee",
    borderRadius: "10px",
    padding: "15px",
    marginBottom: "10px",
    background: "#fafafa"
  },

  btn: {
    marginTop: "10px",
    padding: "10px 15px",
    borderRadius: "8px",
    border: "none",
    background: "#ff4b2b",
    color: "#fff",
    cursor: "pointer"
  }
};