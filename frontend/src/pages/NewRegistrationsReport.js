import React, { useMemo, useState, useEffect } from "react";
import {
LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
PieChart, Pie, Cell, Legend
} from "recharts";
import axios from "axios";

// ---------- Real data from API ----------
const useOnboardingData = (from, to, role) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const params = {};
        if (from) params.from = from;
        if (to) params.to = to;
        if (role && role !== "All") params.role = role;
        
        const response = await axios.get('http://localhost:5001/api/onboarding-data', { params });
        setData(response.data);
      } catch (err) {
        console.error('Error fetching onboarding data:', err);
        setError('Failed to load data. Please try again.');
        // Fallback to dummy data if API fails
        setData([
          { id: "p1", name: "Alice Smith", role: "Student", date: "2025-08-01" },
          { id: "p2", name: "John Doe", role: "Student", date: "2025-08-02" },
          { id: "p3", name: "Mary Johnson", role: "Student", date: "2025-08-03" },
          { id: "p4", name: "Sam Brown", role: "Student", date: "2025-08-03" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [from, to, role]);

  return { data, loading, error };
};
// --------------------------------------------------------

const COLORS = ["#3b82f6", "#22c55e"]; // Students, Staff

const card = {
padding: "14px 18px",
border: "1px solid #e5e7eb",
borderRadius: 12,
background: "#fff",
boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
};

export default function NewRegistrationsReport() {
// Filters
const [from, setFrom] = useState("");
const [to, setTo] = useState("");
const [role, setRole] = useState("All");

// Fetch real data from API
const { data: seedData, loading, error } = useOnboardingData(from, to, role);

// Filter data
const filtered = useMemo(() => {
return seedData.filter((r) => {
const d = new Date(r.date);
const passRole = role === "All" ? true : r.role === role;
const passFrom = from ? d >= new Date(from) : true;
const passTo = to ? d <= new Date(to) : true;
return passRole && passFrom && passTo;
});
}, [seedData, from, to, role]);

// Aggregations
const totals = useMemo(() => {
const total = filtered.length;
const students = filtered.filter((r) => r.role === "Student").length;
const staff = filtered.filter((r) => r.role === "Staff").length;

let days = 1;
if (from && to) {
const diff = (new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24);
days = Math.max(1, Math.floor(diff) + 1);
} else {
days = new Set(filtered.map((r) => r.date)).size || 1;
}
const avgPerDay = total / days;

return { total, students, staff, avgPerDay };
}, [filtered, from, to]);

// Line chart
const byDay = useMemo(() => {
const map = new Map();
filtered.forEach((r) => {
map.set(r.date, (map.get(r.date) || 0) + 1);
});
return Array.from(map.entries())
.sort((a, b) => new Date(a[0]) - new Date(b[0]))
.map(([date, count]) => ({ date, count }));
}, [filtered]);

// Pie chart
const roleBreakdown = useMemo(
() => [
{ name: "Students", value: filtered.filter((r) => r.role === "Student").length },
{ name: "Staff", value: filtered.filter((r) => r.role === "Staff").length },
],
[filtered]
);

const handleExport = () => window.print();

return (
<div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
<style>{`
@media print {
.no-print { display: none !important; }
body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
`}</style>

{/* Loading State */}
{loading && (
<div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
<div style={{ fontSize: 18, marginBottom: 10 }}>Loading registration data...</div>
<div style={{ fontSize: 14 }}>Please wait while we fetch the latest information.</div>
</div>
)}

{/* Error State */}
{error && (
<div style={{ textAlign: "center", padding: "20px", color: "#dc3545", backgroundColor: "#f8d7da", borderRadius: 8, marginBottom: 20 }}>
<div style={{ fontSize: 16, marginBottom: 5 }}>⚠️ Error Loading Data</div>
<div style={{ fontSize: 14 }}>{error}</div>
<div style={{ fontSize: 12, marginTop: 10, color: "#721c24" }}>Showing sample data for demonstration.</div>
</div>
)}

{/* Main Content */}
{!loading && (
<>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
<h1 style={{ fontSize: 28, margin: 0 }}>New Student Onboarding Report</h1>
<button className="no-print" onClick={handleExport}
style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #2563eb",
background: "#2563eb", color: "#fff", cursor: "pointer" }}>
Export PDF
</button>
</div>

{/* Filters */}
<div className="no-print" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 16 }}>
<input type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={card} />
<input type="date" value={to} onChange={(e) => setTo(e.target.value)} style={card} />
<select value={role} onChange={(e) => setRole(e.target.value)} style={{ ...card, cursor: "pointer" }}>
<option value="All">All Roles</option>
<option value="Student">Student</option>
<option value="Staff">Staff</option>
</select>
</div>

{/* KPI cards */}
<div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 16 }}>
<div style={card}><div style={{ color: "#6b7280" }}>Total</div><div style={{ fontSize: 22, fontWeight: 700 }}>{totals.total}</div></div>
<div style={card}><div style={{ color: "#6b7280" }}>Students</div><div style={{ fontSize: 22, fontWeight: 700 }}>{totals.students}</div></div>
<div style={card}><div style={{ color: "#6b7280" }}>Staff</div><div style={{ fontSize: 22, fontWeight: 700 }}>{totals.staff}</div></div>
<div style={card}><div style={{ color: "#6b7280" }}>Avg/Day</div><div style={{ fontSize: 22, fontWeight: 700 }}>{totals.avgPerDay.toFixed(2)}</div></div>
</div>

