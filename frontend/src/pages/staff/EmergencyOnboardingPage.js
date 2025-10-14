import config from '../../config';
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const EmergencyOnboardingPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");

    // Validate required fields based on the actual form
    const requiredFields = [
      'date', 'timeOfCall', 'personResponsible', 'callerName', 'department',
      'contactNumber', 'problemNature', 'staffInformed', 'notificationTime',
      'teamResponding', 'timeLeftClinic', 'arrivalTime', 'studentNumber',
      'patientName', 'patientSurname', 'primaryAssessment', 'intervention',
      'medicalConsent', 'transportConsent', 'signature', 'consentDate',
      'patientTransportedTo', 'departureTime', 'chwcArrivalTime',
      'existingFile', 'referred', 'dischargeCondition', 'dischargeTime'
    ];

    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      setSubmitMessage(`Error: Missing required fields: ${missingFields.join(', ')}`);
      setIsSubmitting(false);
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    try {
      // Prepare the data for submission matching the physical form structure
      const submissionData = {
        // Emergency Report Section
        date: formData.date,
        timeOfCall: formData.timeOfCall,
        personResponsible: formData.personResponsible,
        callerName: formData.callerName,
        department: formData.department,
        contactNumber: formData.contactNumber,
        problemNature: formData.problemNature,
        
        // Location of Emergency
        eastCampus: formData.eastCampus || false,
        westCampus: formData.westCampus || false,
        educationCampus: formData.educationCampus || false,
        otherCampus: formData.otherCampus || false,
        building: formData.building || '',
        roomNumber: formData.roomNumber || '',
        floor: formData.floor || '',
        otherLocation: formData.otherLocation || '',
        
        // Hand Over
        staffInformed: formData.staffInformed,
        notificationTime: formData.notificationTime,
        teamResponding: formData.teamResponding,
        timeLeftClinic: formData.timeLeftClinic,
        
        // Responding Team Transport
        chwcVehicle: formData.chwcVehicle || false,
        sistersOnFoot: formData.sistersOnFoot || false,
        otherTransport: formData.otherTransport || false,
        otherTransportDetail: formData.otherTransportDetail || '',
        
        // On Site Emergency Management
        arrivalTime: formData.arrivalTime,
        
        // Patient Information
        studentNumber: formData.studentNumber,
        patientName: formData.patientName,
        patientSurname: formData.patientSurname,
        
        // Primary Assessment & Intervention
        primaryAssessment: formData.primaryAssessment,
        intervention: formData.intervention,
        
        // Consent
        medicalConsent: formData.medicalConsent,
        transportConsent: formData.transportConsent,
        signature: formData.signature,
        consentDate: formData.consentDate,
        
        // Patient Transport
        ptCHWCVehicle: formData.ptCHWCVehicle || false,
        ptAmbulance: formData.ptAmbulance || false,
        ptOther: formData.ptOther || false,
        ptOtherDetail: formData.ptOtherDetail || '',
        patientTransportedTo: formData.patientTransportedTo,
        departureTime: formData.departureTime,
        
        // Case Management at CHWC
        chwcArrivalTime: formData.chwcArrivalTime,
        existingFile: formData.existingFile,
        referred: formData.referred,
        hospitalName: formData.hospitalName || '',
        dischargeCondition: formData.dischargeCondition,
        dischargeTime: formData.dischargeTime
      };

      console.log('Submitting emergency report:', submissionData);

      const response = await fetch(`${config.API_URL}/api/emergency-onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("Emergency Report Submitted:", result);
        setSubmitMessage("Emergency report submitted successfully!");
        alert("Emergency report submitted successfully!");
        
        // Reset the form
        setFormData({});
        // Reset form elements
        e.target.reset();
      } else {
        console.error("Submission error:", result);
        setSubmitMessage(`Error: ${result.error} - ${result.details || ''}`);
        alert(`Error: ${result.error}\n${result.details || ''}`);
      }
    } catch (error) {
      console.error("Network error:", error);
      setSubmitMessage("Network error. Please check your connection and try again.");
      alert("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "auto", fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <div style={{ textAlign: "center", flex: 1 }}>
          <h1 style={{ margin: "10px 0" }}>UNIVERSITY OF THE WITWATERSRAND</h1>
          <h2 style={{ margin: "10px 0", fontWeight: "normal" }}>CAMPUS HEALTH & WELLNESS CENTRE</h2>
          <h2 style={{ margin: "10px 0", textDecoration: "underline" }}>EMERGENCY REPORT</h2>
        </div>
        <button 
          onClick={() => navigate("/admin-dashboard")}
          style={{
            padding: "15px 40px",
            backgroundColor: "#003366",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "16px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            marginLeft: "20px"
          }}
        >
          BACK TO DASHBOARD
        </button>
      </div>
      
      {submitMessage && (
        <div style={{
          padding: "15px",
          margin: "20px 0",
          backgroundColor: submitMessage.includes("Error") ? "#ffebee" : "#e8f5e9",
          border: submitMessage.includes("Error") ? "2px solid #f44336" : "2px solid #4caf50",
          color: submitMessage.includes("Error") ? "#d32f2f" : "#2e7d32",
          borderRadius: "5px",
          fontWeight: "bold"
        }}>
          {submitMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* EMERGENCY REPORT */}
        <fieldset style={{ border: "2px solid #333", padding: "20px", marginBottom: "20px", backgroundColor: "#f5f5f5" }}>
          <legend style={{ fontWeight: "bold", fontSize: "18px", padding: "0 10px" }}>EMERGENCY REPORT</legend>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                DATE: <span style={{ color: "red" }}>*</span>
              </label>
              <input 
                type="date" 
                name="date" 
                onChange={handleChange} 
                required 
                style={{ width: "100%", padding: "8px", fontSize: "14px" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                TIME OF CALL: <span style={{ color: "red" }}>*</span>
              </label>
              <input 
                type="time" 
                name="timeOfCall" 
                onChange={handleChange} 
                required 
                style={{ width: "100%", padding: "8px", fontSize: "14px" }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              PERSON RESPONSIBLE FOR TAKING THE CALL: <span style={{ color: "red" }}>*</span>
            </label>
            <input 
              type="text" 
              name="personResponsible" 
              onChange={handleChange} 
              required 
              style={{ width: "100%", padding: "8px", fontSize: "14px" }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              NAME OF PERSON CALLING: <span style={{ color: "red" }}>*</span>
            </label>
            <input 
              type="text" 
              name="callerName" 
              onChange={handleChange} 
              required 
              style={{ width: "100%", padding: "8px", fontSize: "14px" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                DEPARTMENT: <span style={{ color: "red" }}>*</span>
              </label>
              <input 
                type="text" 
                name="department" 
                onChange={handleChange} 
                required 
                style={{ width: "100%", padding: "8px", fontSize: "14px" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                CONTACT NUMBER: <span style={{ color: "red" }}>*</span>
              </label>
              <input 
                type="tel" 
                name="contactNumber" 
                onChange={handleChange} 
                required 
                style={{ width: "100%", padding: "8px", fontSize: "14px" }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              NATURE OF THE PROBLEM (if known): <span style={{ color: "red" }}>*</span>
            </label>
            <textarea 
              name="problemNature" 
              onChange={handleChange} 
              required 
              rows="4"
              style={{ width: "100%", padding: "8px", fontSize: "14px" }}
            ></textarea>
          </div>
        </fieldset>

        {/* LOCATION OF EMERGENCY */}
        <fieldset style={{ border: "2px solid #333", padding: "20px", marginBottom: "20px", backgroundColor: "#f5f5f5" }}>
          <legend style={{ fontWeight: "bold", fontSize: "18px", padding: "0 10px" }}>LOCATION OF EMERGENCY</legend>
          
          <div style={{ display: "flex", gap: "20px", marginBottom: "15px", flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <input type="checkbox" name="eastCampus" onChange={handleChange} />
              <span style={{ fontWeight: "bold" }}>EAST CAMPUS</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <input type="checkbox" name="westCampus" onChange={handleChange} />
              <span style={{ fontWeight: "bold" }}>WEST CAMPUS</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <input type="checkbox" name="educationCampus" onChange={handleChange} />
              <span style={{ fontWeight: "bold" }}>EDUCATION CAMPUS</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <input type="checkbox" name="otherCampus" onChange={handleChange} />
              <span style={{ fontWeight: "bold" }}>OTHER</span>
            </label>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>BUILDING:</label>
              <input 
                type="text" 
                name="building" 
                onChange={handleChange} 
                style={{ width: "100%", padding: "8px", fontSize: "14px" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>FLOOR:</label>
              <input 
                type="text" 
                name="floor" 
                onChange={handleChange} 
                style={{ width: "100%", padding: "8px", fontSize: "14px" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>ROOM NUMBER:</label>
              <input 
                type="text" 
                name="roomNumber" 
                onChange={handleChange} 
                style={{ width: "100%", padding: "8px", fontSize: "14px" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>OTHER:</label>
              <input 
                type="text" 
                name="otherLocation" 
                onChange={handleChange} 
                style={{ width: "100%", padding: "8px", fontSize: "14px" }}
              />
            </div>
          </div>
        </fieldset>

        {/* HAND OVER */}
        <fieldset style={{ border: "2px solid #333", padding: "20px", marginBottom: "20px", backgroundColor: "#f5f5f5" }}>
          <legend style={{ fontWeight: "bold", fontSize: "18px", padding: "0 10px" }}>HAND OVER</legend>
          
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              CLINICAL STAFF MEMBER INFORMED: <span style={{ color: "red" }}>*</span>
            </label>
            <input 
              type="text" 
              name="staffInformed" 
              onChange={handleChange} 
              required 
              style={{ width: "100%", padding: "8px", fontSize: "14px" }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              TIME OF NOTIFICATION: <span style={{ color: "red" }}>*</span>
            </label>
            <input 
              type="time" 
              name="notificationTime" 
              onChange={handleChange} 
              required 
              style={{ width: "100%", padding: "8px", fontSize: "14px" }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              CLINICAL TEAM RESPONDING: <span style={{ color: "red" }}>*</span>
            </label>
            <input 
              type="text" 
              name="teamResponding" 
              onChange={handleChange} 
              required 
              style={{ width: "100%", padding: "8px", fontSize: "14px" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              TIME WHEN CLINICAL TEAM LEFT THE CLINIC: <span style={{ color: "red" }}>*</span>
            </label>
            <input 
              type="time" 
              name="timeLeftClinic" 
              onChange={handleChange} 
              required 
              style={{ width: "100%", padding: "8px", fontSize: "14px" }}
            />
          </div>
        </fieldset>

        {/* RESPONDING TEAM TRANSPORT */}
        <fieldset style={{ border: "2px solid #333", padding: "20px", marginBottom: "20px", backgroundColor: "#f5f5f5" }}>
          <legend style={{ fontWeight: "bold", fontSize: "18px", padding: "0 10px" }}>RESPONDING TEAM TRANSPORT</legend>
          
          <div style={{ display: "flex", gap: "20px", marginBottom: "15px", flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <input type="checkbox" name="chwcVehicle" onChange={handleChange} />
              <span style={{ fontWeight: "bold" }}>CHWC VEHICLE</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <input type="checkbox" name="sistersOnFoot" onChange={handleChange} />
              <span style={{ fontWeight: "bold" }}>SISTERS ON FOOT</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <input type="checkbox" name="otherTransport" onChange={handleChange} />
              <span style={{ fontWeight: "bold" }}>OTHER</span>
            </label>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>PLEASE SPECIFY:</label>
            <input 
              type="text" 
              name="otherTransportDetail" 
              onChange={handleChange} 
              placeholder="If other, please specify"
              style={{ width: "100%", padding: "8px", fontSize: "14px" }}
            />
          </div>
        </fieldset>

        {/* ON SITE EMERGENCY MANAGEMENT */}
        <fieldset style={{ border: "2px solid #333", padding: "20px", marginBottom: "20px", backgroundColor: "#f5f5f5" }}>
          <legend style={{ fontWeight: "bold", fontSize: "18px", padding: "0 10px" }}>ON SITE EMERGENCY MANAGEMENT</legend>
          
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              TIME OF ARRIVAL ON SITE: <span style={{ color: "red" }}>*</span>
            </label>
            <input 
              type="time" 
              name="arrivalTime" 
              onChange={handleChange} 
              required 
              style={{ width: "100%", padding: "8px", fontSize: "14px" }}
            />
          </div>
        </fieldset>

        {/* PATIENT INFORMATION */}
        <fieldset style={{ border: "2px solid #333", padding: "20px", marginBottom: "20px", backgroundColor: "#f5f5f5" }}>
          <legend style={{ fontWeight: "bold", fontSize: "18px", padding: "0 10px" }}>PATIENT INFORMATION</legend>
          
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              STUDENT NUMBER: <span style={{ color: "red" }}>*</span>
            </label>
            <input 
              type="text" 
              name="studentNumber" 
              onChange={handleChange} 
              required 
              style={{ width: "100%", padding: "8px", fontSize: "14px" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                NAME: <span style={{ color: "red" }}>*</span>
              </label>
              <input 
                type="text" 
                name="patientName" 
                onChange={handleChange} 
                required 
                style={{ width: "100%", padding: "8px", fontSize: "14px" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                SURNAME: <span style={{ color: "red" }}>*</span>
              </label>
              <input 
                type="text" 
                name="patientSurname" 
                onChange={handleChange} 
                required 
                style={{ width: "100%", padding: "8px", fontSize: "14px" }}
              />
            </div>
          </div>
        </fieldset>

        {/* PRIMARY ASSESSMENT */}
        <fieldset style={{ border: "2px solid #333", padding: "20px", marginBottom: "20px", backgroundColor: "#f5f5f5" }}>
          <legend style={{ fontWeight: "bold", fontSize: "18px", padding: "0 10px" }}>PRIMARY ASSESSMENT</legend>
          <textarea 
            name="primaryAssessment" 
            onChange={handleChange} 
            required 
            rows="4"
            style={{ width: "100%", padding: "8px", fontSize: "14px" }}
          ></textarea>
        </fieldset>

        {/* INTERVENTION */}
        <fieldset style={{ border: "2px solid #333", padding: "20px", marginBottom: "20px", backgroundColor: "#f5f5f5" }}>
          <legend style={{ fontWeight: "bold", fontSize: "18px", padding: "0 10px" }}>INTERVENTION</legend>
          <textarea 
            name="intervention" 
            onChange={handleChange} 
            required 
            rows="4"
            style={{ width: "100%", padding: "8px", fontSize: "14px" }}
          ></textarea>
        </fieldset>

        {/* CONSENT */}
        <fieldset style={{ border: "2px solid #333", padding: "20px", marginBottom: "20px", backgroundColor: "#f5f5f5" }}>
          <legend style={{ fontWeight: "bold", fontSize: "18px", padding: "0 10px" }}>CONSENT</legend>
          
          <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "white", border: "1px solid #ccc" }}>
            <p style={{ marginBottom: "10px" }}>
              I hereby{" "}
              <select name="medicalConsent" onChange={handleChange} required style={{ padding: "5px", fontSize: "14px", fontWeight: "bold" }}>
                <option value="">--Select--</option>
                <option value="give">give consent</option>
                <option value="doNotGive">do not give consent</option>
              </select>{" "}
              to receive medical treatment from Campus Health and Wellness Centre medical personnel.
            </p>
          </div>

          <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "white", border: "1px solid #ccc" }}>
            <p style={{ marginBottom: "10px" }}>
              I hereby{" "}
              <select name="transportConsent" onChange={handleChange} required style={{ padding: "5px", fontSize: "14px", fontWeight: "bold" }}>
                <option value="">--Select--</option>
                <option value="consent">consent</option>
                <option value="doNotConsent">do not consent</option>
              </select>{" "}
              to being transported to Campus Health and Wellness Centre for further assistance.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                SIGNATURE: <span style={{ color: "red" }}>*</span>
              </label>
              <input 
                type="text" 
                name="signature" 
                onChange={handleChange} 
                required 
                placeholder="Type full name as signature"
                style={{ width: "100%", padding: "8px", fontSize: "14px" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                DATE: <span style={{ color: "red" }}>*</span>
              </label>
              <input 
                type="date" 
                name="consentDate" 
                onChange={handleChange} 
                required 
                style={{ width: "100%", padding: "8px", fontSize: "14px" }}
              />
            </div>
          </div>
        </fieldset>

        {/* PATIENT TRANSPORT */}
        <fieldset style={{ border: "2px solid #333", padding: "20px", marginBottom: "20px", backgroundColor: "#f5f5f5" }}>
          <legend style={{ fontWeight: "bold", fontSize: "18px", padding: "0 10px" }}>PATIENT TRANSPORT</legend>
          
          <div style={{ display: "flex", gap: "20px", marginBottom: "15px", flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <input type="checkbox" name="ptCHWCVehicle" onChange={handleChange} />
              <span style={{ fontWeight: "bold" }}>CHWC VEHICLE</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <input type="checkbox" name="ptAmbulance" onChange={handleChange} />
              <span style={{ fontWeight: "bold" }}>AMBULANCE</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <input type="checkbox" name="ptOther" onChange={handleChange} />
              <span style={{ fontWeight: "bold" }}>OTHER</span>
            </label>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>IF OTHER PLEASE SPECIFY:</label>
            <input 
              type="text" 
              name="ptOtherDetail" 
              onChange={handleChange} 
              style={{ width: "100%", padding: "8px", fontSize: "14px" }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              PATIENT TRANSPORTED TO: <span style={{ color: "red" }}>*</span>
            </label>
            <input 
              type="text" 
              name="patientTransportedTo" 
              onChange={handleChange} 
              required 
              style={{ width: "100%", padding: "8px", fontSize: "14px" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              TIME OF DEPARTURE FROM SITE: <span style={{ color: "red" }}>*</span>
            </label>
            <input 
              type="time" 
              name="departureTime" 
              onChange={handleChange} 
              required 
              style={{ width: "100%", padding: "8px", fontSize: "14px" }}
            />
          </div>
        </fieldset>

        {/* CASE MANAGEMENT AT CHWC */}
        <fieldset style={{ border: "2px solid #333", padding: "20px", marginBottom: "20px", backgroundColor: "#f5f5f5" }}>
          <legend style={{ fontWeight: "bold", fontSize: "18px", padding: "0 10px" }}>CASE MANAGEMENT AT CHWC</legend>
          
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              TIME OF ARRIVAL AT CHWC: <span style={{ color: "red" }}>*</span>
            </label>
            <input 
              type="time" 
              name="chwcArrivalTime" 
              onChange={handleChange} 
              required 
              style={{ width: "100%", padding: "8px", fontSize: "14px" }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "10px", fontWeight: "bold" }}>
              DOES THE PATIENT HAVE AN EXISTING FILE? <span style={{ color: "red" }}>*</span>
            </label>
            <div style={{ display: "flex", gap: "20px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <input type="radio" name="existingFile" value="yes" onChange={handleChange} required />
                <span>YES</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <input type="radio" name="existingFile" value="no" onChange={handleChange} required />
                <span>NO</span>
              </label>
            </div>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "10px", fontWeight: "bold" }}>
              WAS THE PATIENT REFERRED? <span style={{ color: "red" }}>*</span>
            </label>
            <div style={{ display: "flex", gap: "20px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <input type="radio" name="referred" value="yes" onChange={handleChange} required />
                <span>YES</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <input type="radio" name="referred" value="no" onChange={handleChange} required />
                <span>NO</span>
              </label>
            </div>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              IF HOSPITAL, NAME OF THE HOSPITAL:
            </label>
            <input 
              type="text" 
              name="hospitalName" 
              onChange={handleChange} 
              style={{ width: "100%", padding: "8px", fontSize: "14px" }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              CONDITION OF PATIENT ON DISCHARGE: <span style={{ color: "red" }}>*</span>
            </label>
            <textarea 
              name="dischargeCondition" 
              onChange={handleChange} 
              required 
              rows="3"
              style={{ width: "100%", padding: "8px", fontSize: "14px" }}
            ></textarea>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              TIME OF DISCHARGE FROM CHWC: <span style={{ color: "red" }}>*</span>
            </label>
            <input 
              type="time" 
              name="dischargeTime" 
              onChange={handleChange} 
              required 
              style={{ width: "100%", padding: "8px", fontSize: "14px" }}
            />
          </div>
        </fieldset>

        <div style={{ textAlign: "center", marginTop: "30px", marginBottom: "20px" }}>
          <button 
            type="submit" 
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
            disabled={isSubmitting}
          >
            {isSubmitting ? "SUBMITTING..." : "SUBMIT EMERGENCY REPORT"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmergencyOnboardingPage;