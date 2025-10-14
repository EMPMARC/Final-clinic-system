import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";


function OnboardingPage() {
  const [formData, setFormData] = useState({
    studentNumber: "",
    surname: "",
    fullNames: "",
    dateOfBirth: "",
    gender: "",
    otherGender: "",
    physicalAddress: "",
    postalAddress: "",
    code: "",
    email: "",
    cell: "",
    altNumber: "",
    emergencyName: "",
    emergencyRelation: "",
    emergencyWorkTel: "",
    emergencyCell: "",
    medicalConditions: "",
    operations: "",
    conditionsDetails: "",
    disability: "",
    disabilityDetails: "",
    medication: "",
    medicationDetails: "",
    otherConditions: "",
    congenital: "",
    familyOther: "",
    smoking: "",
    recreation: "",
    psychological: "",
    psychologicalDetails: "",
    date: new Date().toISOString().split('T')[0], // Set to current date
  });

  const signatureRef = useRef(null);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alreadyOnboarded, setAlreadyOnboarded] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Get student number from localStorage (set during login)
  useEffect(() => {
    const studentNumber = 
      localStorage.getItem('studentNumber') || 
      sessionStorage.getItem('studentNumber') ||
      (JSON.parse(localStorage.getItem('user') || '{}')).student_number;
    
    console.log('Retrieved student number:', studentNumber);

    if (studentNumber) {
      setFormData(prev => ({
        ...prev,
        studentNumber: studentNumber
      }));
      
      // Store it in localStorage for consistency
      localStorage.setItem('studentNumber', studentNumber);

      // Check if student is already onboarded
      checkIfOnboarded(studentNumber);
    } else {
      setIsChecking(false);
      // If no student number found, redirect to login
      navigate('/');
    }
  }, [navigate]);

  const checkIfOnboarded = async (studentNumber) => {
    try {
      const response = await fetch('http://localhost:5001/api/check-onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentNumber }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setAlreadyOnboarded(data.exists);
      } else {
        console.error("Failed to check onboarding status:", data.error);
      }
    } catch (error) {
      console.error("Error checking onboarding status:", error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClearSignature = () => {
    const canvas = signatureRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleMouseDown = (e) => {
    const canvas = signatureRef.current;
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    canvas.isDrawing = true;
  };

  const handleMouseMove = (e) => {
    const canvas = signatureRef.current;
    if (!canvas.isDrawing) return;
    const ctx = canvas.getContext("2d");
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };

  const handleMouseUp = () => {
    signatureRef.current.isDrawing = false;
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    const canvas = signatureRef.current;
    const ctx = canvas.getContext("2d");
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
    canvas.isDrawing = true;
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    const canvas = signatureRef.current;
    if (!canvas.isDrawing) return;
    const ctx = canvas.getContext("2d");
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
    ctx.stroke();
  };

  const handleTouchEnd = () => {
    signatureRef.current.isDrawing = false;
  };

  // Function to get signature as base64
  const getSignatureData = () => {
    if (!signatureRef.current) return null;
    return signatureRef.current.toDataURL();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get signature data
      const signatureData = getSignatureData();
      
      // Prepare data to send
      const dataToSend = {
        ...formData,
        signatureData
      };
      
      console.log("Sending data:", dataToSend);
      
      // Send data to backend
      const response = await fetch('http://localhost:5001/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        console.log("Form submitted successfully!", result);
        
        // Mark onboarding as completed in progress
        const progress = JSON.parse(localStorage.getItem("patientProgress") || "{}");
        const updatedProgress = {
          ...progress,
          onboarding: true
        };
        localStorage.setItem("patientProgress", JSON.stringify(updatedProgress));
        
        navigate("/upload-proof");
      } else {
        console.error("Failed to submit form:", result.error);
        alert(`Error: ${result.error}\nDetails: ${result.details || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to submit form. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderRadio = (name, options) =>
    options.map((opt) => (
      <label key={opt} style={{ marginRight: '10px' }}>
        <input
          type="radio"
          name={name}
          value={opt}
          checked={formData[name] === opt}
          onChange={handleChange}
          required
        />
        {opt}
      </label>
    ));

  if (isChecking) {
    return (
      <div style={{ padding: "30px", fontFamily: "Arial", textAlign: "center" }}>
        <h2>Checking your onboarding status...</h2>
      </div>
    );
  }

  if (alreadyOnboarded) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-content">
          {/* Header */}
          <div className="dashboard-header">
            <div className="header-content">
              <h1>Onboarding Complete</h1>
            </div>
            <p className="welcome-text">You have already completed the onboarding process.</p>
          </div>

          {/* Status Card */}
          <div className="actions-card">
            <div style={{ textAlign: "center", padding: "20px" }}>
              <div style={{ 
                fontSize: "48px", 
                color: "#10b981", 
                marginBottom: "16px" 
              }}>
                ✓
              </div>
              <h2 style={{ 
                fontSize: "24px", 
                fontWeight: "600", 
                color: "#0f2b5b", 
                margin: "0 0 8px" 
              }}>
                Onboarding Complete
              </h2>
              <p style={{ 
                color: "#64748b", 
                fontSize: "16px", 
                margin: "0 0 24px" 
              }}>
                Your information is already in our system.
              </p>
              <button 
                onClick={() => navigate("/patient-dashboard")}
                className="action-button primary"
                style={{
                  padding: "15px 40px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  backgroundColor: "#003366",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                }}
              >
                RETURN TO DASHBOARD
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

          .actions-card {
            background: white;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
            margin-bottom: 24px;
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
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "auto", fontFamily: "Arial, sans-serif" }}>
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <h1 style={{ margin: "10px 0" }}>UNIVERSITY OF THE WITWATERSRAND</h1>
        <h2 style={{ margin: "10px 0", fontWeight: "normal" }}>CAMPUS HEALTH & WELLNESS CENTRE</h2>
        <h2 style={{ margin: "10px 0", textDecoration: "underline" }}>CONFIDENTIAL MEDICAL HISTORY: STUDENT</h2>
      </div>

      <form onSubmit={handleSubmit}>
        {/* STUDENT INFORMATION */}
        <fieldset style={{ border: "2px solid #333", padding: "20px", marginBottom: "20px", backgroundColor: "#f5f5f5" }}>
          <legend style={{ fontWeight: "bold", fontSize: "18px", padding: "0 10px" }}>STUDENT INFORMATION</legend>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontWeight: 'bold', marginRight: '8px' }}>Date:</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              readOnly
              style={{
                padding: '8px',
                fontSize: '14px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: '#f5f5f5',
                cursor: 'not-allowed'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontWeight: 'bold', marginRight: '8px' }}>Student Number:</label>
            <span style={{ 
              padding: '8px', 
              backgroundColor: '#f0f0f0', 
              borderRadius: '4px',
              fontWeight: 'bold'
            }}>
              {formData.studentNumber}
            </span>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                SURNAME: <span style={{ color: "red" }}>*</span>
              </label>
              <input 
                name="surname" 
                value={formData.surname} 
                onChange={handleChange} 
                required 
                style={{ width: "100%", padding: "8px", fontSize: "14px" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                FULL NAMES: <span style={{ color: "red" }}>*</span>
              </label>
              <input 
                name="fullNames" 
                value={formData.fullNames} 
                onChange={handleChange} 
                required 
                style={{ width: "100%", padding: "8px", fontSize: "14px" }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontWeight: 'bold', marginRight: '8px' }}>Date of Birth:</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
              style={{
                padding: '8px',
                fontSize: '14px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "10px", fontWeight: "bold" }}>
              GENDER: <span style={{ color: "red" }}>*</span>
            </label>
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
              {renderRadio("gender", ["Male", "Female", "Other"])}
            </div>
            {formData.gender === "Other" && (
              <input
                name="otherGender"
                placeholder="Please specify"
                value={formData.otherGender}
                onChange={handleChange}
                style={{ width: "100%", padding: "8px", fontSize: "14px", marginTop: "10px" }}
              />
            )}
          </div>
        </fieldset>

        {/* CONTACT DETAILS */}
        <fieldset style={{ border: "2px solid #333", padding: "20px", marginBottom: "20px", backgroundColor: "#f5f5f5" }}>
          <legend style={{ fontWeight: "bold", fontSize: "18px", padding: "0 10px" }}>CONTACT DETAILS</legend>
          
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              PHYSICAL ADDRESS: <span style={{ color: "red" }}>*</span>
            </label>
            <input 
              name="physicalAddress" 
              value={formData.physicalAddress} 
              onChange={handleChange} 
              required 
              style={{ width: "100%", padding: "8px", fontSize: "14px" }}
            />
          </div>
          
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              POSTAL ADDRESS: <span style={{ color: "red" }}>*</span>
            </label>
            <input 
              name="postalAddress" 
              value={formData.postalAddress} 
              onChange={handleChange} 
              required 
              style={{ width: "100%", padding: "8px", fontSize: "14px" }}
            />
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px", marginBottom: "15px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                CODE: <span style={{ color: "red" }}>*</span>
              </label>
              <input 
                name="code" 
                value={formData.code} 
                onChange={handleChange} 
                required 
                style={{ width: "100%", padding: "8px", fontSize: "14px" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                EMAIL: <span style={{ color: "red" }}>*</span>
              </label>
              <input 
                name="email" 
                type="email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
                style={{ width: "100%", padding: "8px", fontSize: "14px" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                CELL: <span style={{ color: "red" }}>*</span>
              </label>
              <input 
                name="cell" 
                value={formData.cell} 
                onChange={handleChange} 
                required 
                style={{ width: "100%", padding: "8px", fontSize: "14px" }}
              />
            </div>
          </div>
          
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              ALTERNATIVE NUMBER:
            </label>
            <input 
              name="altNumber" 
              value={formData.altNumber} 
              onChange={handleChange} 
              style={{ width: "100%", padding: "8px", fontSize: "14px" }}
            />
          </div>
        </fieldset>

        {/* EMERGENCY CONTACT */}
        <fieldset style={{ border: "2px solid #333", padding: "20px", marginBottom: "20px", backgroundColor: "#f5f5f5" }}>
          <legend style={{ fontWeight: "bold", fontSize: "18px", padding: "0 10px" }}>FRIEND/RELATIVE TO BE CONTACTED IN AN EMERGENCY</legend>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                NAME: <span style={{ color: "red" }}>*</span>
              </label>
              <input 
                name="emergencyName" 
                value={formData.emergencyName} 
                onChange={handleChange} 
                required 
                style={{ width: "100%", padding: "8px", fontSize: "14px" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                RELATIONSHIP: <span style={{ color: "red" }}>*</span>
              </label>
              <input 
                name="emergencyRelation" 
                value={formData.emergencyRelation} 
                onChange={handleChange} 
                required 
                style={{ width: "100%", padding: "8px", fontSize: "14px" }}
              />
            </div>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                WORK TEL:
              </label>
              <input 
                name="emergencyWorkTel" 
                value={formData.emergencyWorkTel} 
                onChange={handleChange} 
                style={{ width: "100%", padding: "8px", fontSize: "14px" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                CELL NO: <span style={{ color: "red" }}>*</span>
              </label>
              <input 
                name="emergencyCell" 
                value={formData.emergencyCell} 
                onChange={handleChange} 
                required 
                style={{ width: "100%", padding: "8px", fontSize: "14px" }}
              />
            </div>
          </div>
        </fieldset>

        {/* MEDICAL HISTORY */}
        <fieldset style={{ border: "2px solid #333", padding: "20px", marginBottom: "20px", backgroundColor: "#f5f5f5" }}>
          <legend style={{ fontWeight: "bold", fontSize: "18px", padding: "0 10px" }}>PLEASE INDICATE IF YOU HAVE A HISTORY OF THE FOLLOWING CONDITIONS</legend>
          
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "10px", fontWeight: "bold" }}>
              ANY MEDICAL CONDITIONS: <span style={{ color: "red" }}>*</span>
            </label>
            <div style={{ display: "flex", gap: "20px" }}>
              {renderRadio("medicalConditions", ["Yes", "No"])}
            </div>
          </div>
          
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "10px", fontWeight: "bold" }}>
              ANY OPERATIONS/SURGERY: <span style={{ color: "red" }}>*</span>
            </label>
            <div style={{ display: "flex", gap: "20px" }}>
              {renderRadio("operations", ["Yes", "No"])}
            </div>
          </div>
          
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              IF YES TO ANY OF THE ABOVE, PLEASE SPECIFY:
            </label>
            <textarea 
              name="conditionsDetails" 
              value={formData.conditionsDetails} 
              onChange={handleChange} 
              rows="3"
              style={{ width: "100%", padding: "8px", fontSize: "14px" }}
            />
          </div>
          
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "10px", fontWeight: "bold" }}>
              DO YOU HAVE ANY DISABILITIES? <span style={{ color: "red" }}>*</span>
            </label>
            <div style={{ display: "flex", gap: "20px", marginBottom: "10px" }}>
              {renderRadio("disability", ["Yes", "No"])}
            </div>
            <input
              name="disabilityDetails"
              placeholder="Please specify"
              value={formData.disabilityDetails}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px", fontSize: "14px" }}
            />
          </div>
          
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "10px", fontWeight: "bold" }}>
              ARE YOU ON MEDICATION? <span style={{ color: "red" }}>*</span>
            </label>
            <div style={{ display: "flex", gap: "20px", marginBottom: "10px" }}>
              {renderRadio("medication", ["Yes", "No"])}
            </div>
            <input
              name="medicationDetails"
              placeholder="Please specify"
              value={formData.medicationDetails}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px", fontSize: "14px" }}
            />
          </div>
          
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              DO YOU HAVE ANY OTHER CONDITION TO INFORM US OF?
            </label>
            <textarea 
              name="otherConditions" 
              value={formData.otherConditions} 
              onChange={handleChange} 
              rows="3"
              style={{ width: "100%", padding: "8px", fontSize: "14px" }}
            />
          </div>
        </fieldset>

        {/* FAMILY HISTORY */}
        <fieldset style={{ border: "2px solid #333", padding: "20px", marginBottom: "20px", backgroundColor: "#f5f5f5" }}>
          <legend style={{ fontWeight: "bold", fontSize: "18px", padding: "0 10px" }}>FAMILY HISTORY</legend>
          
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "10px", fontWeight: "bold" }}>
              CONGENITAL DISEASES: <span style={{ color: "red" }}>*</span>
            </label>
            <div style={{ display: "flex", gap: "20px" }}>
              {renderRadio("congenital", ["Yes", "No"])}
            </div>
          </div>
          
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              OTHER (PLEASE SPECIFY):
            </label>
            <input 
              name="familyOther" 
              value={formData.familyOther} 
              onChange={handleChange} 
              style={{ width: "100%", padding: "8px", fontSize: "14px" }}
            />
          </div>
        </fieldset>

        {/* LIFESTYLE */}
        <fieldset style={{ border: "2px solid #333", padding: "20px", marginBottom: "20px", backgroundColor: "#f5f5f5" }}>
          <legend style={{ fontWeight: "bold", fontSize: "18px", padding: "0 10px" }}>LIFESTYLE</legend>
          
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "10px", fontWeight: "bold" }}>
              SMOKING? <span style={{ color: "red" }}>*</span>
            </label>
            <div style={{ display: "flex", gap: "20px" }}>
              {renderRadio("smoking", ["Yes", "No"])}
            </div>
          </div>
          
          <div>
            <label style={{ display: "block", marginBottom: "10px", fontWeight: "bold" }}>
              RECREATIONAL ACTIVITIES? <span style={{ color: "red" }}>*</span>
            </label>
            <div style={{ display: "flex", gap: "20px" }}>
              {renderRadio("recreation", ["Yes", "No"])}
            </div>
          </div>
        </fieldset>

        {/* MENTAL HEALTH */}
        <fieldset style={{ border: "2px solid #333", padding: "20px", marginBottom: "20px", backgroundColor: "#f5f5f5" }}>
          <legend style={{ fontWeight: "bold", fontSize: "18px", padding: "0 10px" }}>MENTAL HEALTH</legend>
          
          <div>
            <label style={{ display: "block", marginBottom: "10px", fontWeight: "bold" }}>
              PSYCHOLOGICAL PROBLEMS? <span style={{ color: "red" }}>*</span>
            </label>
            <div style={{ display: "flex", gap: "20px", marginBottom: "10px" }}>
              {renderRadio("psychological", ["Yes", "No"])}
            </div>
            <input
              name="psychologicalDetails"
              placeholder="Please give details"
              value={formData.psychologicalDetails}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px", fontSize: "14px" }}
            />
          </div>
        </fieldset>

        {/* SIGNATURE */}
        <fieldset style={{ border: "2px solid #333", padding: "20px", marginBottom: "20px", backgroundColor: "#f5f5f5" }}>
          <legend style={{ fontWeight: "bold", fontSize: "18px", padding: "0 10px" }}>SIGNATURE</legend>
          
          <p style={{ marginBottom: "15px" }}>Please sign below to confirm the information provided:</p>
          <canvas
            ref={signatureRef}
            width={600}
            height={150}
            style={{
              border: "1px solid #000",
              display: "block",
              marginBottom: "16px",
              cursor: "crosshair",
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          ></canvas>
          
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              onClick={handleClearSignature}
              style={{
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                padding: "8px 16px",
                cursor: "pointer",
                borderRadius: "4px",
              }}
            >
              Clear Signature
            </button>
          </div>
        </fieldset>

        <div style={{ textAlign: "center", marginTop: "30px", marginBottom: "20px" }}>
          <button 
            type="submit" 
            disabled={isSubmitting}
            style={{ 
              padding: "15px 40px", 
              fontSize: "16px", 
              fontWeight: "bold",
              backgroundColor: isSubmitting ? "#ccc" : "#003366",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
            }}
          >
            {isSubmitting ? "SUBMITTING..." : "SUBMIT AND CONTINUE"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default OnboardingPage;