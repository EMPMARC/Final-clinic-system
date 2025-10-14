import React, { useState } from "react";

const box = {
  width: "100%",
  minHeight: 90,
  padding: 12,
  border: "1px solid #d0d7de",
  borderRadius: 10,
  resize: "vertical",
};

export default function ClinicalRecordsPage() {
  const [form, setForm] = useState({
    mainComplaint: "",
    assessment: "",
    diagnosis: "",
    management: "",
    medication: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();

    // temporary local save so you can test without a DB
    const existing = JSON.parse(localStorage.getItem("clinicalRecords") || "[]");
    existing.push({ ...form, savedAt: new Date().toISOString() });
    localStorage.setItem("clinicalRecords", JSON.stringify(existing));

    alert("Record saved (temporary). We’ll hook this to the database later.");
    setForm({
      mainComplaint: "",
      assessment: "",
      diagnosis: "",
      management: "",
      medication: "",
    });
  };

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 6, color: "#0b5cab" }}>
        Clinical Records (Nurses / Clinicians Only)
      </h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Please complete the patient’s clinical note below.
      </p>

      <form onSubmit={handleSave} style={{ display: "grid", gap: 16, marginTop: 18 }}>
        <div>
          <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>
            1) Main Complaint
          </label>
          <textarea
            name="mainComplaint"
            value={form.mainComplaint}
            onChange={handleChange}
            style={box}
            required
          />
        </div>

        <div>
          <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>
            2) Assessment / Examination
          </label>
          <textarea
            name="assessment"
            value={form.assessment}
            onChange={handleChange}
            style={box}
            required
          />
        </div>

        <div>
          <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>
            3) Diagnosis
          </label>
          <textarea
            name="diagnosis"
            value={form.diagnosis}
            onChange={handleChange}
            style={box}
            required
          />
        </div>

        <div>
          <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>
            4) Management
          </label>
          <textarea
            name="management"
            value={form.management}
            onChange={handleChange}
            style={box}
            required
          />
        </div>

        <div>
          <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>
            5) Medication
          </label>
          <textarea
            name="medication"
            value={form.medication}
            onChange={handleChange}
            style={box}
            required
          />
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            type="submit"
            style={{
              background: "#0b5cab",
              color: "#fff",
              border: 0,
              padding: "10px 16px",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Save Record
          </button>
          <button
            type="button"
            onClick={() =>
              setForm({
                mainComplaint: "",
                assessment: "",
                diagnosis: "",
                management: "",
                medication: "",
              })
            }
            style={{
              background: "#eee",
              color: "#333",
              border: "1px solid #d0d7de",
              padding: "10px 16px",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}