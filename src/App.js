import logo from "./assets/logo.png";
import React, { useEffect, useState } from "react";
import "./App.css";
import { db } from "./firebase";
import { collection, query, orderBy, getDocs } from "firebase/firestore";


const API_URL =
  "https://haleigh-nonextendible-unduteously.ngrok-free.dev/generate-plan";

/* ---------- Robust Phase Parser ---------- */
function splitPhases(planText) {
  if (!planText || typeof planText !== "string") return [];
  const regex = /PHASE\s+\d+:\s*[\s\S]*?(?=PHASE\s+\d+:|$)/g;
  const matches = planText.match(regex);
  if (!matches) return [];

  return matches.map(block => {
    const titleMatch = block.match(/^PHASE\s+\d+:\s*/);
    return {
      title: titleMatch
        ? titleMatch[0].replace(":", "").trim()
        : "PHASE",
      content: block.replace(/^PHASE\s+\d+:\s*/, "").trim()
    };
  });
}

export default function App() {
  const [form, setForm] = useState({
    goal: "",
    level: "beginner",
    time_available_days: "",
    hours_per_day: "",
    constraints: ""
  });

  const [loading, setLoading] = useState(false);
  const [phases, setPhases] = useState([]);
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  /* ---------- Theme ---------- */
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  /* ---------- Fetch History ---------- */
  useEffect(() => {
    const fetchHistory = async () => {
      const q = query(collection(db, "plans"), orderBy("timestamp", "desc"));
      const snap = await getDocs(q);
      setHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchHistory();
  }, []);

  const submitForm = async () => {
    setLoading(true);
    setPhases([]);

    const payload = {
      goal: form.goal,
      level: form.level,
      time_available_days: Number(form.time_available_days),
      hours_per_day: Number(form.hours_per_day),
      constraints: form.constraints.split("\n").filter(Boolean)
    };

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setPhases(splitPhases(data.plan));
    } catch {
      alert("Backend connection failed");
    }

    setLoading(false);
  };

  const filteredHistory = history.filter(h =>
    h.input.goal.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app">
      {/* HEADER */}
      <header className="header">
<div className="brand">
    <img src={logo} alt="Project Logo" className="logo" />
    <div>
      <h1>AI-Driven Academic Planning Platform</h1>
      <p>
        We produce structured learning plans that balance ambition,
        feasibility, and consistency over time.
      </p>
    </div>
  </div>
        <button
          className="theme-toggle"
          onClick={() =>
            setTheme(theme === "light" ? "dark" : "light")
          }
        >
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>
      </header>

      {/* MAIN */}
      <div className="layout">
        {/* FORM PANEL */}
        <section className="panel">
          <h2>Create Plan</h2>

          <input
            placeholder="Goal"
            onChange={e => setForm({ ...form, goal: e.target.value })}
          />

          <select
            onChange={e => setForm({ ...form, level: e.target.value })}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="pro">Pro</option>
          </select>

          <div className="row">
            <input
              placeholder="Days"
              onChange={e =>
                setForm({ ...form, time_available_days: e.target.value })
              }
            />
            <input
              placeholder="Hours / Day"
              onChange={e =>
                setForm({ ...form, hours_per_day: e.target.value })
              }
            />
          </div>

          <textarea
            rows={4}
            placeholder="Constraints (one per line)"
            onChange={e =>
              setForm({ ...form, constraints: e.target.value })
            }
          />

          <button className="primary-btn" onClick={submitForm}>
            {loading ? "Generating…" : "Generate Plan"}
          </button>
        </section>

        {/* PLAN PANEL */}
        <section className="panel wide">
          <h2>Execution Plan</h2>

          {loading && <div className="spinner"></div>}

          {!loading && phases.length === 0 && (
            <div className="placeholder">
              Generate a plan to view execution phases
            </div>
          )}

          {phases.map((p, i) => (
            <div key={i} className="phase-card">
              <h3>{p.title}</h3>
              <pre>{p.content.replace(/\s-\s/g, "\n- ")}</pre>
            </div>
          ))}
        </section>
      </div>

      {/* HISTORY */}
      <section className="history">
        <h2>Plan History</h2>

        <input
          placeholder="Search by goal"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <div className="history-list">
          {filteredHistory.map(h => (
            <div
              key={h.id}
              className="history-card"
              onClick={() => setPhases(splitPhases(h.output))}
            >
              <strong>{h.input.goal}</strong>
              <span>
                {h.input.level} · {h.input.time_available_days} days ·{" "}
                {h.input.hours_per_day} hrs/day
              </span>
              <small>
                {new Date(h.timestamp.seconds * 1000).toLocaleString()}
              </small>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
