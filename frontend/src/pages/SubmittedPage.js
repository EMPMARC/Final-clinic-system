import React from "react";
import { useNavigate } from "react-router-dom";

const Submitted = () => {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate("/my-submissions");
  };

  const handleBookNew = () => {
    navigate("/booking");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f9f9f9",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial, sans-serif",
        padding: "20px",
        textAlign: "center"
      }}
    >
      <h1
        style={{
          fontSize: "3rem",
          fontWeight: "bold",
          color: "#0f2b5b", 
          marginBottom: "1.5rem"
        }}
      >
        Submitted
      </h1>

      <p style={{ fontSize: "1.25rem", color: "#374151", marginBottom: "1rem" }}>
        You have submitted the form and we will notify you on the next steps.
      </p>
      <p style={{ fontSize: "1.25rem", color: "#374151", marginBottom: "1rem" }}>
        You may review your appointment on the <strong>My Submissions</strong> page.
      </p>
      <p style={{ fontSize: "1.25rem", color: "#374151", marginBottom: "2rem" }}>
        You can book a new appointment or view your existing appointments below.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center" }}>
        <button
          onClick={handleBookNew}
          style={{
            backgroundColor: "#0b5ed7", 
            color: "#fff",
            padding: "12px 30px",
            fontSize: "1rem",
            fontWeight: "bold",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            minWidth: "200px"
          }}
        >
          BOOK NEW APPOINTMENT
        </button>

        <button
          onClick={handleContinue}
          style={{
            backgroundColor: "#1da1a9", 
            color: "#fff",
            padding: "12px 30px",
            fontSize: "1rem",
            fontWeight: "bold",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            minWidth: "200px"
          }}
        >
          VIEW MY APPOINTMENTS
        </button>
      </div>

      <footer style={{ marginTop: "3rem", fontSize: "0.875rem", color: "#6b7280" }}>
        © 2025 Wits University - Campus Health and Wellness Centre
      </footer>
    </div>
  );
};

export default Submitted;