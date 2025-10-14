import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function HealthAndWellnessPage() {
  const [selectedService, setSelectedService] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const navigate = useNavigate();
  const studentNumber = localStorage.getItem('studentNumber');

  const services = [
    "General Consultation",
    "HIV Testing and Counselling - Free Service",
    "Mental Health - Free Service"
  ];

  const times = [
    "08:00", "08:30", "09:00", "09:30",
    "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30"
  ];

  const requiresDate = [
    "HIV Testing and Counselling - Free Service",
    "Mental Health - Free Service"
  ];

  const handleNext = () => {
    if (!selectedService || !appointmentTime || (requiresDate.includes(selectedService) && !appointmentDate)) {
      alert("Please fill in all required fields.");
      return;
    }

    if (!studentNumber) {
      alert("Student number not found. Please log in again.");
      return;
    }

    navigate("/confirm-booking", {
      state: {
        service: selectedService,
        date: appointmentDate,
        time: appointmentTime,
        studentNumber: studentNumber
      },
    });
  };

  const handleSave = () => {
    if (!selectedService || !appointmentTime || (requiresDate.includes(selectedService) && !appointmentDate)) {
      alert("Please complete all required fields before saving.");
      return;
    }

    alert("Booking details saved successfully!");
  };

  const handleDiscard = () => {
    const confirmDiscard = window.confirm("Are you sure you want to discard this appointment?");
    if (confirmDiscard) {
      navigate('/booking');
    }
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Campus Health And Wellness Centre</h1>
      <div style={cardStyle}>
        <h2 style={sectionTitleStyle}>Health and Wellness Booking (Main Campus)</h2>
        <hr />
        
        <div style={infoSectionStyle}>
          <div style={campusInfoStyle}>
            Main Campus Health and Wellness Centre
          </div>
          
          <div style={descriptionStyle}>
            <p>Campus Health offers services such as: Primary Health care, Family Planning, Mental Health, Emergency Care, Dispensary, HCT (VCT), Wellness Programs, Private Medical Practitioner to staff, students and Wits community. Some of these services are free such as HIV testing, Counselling and Reproductive health.</p>
            
            <div style={hoursStyle}>
              <strong>SERVICE HOURS:</strong> Monday - Friday, 08:00 to 15:30<br />
              <strong>FOLLOW-UP:</strong> Monday - Friday, 08:00 to 11:00
            </div>
            
            <div style={noticeStyle}>
              If you must <strong>cancel</strong> an appointment, we request for <strong>2 hours</strong> notice, in order to allow other bookings.<br />
              <strong>Please note:</strong> General Consultations can <strong>only</strong> be booked daily on the day of consultation.
            </div>
          </div>
        </div>

        <div style={formSectionStyle}>
          <div style={formGroupStyle}>
            <label style={labelStyle}>Appointment for *</label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              required
              style={selectStyle}
            >
              <option value="">Select service</option>
              {services.map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>
          </div>

          {requiresDate.includes(selectedService) && (
            <div style={formGroupStyle}>
              <label style={labelStyle}>Appointment Date *</label>
              <input
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                required
                style={inputStyle}
              />
            </div>
          )}

          <div style={formGroupStyle}>
            <label style={labelStyle}>Appointment Time *</label>
            <select
              value={appointmentTime}
              onChange={(e) => setAppointmentTime(e.target.value)}
              required
              style={selectStyle}
            >
              <option value="">Select time</option>
              {times.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={buttonContainerStyle}>
          <button
            onClick={handleSave}
            style={secondaryButtonStyle}
          >
            SAVE
          </button>
          <button
            onClick={handleNext}
            style={primaryButtonStyle}
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

const infoSectionStyle = {
  marginTop: "20px",
};

const campusInfoStyle = {
  backgroundColor: "#d6eaff",
  border: "1px solid #0b5ed7",
  borderRadius: "12px",
  padding: "12px",
  marginBottom: "20px",
  color: "#0b5ed7",
  fontWeight: "500",
  textAlign: "center",
};

const descriptionStyle = {
  marginBottom: "25px",
};

const hoursStyle = {
  backgroundColor: "#f8f9fa",
  padding: "12px",
  borderRadius: "8px",
  marginBottom: "15px",
  border: "1px solid #e9ecef",
  fontSize: "14px",
};

const noticeStyle = {
  backgroundColor: "#fff3cd",
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #ffeaa7",
  fontSize: "14px",
  color: "#856404",
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

const selectStyle = {
  width: "100%",
  padding: "12px",
  border: "1px solid #ced4da",
  borderRadius: "8px",
  fontSize: "14px",
  backgroundColor: "#ffffff",
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  border: "1px solid #ced4da",
  borderRadius: "8px",
  fontSize: "14px",
  backgroundColor: "#ffffff",
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

export default HealthAndWellnessPage;