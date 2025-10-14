import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const StaffSchedule = () => {
  const navigate = useNavigate();
const [selectedStaff, setSelectedStaff] = useState("Sr. Virginia Nobela");
const [lunchOption, setLunchOption] = useState("Lunch 1");
const [startTime, setStartTime] = useState("");
const [endTime, setEndTime] = useState("");
const [notes, setNotes] = useState("");

const staffList = [
"Mr. Brian Jele",
"Sr. Virginia Nobela",
"Sr. Ludo Dube",
"Sr. Constance Matshi",
"Sr. Siminathi Bilankulu",
"Sr. Simangele Sithole",
"Sr. Ntombi Daantjie",
"HCT Nodayimane Njoku",
"Mr. Zandisile Matahafeni",
"Mr. Tebogo Sibilanga",
"Mrs. Brenda Mnisi",
"Ms. Siza Nkosi",
"Ms. Nomangezi Ziqubu",
];

return (
<div style={{ 
  minHeight: "100vh", 
  backgroundColor: "#f5f5f5", 
  display: "flex", 
  alignItems: "center", 
  justifyContent: "center", 
  padding: "20px",
  fontFamily: "Arial, sans-serif"
}}>
<div style={{ 
  backgroundColor: "white", 
  padding: "40px", 
  borderRadius: "8px", 
  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  width: "100%",
  maxWidth: "500px"
}}>
<div style={{ 
  display: "flex", 
  justifyContent: "space-between", 
  alignItems: "center", 
  marginBottom: "30px" 
}}>
<h1 style={{ 
  fontSize: "24px", 
  fontWeight: "bold", 
  margin: 0,
  color: "#333"
}}>
Staff Lunch Schedule
</h1>
<button 
  onClick={() => navigate("/admin-dashboard")}
  style={{
    padding: "12px 24px",
    backgroundColor: "#003366",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "14px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
  }}
>
  BACK TO DASHBOARD
</button>
</div>

{/* Staff Selection */}
<div style={{ marginBottom: "20px" }}>
<label style={{ 
  display: "block", 
  marginBottom: "8px", 
  fontSize: "14px", 
  fontWeight: "500",
  color: "#333"
}}>
Select Staff
</label>
<select
style={{
  width: "100%",
  padding: "12px",
  border: "1px solid #ddd",
  borderRadius: "4px",
  fontSize: "14px",
  backgroundColor: "white"
}}
value={selectedStaff}
onChange={(e) => setSelectedStaff(e.target.value)}
>
{staffList.map((staff, idx) => (
<option key={idx} value={staff}>
{staff}
</option>
))}
</select>
</div>

{/* Lunch Option Selection */}
<div style={{ marginBottom: "20px" }}>
<label style={{ 
  display: "block", 
  marginBottom: "8px", 
  fontSize: "14px", 
  fontWeight: "500",
  color: "#333"
}}>
Select Lunch Break
</label>
<select
style={{
  width: "100%",
  padding: "12px",
  border: "1px solid #ddd",
  borderRadius: "4px",
  fontSize: "14px",
  backgroundColor: "white"
}}
value={lunchOption}
onChange={(e) => setLunchOption(e.target.value)}
>
<option value="Lunch 1">Lunch 1</option>
<option value="Lunch 2">Lunch 2</option>
</select>
</div>

{/* Time Inputs */}
<div style={{ 
  display: "flex", 
  gap: "15px", 
  marginBottom: "20px" 
}}>
<div style={{ flex: 1 }}>
<label style={{ 
  display: "block", 
  marginBottom: "8px", 
  fontSize: "14px", 
  fontWeight: "500",
  color: "#333"
}}>
Start Time
</label>
<input
type="time"
style={{
  width: "100%",
  padding: "12px",
  border: "1px solid #ddd",
  borderRadius: "4px",
  fontSize: "14px"
}}
value={startTime}
onChange={(e) => setStartTime(e.target.value)}
/>
</div>
<div style={{ flex: 1 }}>
<label style={{ 
  display: "block", 
  marginBottom: "8px", 
  fontSize: "14px", 
  fontWeight: "500",
  color: "#333"
}}>
End Time
</label>
<input
type="time"
style={{
  width: "100%",
  padding: "12px",
  border: "1px solid #ddd",
  borderRadius: "4px",
  fontSize: "14px"
}}
value={endTime}
onChange={(e) => setEndTime(e.target.value)}
/>
</div>
</div>

{/* Notes */}
<div style={{ marginBottom: "30px" }}>
<label style={{ 
  display: "block", 
  marginBottom: "8px", 
  fontSize: "14px", 
  fontWeight: "500",
  color: "#333"
}}>
Notes
</label>
<input
type="text"
placeholder="e.g., WEC, Activation, Off-site"
style={{
  width: "100%",
  padding: "12px",
  border: "1px solid #ddd",
  borderRadius: "4px",
  fontSize: "14px"
}}
value={notes}
onChange={(e) => setNotes(e.target.value)}
/>
</div>

{/* Save Button */}
<button style={{
  width: "100%",
  backgroundColor: "#003366",
  color: "white",
  padding: "15px 40px",
  border: "none",
  borderRadius: "8px",
  fontSize: "16px",
  fontWeight: "bold",
  cursor: "pointer",
  boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
}}>
SAVE SCHEDULE
</button>
</div>
</div>
);
};

export default StaffSchedule;