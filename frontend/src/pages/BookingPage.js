import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const BookingPage = () => {
  const navigate = useNavigate();
  const [porApproved, setPorApproved] = useState(null);
  const [porLoading, setPorLoading] = useState(true);
  const [porError, setPorError] = useState("");

  useEffect(() => {
    const studentNumber = localStorage.getItem('studentNumber');
    if (!studentNumber) {
      setPorError('Missing student number. Please login again.');
      setPorLoading(false);
      return;
    }
    const check = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/check-por', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentNumber })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to check POR');
        setPorApproved(Boolean(data.approved));
      } catch (e) {
        setPorError(e.message);
      } finally {
        setPorLoading(false);
      }
    };
    check();
  }, []);

  const handleAppointmentSelection = (type) => {
    if (!porApproved) {
      alert('You cannot book an appointment until your proof of registration has been approved by admin.');
      return;
    }
    if (type === "followup") {
      navigate("/follow-up-booking");
    } else if (type === "wellness") {
      navigate("/health-wellness-booking");
    }
  };

  const handleBackToDashboard = () => {
    navigate("/patient-dashboard");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <h1>Book Appointment</h1>
            <button onClick={handleBackToDashboard} className="logout-button">BACK TO DASHBOARD</button>
          </div>
          <p className="welcome-text">Campus Health And Wellness Centre</p>
        </div>

        {/* Status Messages */}
        {porLoading && (
          <div className="status-message info">
            Checking approval status...
          </div>
        )}
        {!porLoading && !porApproved && (
          <div className="status-message warning">
            Your proof of registration is not approved yet. Please upload it on the Upload Proof page and wait for admin approval.
          </div>
        )}
        {porError && (
          <div className="status-message error">
            {porError}
          </div>
        )}

        {/* Appointment Selection */}
        <div className="actions-card">
          <h2>Select Appointment Type</h2>
          <div className="action-grid">
            <button
              onClick={() => handleAppointmentSelection("followup")}
              disabled={!porApproved}
              className="action-tile followup-tile"
            >
              <span className="tile-title">Follow-Up Booking</span>
              <span className="tile-sub">Schedule a follow-up appointment</span>
            </button>
            <button
              onClick={() => handleAppointmentSelection("wellness")}
              disabled={!porApproved}
              className="action-tile wellness-tile"
            >
              <span className="tile-title">Health and Wellness Booking</span>
              <span className="tile-sub">Schedule a wellness appointment (Main Campus)</span>
            </button>
          </div>
        </div>

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

        .status-message {
          margin: 20px 0;
          padding: 16px;
          border-radius: 8px;
          font-weight: 500;
        }
        .status-message.info {
          background: #d1ecf1;
          color: #0c5460;
          border: 1px solid #bee5eb;
        }
        .status-message.warning {
          background: #fff3cd;
          color: #856404;
          border: 1px solid #ffeeba;
        }
        .status-message.error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
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

        .action-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 16px;
        }

        .action-tile {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          text-align: left;
          cursor: pointer;
          transition: background 0.2s ease;
          color: #0f2b5b;
          font-size: 16px;
        }
        .action-tile:hover { 
          background: #eef2f7; 
        }
        .action-tile:disabled {
          background: #f1f5f9;
          color: #94a3b8;
          cursor: not-allowed;
          border-color: #e2e8f0;
        }

        .followup-tile {
          background: #0ea5e9;
          border-color: #0ea5e9;
          color: white;
        }
        .followup-tile:hover {
          background: #0284c7;
        }
        .followup-tile:disabled {
          background: #f1f5f9;
          color: #94a3b8;
          border-color: #e2e8f0;
        }

        .wellness-tile {
          background: #10b981;
          border-color: #10b981;
          color: white;
        }
        .wellness-tile:hover {
          background: #059669;
        }
        .wellness-tile:disabled {
          background: #f1f5f9;
          color: #94a3b8;
          border-color: #e2e8f0;
        }

        .tile-title { 
          display: block; 
          font-weight: 600; 
          margin-bottom: 4px; 
        }
        .tile-sub { 
          display: block; 
          color: #64748b; 
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
          .action-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};


export default BookingPage;