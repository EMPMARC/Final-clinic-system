import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PatientDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const studentNumber = localStorage.getItem("studentNumber");
  const navigate = useNavigate();

  // Get progress from localStorage (default all)
  const progress = JSON.parse(localStorage.getItem("patientProgress") || "{}");

  useEffect(() => {
    // Check current onboarding and POR status (in case they were updated elsewhere)
    const checkCurrentStatus = async () => {
      try {
        const onboardingResponse = await fetch('http://localhost:5001/api/check-onboarding', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ studentNumber }),
        });
        
        const onboardingData = await onboardingResponse.json();
        
        const porResponse = await fetch(`http://localhost:5001/api/student-files/${studentNumber}`);
        const porData = await porResponse.json();
        
        if (onboardingResponse.ok && porResponse.ok) {
          const currentProgress = {
            onboarding: onboardingData.exists,
            proofUploaded: porData.files && porData.files.length > 0,
            booking: progress.booking || false,
            submission: progress.submission || false
          };
          
          localStorage.setItem('patientProgress', JSON.stringify(currentProgress));
        }
      } catch (error) {
        console.error('Error checking current status:', error);
      }
    };

    if (studentNumber) {
      checkCurrentStatus();
    }
  }, [studentNumber, progress.booking, progress.submission]);

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("studentNumber");
    localStorage.removeItem("userType");
    localStorage.removeItem("patientProgress");
    navigate("/");
  };

  const completeStep = (step) => {
    const newProgress = { ...progress, [step]: true };
    localStorage.setItem("patientProgress", JSON.stringify(newProgress));
  };

  const handleClick = (action) => {
    if (action === "upload-proof" && !progress.onboarding) {
      alert("Please complete onboarding first.");
      return;
    }
    if (action === "booking" && !progress.proofUploaded) {
      alert("Please upload and get your proof of registration approved first.");
      return;
    }

    // Simulate marking a step as done (remove this in real version)
    if (action === "onboarding") completeStep("onboarding");
    if (action === "upload-proof") completeStep("proofUploaded");
    if (action === "booking") completeStep("booking");
    if (action === "my-submissions") completeStep("submission");

    navigate("/" + action);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <h1>Welcome, {user?.full_name || "Student"}</h1>
            <button onClick={logout} className="logout-button">LOG OUT</button>
          </div>
          <p className="welcome-text">What would you like to do today?</p>
        </div>

        {/* Quick Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{progress.onboarding ? '✓' : '—'}</div>
            <div className="stat-label">Onboarding</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{progress.proofUploaded ? '✓' : '—'}</div>
            <div className="stat-label">Proof of Registration</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{progress.booking ? '✓' : '—'}</div>
            <div className="stat-label">Booking Made</div>
          </div>
        </div>

        {/* Actions */}
        <div className="actions-card">
          <h2>Actions</h2>
          <div className="action-grid">
            <button onClick={() => handleClick("onboarding")} className={`action-tile ${progress.onboarding ? 'success' : ''}`}>
              <span className="tile-title">Complete Onboarding</span>
              <span className="tile-sub">Create your patient profile</span>
            </button>
            <button onClick={() => handleClick("upload-proof")} className={`action-tile ${progress.proofUploaded ? 'success' : ''}`}>
              <span className="tile-title">Upload Proof of Registration</span>
              <span className="tile-sub">Submit proof of registration</span>
            </button>
            <button onClick={() => handleClick("booking")} className={`action-tile ${progress.booking ? 'success' : ''}`}>
              <span className="tile-title">Book Appointment</span>
              <span className="tile-sub">Schedule a consultation</span>
            </button>
            <button onClick={() => handleClick("my-submissions")} className={`action-tile ${progress.submission ? 'success' : ''}`}>
              <span className="tile-title">My Appointments</span>
              <span className="tile-sub">View all submissions</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="action-buttons">
          <button onClick={() => handleClick("my-submissions")} className="action-button primary">VIEW MY APPOINTMENTS</button>
          <button onClick={() => handleClick("booking")} className="action-button secondary">BOOK NEW APPOINTMENT</button>
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
          background: #b91c1c;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
          font-size: 16px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .logout-button:hover { 
          background: #991b1b; 
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
        .stat-label { color: #64748b; font-size: 14px; }

        .actions-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          margin-bottom: 24px;
        }
        .actions-card h2 { font-size: 20px; font-weight: 600; color: #0f2b5b; margin: 0 0 16px; }

        .action-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
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
        .action-tile:hover { background: #eef2f7; }

        .tile-title { display: block; font-weight: 600; margin-bottom: 4px; }
        .tile-sub { display: block; color: #64748b; font-size: 14px; }

        .action-buttons {
          display: flex;
          justify-content: center;
          gap: 12px;
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

        .page-footer { text-align: center; color: #94a3b8; font-size: 14px; margin-top: 40px; }

        @media (max-width: 768px) {
          .dashboard-container { padding: 16px; }
          .header-content { flex-direction: column; align-items: flex-start; gap: 16px; }
          .action-buttons { flex-direction: column; }
        }
      `}</style>
    </div>
  );
};

export default PatientDashboard;