{/* Charts */}
<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 20 }}>
<div style={card}>
<div style={{ fontWeight: 600, marginBottom: 8 }}>Registrations Trend</div>
<div style={{ width: "100%", height: 240 }}>
<ResponsiveContainer>
<LineChart data={byDay}>
<CartesianGrid strokeDasharray="3 3" />
<XAxis dataKey="date" />
<YAxis allowDecimals={false} />
<Tooltip />
<Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} dot />
</LineChart>
</ResponsiveContainer>
</div>
</div>

<div style={card}>
<div style={{ fontWeight: 600, marginBottom: 8 }}>Role Breakdown</div>
<div style={{ width: "100%", height: 240 }}>
<ResponsiveContainer>
<PieChart>
<Pie data={roleBreakdown} dataKey="value" nameKey="name" outerRadius={90} label>
{roleBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
</Pie>
<Legend />
<Tooltip />
</PieChart>
</ResponsiveContainer>
</div>
</div>
</div>

{/* Table */}
<div style={{ ...card, marginTop: 20 }}>
<div style={{ fontWeight: 600, marginBottom: 10 }}>Detailed Registrations</div>
<div style={{ overflowX: "auto" }}>
<table style={{ width: "100%", borderCollapse: "collapse" }}>
<thead>
<tr style={{ background: "#f9fafb" }}>
<th style={th}>ID</th>
<th style={th}>Name</th>
<th style={th}>Role</th>
<th style={th}>Date</th>
</tr>
</thead>
<tbody>
{filtered.map((r) => (
<tr key={`${r.id}-${r.date}`}>
<td style={td}>{r.id}</td>
<td style={td}>{r.name}</td>
<td style={td}>{r.role}</td>
<td style={td}>{r.date}</td>
</tr>
))}
{filtered.length === 0 && (
<tr>
<td colSpan={4} style={{ ...td, textAlign: "center", color: "#6b7280" }}>
No registrations for selected filters.
</td>
</tr>
)}
</tbody>
</table>
</div>
</div>
</>
)}
</div>
);
}

const th = {
textAlign: "left",
padding: "10px 12px",
borderBottom: "1px solid #e5e7eb",
fontWeight: 600,
fontSize: 14
};
const td = {
padding: "10px 12px",
borderBottom: "1px solid #f1f5f9",
fontSize: 14
};
