import config from '../config';
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const RegistrationCapturePage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const navigate = useNavigate();
  
  const studentNumber = localStorage.getItem('studentNumber');

  // Wrap fetchUploadedFiles with useCallback to memoize it
  const fetchUploadedFiles = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/student-files/${studentNumber}`);
      const data = await response.json();
      
      if (data.files) {
        setUploadedFiles(data.files);
      }
    } catch (error) {
      console.error('Error fetching uploaded files:', error);
    }
  }, [studentNumber]); // Add studentNumber as dependency

  useEffect(() => {
    if (studentNumber) {
      fetchUploadedFiles();
    }
  }, [studentNumber, fetchUploadedFiles]); // Now includes fetchUploadedFiles in dependencies

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      
      if (!allowedTypes.includes(file.type)) {
        setUploadStatus('Please select a valid file type (PDF, Word, Image, Text)');
        return;
      }
      
      // Check file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setUploadStatus('File size must be less than 10MB');
        return;
      }
      
      setSelectedFile(file);
      setUploadStatus('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus('Please select a file first');
      return;
    }

    if (!studentNumber) {
      setUploadStatus('Student number not found. Please login again.');
      navigate('/');
      return;
    }

    setIsUploading(true);
    setUploadStatus('Uploading...');

    const formData = new FormData();
    formData.append('document', selectedFile);
    formData.append('studentNumber', studentNumber);

    try {
      const response = await fetch(`${config.API_URL}/api/upload-por-multer`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok) {
        setUploadStatus('File uploaded successfully!');
        setSelectedFile(null);
        
        // Clear file input
        document.getElementById('file-input').value = '';
        
        // Mark proof as uploaded in progress
        const progress = JSON.parse(localStorage.getItem("patientProgress") || "{}");
        const updatedProgress = {
          ...progress,
          proofUploaded: true
        };
        localStorage.setItem("patientProgress", JSON.stringify(updatedProgress));
        
        // Refresh uploaded files list
        fetchUploadedFiles();
      } else {
        setUploadStatus('Error: ' + (data.error || 'Upload failed'));
      }
    } catch (error) {
      setUploadStatus('Error uploading file: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const response = await fetch(`${config.API_URL}/api/download-file/${fileId}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        const errorData = await response.json();
        setUploadStatus('Download failed: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      setUploadStatus('Download error: ' + error.message);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/patient-dashboard');
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <h1>Upload Proof of Registration</h1>
            <button onClick={handleBackToDashboard} className="logout-button">BACK TO DASHBOARD</button>
          </div>
          <p className="welcome-text">Student Number: {studentNumber}</p>
        </div>

        {/* Upload Section */}
        <div className="actions-card">
          <h2>Upload Document</h2>
          <div className="upload-area">
            <input 
              id="file-input"
              type="file" 
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
              onChange={handleFileChange} 
              className="file-input"
              disabled={isUploading}
            />
            
            {selectedFile && (
              <div className="file-preview">
                <p><strong>Selected File:</strong> {selectedFile.name}</p>
                <p><strong>Size:</strong> {formatFileSize(selectedFile.size)}</p>
                <p><strong>Type:</strong> {selectedFile.type}</p>
              </div>
            )}
          </div>
          
          <div className="action-buttons">
            <button 
              onClick={handleUpload} 
              disabled={!selectedFile || isUploading}
              className="action-button primary"
            >
              {isUploading ? 'UPLOADING...' : 'UPLOAD DOCUMENT'}
            </button>
          </div>
        </div>

        {/* Status Message */}
        {uploadStatus && (
          <div className={`status-message ${uploadStatus.includes('Error') ? 'error' : 'success'}`}>
            {uploadStatus}
          </div>
        )}
        
        {/* Uploaded Files Section */}
        {uploadedFiles.length > 0 && (
          <div className="actions-card">
            <h2>Your Uploaded Files</h2>
            <div className="files-list">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="file-item">
                  <div className="file-info">
                    <strong>{file.file_name}</strong>
                    <br />
                    <small>
                      Size: {formatFileSize(file.file_size)} | 
                      Type: {file.mimetype} | 
                      Uploaded: {new Date(file.uploaded_at).toLocaleDateString()}
                    </small>
                  </div>
                  <button
                    onClick={() => handleDownload(file.id, file.file_name)}
                    className="action-button secondary"
                  >
                    Download
                  </button>
                </div>
              ))}
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

        .upload-area {
          border: 2px dashed #e2e8f0;
          border-radius: 12px;
          padding: 24px;
          text-align: center;
          margin-bottom: 20px;
          background: #f8fafc;
        }

        .file-input {
          margin-bottom: 16px;
          padding: 8px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
        }

        .file-preview {
          background: #e8f4fd;
          padding: 16px;
          border-radius: 8px;
          margin-top: 16px;
          border-left: 4px solid #2196f3;
          text-align: left;
        }

        .file-preview p {
          margin: 4px 0;
          font-size: 14px;
        }

        .action-buttons {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-top: 20px;
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
        .action-button.primary:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        .action-button.secondary { 
          background: #28a745; 
          color: white; 
          padding: 8px 16px;
          font-size: 14px;
        }
        .action-button.secondary:hover { 
          background: #218838; 
        }

        .status-message {
          margin: 20px 0;
          padding: 16px;
          border-radius: 8px;
          font-weight: 500;
        }
        .status-message.success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }
        .status-message.error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .files-list {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
        }

        .file-item {
          padding: 16px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .file-item:last-child {
          border-bottom: none;
        }

        .file-info {
          flex: 1;
        }
        .file-info strong {
          color: #0f2b5b;
          font-size: 16px;
        }
        .file-info small {
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
          .action-buttons { 
            flex-direction: column; 
          }
          .file-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default RegistrationCapturePage;