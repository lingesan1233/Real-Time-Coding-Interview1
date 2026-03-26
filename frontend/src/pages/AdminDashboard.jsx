import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [candidates, setCandidates] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [task, setTask] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    const res = await API.get("/admin/candidates");
    setCandidates(res.data);
  };

  const createCandidate = async () => {
    if (!form.name || !form.email || !form.password) {
      return alert("Fill all fields");
    }

    await API.post("/admin/create-candidate", form);
    setForm({ name: "", email: "", password: "" });
    fetchCandidates();
  };

  const startInterview = async () => {
    if (!selectedCandidate) return alert("Select candidate");
    if (!task) return alert("Enter task");

    const res = await API.post("/interview/create", {
      candidateId: selectedCandidate._id,
      task
    });

    await API.put("/interview/start", {
      interviewId: res.data._id
    });

    navigate(`/admin-room/${res.data.roomId}`);
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
          <h2>Admin Dashboard</h2>
          <p>Manage your interviews efficiently 🚀</p>
        </div>

        {/* GRID */}
        <div style={styles.grid}>

          {/* CREATE */}
          <div style={styles.card}>
            <h3>Create Candidate</h3>

            <input style={styles.input} placeholder="Name"
              value={form.name}
              onChange={(e)=>setForm({...form,name:e.target.value})} />

            <input style={styles.input} placeholder="Email"
              value={form.email}
              onChange={(e)=>setForm({...form,email:e.target.value})} />

            <input style={styles.input} type="password" placeholder="Password"
              value={form.password}
              onChange={(e)=>setForm({...form,password:e.target.value})} />

            <button style={styles.btn} onClick={createCandidate}>
              Create Candidate
            </button>
          </div>

          {/* LIST */}
          <div style={styles.card}>
            <h3>Candidate List</h3>

            <div style={styles.list}>
              {candidates.map((c) => (
                <div
                  key={c._id}
                  onClick={() => setSelectedCandidate(c)}
                  style={{
                    ...styles.listItem,
                    border:
                      selectedCandidate?._id === c._id
                        ? "2px solid #ff4b2b"
                        : "1px solid #eee"
                  }}
                >
                  <strong>{c.name}</strong>
                  <span>{c.email}</span>
                </div>
              ))}
            </div>
          </div>

          {/* START */}
          <div style={styles.card}>
            <h3>Start Interview</h3>

            {selectedCandidate && (
              <p>
                Selected: <strong>{selectedCandidate.name}</strong>
              </p>
            )}

            <textarea
              style={styles.textarea}
              placeholder="Enter task..."
              value={task}
              onChange={(e)=>setTask(e.target.value)}
            />

            <button style={styles.btn} onClick={startInterview}>
              Start Interview 🎥
            </button>
          </div>

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

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
    gap: "20px"
  },

  card: {
    background: "#fff",
    padding: "44px",
    borderRadius: "15px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)"
  },

  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "10px",
    borderRadius: "10px",
    border: "1px solid #ddd"
  },

  textarea: {
    width: "100%",
    height: "100px",
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    marginBottom: "10px"
  },

  btn: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: "#ff4b2b",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer"
  },

  list: {
    maxHeight: "250px",
    overflowY: "auto"
  },

  listItem: {
    padding: "10px",
    borderRadius: "10px",
    marginBottom: "8px",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column"
  }
};