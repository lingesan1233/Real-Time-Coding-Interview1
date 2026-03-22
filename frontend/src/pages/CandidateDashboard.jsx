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

    // Auto refresh
    const interval = setInterval(fetchInterviews, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchInterviews = async () => {
    const res = await API.get("/interview/candidate");
    setInterviews(res.data);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Candidate Dashboard</h2>

      {user && (
        <>
          <h3>Profile</h3>
          <p>{user.name}</p>
          <p>{user.email}</p>
        </>
      )}

      <h3>Interviews</h3>

      {interviews.map((i) => (
        <div key={i._id} style={{ border: "1px solid", margin: 10, padding: 10 }}>
          <p>Task: {i.task}</p>
          <p>Status: {i.status}</p>
          <p>Interviewer: {i.adminId?.name}</p>

          {i.status === "ongoing" && (
            <button onClick={() => navigate(`/candidate-room/${i.roomId}`)}>
              Join Now 🎥
            </button>
          )}

          {i.status === "scheduled" && (
            <p>Waiting for admin...</p>
          )}

          {i.status === "completed" && (
            <p>Completed</p>
          )}
        </div>
      ))}
    </div>
  );
}