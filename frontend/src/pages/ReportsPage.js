import config from '../config';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NewRegistrationsReport from './NewRegistrationsReport';

const ReportsPage = () => {
  const [loading, setLoading] = useState({});
  const [error, setError] = useState({});
  const [success, setSuccess] = useState({});
  const [activeReport, setActiveReport] = useState(null);
  const navigate = useNavigate();

  const generateReport = async (reportType) => {
    setLoading(prev => ({ ...prev, [reportType]: true }));
    setError(prev => ({ ...prev, [reportType]: '' }));
    setSuccess(prev => ({ ...prev, [reportType]: '' }));

    try {
      const response = await axios.post(`http://${config.API_URL}/api/${reportType}`, {}, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Set filename based on report type
      let filename = 'report.pdf';
      switch(reportType) {
        case 'report1':
          filename = 'appointments_report.pdf';
          break;
        case 'report2':
          filename = 'emergency_report.pdf';
          break;
        case 'report3':
          filename = 'por_report.pdf';
          break;
        default:
          filename = 'report.pdf';
          break;
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setSuccess(prev => ({ ...prev, [reportType]: 'Report generated successfully!' }));
    } catch (err) {
      setError(prev => ({ ...prev, [reportType]: 'Error generating report. Please try again.' }));
      console.error('Error generating report:', err);
    } finally {
      setLoading(prev => ({ ...prev, [reportType]: false }));
    }
  };

  const viewNewRegistrationsReport = () => {
    setActiveReport('newRegistrations');
  };

  const backToReportsList = () => {
    setActiveReport(null);
  };


  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {activeReport === 'newRegistrations' ? (
          // New Registrations Report View
          <>
            {/* Header */}
            <div className="dashboard-header">
              <div className="header-content">
                <h1>📊 New Student Onboarding Report</h1>
                <button onClick={backToReportsList} className="logout-button">BACK TO REPORTS</button>
              </div>
              <p className="welcome-text">Interactive report showing new student registrations who completed the onboarding process</p>
            </div>

            <div className="actions-card">
              <NewRegistrationsReport />
            </div>
          </>
        ) : (
          // Main Reports Dashboard
          <>
            {/* Header */}
            <div className="dashboard-header">
              <div className="header-content">
                <h1>📊 CHWC Reports Dashboard</h1>
                <button onClick={() => navigate('/admin-dashboard')} className="logout-button">BACK TO DASHBOARD</button>
              </div>
              <p className="welcome-text">Generate comprehensive reports for your campus health system</p>
            </div>

            {/* Reports Grid */}
            <div className="actions-card">
              <h2>Available Reports</h2>
              <div className="reports-grid">
                {/* Appointments Report */}
                <div className="report-card">
                  <div className="report-header">
                    <div className="report-icon">📅</div>
                    <div className="report-title">Appointments Report</div>
                  </div>
                  <div className="report-description">
                    Monthly breakdown of appointments and emergency cases with detailed statistics and trends.
                  </div>
                  <button 
                    className="action-button primary"
                    onClick={() => generateReport('report1')}
                    disabled={loading.report1}
                  >
                    {loading.report1 ? 'Generating...' : 'Generate Report'}
                  </button>
                  {loading.report1 && <div className="status-message info">Generating report...</div>}
                  {error.report1 && <div className="status-message error">{error.report1}</div>}
                  {success.report1 && <div className="status-message success">{success.report1}</div>}
                </div>

                {/* Emergency Report */}
                <div className="report-card">
                  <div className="report-header">
                    <div className="report-icon">🚨</div>
                    <div className="report-title">Emergency Report</div>
                  </div>
                  <div className="report-description">
                    Campus-wise emergency statistics showing distribution across Parktown and Main campuses.
                  </div>
                  <button 
                    className="action-button primary"
                    onClick={() => generateReport('report2')}
                    disabled={loading.report2}
                  >
                    {loading.report2 ? 'Generating...' : 'Generate Report'}
                  </button>
                  {loading.report2 && <div className="status-message info">Generating report...</div>}
                  {error.report2 && <div className="status-message error">{error.report2}</div>}
                  {success.report2 && <div className="status-message success">{success.report2}</div>}
                </div>

                {/* POR Report */}
                <div className="report-card">
                  <div className="report-header">
                    <div className="report-icon">📋</div>
                    <div className="report-title">Proof of Registration Report</div>
                  </div>
                  <div className="report-description">
                    Monthly upload statistics for proof of registration documents submitted by students.
                  </div>
                  <button 
                    className="action-button primary"
                    onClick={() => generateReport('report3')}
                    disabled={loading.report3}
                  >
                    {loading.report3 ? 'Generating...' : 'Generate Report'}
                  </button>
                  {loading.report3 && <div className="status-message info">Generating report...</div>}
                  {error.report3 && <div className="status-message error">{error.report3}</div>}
                  {success.report3 && <div className="status-message success">{success.report3}</div>}
                </div>

                {/* New Registrations Report */}
                <div className="report-card">
                  <div className="report-header">
                    <div className="report-icon">👥</div>
                    <div className="report-title">New Student Onboarding Report</div>
                  </div>
                  <div className="report-description">
                    Interactive dashboard showing new student registrations who completed the onboarding process with charts, filters, and detailed breakdowns.
                  </div>
                  <button 
                    className="action-button primary"
                    onClick={viewNewRegistrationsReport}
                  >
                    View Report
                  </button>
                </div>
              </div>
            </div>
          </>
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

        .reports-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .report-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          transition: all 0.2s ease;
        }
        .report-card:hover {
          border-color: #3b82f6;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .report-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .report-icon {
          font-size: 24px;
        }

        .report-title {
          font-size: 18px;
          font-weight: 600;
          color: #0f2b5b;
        }

        .report-description {
          color: #64748b;
          margin-bottom: 20px;
          line-height: 1.5;
          font-size: 14px;
        }

        .action-button {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
          font-size: 14px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          width: 100%;
        }

        .action-button.primary {
          background: #003366;
          color: white;
        }
        .action-button.primary:hover {
          background: #002244;
        }
        .action-button.primary:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .status-message {
          margin-top: 12px;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 14px;
          text-align: center;
        }
        .status-message.info {
          background: #dbeafe;
          color: #1e40af;
        }
        .status-message.error {
          background: #fef2f2;
          color: #dc2626;
        }
        .status-message.success {
          background: #dcfce7;
          color: #166534;
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
          .reports-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ReportsPage;
