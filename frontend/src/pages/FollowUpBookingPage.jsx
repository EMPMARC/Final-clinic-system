import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function FollowUpBooking() {
  const [selectedPreviousAppointment, setSelectedPreviousAppointment] = useState("");
  const [followUpFor, setFollowUpFor] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [previousAppointments, setPreviousAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const studentNumber = localStorage.getItem('studentNumber');

  // Fetch user's previous appointments on component mount
  useEffect(() => {
    const fetchPreviousAppointments = async () => {
      if (!studentNumber) {
        setError("Student number not found. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5001/api/student-appointments/${studentNumber}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch appointments');
        }

        // Filter appointments to only show completed ones (you might want to add a status field)
        // For now, we'll show all appointments
        // Ensure appointments is always an array
        const appointments = Array.isArray(data.appointments) ? data.appointments : [];
        setPreviousAppointments(appointments);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPreviousAppointments();
  }, [studentNumber]);

  const appointmentTypes = [
    "HIV Testing Follow-Up",
    "Mental Health Follow-Up",
    "General Consultation Follow-Up"
  ];

  const appointmentTimes = [
    "08:00", "08:30", "09:00", "09:30",
    "10:00", "10:30", "11:00"
  ];

  const handleNext = () => {
    if (selectedPreviousAppointment && followUpFor && appointmentDate && appointmentTime) {
      if (!studentNumber) {
        alert("Student number not found. Please log in again.");
        return;
      }

      navigate("/confirm-follow-up", {
        state: {
          previousAppointment: selectedPreviousAppointment,
          followUpFor,
          appointmentDate,
          appointmentTime,
          studentNumber: studentNumber
        }
      });
    } else {
      alert("Please fill in all fields.");
    }
  };

  const handleSave = () => {
    if (selectedPreviousAppointment && followUpFor && appointmentDate && appointmentTime) {
      alert("Follow-up appointment saved successfully!");
    } else {
      alert("Please complete all fields before saving.");
    }
  };

  const handleDiscard = () => {
    const confirmDiscard = window.confirm("Are you sure you want to discard this appointment?");
    if (confirmDiscard) {
      navigate('/booking');
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div style={containerStyle}>
        <h1 style={titleStyle}>Campus Health And Wellness Centre</h1>
        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>Follow-Up Booking</h2>
          <hr />
          <div style={loadingStyle}>
            <p>Loading your previous appointments...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div style={containerStyle}>
        <h1 style={titleStyle}>Campus Health And Wellness Centre</h1>
        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>Follow-Up Booking</h2>
          <hr />
          <div style={errorStyle}>
            <p><strong>Error:</strong> {error}</p>
            <button 
              onClick={() => window.location.reload()}
              style={primaryButtonStyle}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Campus Health And Wellness Centre</h1>
      <div style={cardStyle}>
        <h2 style={sectionTitleStyle}>Follow-Up Booking</h2>
        <hr />
        
        <div style={referenceStyle}>
          <strong>Ref:</strong> WITS-0535369819
        </div>

        <div style={infoSectionStyle}>
          <div style={importantNoticeStyle}>
            <strong>Important:</strong>
            <p style={{ fontStyle: "italic", marginTop: "8px" }}>
              Please note that you need to book previous appointments before booking for a follow-up.
            </p>
          </div>
        </div>

        <div style={formSectionStyle}>
          <div style={formGroupStyle}>
            <label style={labelStyle}>Select Previous Appointment *</label>
            <p style={helpTextStyle}>
              {previousAppointments.length === 0 
                ? "No previous appointments found. You need to book an appointment before booking for a follow-up."
                : "Select the previous appointment you want to follow up on."
              }
            </p>
            <select
              value={selectedPreviousAppointment}
              onChange={(e) => setSelectedPreviousAppointment(e.target.value)}
              style={previousAppointments.length === 0 ? selectStyleDisabled : selectStyle}
              disabled={previousAppointments.length === 0}
            >
              <option value="">Select previous appointment</option>
              {previousAppointments.map(appointment => (
                <option key={appointment.reference_number} value={appointment.reference_number}>
                  {appointment.reference_number} - {appointment.appointment_for} ({appointment.appointment_date})
                </option>
              ))}
            </select>
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Follow-Up Appointment For *</label>
            <select
              value={followUpFor}
              onChange={(e) => setFollowUpFor(e.target.value)}
              style={previousAppointments.length === 0 ? selectStyleDisabled : selectStyle}
              disabled={previousAppointments.length === 0}
            >
              <option value="">Select follow-up type</option>
              {appointmentTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Appointment Date *</label>
            <input
              type="date"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              style={previousAppointments.length === 0 ? inputStyleDisabled : inputStyle}
              disabled={previousAppointments.length === 0}
            />
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Appointment Time *</label>
            <select
              value={appointmentTime}
              onChange={(e) => setAppointmentTime(e.target.value)}
              style={previousAppointments.length === 0 ? selectStyleDisabled : selectStyle}
              disabled={previousAppointments.length === 0}
            >
              <option value="">Select time</option>
              {appointmentTimes.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={buttonContainerStyle}>
          <button
            onClick={handleSave}
            style={previousAppointments.length === 0 ? secondaryButtonStyleDisabled : secondaryButtonStyle}
            disabled={previousAppointments.length === 0}
          >
            SAVE
          </button>
          <button
            onClick={handleNext}
            style={previousAppointments.length === 0 ? primaryButtonStyleDisabled : primaryButtonStyle}
            disabled={previousAppointments.length === 0}
          >
            NEXT &gt;&gt;
          </button>
        </div>

        <button
          onClick={handleDiscard}
          style={discardButtonStyle}
        >
          DISCARD THIS APPOINTMENT
        </button>
      </div>
    </div>
  );
}

// Styles matching BookingPage design
const containerStyle = {
  padding: "30px",
  fontFamily: "Arial, sans-serif",
  backgroundColor: "#f5f8fa",
  minHeight: "100vh",
};

const titleStyle = {
  textAlign: "center",
  marginBottom: "30px",
  color: "#003366",
};

const cardStyle = {
  maxWidth: "450px",
  margin: "0 auto",
  padding: "30px",
  borderRadius: "15px",
  backgroundColor: "#ffffff",
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
};

const sectionTitleStyle = {
  fontSize: "20px",
  fontWeight: "600",
  marginBottom: "10px",
  color: "#003366",
};

const referenceStyle = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#0b5ed7",
  marginBottom: "15px",
  padding: "10px",
  backgroundColor: "#f8f9fa",
  borderRadius: "8px",
  border: "1px solid #e9ecef",
};

const infoSectionStyle = {
  marginBottom: "25px",
};

const importantNoticeStyle = {
  backgroundColor: "#fff3cd",
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #ffeaa7",
  fontSize: "14px",
  color: "#856404",
  marginBottom: "20px",
};

const formSectionStyle = {
  marginBottom: "25px",
};

const formGroupStyle = {
  marginBottom: "20px",
};

const labelStyle = {
  display: "block",
  fontWeight: "600",
  color: "#495057",
  fontSize: "14px",
  marginBottom: "8px",
};

const helpTextStyle = {
  fontSize: "12px",
  color: "#6c757d",
  marginBottom: "8px",
  fontStyle: "italic",
};

const selectStyle = {
  width: "100%",
  padding: "12px",
  border: "1px solid #ced4da",
  borderRadius: "8px",
  fontSize: "14px",
  backgroundColor: "#ffffff",
};

const selectStyleDisabled = {
  width: "100%",
  padding: "12px",
  border: "1px solid #ced4da",
  borderRadius: "8px",
  fontSize: "14px",
  backgroundColor: "#f8f9fa",
  color: "#6c757d",
  cursor: "not-allowed",
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  border: "1px solid #ced4da",
  borderRadius: "8px",
  fontSize: "14px",
  backgroundColor: "#ffffff",
};

const inputStyleDisabled = {
  width: "100%",
  padding: "12px",
  border: "1px solid #ced4da",
  borderRadius: "8px",
  fontSize: "14px",
  backgroundColor: "#f8f9fa",
  color: "#6c757d",
  cursor: "not-allowed",
};

const buttonContainerStyle = {
  display: "flex",
  gap: "15px",
  marginBottom: "20px",
};

const primaryButtonStyle = {
  backgroundColor: "#0b5ed7",
  border: "none",
  padding: "12px 20px",
  borderRadius: "20px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  cursor: "pointer",
  flex: "1",
};

const primaryButtonStyleDisabled = {
  backgroundColor: "#6c757d",
  border: "none",
  padding: "12px 20px",
  borderRadius: "20px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  cursor: "not-allowed",
  flex: "1",
  opacity: "0.6",
};

const secondaryButtonStyle = {
  backgroundColor: "#6c757d",
  border: "none",
  padding: "12px 20px",
  borderRadius: "20px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  cursor: "pointer",
  flex: "1",
};

const secondaryButtonStyleDisabled = {
  backgroundColor: "#adb5bd",
  border: "none",
  padding: "12px 20px",
  borderRadius: "20px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  cursor: "not-allowed",
  flex: "1",
  opacity: "0.6",
};

const discardButtonStyle = {
  backgroundColor: "#dc3545",
  border: "none",
  padding: "12px 20px",
  borderRadius: "20px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  cursor: "pointer",
  width: "100%",
};

const loadingStyle = {
  textAlign: "center",
  padding: "20px",
  color: "#6c757d",
};

const errorStyle = {
  textAlign: "center",
  padding: "20px",
  color: "#dc3545",
  backgroundColor: "#f8d7da",
  borderRadius: "8px",
  border: "1px solid #f5c6cb",
};

export default FollowUpBooking;