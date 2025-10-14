import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ApproveProofPage = () => {
  const navigate = useNavigate();
  const [studentNumberInput, setStudentNumberInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [por, setPor] = useState(null); // { id, student_number, file_name, uploaded_at, approval_status }
  const [decisionLoading, setDecisionLoading] = useState(false);

  const handleBackToDashboard = () => {
    navigate("/admin-dashboard");
  };

  const fetchPOR = async () => {
    setError("");
    setPor(null);
    if (!studentNumberInput.trim()) {
      setError("Please enter a student number");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5001/api/por/${encodeURIComponent(studentNumberInput.trim())}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "POR not found for this student");
      }
      const data = await res.json();
      setPor(data.por);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const decide = async (next) => {
    if (!por) return;
    setDecisionLoading(true);
    setError("");
    try {
      const res = await fetch(`http://localhost:5001/api/por/${encodeURIComponent(por.student_number)}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision: next })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to update decision');
      // Refresh POR to get latest status
      await fetchPOR();
    } catch (e) {
      setError(e.message);
    } finally {
      setDecisionLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <h1>Approve Proof of Registration</h1>
            <button onClick={handleBackToDashboard} className="logout-button">BACK TO DASHBOARD</button>
          </div>
          <p className="welcome-text">Search a student's latest uploaded POR, review and approve or reject</p>
        </div>

        {/* Search Section */}
        <div className="actions-card">
          <h2>Search Student POR</h2>
          <div className="search-container">
            <input
              type="text"
              placeholder="Enter student number"
              value={studentNumberInput}
              onChange={(e) => setStudentNumberInput(e.target.value)}
              className="search-input"
            />
            <button
              onClick={fetchPOR}
              disabled={loading}
              className="search-button"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
          {error && (
            <div className="error-message">{error}</div>
          )}
        </div>

        {/* POR Details */}
        {por && (
          <div className="actions-card">
            <h2>POR Details</h2>
            <div className="por-details">
              <div className="detail-item">
                <strong>Student Number:</strong> {por.student_number}
              </div>
              <div className="detail-item">
                <strong>File:</strong> {por.file_name}
              </div>
              <div className="detail-item">
                <strong>Uploaded:</strong> {new Date(por.uploaded_at).toLocaleString()}
              </div>
              <div className="detail-item">
                <strong>Status:</strong> 
                <span className={`status-badge ${por.approval_status === 'approved' ? 'approved' : por.approval_status === 'rejected' ? 'rejected' : 'pending'}`}>
                  {por.approval_status?.toUpperCase() || 'PENDING'}
                </span>
              </div>
            </div>
            
            <div className="por-actions">
              <a
                href={`http://localhost:5001/api/download-file/${por.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="action-button secondary"
              >
                View / Download
              </a>
              <button
                onClick={() => decide('approved')}
                disabled={decisionLoading || por.approval_status === 'approved'}
                className="action-button primary"
              >
                {decisionLoading ? 'Processing...' : 'Approve'}
              </button>
              <button
                onClick={() => decide('rejected')}
                disabled={decisionLoading || por.approval_status === 'rejected'}
                className="action-button danger"
              >
                {decisionLoading ? 'Processing...' : 'Reject'}
              </button>
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

        .por-details {
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .detail-item {
          margin-bottom: 12px;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
        }
        .status-badge.approved {
          background: #dcfce7;
          color: #166534;
        }
        .status-badge.rejected {
          background: #fef2f2;
          color: #dc2626;
        }
        .status-badge.pending {
          background: #fef3c7;
          color: #92400e;
        }

        .por-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .action-button {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
          font-size: 14px;
          text-decoration: none;
          display: inline-block;
          text-align: center;
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
          .search-container {
            flex-direction: column;
            align-items: stretch;
          }
          .por-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default ApproveProofPage;