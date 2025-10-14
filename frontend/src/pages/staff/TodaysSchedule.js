import React, { useState, useEffect } from "react";
import axios from "axios";

export default function TodaysSchedule() {
  const [schedule, setSchedule] = useState([]);
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTodaysSchedule();
  }, []);

  const fetchTodaysSchedule = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5001/api/today-staff-schedule");
      setSchedule(response.data.schedule);
      setDate(response.data.date);
      setError("");
    } catch (error) {
      console.error("Error fetching today's schedule:", error);
      setError("Failed to load today's schedule. Please make sure the server is running.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center", fontFamily: "Arial, sans-serif" }}>
        <div style={{ fontSize: "18px", marginBottom: "20px" }}>⏳ Loading today's schedule...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <div style={{ color: "#dc3545", backgroundColor: "#f8d7da", padding: "15px", borderRadius: "5px", marginBottom: "20px" }}>
          <strong>Error:</strong> {error}
        </div>
        <button 
          onClick={fetchTodaysSchedule}
          style={{
            padding: "10px 20px",
            background: "#007bff",
            color: "white",
            border: "none",
            cursor: "pointer",
            borderRadius: "5px",
          }}
        >
          🔄 Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ color: "#2c3e50", marginBottom: "10px" }}>Campus Health and Wellness Centre</h1>
      <h2 style={{ color: "#7f8c8d", marginBottom: "30px" }}>Today's Schedule ({date})</h2>
      
      {schedule.length === 0 ? (
        <div style={{ 
          textAlign: "center", 
          padding: "40px", 
          backgroundColor: "#f8f9fa", 
          borderRadius: "8px",
          border: "2px dashed #dee2e6"
        }}>
          <div style={{ fontSize: "24px", color: "#6c757d", marginBottom: "10px" }}>📅</div>
          <div style={{ fontSize: "18px", color: "#6c757d" }}>No schedule found for today.</div>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table border="1" cellPadding="12" style={{ 
            borderCollapse: "collapse", 
            width: "100%", 
            backgroundColor: "white",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            borderRadius: "8px"
          }}>
            <thead>
              <tr style={{ backgroundColor: "#2c3e50", color: "white" }}>
                <th style={{ padding: "15px", textAlign: "left", fontWeight: "bold" }}>Staff Name</th>
                <th style={{ padding: "15px", textAlign: "center", fontWeight: "bold" }}>Lunch Times</th>
                <th style={{ padding: "15px", textAlign: "left", fontWeight: "bold" }}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((staff, index) => (
                <tr key={index} style={{ 
                  backgroundColor: index % 2 === 0 ? "#f8f9fa" : "white",
                  borderBottom: "1px solid #dee2e6"
                }}>
                  <td style={{ padding: "12px", fontWeight: "bold", color: "#2c3e50" }}>
                    {staff.staff_name}
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    {staff.lunch_times || (
                      <span style={{ color: "#6c757d", fontStyle: "italic" }}>No lunch times scheduled</span>
                    )}
                  </td>
                  <td style={{ padding: "12px", color: "#495057" }}>
                    {staff.notes || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div style={{ marginTop: "30px", textAlign: "center" }}>
        <button 
          onClick={fetchTodaysSchedule}
          style={{
          padding: "12px 24px",
          background: "#007bff",
          color: "white",
          border: "none",
          cursor: "pointer",
          borderRadius: "6px",
          fontSize: "16px",
          fontWeight: "bold",
  }}
>
  Refresh Schedule
</button>
      </div>

      <div style={{ 
        marginTop: "30px", 
        padding: "15px", 
        backgroundColor: "#e9ecef", 
        borderRadius: "5px",
        fontSize: "14px",
        color: "#6c757d"
      }}>
        <strong>Note:</strong> This schedule shows today's lunch times for all staff members. 
        Times are displayed in 12-hour format.
      </div>
    </div>
  );
}