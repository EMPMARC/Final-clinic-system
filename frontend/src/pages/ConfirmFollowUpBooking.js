import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

function ConfirmFollowUpPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const {
    previousAppointment,
    followUpFor,
    appointmentDate: date,
    appointmentTime: time,
    studentNumber
  } = location.state || {};

  const handleSubmit = async () => {
    try {
      const reference = 'CHWCS' + Math.floor(Math.random() * 1000000000);
      
      console.log('Sending follow-up appointment data:', {
        referenceNumber: reference,
        studentNumber: studentNumber,
        appointmentType: "Follow-Up Booking",
        appointmentFor: followUpFor,
        appointmentDate: date,
        appointmentTime: time,
        previousAppointmentRef: previousAppointment
      });

      const response = await fetch('http://localhost:5001/api/save-appointment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          referenceNumber: reference,
          studentNumber: studentNumber,
          appointmentType: "Follow-Up Booking",
          appointmentFor: followUpFor,
          appointmentDate: date,
          appointmentTime: time,
          previousAppointmentRef: previousAppointment
        }),
      });

      const data = await response.json();
      console.log('Server response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save appointment');
      }

      navigate("/submitted");
    } catch (error) {
      console.error('Error saving appointment:', error);
      alert('Failed to save appointment: ' + error.message);
    }
  };

  const handleBack = () => {
    navigate("/follow-up-booking", {
      state: {
        previousAppointment,
        followUpFor,
        appointmentDate: date,
        appointmentTime: time,
        studentNumber
      }
    });
  };

  if (!location.state) {
    return (
      <div style={{
        maxWidth: "500px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif"
      }}>
        <h2 style={{ color: "#2C3E50" }}>Error</h2>
        <p>No appointment data found. Please start over.</p>
        <button 
          onClick={() => navigate('/booking')}
          style={{
            padding: "10px 20px",
            backgroundColor: "#3498db",
            color: "white",
            border: "none",
            borderRadius: "4px"
          }}
        >
          Go Back to Booking
        </button>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: "500px",
      margin: "0 auto",
      padding: "20px",
      fontFamily: "Arial, sans-serif",
      backgroundColor: "#f9f9f9",
      borderRadius: "10px",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)"
    }}>
      <h2 style={{ color: "#2C3E50", marginBottom: "20px" }}>Confirm Follow-Up Booking</h2>

      <div style={{ marginBottom: "20px", lineHeight: "1.8" }}>
        <p><strong>Previous Appointment Ref:</strong> {previousAppointment}</p>
        <p><strong>Follow-Up For:</strong> {followUpFor}</p>
        <p><strong>Date:</strong> {date}</p>
        <p><strong>Time:</strong> {time}</p>
        <p><strong>Student Number:</strong> {studentNumber}</p>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button
          onClick={handleBack}
          style={{
            padding: "12px 20px",
            backgroundColor: "#ecf0f1",
            color: "#2c3e50",
            border: "none",
            borderRadius: "25px",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          &lt;&lt; Back
        </button>

        <button
          onClick={handleSubmit}
          style={{
            padding: "12px 20px",
            backgroundColor: "#3498db",
            color: "white",
            border: "none",
            borderRadius: "25px",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Submit Follow-Up Booking
        </button>
      </div>
    </div>
  );
}

export default ConfirmFollowUpPage;