import React from "react";
import { useNavigate } from "react-router-dom";

const NurseDashboard = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        textAlign: "center",
        backgroundColor: "#f8f9fa",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "40px", fontWeight: "bold" }}>
        Welcome Nurse 👩‍⚕
      </h1>

      <button
        style={{
          padding: "20px",
          fontSize: "1.5rem",
          fontWeight: "600",
          border: "none",
          borderRadius: "12px",
          backgroundColor: "#007bff",
          color: "white",
          marginBottom: "20px",
          width: "250px",
          cursor: "pointer",
        }}
        onClick={() => navigate("/clinical-records")}
      >
        Clinical Records
      </button>

      <button
        style={{
          padding: "20px",
          fontSize: "1.5rem",
          fontWeight: "600",
          border: "none",
          borderRadius: "12px",
          backgroundColor: "#28a745",
          color: "white",
          width: "250px",
          cursor: "pointer",
          marginBottom: "20px",
        }}
        onClick={() => navigate("/saved-records")}
      >
        Saved Records
      </button>

      {/* Logout / Back button */}
      <button
        style={{
          padding: "15px",
          fontSize: "1.2rem",
          fontWeight: "600",
          border: "none",
          borderRadius: "12px",
          backgroundColor: "#dc3545",
          color: "white",
          width: "200px",
          cursor: "pointer",
        }}
        onClick={() => navigate("/")}
      >
        Logout
      </button>
    </div>
  );
};

export default NurseDashboard;