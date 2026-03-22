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
  }, []);

  const fetchInterviews = async () => {
    try {
      const res = await API.get("/interview/candidate");
      setInterviews(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Candidate Dashboard</h2>

      {/* ================= PROFILE ================= */}
      {user && (
        <div style={{ marginBottom: "20px" }}>
          <h3>My Profile</h3>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
      )}

      {/* ================= INTERVIEWS ================= */}
      <h3>My Interviews</h3>

      {interviews.length === 0 ? (
        <p>No interviews assigned</p>
      ) : (
        interviews.map((i) => (
          <div
            key={i._id}
            style={{
              border: "1px solid #ccc",
              padding: "15px",
              marginBottom: "15px",
              borderRadius: "8px"
            }}
          >
            <p><strong>Task:</strong> {i.task}</p>

            <p>
              <strong>Status:</strong>{" "}
              <span
                style={{
                  color:
                    i.status === "completed"
                      ? "green"
                      : i.status === "ongoing"
                      ? "blue"
                      : "orange"
                }}
              >
                {i.status}
              </span>
            </p>

            <p>
              <strong>Interviewer:</strong>{" "}
              {i.adminId?.name || "Admin"}
            </p>

            {/* ✅ Join button only if ongoing */}
            {i.status === "ongoing" && (
              <button
                onClick={() =>
                  navigate(`/candidate-room/${i.roomId}`)
                }
              >
                Join Now 🎥
              </button>
            )}

            {/* ⏳ Scheduled */}
            {i.status === "scheduled" && (
              <p style={{ color: "gray" }}>
                Waiting for admin to start interview...
              </p>
            )}

            {/* ✅ Completed */}
            {i.status === "completed" && (
              <p style={{ color: "green" }}>
                Interview completed
              </p>
            )}
          </div>
        ))
      )}
    </div>
  );
}