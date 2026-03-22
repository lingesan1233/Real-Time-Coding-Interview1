import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [candidates, setCandidates] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [task, setTask] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const navigate = useNavigate();

  // 🔄 Fetch candidates
  const fetchCandidates = async () => {
    try {
      const res = await API.get("/admin/candidates");
      setCandidates(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  // ➕ Create Candidate (REAL USER ONLY)
  const createCandidate = async () => {
    if (!form.name || !form.email || !form.password) {
      return alert("Please fill all fields");
    }

    try {
      await API.post("/admin/create-candidate", form);

      alert("Candidate created successfully ✅");

      setForm({ name: "", email: "", password: "" });
      fetchCandidates();
    } catch (err) {
      alert("Error creating candidate");
    }
  };

  // 🎥 Start Interview
  const startInterview = async () => {
    if (!selectedCandidate) {
      return alert("Please select a candidate");
    }

    if (!task) {
      return alert("Please enter interview task");
    }

    try {
      const res = await API.post("/interview/create", {
        candidateId: selectedCandidate._id,
        task
      });

      navigate(`/admin-room/${res.data.roomId}`);
    } catch (err) {
      alert("Error starting interview");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Dashboard</h2>

      {/* ================= CREATE CANDIDATE ================= */}
      <div style={{ marginBottom: "30px" }}>
        <h3>Create Candidate</h3>

        <input
          type="text"
          placeholder="Enter Name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <br /><br />

        <input
          type="email"
          placeholder="Enter Email"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <br /><br />

        <input
          type="password"
          placeholder="Enter Password"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <br /><br />

        <button onClick={createCandidate}>
          Create Candidate
        </button>
      </div>

      {/* ================= CANDIDATE LIST ================= */}
      <div style={{ marginBottom: "30px" }}>
        <h3>Candidate List</h3>

        {candidates.length === 0 ? (
          <p>No candidates available</p>
        ) : (
          candidates.map((c) => (
            <div
              key={c._id}
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                marginBottom: "10px",
                cursor: "pointer",
                borderRadius: "8px",
                background:
                  selectedCandidate?._id === c._id
                    ? "#d4edda"
                    : "#fff"
              }}
              onClick={() => setSelectedCandidate(c)}
            >
              <p><strong>{c.name}</strong></p>
              <p>{c.email}</p>
            </div>
          ))
        )}
      </div>

      {/* ================= START INTERVIEW ================= */}
      <div>
        <h3>Start Interview</h3>

        {selectedCandidate && (
          <p>
            Selected Candidate:{" "}
            <strong>{selectedCandidate.name}</strong>
          </p>
        )}

        <textarea
          placeholder="Enter Interview Task"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          style={{
            width: "300px",
            height: "100px"
          }}
        />

        <br /><br />

        <button onClick={startInterview}>
          Start Meeting 🎥
        </button>
      </div>
    </div>
  );
}