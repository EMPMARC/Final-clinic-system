import config from '../../config';
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ModifyBookingPage = () => {
  const navigate = useNavigate();
  const [studentNumber, setStudentNumber] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    appointmentDate: "",
    appointmentTime: "",
    appointmentFor: "",
  });

  const handleBackToDashboard = () => {
    navigate("/admin-dashboard");
  };

  // Search for appointments by student number
  const searchAppointments = async () => {
    if (!studentNumber.trim()) {
      setError("Please enter a student number");
      return;
    }

    setLoading(true);
    setError("");
    setAppointments([]);
    setSelectedAppointment(null);

    try {
      const response = await fetch(`http://${config.API_URL}/api/appointments/student/${studentNumber}`);
      const data = await response.json();

      if (response.ok) {
        setAppointments(data.appointments);
        if (data.appointments.length === 0) {
          setError("No appointments found for this student number");
        }
      } else {
        setError(data.error || "Failed to fetch appointments");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle appointment selection
  const selectAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setEditForm({
      appointmentDate: appointment.appointment_date || "",
      appointmentTime: appointment.appointment_time || "",
      appointmentFor: appointment.appointment_for || "",
    });
    setIsEditing(false);
  };

  // Handle form changes
  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  // Update appointment
  const updateAppointment = async () => {
    if (!selectedAppointment) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`http://${config.API_URL}/api/appointments/${selectedAppointment.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();

      if (response.ok) {
        // Update the appointment in the list
        setAppointments(appointments.map(apt => 
          apt.id === selectedAppointment.id 
            ? { ...apt, ...editForm }
            : apt
        ));
        setSelectedAppointment({ ...selectedAppointment, ...editForm });
        setIsEditing(false);
        alert("Appointment updated successfully!");
      } else {
        setError(data.error || "Failed to update appointment");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Cancel appointment
  const cancelAppointment = async () => {
    if (!selectedAppointment) return;

    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`http://${config.API_URL}/api/appointments/${selectedAppointment.id}/cancel`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        // Update the appointment status in the list
        setAppointments(appointments.map(apt => 
          apt.id === selectedAppointment.id 
            ? { ...apt, status: "cancelled" }
            : apt
        ));
        setSelectedAppointment({ ...selectedAppointment, status: "cancelled" });
        alert("Appointment cancelled successfully!");
      } else {
        setError(data.error || "Failed to cancel appointment");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Format time for display
  const formatTime = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <h1>Modify Booking</h1>
            <button onClick={handleBackToDashboard} className="logout-button">BACK TO DASHBOARD</button>
          </div>
          <p className="welcome-text">Search and modify student appointments</p>
        </div>

        {/* Search Section */}
        <div className="actions-card">
          <h2>Search Student Appointments</h2>
          <div className="search-container">
            <input
              type="text"
              value={studentNumber}
              onChange={(e) => setStudentNumber(e.target.value)}
              placeholder="Enter student number"
              className="search-input"
            />
            <button
              onClick={searchAppointments}
              disabled={loading}
              className="search-button"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
          {error && (
            <div className="error-message">{error}</div>
          )}
        </div>

        {/* Appointments List */}
        {appointments.length > 0 && (
          <div className="actions-card">
            <h2>Student Appointments</h2>
            <div className="appointments-list">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  onClick={() => selectAppointment(appointment)}
                  className={`appointment-item ${selectedAppointment?.id === appointment.id ? 'selected' : ''}`}
                >
                  <div className="appointment-content">
                    <div className="appointment-details">
                      <div><strong>Reference:</strong> {appointment.reference_number}</div>
                      <div><strong>Type:</strong> {appointment.appointment_type}</div>
                      <div><strong>For:</strong> {appointment.appointment_for}</div>
                      <div><strong>Date:</strong> {formatDate(appointment.appointment_date)}</div>
                      <div><strong>Time:</strong> {formatTime(appointment.appointment_time)}</div>
                    </div>
                    <div className={`status-badge ${appointment.status === "cancelled" ? 'cancelled' : 'scheduled'}`}>
                      {appointment.status?.toUpperCase() || "SCHEDULED"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Appointment Details and Edit Form */}
        {selectedAppointment && (
          <div className="actions-card">
            <h2>Selected Appointment Details</h2>
            
            <div className="appointment-details-container">
              {/* Current Details */}
              <div className="current-details">
                <h3>Current Details</h3>
                <div className="detail-item">
                  <strong>Reference:</strong> {selectedAppointment.reference_number}
                </div>
                <div className="detail-item">
                  <strong>Student Number:</strong> {selectedAppointment.student_number}
                </div>
                <div className="detail-item">
                  <strong>Type:</strong> {selectedAppointment.appointment_type}
                </div>
                <div className="detail-item">
                  <strong>For:</strong> {selectedAppointment.appointment_for}
                </div>
                <div className="detail-item">
                  <strong>Date:</strong> {formatDate(selectedAppointment.appointment_date)}
                </div>
                <div className="detail-item">
                  <strong>Time:</strong> {formatTime(selectedAppointment.appointment_time)}
                </div>
                <div className="detail-item">
                  <strong>Status:</strong> {selectedAppointment.status?.toUpperCase() || "SCHEDULED"}
                </div>
              </div>

              {/* Edit Form */}
              <div className="edit-form">
                <h3>Modify Appointment</h3>
                {isEditing ? (
                  <form onSubmit={(e) => { e.preventDefault(); updateAppointment(); }} className="form-container">
                    <div className="form-group">
                      <label>Appointment Date:</label>
                      <input
                        type="date"
                        name="appointmentDate"
                        value={editForm.appointmentDate}
                        onChange={handleEditChange}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>Appointment Time:</label>
                      <input
                        type="time"
                        name="appointmentTime"
                        value={editForm.appointmentTime}
                        onChange={handleEditChange}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>Appointment For:</label>
                      <input
                        type="text"
                        name="appointmentFor"
                        value={editForm.appointmentFor}
                        onChange={handleEditChange}
                        placeholder="Enter appointment reason"
                        className="form-input"
                      />
                    </div>

                    <div className="form-actions">
                      <button
                        type="submit"
                        disabled={loading}
                        className="action-button primary"
                      >
                        {loading ? "Saving..." : "Save Changes"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="action-button secondary"
                      >
                        Cancel Edit
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="edit-actions">
                    <p className="edit-description">
                      Click "Edit Appointment" to modify the details, or "Cancel Appointment" to cancel it.
                    </p>
                    <div className="action-buttons">
                      <button
                        onClick={() => setIsEditing(true)}
                        disabled={selectedAppointment.status === "cancelled"}
                        className="action-button primary"
                      >
                        Edit Appointment
                      </button>
                      <button
                        onClick={cancelAppointment}
                        disabled={selectedAppointment.status === "cancelled" || loading}
                        className="action-button danger"
                      >
                        {loading ? "Cancelling..." : "Cancel Appointment"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <footer className="page-footer">© 2025 Wits University - Campus Health and Wellness Centre</footer>
      </div>

      <style jsx>{`
        .dashboard-container {
          min-height: 100vh;
          background-color: #f8fafc;
          padding: 24px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        }

        .dashboard-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .dashboard-header {
          background: white;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        h1 {
          font-size: 24px;
          font-weight: 600;
          color: #0f2b5b;
          margin: 0;
        }

        .welcome-text {
          color: #64748b;
          margin: 0;
          font-size: 16px;
        }

        .logout-button {
          padding: 15px 40px;
          background: #003366;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
          font-size: 16px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .logout-button:hover { 
          background: #002244; 
        }

        .actions-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          margin-bottom: 24px;
        }
        .actions-card h2 { 
          font-size: 20px; 
          font-weight: 600; 
          color: #0f2b5b; 
          margin: 0 0 16px; 
        }

        .search-container {
          display: flex;
          gap: 12px;
          align-items: center;
          margin-bottom: 16px;
        }

        .search-input {
          flex: 1;
          padding: 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 16px;
        }

        .search-button {
          padding: 12px 24px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
          font-size: 16px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .search-button:hover {
          background: #2563eb;
        }
        .search-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .error-message {
          color: #dc2626;
          background: #fef2f2;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid #fecaca;
        }

        .appointments-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .appointment-item {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: white;
        }
        .appointment-item:hover {
          border-color: #3b82f6;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .appointment-item.selected {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .appointment-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .appointment-details {
          flex: 1;
        }
        .appointment-details div {
          margin-bottom: 4px;
          font-size: 14px;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
        }
        .status-badge.scheduled {
          background: #dcfce7;
          color: #166534;
        }
        .status-badge.cancelled {
          background: #fef2f2;
          color: #dc2626;
        }

        .appointment-details-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
        }

        .current-details, .edit-form {
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
        }

        .current-details h3, .edit-form h3 {
          font-size: 18px;
          font-weight: 600;
          color: #0f2b5b;
          margin: 0 0 16px;
        }

        .detail-item {
          margin-bottom: 8px;
          font-size: 14px;
        }

        .form-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-weight: 500;
          color: #374151;
          font-size: 14px;
        }

        .form-input {
          padding: 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
        }

        .form-actions, .action-buttons {
          display: flex;
          gap: 12px;
          margin-top: 16px;
        }

        .action-button {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
          font-size: 14px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .action-button.primary {
          background: #3b82f6;
          color: white;
        }
        .action-button.primary:hover {
          background: #2563eb;
        }
        .action-button.primary:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .action-button.secondary {
          background: #6b7280;
          color: white;
        }
        .action-button.secondary:hover {
          background: #4b5563;
        }

        .action-button.danger {
          background: #dc2626;
          color: white;
        }
        .action-button.danger:hover {
          background: #b91c1c;
        }
        .action-button.danger:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .edit-description {
          color: #6b7280;
          margin-bottom: 16px;
          font-size: 14px;
        }

        .page-footer { 
          text-align: center; 
          color: #94a3b8; 
          font-size: 14px; 
          margin-top: 40px; 
        }

        @media (max-width: 768px) {
          .dashboard-container { 
            padding: 16px; 
          }
          .header-content { 
            flex-direction: column; 
            align-items: flex-start; 
            gap: 16px; 
          }
          .appointment-details-container {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .search-container {
            flex-direction: column;
            align-items: stretch;
          }
          .form-actions, .action-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default ModifyBookingPage;