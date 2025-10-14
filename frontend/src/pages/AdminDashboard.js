import React from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <h1>Welcome, {user?.name || "Admin"}</h1>
            <button onClick={logout} className="logout-button">LOG OUT</button>
          </div>
          <p className="welcome-text">Choose what you want to do today:</p>
        </div>

        {/* Actions */}
        <div className="actions-card">
          <h2>Admin Actions</h2>
          <div className="action-grid">
            <button onClick={() => navigate("/staff-schedule")} className="action-tile">
              <span className="tile-title">View / Manage Schedule</span>
              <span className="tile-sub">Manage staff schedules and availability</span>
            </button>
            <button onClick={() => navigate("/emergency-onboarding")} className="action-tile">
              <span className="tile-title">Emergency Onboarding</span>
              <span className="tile-sub">Handle emergency patient onboarding</span>
            </button>
            <button onClick={() => navigate("/modify-booking")} className="action-tile">
              <span className="tile-title">Modify Booking</span>
              <span className="tile-sub">Modify existing patient bookings</span>
            </button>
            <button onClick={() => navigate("/approve-proof")} className="action-tile">
              <span className="tile-title">Approve Proof of Registration</span>
              <span className="tile-sub">Review and approve student documents</span>
            </button>
            <button onClick={() => navigate("/new-report")} className="action-tile">
              <span className="tile-title">Generate Reports</span>
              <span className="tile-sub">Create and download system reports</span>
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
          padding: 12px 24px;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
          font-size: 16px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .logout-button:hover { 
          background: #c82333; 
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
          background: #3b82f6;
          border: 1px solid #3b82f6;
          border-radius: 12px;
          padding: 20px;
          text-align: left;
          cursor: pointer;
          transition: background 0.2s ease;
          color: white;
          font-size: 16px;
        }
        .action-tile:hover { 
          background: #2563eb; 
        }

        .tile-title { 
          display: block; 
          font-weight: 600; 
          margin-bottom: 4px; 
        }
        .tile-sub { 
          display: block; 
          color: #e0f2fe; 
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

export default AdminDashboard;