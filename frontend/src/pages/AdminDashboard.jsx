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

  // Fetch candidates
  const fetchCandidates = async () => {
    const res = await API.get("/admin/candidates");
    setCandidates(res.data);
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  // Create candidate
  const createCandidate = async () => {
    if (!form.name || !form.email || !form.password) {
      return alert("Fill all fields");
    }

    await API.post("/admin/create-candidate", form);
    alert("Candidate created");

    setForm({ name: "", email: "", password: "" });
    fetchCandidates();
  };

  // ✅ START INTERVIEW (FINAL FIX)
  const startInterview = async () => {
    if (!selectedCandidate) return alert("Select candidate");
    if (!task) return alert("Enter task");

    try {
      // 1. Create interview
      const res = await API.post("/interview/create", {
        candidateId: selectedCandidate._id,
        task
      });

      // 2. Update to ongoing
      await API.put("/interview/start", {
        interviewId: res.data._id
      });

      // 3. Navigate
      navigate(`/admin-room/${res.data.roomId}`);
    } catch (err) {
      alert("Error starting interview");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Dashboard</h2>

      <h3>Create Candidate</h3>
      <input
        placeholder="Name"
        value={form.name}
        onChange={(e) =>
          setForm({ ...form, name: e.target.value })
        }
      />
      <input
        placeholder="Email"
        value={form.email}
        onChange={(e) =>
          setForm({ ...form, email: e.target.value })
        }
      />
      <input
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={(e) =>
          setForm({ ...form, password: e.target.value })
        }
      />
      <button onClick={createCandidate}>Create</button>

      <h3>Candidate List</h3>
      {candidates.map((c) => (
        <div
          key={c._id}
          onClick={() => setSelectedCandidate(c)}
          style={{
            border: "1px solid",
            margin: "10px",
            padding: "10px",
            cursor: "pointer",
            background:
              selectedCandidate?._id === c._id
                ? "#d4edda"
                : "#fff"
          }}
        >
          {c.name} - {c.email}
        </div>
      ))}

      <h3>Start Interview</h3>
      <textarea
        placeholder="Task"
        value={task}
        onChange={(e) => setTask(e.target.value)}
      />
      <br />
      <button onClick={startInterview}>
        Start Meeting 🎥
      </button>
    </div>
  );
}