import config from '../config';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MySubmissionsPage = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const studentNumber = localStorage.getItem('studentNumber');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        if (!studentNumber) {
          setError('No student number found. Please log in again.');
          setLoading(false);
          return;
        }

        const response = await fetch(`http://${config.API_URL}/api/student-appointments/${studentNumber}`);
        const data = await response.json();
        
        if (response.ok) {
          setAppointments(data.appointments);
        } else {
          setError(data.error || 'Failed to fetch appointments');
        }
      } catch (err) {
        setError('Error connecting to server. Please try again later.');
        console.error('Error fetching appointments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [studentNumber]);


  const formatDate = (dateString) => {
    if (!dateString) return 'Date not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Time not set';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const getStatusBadge = (status, appointmentDate) => {
    let statusClass, statusText;
    
    if (status === 'cancelled') {
      statusClass = 'status-cancelled';
      statusText = 'Cancelled';
    } else if (status === 'completed') {
      statusClass = 'status-completed';
      statusText = 'Completed';
    } else if (appointmentDate) {
      const today = new Date();
      const appointment = new Date(appointmentDate);
      
      if (appointment.toDateString() === today.toDateString()) {
        statusClass = 'status-today';
        statusText = 'Today';
      } else if (appointment < today) {
        statusClass = 'status-past';
        statusText = 'Past';
      } else {
        statusClass = 'status-upcoming';
        statusText = 'Upcoming';
      }
    } else {
      statusClass = 'status-scheduled';
      statusText = 'Scheduled';
    }
    
    return (
      <span className={`status-badge ${statusClass}`}>
        {statusText}
      </span>
    );
  };

  const getAppointmentTypeIcon = (type) => {
    const icons = {
      'General Consultation': '🩺',
      'Mental Health': '🧠',
      'Health & Wellness': '💪',
      'Follow-Up': '↩️',
      'default': '📅'
    };
    
    return icons[type] || icons['default'];
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your appointments...</p>
      </div>
    );
  }

  return (
    <div className="submissions-container">
      <div className="submissions-content">
        {/* Header */}
        <div className="submissions-header">
          <div className="header-content">
            <h1>My Appointments</h1>
            <button onClick={() => navigate('/patient-dashboard')} className="back-button">
              BACK TO DASHBOARD
            </button>
          </div>
          <p className="welcome-text">
            Welcome, {user?.full_name || 'Student'}. Here are all your scheduled appointments.
          </p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Stats Summary */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{appointments.length}</div>
            <div className="stat-label">Total Appointments</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {appointments.filter(a => a.status === 'completed' || (a.appointment_date && new Date(a.appointment_date) < new Date())).length}
            </div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {appointments.filter(a => 
                a.status === 'scheduled' && 
                a.appointment_date && 
                new Date(a.appointment_date).toDateString() === new Date().toDateString()
              ).length}
            </div>
            <div className="stat-label">Today</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {appointments.filter(a => 
                a.status === 'scheduled' && 
                a.appointment_date && 
                new Date(a.appointment_date) > new Date()
              ).length}
            </div>
            <div className="stat-label">Upcoming</div>
          </div>
        </div>

        {appointments.length > 0 ? (
          <div className="appointments-card">
            <div className="appointments-header">
              <h2>Your Appointments</h2>
            </div>
            <div className="appointments-table">
              <table>
                <thead>
                  <tr>
                    <th>Appointment</th>
                    <th>Details</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                    <th>Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr key={appointment.id} className="appointment-row">
                      <td>
                        <div className="appointment-type">
                          <span className="appointment-icon">{getAppointmentTypeIcon(appointment.appointment_for)}</span>
                          <div className="appointment-details">
                            <div className="appointment-service">{appointment.appointment_for}</div>
                            <div className="appointment-category">{appointment.appointment_type}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="appointment-info">Student #: {appointment.student_number}</div>
                      </td>
                      <td>
                        <div className="appointment-date">{formatDate(appointment.appointment_date)}</div>
                        <div className="appointment-time">{formatTime(appointment.appointment_time)}</div>
                      </td>
                      <td>
                        {getStatusBadge(appointment.status, appointment.appointment_date)}
                      </td>
                      <td>
                        <div className="reference-number">{appointment.reference_number}</div>
                        <div className="created-date">
                          Created: {new Date(appointment.created_at).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h3>You don't have any appointments yet.</h3>
            <p>Book your first appointment to get started with our services.</p>
            <button
              onClick={() => navigate('/booking')}
              className="book-button"
            >
              BOOK YOUR FIRST APPOINTMENT
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="action-buttons">
          <button onClick={() => navigate('/booking')} className="action-button primary">
            BOOK NEW APPOINTMENT
          </button>
        </div>

        <footer className="page-footer">
          © 2025 Wits University - Campus Health and Wellness Centre
        </footer>
      </div>
      
      <style jsx>{`
        .submissions-container {
          min-height: 100vh;
          background-color: #f8fafc;
          padding: 24px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        }
        
        .submissions-content {
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .submissions-header {
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
        
        .back-button {
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
        
        .back-button:hover {
          background: #002244;
        }
        
        .error-message {
          background: #fee2e2;
          color: #b91c1c;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 24px;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        
        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        
        .stat-number {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 8px;
          color: #0f2b5b;
        }
        
        .stat-label {
          color: #64748b;
          font-size: 14px;
        }
        
        .appointments-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          margin-bottom: 24px;
        }
        
        .appointments-header {
          margin-bottom: 20px;
        }
        
        .appointments-header h2 {
          font-size: 20px;
          font-weight: 600;
          color: #0f2b5b;
          margin: 0;
        }
        
        .appointments-table {
          overflow-x: auto;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
        }
        
        th {
          text-align: left;
          padding: 12px 16px;
          font-weight: 500;
          color: #64748b;
          border-bottom: 1px solid #e2e8f0;
          font-size: 14px;
        }
        
        td {
          padding: 16px;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .appointment-row:hover {
          background: #f8fafc;
        }
        
        .appointment-type {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .appointment-icon {
          font-size: 20px;
        }
        
        .appointment-service {
          font-weight: 500;
          color: #0f2b5b;
        }
        
        .appointment-category {
          font-size: 14px;
          color: #64748b;
        }
        
        .appointment-info, .appointment-date, .appointment-time, .reference-number, .created-date {
          font-size: 14px;
        }
        
        .appointment-date {
          font-weight: 500;
          color: #0f2b5b;
        }
        
        .appointment-time {
          color: #64748b;
        }
        
        .reference-number {
          font-family: monospace;
          color: #0f2b5b;
          font-weight: 500;
        }
        
        .created-date {
          color: #64748b;
          font-size: 12px;
          margin-top: 4px;
        }
        
        .status-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          display: inline-block;
        }
        
        .status-upcoming {
          background: #dbeafe;
          color: #1e40af;
        }
        
        .status-today {
          background: #ffedd5;
          color: #ea580c;
        }
        
        .status-completed {
          background: #dcfce7;
          color: #16a34a;
        }
        
        .status-past {
          background: #f3f4f6;
          color: #6b7280;
        }
        
        .status-cancelled {
          background: #fee2e2;
          color: #b91c1c;
        }
        
        .status-scheduled {
          background: #e0e7ff;
          color: #4338ca;
        }
        
        .empty-state {
          background: white;
          border-radius: 12px;
          padding: 60px 20px;
          text-align: center;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          margin-bottom: 24px;
        }
        
        .empty-icon {
          font-size: 64px;
          margin-bottom: 16px;
          opacity: 0.5;
        }
        
        .empty-state h3 {
          font-size: 20px;
          color: #64748b;
          margin-bottom: 8px;
        }
        
        .empty-state p {
          color: #94a3b8;
          margin-bottom: 24px;
        }
        
        .book-button {
          padding: 15px 40px;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
          font-size: 16px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .book-button:hover {
          background: #059669;
        }
        
        .action-buttons {
          display: flex;
          justify-content: center;
          margin-top: 24px;
        }
        
        .action-button {
          padding: 15px 40px;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
          border: none;
          font-size: 16px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .action-button.primary {
          background: #003366;
          color: white;
        }
        
        .action-button.primary:hover {
          background: #002244;
        }
        
        .action-button.secondary {
          background: #e2e8f0;
          color: #475569;
        }
        
        .action-button.secondary:hover {
          background: #cbd5e1;
        }
        
        .page-footer {
          text-align: center;
          color: #94a3b8;
          font-size: 14px;
          margin-top: 40px;
        }
        
        .loading-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background-color: #f8fafc;
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e2e8f0;
          border-top: 4px solid #0f2b5b;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .submissions-container {
            padding: 16px;
          }
          
          .header-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          th, td {
            padding: 12px 8px;
          }
          
        }
      `}</style>
    </div>
  );
};

export default MySubmissionsPage;