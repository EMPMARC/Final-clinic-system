require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const app = express();
const PORT = process.env.PORT || 5001;



app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// PostgreSQL Connection with environment variables
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 5,  // Reduced pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  allowExitOnIdle: false  // Keep pool alive
});

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
// Test database connection
// Test database connection
db.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.error('Error connecting to PostgreSQL:', err);
    return;
  }
  console.log('Connected to PostgreSQL Database!');
  console.log('Database time:', result.rows[0].now);
  // Ensure POR uploads table and approval columns exist at startup
  ensurePorTableExists(() => ensurePorApprovalColumns());
  // Ensure Emergencies table exists at startup
  ensureEmergenciesTableExists();
  ensureAppointmentsTableExists();
});
// Ensure Appointments table exists (idempotent)
function ensureAppointmentsTableExists(callback) {
  const createSql = `
    CREATE TABLE IF NOT EXISTS appointments (
      id SERIAL PRIMARY KEY,
      reference_number VARCHAR(50) NOT NULL,
      student_number VARCHAR(50) NOT NULL,
      appointment_type VARCHAR(100) NOT NULL,
      appointment_for VARCHAR(100) NOT NULL,
      appointment_date DATE NULL,
      appointment_time TIME NOT NULL,
      previous_appointment_ref VARCHAR(50) NULL,
      status VARCHAR(20) DEFAULT 'scheduled',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  db.query(createSql, (err) => {
    if (err) {
      console.error('Error ensuring Appointments table exists:', err);
    } else {
      console.log('Appointments table is ready');
    }
    if (typeof callback === 'function') callback();
  });
}

// Chart canvas setup
const width = 600;
const height = 400;
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

// 🔹 Helper function: Draws a clean table
function drawTable(doc, headers, rows, columnPositions) {
  const tableTop = doc.y;
  const rowHeight = 20;

  // Header row
  doc.font("Helvetica-Bold").fontSize(12);
  headers.forEach((header, i) => {
    doc.text(header, columnPositions[i], tableTop);
  });

  // Line under header
  doc.moveTo(columnPositions[0], tableTop + 15).lineTo(550, tableTop + 15).stroke();

  // Data rows
  doc.font("Helvetica").fontSize(11);
  let y = tableTop + 25;

  rows.forEach(row => {
    row.forEach((cell, i) => {
      doc.text(cell.toString(), columnPositions[i], y);
    });

    // Optional row separator
    doc.moveTo(columnPositions[0], y + 15).lineTo(550, y + 15)
       .dash(1, { space: 2 }).stroke().undash();

    y += rowHeight;
  });

  doc.moveDown();
}

// Test route
app.get('/', (req, res) => {
  res.send('Backend is working!');
});

// Add this after your other middleware
// Configure multer for file uploads
// Files are stored persistently in the uploads directory and will survive server restarts
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Use timestamp + original name to ensure unique filenames
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const extAllowed = /(\.jpeg|\.jpg|\.png|\.pdf|\.doc|\.docx|\.txt)$/i.test(file.originalname);
    const mimeAllowed = /^(image\/|application\/pdf|application\/msword|application\/vnd\.openxmlformats\-officedocument\.wordprocessingml\.document|text\/plain)/.test(file.mimetype);
    if (extAllowed || mimeAllowed) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type'));
  }
});

// Ensure POR table has approval columns (compatible with older MySQL)
function ensurePorApprovalColumns(callback) {
  const checkSql = `
    SELECT COLUMN_NAME FROM information_schema.COLUMNS 
    WHERE TABLE_NAME = 'por_uploads' 
      AND COLUMN_NAME IN ('approval_status','approved_at')
  `;
  db.query(checkSql, (err, results) => {
    if (err) {
      console.error('Error checking POR columns:', err);
      if (typeof callback === 'function') callback();
      return;
    }
    const existing = new Set(results.rows.map(r => r.column_name));
    const tasks = [];
    if (!existing.has('approval_status')) {
      tasks.push(cb => db.query(
        "ALTER TABLE por_uploads ADD COLUMN approval_status VARCHAR(20) DEFAULT 'pending' CHECK (approval_status IN ('pending','approved','rejected'))",
        (e) => { if (e) console.error('Error adding approval_status:', e); cb(); }
      ));
    }
    if (!existing.has('approved_at')) {
      tasks.push(cb => db.query(
        "ALTER TABLE por_uploads ADD COLUMN approved_at TIMESTAMP NULL",
        (e) => { if (e) console.error('Error adding approved_at:', e); cb(); }
      ));
    }
    if (tasks.length === 0) {
      if (typeof callback === 'function') callback();
      return;
    }
    // Run tasks sequentially
    const runNext = () => {
      const t = tasks.shift();
      if (!t) { if (typeof callback === 'function') callback(); return; }
      t(runNext);
    };
    runNext();
  });
}

// Ensure POR uploads table exists (idempotent)
function ensurePorTableExists(callback) {
  const createSql = `
    CREATE TABLE IF NOT EXISTS por_uploads (
      id SERIAL PRIMARY KEY,
      student_number VARCHAR(50) NOT NULL,
      file_name VARCHAR(255) NOT NULL,
      file_path VARCHAR(255) NULL,
      file_size INT NULL,
      mimetype VARCHAR(100) NULL,
      uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  db.query(createSql, (err) => {
    if (err) {
      console.error('Error ensuring POR table exists:', err);
    }
    if (typeof callback === 'function') callback();
  });
}

// Ensure Emergencies table exists (idempotent)
function ensureEmergenciesTableExists(callback) {
  const createSql = `
    CREATE TABLE IF NOT EXISTS Emergencies (
      id SERIAL PRIMARY KEY,
      date DATE NOT NULL,
      time_of_call TIME NOT NULL,
      person_responsible VARCHAR(255) NOT NULL,
      caller_name VARCHAR(255) NOT NULL,
      department VARCHAR(255) NOT NULL,
      contact_number VARCHAR(20) NOT NULL,
      problem_nature TEXT NOT NULL,
      
      east_campus BOOLEAN DEFAULT FALSE,
      west_campus BOOLEAN DEFAULT FALSE,
      education_campus BOOLEAN DEFAULT FALSE,
      other_campus BOOLEAN DEFAULT FALSE,
      building VARCHAR(255),
      room_number VARCHAR(50),
      floor VARCHAR(50),
      other_location VARCHAR(255),
      
      staff_informed VARCHAR(255) NOT NULL,
      notification_time TIME NOT NULL,
      team_responding VARCHAR(255) NOT NULL,
      time_left_clinic TIME NOT NULL,
      
      chwc_vehicle BOOLEAN DEFAULT FALSE,
      sisters_on_foot BOOLEAN DEFAULT FALSE,
      other_transport BOOLEAN DEFAULT FALSE,
      other_transport_detail VARCHAR(255),
      
      arrival_time TIME NOT NULL,
      
      student_number VARCHAR(50) NOT NULL,
      patient_name VARCHAR(255) NOT NULL,
      patient_surname VARCHAR(255) NOT NULL,
      
      primary_assessment TEXT NOT NULL,
      intervention TEXT NOT NULL,
      
      medical_consent VARCHAR(20) CHECK (medical_consent IN ('give', 'doNotGive')) NOT NULL,
      transport_consent VARCHAR(20) CHECK (transport_consent IN ('consent', 'doNotConsent')) NOT NULL,
      signature VARCHAR(255) NOT NULL,
      consent_date DATE NOT NULL,
      
      pt_chwc_vehicle BOOLEAN DEFAULT FALSE,
      pt_ambulance BOOLEAN DEFAULT FALSE,
      pt_other BOOLEAN DEFAULT FALSE,
      pt_other_detail VARCHAR(255),
      patient_transported_to VARCHAR(255) NOT NULL,
      departure_time TIME NOT NULL,
      
      chwc_arrival_time TIME NOT NULL,
      existing_file VARCHAR(10) CHECK (existing_file IN ('yes', 'no')) NOT NULL,
      referred VARCHAR(10) CHECK (existing_file IN ('yes', 'no')) NOT NULL,
      hospital_name VARCHAR(255),
      discharge_condition TEXT NOT NULL,
      discharge_time TIME NOT NULL,
      
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  db.query(createSql, (err) => {
    if (err) {
      console.error('Error ensuring Emergencies table exists:', err);
    } else {
      console.log('Emergencies table is ready');
    }
    if (typeof callback === 'function') callback();
  });
}

// Helper functions for checking status
async function checkOnboardingStatus(studentNumber) {
  return new Promise((resolve) => {
    const sql = 'SELECT id FROM onboarding_students WHERE student_number = $1';
    db.query(sql, [studentNumber], (err, results) => {
      if (err) {
        console.error('Database error checking onboarding:', err);
        resolve({ exists: false });
      } else {
        resolve({ exists: results.length > 0 });
      }
    });
  });
}

async function checkPORStatus(studentNumber) {
  return new Promise((resolve) => {
    const sql = 'SELECT id, approval_status FROM por_uploads WHERE student_number = $1';
    ensurePorApprovalColumns(() => db.query(sql, [studentNumber], (err, results) => {
      if (err) {
        console.error('Database error checking POR:', err);
        resolve({ exists: false, approved: false });
      } else {
        const exists = results.rows.length > 0;
        const approved = exists ? results.rows[0].approval_status === 'approved' : false;
        resolve({ exists, approved });
      }
    }));
  });
}

// Login endpoint - FIXED with better error handling
app.post('/api/login', async (req, res) => {
  const { identifier, password, userType } = req.body;
  
  console.log('Login attempt:', { identifier, userType });
  
  if (!identifier || !password || !userType) {
    return res.status(400).json({ error: 'Identifier, password, and user type are required' });
  }

  if (userType === 'staff') {
    // Staff login (existing users table)
    const sql = `
      SELECT u.*, r.role_name 
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      WHERE u.staff_number = $1 OR u.username = $2
    `;
    
    db.query(sql, [identifier, identifier], async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error', details: err.message });
      }
      
      if (results.rows.length === 0) {
        console.log('No staff user found with identifier:', identifier);
        return res.status(401).json({ error: 'Invalid staff number/username or password' });
      }
      
      const user = results.rows[0];
      console.log('Found staff user:', user.username);
      
      try {
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
          console.log('Password mismatch for user:', user.username);
          return res.status(401).json({ error: 'Invalid staff number/username or password' });
        }
        
        const { password: _, ...userWithoutPassword } = user;
        
        res.status(200).json({
          message: 'Login successful',
          user: userWithoutPassword,
          userType: 'staff'
        });
      } catch (error) {
        console.error('Error comparing passwords:', error);
        res.status(500).json({ error: 'Server error' });
      }
    });
  } else if (userType === 'student') {
    const sql = `
      SELECT s.*, r.role_name 
      FROM students s 
      JOIN roles r ON s.role_id = r.id 
      WHERE s.student_number = $1 OR s.username = $2
    `;
    
    db.query(sql, [identifier, identifier], async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error', details: err.message });
      }
      
      if (results.rows.length === 0) {
        console.log('No student found with identifier:', identifier);
        return res.status(401).json({ error: 'Invalid student number/username or password' });
      }
      
      const student = results.rows[0];
      console.log('Found student:', student.username);
      
      try {
        const isMatch = await bcrypt.compare(password, student.password);
        
        if (!isMatch) {
          console.log('Password mismatch for student:', student.username);
          return res.status(401).json({ error: 'Invalid student number/username or password' });
        }
        
        const { password: _, ...studentWithoutPassword } = student;
        
        // Check both onboarding and POR status
        const onboardingCheck = await checkOnboardingStatus(identifier);
        const porCheck = await checkPORStatus(identifier);
        
        res.status(200).json({
          message: 'Login successful',
          user: studentWithoutPassword,
          userType: 'student',
          onboardingCompleted: onboardingCheck.exists,
          porUploaded: porCheck.exists,
          porApproved: porCheck.approved
        });
      } catch (error) {
        console.error('Error comparing passwords:', error);
        res.status(500).json({ error: 'Server error' });
      }
    });
  } else {
    return res.status(400).json({ error: 'Invalid user type' });
  }
});

// Check if student is already onboarded
app.post('/api/check-onboarding', (req, res) => {
  const { studentNumber } = req.body;
  
  if (!studentNumber) {
    return res.status(400).json({ error: 'Student number is required' });
  }

  const sql = 'SELECT id FROM onboarding_students WHERE student_number = $1';
  
  db.query(sql, [studentNumber], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    
    res.status(200).json({ 
      exists: results.rows.length > 0
    });
  });
});

// Check if student has uploaded proof of registration
app.post('/api/check-por', (req, res) => {
  const { studentNumber } = req.body;
  
  if (!studentNumber) {
    return res.status(400).json({ error: 'Student number is required' });
  }

  const sql = 'SELECT id, approval_status FROM por_uploads WHERE student_number = $1';
  
  ensurePorApprovalColumns(() => db.query(sql, [studentNumber], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    
    const exists = results.rows.length > 0;
    const approved = exists ? results.rows[0].approval_status === 'approved' : false;
    res.status(200).json({ exists, approved });
  }));
});

// Regular upload-por endpoint (for compatibility)
app.post('/api/upload-por', upload.single('document'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { studentNumber } = req.body;
    
    if (!studentNumber) {
      return res.status(400).json({ error: 'Student number is required' });
    }

    const fileData = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path,
      studentNumber: studentNumber,
      uploadDate: new Date()
    };

   // Check if file already exists for this student
    const checkSql = 'SELECT id FROM por_uploads WHERE student_number = $1';
    
    ensurePorApprovalColumns(() => db.query(checkSql, [studentNumber], (err, results) => {
      if (err) {
        console.error('Database error checking existing records:', err);
        return res.status(500).json({ 
          error: 'Database error',
          details: 'Failed to check existing records: ' + err.message
        });
      }
      
      if (results.rows.length > 0) {
        // Update existing record
        const updateSql = 'UPDATE por_uploads SET file_name = $1, file_path = $2, file_size = $3, mimetype = $4, uploaded_at = NOW(), approval_status = $5 WHERE student_number = $6';
        
        db.query(updateSql, [fileData.originalName, fileData.path, fileData.size, fileData.mimetype, 'pending', studentNumber], (err, result) => {
          if (err) {
            console.error('Database error updating file:', err);
            return res.status(500).json({ 
              error: 'Database error',
              details: 'Failed to update file: ' + err.message
            });
          }
          
          res.status(200).json({ 
            message: 'File updated successfully!',
            file: fileData
          });
        });
      } else {
        // Insert new record
        const insertSql = 'INSERT INTO por_uploads (student_number, file_name, file_path, file_size, mimetype, uploaded_at, approval_status) VALUES ($1, $2, $3, $4, $5, NOW(), $6)';
        
        db.query(insertSql, [studentNumber, fileData.originalName, fileData.path, fileData.size, fileData.mimetype, 'pending'], (err, result) => {
          if (err) {
            console.error('Database error saving file:', err);
            return res.status(500).json({ 
              error: 'Database error',
              details: 'Failed to save file: ' + err.message
            });
          }
          
          res.status(200).json({ 
            message: 'File saved successfully!', 
            file: fileData
          });
        });
      }
    }));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update your existing upload-por endpoint to use multer
app.post('/api/upload-por-multer', upload.single('document'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { studentNumber } = req.body;
    
    if (!studentNumber) {
      return res.status(400).json({ error: 'Student number is required' });
    }

    const fileData = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path,
      studentNumber: studentNumber,
      uploadDate: new Date()
    };

   // Check if file already exists for this student
    const checkSql = 'SELECT id FROM por_uploads WHERE student_number = $1';
    
    ensurePorApprovalColumns(() => db.query(checkSql, [studentNumber], (err, results) => {
      if (err) {
        console.error('Database error checking existing records:', err);
        return res.status(500).json({ 
          error: 'Database error',
          details: 'Failed to check existing records: ' + err.message
        });
      }
      
      if (results.rows.length > 0) {
        // Update existing record
        const updateSql = 'UPDATE por_uploads SET file_name = $1, file_path = $2, file_size = $3, mimetype = $4, uploaded_at = NOW(), approval_status = $5 WHERE student_number = $6';
        
        db.query(updateSql, [fileData.originalName, fileData.path, fileData.size, fileData.mimetype, 'pending', studentNumber], (err, result) => {
          if (err) {
            console.error('Database error updating file:', err);
            return res.status(500).json({ 
              error: 'Database error',
              details: 'Failed to update file: ' + err.message
            });
          }
          
          res.status(200).json({ 
            message: 'File updated successfully!',
            file: fileData
          });
        });
      } else {
        // Insert new record
        const insertSql = 'INSERT INTO por_uploads (student_number, file_name, file_path, file_size, mimetype, uploaded_at, approval_status) VALUES ($1, $2, $3, $4, $5, NOW(), $6)';
        
        db.query(insertSql, [studentNumber, fileData.originalName, fileData.path, fileData.size, fileData.mimetype, 'pending'], (err, result) => {
          if (err) {
            console.error('Database error saving file:', err);
            return res.status(500).json({ 
              error: 'Database error',
              details: 'Failed to save file: ' + err.message
            });
          }
          
          res.status(200).json({ 
            message: 'File saved successfully!', 
            file: fileData
          });
        });
      }
    }));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: get POR by student number (with latest file info)
app.get('/api/por/:studentNumber', (req, res) => {
  const { studentNumber } = req.params;
  const sql = `
    SELECT id, student_number, file_name, file_path, file_size, mimetype, uploaded_at, COALESCE(approval_status, 'pending') AS approval_status
    FROM por_uploads
    WHERE student_number = $1
    ORDER BY uploaded_at DESC
    LIMIT 1
  `;
  ensurePorApprovalColumns(() => db.query(sql, [studentNumber], (err, results) => {
    if (err) {
      console.error('Database error fetching POR:', err);
      return res.status(500).json({ error: 'Failed to fetch POR', details: err.message });
    }
    if (results.rows.length === 0) {
      return res.status(404).json({ error: 'No POR found for this student' });
    }
    res.status(200).json({ por: results.rows[0] });
  }));
});

// Admin: approve/reject POR
app.post('/api/por/:studentNumber/decision', (req, res) => {
  const { studentNumber } = req.params;
  const { decision } = req.body; // 'approved' or 'rejected'
  if (!['approved', 'rejected'].includes(decision)) {
    return res.status(400).json({ error: 'Invalid decision' });
  }
  const sql = `
    UPDATE por_uploads
    SET approval_status = $1, approved_at = $3
    WHERE student_number = $2 AND id = (
      SELECT id FROM por_uploads 
      WHERE student_number = $2 
      ORDER BY uploaded_at DESC 
      LIMIT 1
    )
  `;
  const approvedAt = decision === 'approved' ? new Date() : null;
  ensurePorApprovalColumns(() => db.query(sql, [decision, studentNumber, approvedAt], (err, result) => {
    if (err) {
      console.error('Database error updating POR decision:', err);
      return res.status(500).json({ error: 'Failed to update POR decision', details: err.message });
    }
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'No POR record found to update' });
    }
    res.status(200).json({ message: `POR ${decision} successfully` });
  }));
});

// Add endpoint to get uploaded files
app.get('/api/student-files/:studentNumber', (req, res) => {
  const { studentNumber } = req.params;

  const sql = `
    SELECT id, file_name, file_size, mimetype, uploaded_at
    FROM por_uploads 
    WHERE student_number = $1
    ORDER BY uploaded_at DESC
  `;

  db.query(sql, [studentNumber], (err, results) => {
    if (err) {
      console.error('Database error fetching files:', err);
      return res.status(500).json({ 
        error: 'Failed to fetch files',
        details: err.message 
      });
    }
    
    res.status(200).json({ 
      files: results,
      count: results.length
    });
  });
});

// Add endpoint to download file
app.get('/api/download-file/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'SELECT file_path, file_name, mimetype FROM por_uploads WHERE id = $1';
  
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    
    if (results.rows.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const file = results.rows[0];
    
    if (!fs.existsSync(file.file_path)) {
      return res.status(404).json({ error: 'File not found on server' });
    }
    
    res.setHeader('Content-Type', file.mimetype);
    res.setHeader('Content-Disposition', `attachment; filename="${file.file_name}"`);
    
    const fileStream = fs.createReadStream(file.file_path);
    fileStream.pipe(res);
  });
});

// Create appointments table if it doesn't exist
app.post('/api/create-appointments-table', (req, res) => {
  const createTableSql = `
    CREATE TABLE IF NOT EXISTS appointments (
      id SERIAL PRIMARY KEY,
      reference_number VARCHAR(50) NOT NULL,
      student_number VARCHAR(50) NOT NULL,
      appointment_type VARCHAR(100) NOT NULL,
      appointment_for VARCHAR(100) NOT NULL,
      appointment_date DATE NULL,
      appointment_time TIME NOT NULL,
      previous_appointment_ref VARCHAR(50) NULL,
      status VARCHAR(20) DEFAULT 'scheduled',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.query(createTableSql, (err, result) => {
    if (err) {
      console.error('Error creating appointments table:', err);
      return res.status(500).json({ 
        error: 'Failed to create appointments table',
        details: err.message 
      });
    }
    
    res.status(200).json({ 
      message: 'Appointments table created successfully or already exists',
      result: result
    });
  });
});

// Save appointment to database - UPDATED to use student number
app.post('/api/save-appointment', (req, res) => {
  const {
    referenceNumber,
    studentNumber,
    appointmentType,
    appointmentFor,
    appointmentDate,
    appointmentTime,
    previousAppointmentRef
  } = req.body;

  console.log('Received appointment data:', req.body);

  if (!referenceNumber || !studentNumber || !appointmentType || !appointmentFor || !appointmentTime) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      details: `Missing: ${!referenceNumber ? 'referenceNumber, ' : ''}${!studentNumber ? 'studentNumber, ' : ''}${!appointmentType ? 'appointmentType, ' : ''}${!appointmentFor ? 'appointmentFor, ' : ''}${!appointmentTime ? 'appointmentTime' : ''}`
    });
  }

  const sql = `
    INSERT INTO appointments (
      reference_number, student_number, appointment_type, 
      appointment_for, appointment_date, appointment_time, previous_appointment_ref
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
  `;

  const values = [
    referenceNumber,
    studentNumber,
    appointmentType,
    appointmentFor,
    appointmentDate || null,
    appointmentTime,
    previousAppointmentRef || null
  ];

  console.log('Executing SQL with values:', values);

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Database error saving appointment:', err);
      return res.status(500).json({ 
        error: 'Failed to save appointment',
        details: err.message,
        sqlError: err
      });
    }
    
    res.status(200).json({ 
      message: 'Appointment saved successfully!', 
      appointmentId: result.rows[0]?.id 
    });
  });
});

// Get student appointments - FIXED to handle missing students table gracefully
app.get('/api/student-appointments/:studentNumber', (req, res) => {
  const { studentNumber } = req.params;

  console.log('Fetching appointments for student:', studentNumber);

  // First check if appointments table exists
  const checkTableSql = `
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_name = 'appointments'
  `;
  
  db.query(checkTableSql, (err, results) => {
    if (err) {
      console.error('Database error checking appointments table:', err);
      return res.status(500).json({ 
        error: 'Database error',
        details: err.message 
      });
    }

    if (results.rows.length === 0) {
      // Appointments table doesn't exist
      return res.status(200).json({ 
        appointments: [],
        count: 0,
        message: 'No appointments table found'
      });
    }

    // Table exists, now fetch appointments
    const sql = `
      SELECT a.* 
      FROM appointments a
      WHERE a.student_number = $1
      ORDER BY a.created_at DESC
    `;

    db.query(sql, [studentNumber], (err, results) => {
      if (err) {
        console.error('Database error fetching appointments:', err);
        return res.status(500).json({ 
          error: 'Failed to fetch appointments',
          details: err.message 
        });
      }
      
      res.status(200).json({ 
        appointments: results.rows,
        count: results.rows.length
      });
    });
  });
});

// Get all appointments (for admin/nurse view)
app.get('/api/appointments', (req, res) => {
  const sql = `
    SELECT a.* 
    FROM appointments a
    ORDER BY a.appointment_date DESC, a.appointment_time DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Database error fetching all appointments:', err);
      return res.status(500).json({ 
        error: 'Failed to fetch appointments',
        details: err.message 
      });
    }
    
    res.status(200).json({ 
      appointments: results.rows,
      count: results.rows.length
    });
  });
});

// Get appointments by student number (for modify booking page)
app.get('/api/appointments/student/:studentNumber', (req, res) => {
  const { studentNumber } = req.params;

  const sql = `
    SELECT a.* 
    FROM appointments a
      WHERE a.student_number = $1
    ORDER BY a.appointment_date DESC, a.appointment_time DESC
  `;

  db.query(sql, [studentNumber], (err, results) => {
    if (err) {
      console.error('Database error fetching appointments by student number:', err);
      return res.status(500).json({ 
        error: 'Failed to fetch appointments',
        details: err.message 
      });
    }
    
    res.status(200).json({ 
      appointments: results.rows,
      count: results.rows.length
    });
  });
});

// Update appointment
app.put('/api/appointments/:id', (req, res) => {
  const { id } = req.params;
  const { appointmentDate, appointmentTime, appointmentFor, status } = req.body;

  if (!appointmentDate || !appointmentTime || !appointmentFor) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      details: 'appointmentDate, appointmentTime, and appointmentFor are required'
    });
  }

  const sql = `
    UPDATE appointments 
    SET appointment_date = $1, appointment_time = $2, appointment_for = $3, 
        status = $4, updated_at = NOW()
    WHERE id = $5
  `;

  const values = [appointmentDate, appointmentTime, appointmentFor, status || 'scheduled', id];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Database error updating appointment:', err);
      return res.status(500).json({ 
        error: 'Failed to update appointment',
        details: err.message 
      });
    }
    
    if (result.rowCount === 0) {
      return res.status(404).json({ 
        error: 'Appointment not found'
      });
    }
    
    res.status(200).json({ 
      message: 'Appointment updated successfully!'
    });
  });
});

// Cancel appointment (set status to cancelled)
app.put('/api/appointments/:id/cancel', (req, res) => {
  const { id } = req.params;

  const sql = `
    UPDATE appointments 
    SET status = 'cancelled', updated_at = NOW()
    WHERE id = $1
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Database error cancelling appointment:', err);
      return res.status(500).json({ 
        error: 'Failed to cancel appointment',
        details: err.message 
      });
    }
    
    if (result.rowCount === 0) {
      return res.status(404).json({ 
        error: 'Appointment not found'
      });
    }
    
    res.status(200).json({ 
      message: 'Appointment cancelled successfully!'
    });
  });
});

// Create students table if it doesn't exist (matching users table structure)
app.post('/api/create-students-table', (req, res) => {
  const createTableSql = `
    CREATE TABLE IF NOT EXISTS students (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) NOT NULL,
      password VARCHAR(255) NOT NULL,
      student_number VARCHAR(50) UNIQUE NOT NULL,
      full_name VARCHAR(100) NOT NULL,
      role_id INT NOT NULL DEFAULT 1,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.query(createTableSql, (err, result) => {
    if (err) {
      console.error('Error creating students table:', err);
      return res.status(500).json({ 
        error: 'Failed to create students table',
        details: err.message 
      });
    }
    
    res.status(200).json({ 
      message: 'Students table created successfully or already exists',
      result: result
    });
  });
});

// Password reset endpoint (for development) - FIXED
app.post('/api/reset-passwords', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Reset both users and students tables
    const updateUsersSql = 'UPDATE users SET password = $1';
    const updateStudentsSql = 'UPDATE students SET password = $1';
    
    db.query(updateUsersSql, [hashedPassword], (err, userResult) => {
      if (err) {
        console.error('Database error resetting user passwords:', err);
      }
      
      db.query(updateStudentsSql, [hashedPassword], (err, studentResult) => {
        if (err) {
          console.error('Database error resetting student passwords:', err);
        }
        
        res.status(200).json({ 
          message: 'Passwords reset successfully!',
          newPassword: 'password123',
          usersAffected: userResult?.affectedRows || 0,
          studentsAffected: studentResult?.affectedRows || 0
        });
      });
    });
  } catch (error) {
    console.error('Error hashing password:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Debug endpoint to check user data
app.post('/api/debug-user', (req, res) => {
  const { staffNumber } = req.body;

  if (!staffNumber) {
    return res.status(400).json({ error: 'Staff number is required' });
  }

  const sql = `
    SELECT u.*, r.role_name 
    FROM users u 
    JOIN roles r ON u.role_id = r.id 
    WHERE u.staff_number = $1
  `;

  db.query(sql, [staffNumber], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    
    res.status(200).json({ 
      userFound: results.length > 0,
      users: results,
      count: results.length
    });
  });
});

// Get all users endpoint (for debugging)
app.get('/api/users', (req, res) => {
  const sql = `
    SELECT u.id, u.username, u.email, u.staff_number, u.full_name, 
           r.role_name, u.is_active, u.created_at
    FROM users u 
    JOIN roles r ON u.role_id = r.id 
    ORDER by u.id
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    
    res.status(200).json({ 
      users: results,
      count: results.length
    });
  });
});

// Get POR uploads endpoint (for debugging)
app.get('/api/por-uploads', (req, res) => {
  const sql = `
    SELECT id, student_number, file_name, uploaded_at
    FROM por_uploads 
    ORDER BY uploaded_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    
    res.status(200).json({ 
      uploads: results,
      count: results.length
    });
  });
});

// Update the POR uploads table structure to include file_path
app.post('/api/update-por-table-structure', (req, res) => {
  const alterTableSql = `
    ALTER TABLE por_uploads 
    ADD COLUMN IF NOT EXISTS file_path VARCHAR(255),
    ADD COLUMN IF NOT EXISTS file_size INT,
    ADD COLUMN IF NOT EXISTS mimetype VARCHAR(100)
  `;

  db.query(alterTableSql, (err, result) => {
    if (err) {
      console.error('Error updating POR table structure:', err);
      return res.status(500).json({ 
        error: 'Failed to update POR table structure',
        details: err.message 
      });
    }
    
    res.status(200).json({ 
      message: 'POR table structure updated successfully',
      result: result
    });
  });
});

// Update appointments table to use student_number instead of user_id/staff_number
app.post('/api/update-appointments-table', (req, res) => {
  const alterTableSql = `
    ALTER TABLE appointments 
    DROP COLUMN IF EXISTS user_id,
    DROP COLUMN IF EXISTS staff_number,
    ADD COLUMN IF NOT EXISTS student_number VARCHAR(50) NOT NULL
  `;

  db.query(alterTableSql, (err, result) => {
    if (err) {
      console.error('Error updating appointments table:', err);
      return res.status(500).json({ 
        error: 'Failed to update appointments table',
        details: err.message 
      });
    }
    
    res.status(200).json({ 
      message: 'Appointments table updated successfully',
      result: result
    });
  });
});

// API Endpoint: Save onboarding data
app.post('/api/onboarding', (req, res) => {
  const formData = req.body;

  const checkSql = 'SELECT id FROM onboarding_students WHERE student_number = $1';

  db.query(checkSql, [formData.studentNumber], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ 
        error: 'Failed to check existing records',
        details: err.message 
      });
    }
    
    if (results.length > 0) {
      return res.status(409).json({ 
        error: 'Student already exists in the system',
        details: 'This student number has already completed the onboarding process'
      });
    }
    
    const insertSql = `
      INSERT INTO onboarding_students (
        student_number, surname, full_names, date_of_birth, gender, other_gender,
        physical_address, postal_address, code, email, cell, alt_number,
        emergency_name, emergency_relation, emergency_work_tel, emergency_cell,
        medical_conditions, operations, conditions_details, disability, disability_details,
        medication, medication_details, other_conditions, congenital, family_other,
        smoking, recreation, psychological, psychological_details, date, signature_data
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32)
    `;

    // Convert string values to boolean for boolean columns
    const convertToBoolean = (value) => {
      if (typeof value === 'string') {
        return value.toLowerCase() === 'yes' || value.toLowerCase() === 'true';
      }
      return Boolean(value);
    };

    const values = [
      formData.studentNumber,
      formData.surname,
      formData.fullNames,
      formData.dateOfBirth,
      formData.gender,
      formData.otherGender || null,
      formData.physicalAddress,
      formData.postalAddress,
      formData.code,
      formData.email,
      formData.cell,
      formData.altNumber || null,
      formData.emergencyName,
      formData.emergencyRelation,
      formData.emergencyWorkTel || null,
      formData.emergencyCell,
      convertToBoolean(formData.medicalConditions),
      convertToBoolean(formData.operations),
      formData.conditionsDetails || null,
      convertToBoolean(formData.disability),
      formData.disabilityDetails || null,
      convertToBoolean(formData.medication),
      formData.medicationDetails || null,
      formData.otherConditions || null,
      convertToBoolean(formData.congenital),
      formData.familyOther || null,
      convertToBoolean(formData.smoking),
      convertToBoolean(formData.recreation),
      convertToBoolean(formData.psychological),
      formData.psychologicalDetails || null,
      formData.date,
      formData.signatureData || null
    ];

    db.query(insertSql, values, (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ 
          error: 'Failed to save data',
          details: err.message 
        });
      }
      
      res.status(200).json({ 
        message: 'Form submitted successfully!', 
        recordId: result.rows[0]?.id 
      });
    });
  });
});

// Create student account endpoint
app.post('/api/create-student', async (req, res) => {
  const { username, email, password, studentNumber, fullName, roleId = 1 } = req.body;
  
  if (!username || !email || !password || !studentNumber || !fullName) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const sql = `
      INSERT INTO students (username, email, password, student_number, full_name, role_id) 
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    
    db.query(sql, [username, email, hashedPassword, studentNumber, fullName, roleId], (err, result) => {
      if (err) {
        console.error('Database error creating student:', err);
        return res.status(500).json({ 
          error: 'Failed to create student account',
          details: err.message 
        });
      }
      
      res.status(200).json({ 
        message: 'Student account created successfully!',
        studentId: result.rows[0]?.id 
      });
    });
  } catch (error) {
    console.error('Error hashing password:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reset student password endpoint
app.post('/api/reset-student-password', async (req, res) => {
  const { studentNumber, newPassword } = req.body;
  
  if (!studentNumber || !newPassword) {
    return res.status(400).json({ error: 'Student number and new password are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const sql = `
      UPDATE students 
      SET password = $1 
      WHERE student_number = $2
    `;
    
    db.query(sql, [hashedPassword, studentNumber], (err, result) => {
      if (err) {
        console.error('Database error resetting password:', err);
        return res.status(500).json({ 
          error: 'Failed to reset password',
          details: err.message 
        });
      }
      
      if (result.rowCount === 0) {
        return res.status(404).json({ 
          error: 'Student not found',
          details: 'No student found with the provided student number'
        });
      }
      
      res.status(200).json({ 
        message: 'Password reset successfully!'
      });
    });
  } catch (error) {
    console.error('Error hashing password:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all students
app.get('/api/students', (req, res) => {
  const sql = `
    SELECT s.*
    FROM students s 
    ORDER BY s.id
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Database error fetching students:', err);
      return res.status(500).json({ 
        error: 'Failed to fetch students',
        details: err.message 
      });
    }
    
    res.status(200).json({ 
      students: results,
      count: results.length
    });
  });
});

// Save staff schedule endpoint (UPDATED for time picker)
app.post('/api/save-staff-schedule', (req, res) => {
  const { staff_name, month, day, lunch1_start, lunch1_end, lunch2_start, lunch2_end, notes } = req.body;
  
  if (!staff_name || !month || !day) {
    return res.status(400).json({ error: 'Staff name, month, and day are required' });
  }

  const sql = `
    INSERT INTO staff_lunch_schedule (staff_name, month, day, lunch1_start, lunch1_end, lunch2_start, lunch2_end, notes) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (staff_name, month, day) DO UPDATE SET
      lunch1_start = EXCLUDED.lunch1_start, 
      lunch1_end = EXCLUDED.lunch1_end,
      lunch2_start = EXCLUDED.lunch2_start,
      lunch2_end = EXCLUDED.lunch2_end,
      notes = EXCLUDED.notes,
      updated_at = NOW()
  `;
  
  const values = [staff_name, month, day, lunch1_start, lunch1_end, lunch2_start, lunch2_end, notes];
  
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Database error saving staff schedule:', err);
      return res.status(500).json({ 
        error: 'Failed to save staff schedule',
        details: err.message 
      });
    }
    
    res.status(200).json({ 
      message: 'Staff schedule saved successfully!', 
      recordId: result.rows[0]?.id 
    });
  });
});

// Get today's staff schedule (UPDATED for time picker)
app.get('/api/today-staff-schedule', (req, res) => {
  const today = new Date();
  const month = today.toLocaleString('default', { month: 'long' });
  const day = today.getDate();
  
  const sql = `
    SELECT 
      staff_name, 
      lunch1_start, 
      lunch1_end, 
      lunch2_start, 
      lunch2_end,
      notes,
      CONCAT(
        COALESCE(CONCAT(TO_CHAR(lunch1_start, 'HH12:MI AM'), ' - ', TO_CHAR(lunch1_end, 'HH12:MI AM')), ''),
        CASE WHEN lunch1_start IS NOT NULL AND lunch2_start IS NOT NULL THEN ' / ' ELSE '' END,
        COALESCE(CONCAT(TO_CHAR(lunch2_start, 'HH12:MI AM'), ' - ', TO_CHAR(lunch2_end, 'HH12:MI AM')), '')
      ) as lunch_times
    FROM staff_lunch_schedule 
    WHERE month = $1 AND day = $2
    ORDER BY staff_name
  `;
  
  db.query(sql, [month, day], (err, results) => {
    if (err) {
      console.error('Database error fetching today\'s schedule:', err);
      return res.status(500).json({ 
        error: 'Failed to fetch today\'s schedule',
        details: err.message 
      });
    }
    
    res.status(200).json({ 
      schedule: results,
      date: `${month} ${day}`,
      count: results.length
    });
  });
});

// Create staff_schedule table if it doesn't exist (UPDATED for time picker)
app.post('/api/create-staff-schedule-table', (req, res) => {
  const createTableSql = `
    CREATE TABLE IF NOT EXISTS staff_lunch_schedule (
      id SERIAL PRIMARY KEY,
      staff_name VARCHAR(255) NOT NULL,
      month VARCHAR(20) NOT NULL,
      day INT NOT NULL,
      lunch1_start TIME NULL,
      lunch1_end TIME NULL,
      lunch2_start TIME NULL,
      lunch2_end TIME NULL,
      notes TEXT DEFAULT '',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT unique_schedule_entry UNIQUE (staff_name, month, day)
    )
  `;
  
  db.query(createTableSql, (err, result) => {
    if (err) {
      console.error('Error creating staff_schedule table:', err);
      return res.status(500).json({ 
        error: 'Failed to create staff_schedule table',
        details: err.message 
      });
    }
    
    res.status(200).json({ 
      message: 'Staff schedule table created successfully or already exists',
      result: result
    });
  });
});

// Create emergency_onboarding table if it doesn't exist
app.post('/api/create-emergency-table', (req, res) => {
  const createTableSql = `
    CREATE TABLE IF NOT EXISTS emergency_onboarding (
      id SERIAL PRIMARY KEY,
      date DATE NOT NULL,
      time_of_call TIME NOT NULL,
      person_responsible VARCHAR(255) NOT NULL,
      caller_name VARCHAR(255) NOT NULL,
      department VARCHAR(255) NOT NULL,
      contact_number VARCHAR(20) NOT NULL,
      problem_nature TEXT NOT NULL,
      
      east_campus BOOLEAN DEFAULT FALSE,
      west_campus BOOLEAN DEFAULT FALSE,
      education_campus BOOLEAN DEFAULT FALSE,
      other_campus BOOLEAN DEFAULT FALSE,
      building VARCHAR(255),
      room_number VARCHAR(50),
      floor VARCHAR(50),
      other_location VARCHAR(255),
      
      staff_informed VARCHAR(255) NOT NULL,
      notification_time TIME NOT NULL,
      team_responding VARCHAR(255) NOT NULL,
      time_left_clinic TIME NOT NULL,
      
      chwc_vehicle BOOLEAN DEFAULT FALSE,
      sisters_on_foot BOOLEAN DEFAULT FALSE,
      other_transport BOOLEAN DEFAULT FALSE,
      other_transport_detail VARCHAR(255),
      
      arrival_time TIME NOT NULL,
      
      student_number VARCHAR(50) NOT NULL,
      patient_name VARCHAR(255) NOT NULL,
      patient_surname VARCHAR(255) NOT NULL,
      
      primary_assessment TEXT NOT NULL,
      intervention TEXT NOT NULL,
      
      medical_consent VARCHAR(20) CHECK (medical_consent IN ('give', 'doNotGive')) NOT NULL,
      transport_consent VARCHAR(20) CHECK (transport_consent IN ('consent', 'doNotConsent')) NOT NULL,
      signature VARCHAR(255) NOT NULL,
      consent_date DATE NOT NULL,
      
      pt_chwc_vehicle BOOLEAN DEFAULT FALSE,
      pt_ambulance BOOLEAN DEFAULT FALSE,
      pt_other BOOLEAN DEFAULT FALSE,
      pt_other_detail VARCHAR(255),
      patient_transported_to VARCHAR(255) NOT NULL,
      departure_time TIME NOT NULL,
      
      chwc_arrival_time TIME NOT NULL,
      existing_file VARCHAR(10) CHECK (existing_file IN ('yes', 'no')) NOT NULL,
      referred VARCHAR(10) CHECK (existing_file IN ('yes', 'no')) NOT NULL,
      hospital_name VARCHAR(255),
      discharge_condition TEXT NOT NULL,
      discharge_time TIME NOT NULL,
      
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  db.query(createTableSql, (err, result) => {
    if (err) {
      console.error('Error creating emergency_onboarding table:', err);
      return res.status(500).json({ 
        error: 'Failed to create emergency_onboarding table',
        details: err.message 
      });
    }
    
    res.status(200).json({ 
      message: 'Emergency onboarding table created successfully or already exists',
      result: result
    });
  });
});

// Save emergency onboarding data to Emergencies table - COMPLETELY FIXED VERSION
app.post('/api/save-emergency', (req, res) => {
  const formData = req.body;
  
  console.log('Received emergency data:', formData);
  
  // Validate required fields
  const requiredFields = [
    'date', 'timeOfCall', 'personResponsible', 'callerName', 'department',
    'contactNumber', 'problemNature', 'staffInformed', 'notificationTime',
    'teamResponding', 'timeLeftClinic', 'arrivalTime', 'studentNumber',
    'patientName', 'patientSurname', 'primaryAssessment', 'intervention',
    'medicalConsent', 'transportConsent', 'signature', 'consentDate',
    'patientTransportedTo', 'departureTime', 'chwcArrivalTime',
    'existingFile', 'referred', 'dischargeCondition', 'dischargeTime'
  ];
  
  for (const field of requiredFields) {
    if (!formData[field]) {
      return res.status(400).json({ 
        error: `Missing required field: ${field}`,
        details: `The field '${field}' is required`
      });
    }
  }

  // Use dynamic approach to avoid column count issues
  const fieldMap = {
    date: 'date',
    timeOfCall: 'time_of_call',
    personResponsible: 'person_responsible',
    callerName: 'caller_name',
    department: 'department',
    contactNumber: 'contact_number',
    problemNature: 'problem_nature',
    eastCampus: 'east_campus',
    westCampus: 'west_campus',
    educationCampus: 'education_campus',
    otherCampus: 'other_campus',
    building: 'building',
    roomNumber: 'room_number',
    floor: 'floor',
    otherLocation: 'other_location',
    staffInformed: 'staff_informed',
    notificationTime: 'notification_time',
    teamResponding: 'team_responding',
    timeLeftClinic: 'time_left_clinic',
    chwcVehicle: 'chwc_vehicle',
    sistersOnFoot: 'sisters_on_foot',
    otherTransport: 'other_transport',
    otherTransportDetail: 'other_transport_detail',
    arrivalTime: 'arrival_time',
    studentNumber: 'student_number',
    patientName: 'patient_name',
    patientSurname: 'patient_surname',
    primaryAssessment: 'primary_assessment',
    intervention: 'intervention',
    medicalConsent: 'medical_consent',
    transportConsent: 'transport_consent',
    signature: 'signature',
    consentDate: 'consent_date',
    ptCHWCVehicle: 'pt_chwc_vehicle',
    ptAmbulance: 'pt_ambulance',
    ptOther: 'pt_other',
    ptOtherDetail: 'pt_other_detail',
    patientTransportedTo: 'patient_transported_to',
    departureTime: 'departure_time',
    chwcArrivalTime: 'chwc_arrival_time',
    existingFile: 'existing_file',
    referred: 'referred',
    hospitalName: 'hospital_name',
    dischargeCondition: 'discharge_condition',
    dischargeTime: 'discharge_time'
  };

  const columns = [];
  const placeholders = [];
  const values = [];

  // Build the query dynamically
  Object.keys(fieldMap).forEach(key => {
    if (formData[key] !== undefined) {
      columns.push(fieldMap[key]);
      placeholders.push(`$${placeholders.length + 1}`);
      
      // Convert boolean values properly
      if (typeof formData[key] === 'boolean') {
        values.push(formData[key]);
      } else {
        values.push(formData[key] === '' ? null : formData[key]);
      }
    }
  });

  const sql = `INSERT INTO Emergencies (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`;

  console.log('Dynamic emergency insert:');
  console.log('Columns:', columns.length);
  console.log('Values:', values.length);
  console.log('SQL:', sql);

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Database error saving emergency data:', err);
      console.error('SQL Error details:', err.message);
      return res.status(500).json({ 
        error: 'Failed to save emergency report',
        details: err.message 
      });
    }
    
    res.status(200).json({ 
      message: 'Emergency report submitted successfully!', 
      recordId: result.rows[0]?.id 
    });
  });
});

// Get all emergencies
app.get('/api/emergencies', (req, res) => {
  const sql = `
    SELECT 
      id, date, time_of_call, caller_name, department, 
      patient_name, patient_surname, student_number,
      created_at
    FROM Emergencies 
    ORDER BY created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Database error fetching emergencies:', err);
      return res.status(500).json({ 
        error: 'Failed to fetch emergencies',
        details: err.message 
      });
    }
    
    res.status(200).json({ 
      emergencies: results,
      count: results.length
    });
  });
});

// Get single emergency by ID
app.get('/api/emergency/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'SELECT * FROM Emergencies WHERE id = $1';

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Database error fetching emergency:', err);
      return res.status(500).json({ 
        error: 'Failed to fetch emergency',
        details: err.message 
      });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ 
        error: 'Emergency report not found'
      });
    }
    
    res.status(200).json({ 
      emergency: results[0]
    });
  });
});

// Update emergency report
app.put('/api/emergency/:id', (req, res) => {
  const { id } = req.params;
  const formData = req.body;

  const sql = `
    UPDATE Emergencies SET
      date = ?, time_of_call = ?, person_responsible = ?, caller_name = ?, department = ?,
      contact_number = ?, problem_nature = ?, east_campus = ?, west_campus = ?, education_campus = ?,
      other_campus = ?, building = ?, room_number = ?, floor = ?, other_location = ?, staff_informed = ?,
      notification_time = ?, team_responding = ?, time_left_clinic = ?, chwc_vehicle = ?,
      sisters_on_foot = ?, other_transport = ?, other_transport_detail = ?, arrival_time = ?,
      student_number = ?, patient_name = ?, patient_surname = ?, primary_assessment = ?,
      intervention = ?, medical_consent = ?, transport_consent = ?, signature = ?, consent_date = ?,
      pt_chwc_vehicle = ?, pt_ambulance = ?, pt_other = ?, pt_other_detail = ?,
      patient_transported_to = ?, departure_time = ?, chwc_arrival_time = ?, existing_file = ?,
      referred = ?, hospital_name = ?, discharge_condition = ?, discharge_time = ?
    WHERE id = $1
  `;

  const values = [
    formData.date,
    formData.timeOfCall,
    formData.personResponsible,
    formData.callerName,
    formData.department,
    formData.contactNumber,
    formData.problemNature,
    formData.eastCampus || false,
    formData.westCampus || false,
    formData.educationCampus || false,
    formData.otherCampus || false,
    formData.building || null,
    formData.roomNumber || null,
    formData.floor || null,
    formData.otherLocation || null,
    formData.staffInformed,
    formData.notificationTime,
    formData.teamResponding,
    formData.timeLeftClinic,
    formData.chwcVehicle || false,
    formData.sistersOnFoot || false,
    formData.otherTransport || false,
    formData.otherTransportDetail || null,
    formData.arrivalTime,
    formData.studentNumber,
    formData.patientName,
    formData.patientSurname,
    formData.primaryAssessment,
    formData.intervention,
    formData.medicalConsent,
    formData.transportConsent,
    formData.signature,
    formData.consentDate,
    formData.ptCHWCVehicle || false,
    formData.ptAmbulance || false,
    formData.ptOther || false,
    formData.ptOtherDetail || null,
    formData.patientTransportedTo,
    formData.departureTime,
    formData.chwcArrivalTime,
    formData.existingFile,
    formData.referred,
    formData.hospitalName || null,
    formData.dischargeCondition,
    formData.dischargeTime,
    id
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Database error updating emergency:', err);
      return res.status(500).json({ 
        error: 'Failed to update emergency report',
        details: err.message 
      });
    }
    
    if (result.rowCount === 0) {
      return res.status(404).json({ 
        error: 'Emergency report not found'
      });
    }
    
    res.status(200).json({ 
      message: 'Emergency report updated successfully!'
    });
  });
});

// Delete emergency report
app.delete('/api/emergency/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM Emergencies WHERE id = $1';

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Database error deleting emergency:', err);
      return res.status(500).json({ 
        error: 'Failed to delete emergency report',
        details: err.message 
      });
    }
    
    if (result.rowCount === 0) {
      return res.status(404).json({ 
        error: 'Emergency report not found'
      });
    }
    
    res.status(200).json({ 
      message: 'Emergency report deleted successfully!'
    });
  });
});

// Save emergency onboarding data - FIXED VERSION (for backward compatibility)
app.post('/api/emergency-onboarding', (req, res) => {
  const formData = req.body;
  
  // Use the same dynamic approach as /api/save-emergency
  const fieldMap = {
    date: 'date',
    timeOfCall: 'time_of_call',
    personResponsible: 'person_responsible',
    callerName: 'caller_name',
    department: 'department',
    contactNumber: 'contact_number',
    problemNature: 'problem_nature',
    eastCampus: 'east_campus',
    westCampus: 'west_campus',
    educationCampus: 'education_campus',
    otherCampus: 'other_campus',
    building: 'building',
    roomNumber: 'room_number',
    floor: 'floor',
    otherLocation: 'other_location',
    staffInformed: 'staff_informed',
    notificationTime: 'notification_time',
    teamResponding: 'team_responding',
    timeLeftClinic: 'time_left_clinic',
    chwcVehicle: 'chwc_vehicle',
    sistersOnFoot: 'sisters_on_foot',
    otherTransport: 'other_transport',
    otherTransportDetail: 'other_transport_detail',
    arrivalTime: 'arrival_time',
    studentNumber: 'student_number',
    patientName: 'patient_name',
    patientSurname: 'patient_surname',
    primaryAssessment: 'primary_assessment',
    intervention: 'intervention',
    medicalConsent: 'medical_consent',
    transportConsent: 'transport_consent',
    signature: 'signature',
    consentDate: 'consent_date',
    ptCHWCVehicle: 'pt_chwc_vehicle',
    ptAmbulance: 'pt_ambulance',
    ptOther: 'pt_other',
    ptOtherDetail: 'pt_other_detail',
    patientTransportedTo: 'patient_transported_to',
    departureTime: 'departure_time',
    chwcArrivalTime: 'chwc_arrival_time',
    existingFile: 'existing_file',
    referred: 'referred',
    hospitalName: 'hospital_name',
    dischargeCondition: 'discharge_condition',
    dischargeTime: 'discharge_time'
  };

  const columns = [];
  const placeholders = [];
  const values = [];

  Object.keys(fieldMap).forEach(key => {
    if (formData[key] !== undefined) {
      columns.push(fieldMap[key]);
      placeholders.push(`$${placeholders.length + 1}`);
      values.push(formData[key] === '' ? null : formData[key]);
    }
  });

  const sql = `INSERT INTO emergency_onboarding (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`;

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Database error saving emergency data:', err);
      return res.status(500).json({ 
        error: 'Failed to save emergency report',
        details: err.message 
      });
    }
    
    res.status(200).json({ 
      message: 'Emergency report submitted successfully!', 
      recordId: result.rows[0]?.id 
    });
  });
});

// Get emergency table structure
app.get('/api/emergency-table-structure', (req, res) => {
  const sql = `
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns 
    WHERE table_name = 'emergency_onboarding'
    ORDER BY ordinal_position
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Database error fetching table structure:', err);
      return res.status(500).json({ 
        error: 'Failed to fetch table structure',
        details: err.message 
      });
    }
    
    res.status(200).json({ 
      structure: results,
      count: results.length
    });
  });
});

// Get all emergency reports
app.get('/api/emergency-reports', (req, res) => {
  const sql = `
    SELECT 
      id, date, time_of_call, caller_name, department, 
      patient_name, patient_surname, student_number,
      created_at
    FROM emergency_onboarding 
    ORDER BY created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Database error fetching emergency reports:', err);
      return res.status(500).json({ 
        error: 'Failed to fetch emergency reports',
        details: err.message 
      });
    }
    
    res.status(200).json({ 
      reports: results,
      count: results.length
    });
  });
});

// Get single emergency report by ID
app.get('/api/emergency-report/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'SELECT * FROM emergency_onboarding WHERE id = $1';

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Database error fetching emergency report:', err);
      return res.status(500).json({ 
        error: 'Failed to fetch emergency report',
        details: err.message 
      });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ 
        error: 'Emergency report not found'
      });
    }
    
    res.status(200).json({ 
      report: results[0]
    });
  });
});

// Update emergency report - FIXED VERSION
app.put('/api/emergency-report/:id', (req, res) => {
  const { id } = req.params;
  const formData = req.body;

  const sql = `
    UPDATE emergency_onboarding SET
      date = ?, time_of_call = ?, person_responsible = ?, caller_name = ?, department = ?,
      contact_number = ?, problem_nature = ?, east_campus = ?, west_campus = ?, education_campus = ?,
      other_campus = ?, building = ?, room_number = ?, floor = ?, other_location = ?, staff_informed = ?,
      notification_time = ?, team_responding = ?, time_left_clinic = ?, chwc_vehicle = ?,
      sisters_on_foot = ?, other_transport = ?, other_transport_detail = ?, arrival_time = ?,
      student_number = ?, patient_name = ?, patient_surname = ?, primary_assessment = ?,
      intervention = ?, medical_consent = ?, transport_consent = ?, signature = ?, consent_date = ?,
      pt_chwc_vehicle = ?, pt_ambulance = ?, pt_other = ?, pt_other_detail = ?,
      patient_transported_to = ?, departure_time = ?, chwc_arrival_time = ?, existing_file = ?,
      referred = ?, hospital_name = ?, discharge_condition = ?, discharge_time = ?
    WHERE id = $1
  `;

  const values = [
    formData.date,
    formData.timeOfCall,
    formData.personResponsible,
    formData.callerName,
    formData.department,
    formData.contactNumber,
    formData.problemNature,
    formData.eastCampus || false,
    formData.westCampus || false,
    formData.educationCampus || false,
    formData.otherCampus || false,
    formData.building || null,
    formData.roomNumber || null,
    formData.floor || null,
    formData.otherLocation || null,
    formData.staffInformed,
    formData.notificationTime,
    formData.teamResponding,
    formData.timeLeftClinic,
    formData.chwcVehicle || false,
    formData.sistersOnFoot || false,
    formData.otherTransport || false,
    formData.otherTransportDetail || null,
    formData.arrivalTime,
    formData.studentNumber,
    formData.patientName,
    formData.patientSurname,
    formData.primaryAssessment,
    formData.intervention,
    formData.medicalConsent,
    formData.transportConsent,
    formData.signature,
    formData.consentDate,
    formData.ptCHWCVehicle || false,
    formData.ptAmbulance || false,
    formData.ptOther || false,
    formData.ptOtherDetail || null,
    formData.patientTransportedTo,
    formData.departureTime,
    formData.chwcArrivalTime,
    formData.existingFile,
    formData.referred,
    formData.hospitalName || null,
    formData.dischargeCondition,
    formData.dischargeTime,
    id
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Database error updating emergency report:', err);
      return res.status(500).json({ 
        error: 'Failed to update emergency report',
        details: err.message 
      });
    }
    
    if (result.rowCount === 0) {
      return res.status(404).json({ 
        error: 'Emergency report not found'
      });
    }
    
    res.status(200).json({ 
      message: 'Emergency report updated successfully!'
    });
  });
});

// Delete emergency report
app.delete('/api/emergency-report/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM emergency_onboarding WHERE id = $1';

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Database error deleting emergency report:', err);
      return res.status(500).json({ 
        error: 'Failed to delete emergency report',
        details: err.message 
      });
    }
    
    if (result.rowCount === 0) {
      return res.status(404).json({ 
        error: 'Emergency report not found'
      });
    }
    
    res.status(200).json({ 
      message: 'Emergency report deleted successfully!'
    });
  });
});

// Report endpoints
app.get('/report', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/reports.html'));
});

// 🔹 Report 1: Appointments (Line Chart: Bookings vs Emergencies)
app.post('/report1', (req, res) => {
  res.status(200).json({ message: 'Report generation temporarily disabled for PostgreSQL compatibility' });
});

// 🔹 Report 2: Emergencies (Pie Chart + Table)
app.post('/report2', (req, res) => {
  res.status(200).json({ message: 'Report generation temporarily disabled for PostgreSQL compatibility' });
});

app.post('/report3', (req, res) => {
  res.status(200).json({ message: 'Report generation temporarily disabled for PostgreSQL compatibility' });
});

// API Report endpoints
app.post('/api/report1', (req, res) => {
  res.status(200).json({ message: 'Report generation temporarily disabled for PostgreSQL compatibility' });
});

app.post('/api/report2', (req, res) => {
  res.status(200).json({ message: 'Report generation temporarily disabled for PostgreSQL compatibility' });
});

app.post('/api/report3', (req, res) => {
  res.status(200).json({ message: 'Report generation temporarily disabled for PostgreSQL compatibility' });
});

// API Endpoint: Get onboarding data for reports
app.get('/api/onboarding-data', (req, res) => {
  const { from, to, role } = req.query;
  
  let sql = `
    SELECT 
      id,
      student_number as id,
      CONCAT(surname, ', ', full_names) as name,
      'Student' as role,
      TO_CHAR(date, 'YYYY-MM-DD') as date
    FROM onboarding_students
    WHERE 1=1
  `;
  
  const params = [];
  
  if (from) {
    sql += ' AND DATE(date) >= $' + (params.length + 1);
    params.push(from);
  }
  
  if (to) {
    sql += ' AND DATE(date) <= $' + (params.length + 1);
    params.push(to);
  }
  
  sql += ' ORDER BY date DESC';
  
  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Database error fetching onboarding data:', err);
      return res.status(500).json({ 
        error: 'Failed to fetch onboarding data',
        details: err.message 
      });
    }
    
    res.status(200).json(results.rows);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`- POST /api/login (FIXED with better error handling)`);
  console.log(`- POST /api/check-onboarding`);
  console.log(`- POST /api/check-por`);
  console.log(`- POST /api/upload-por`);
  console.log(`- POST /api/save-appointment`);
  console.log(`- GET /api/student-appointments/:studentNumber`);
  console.log(`- GET /api/appointments`);
  console.log(`- GET /api/appointments/student/:studentNumber`);
  console.log(`- PUT /api/appointments/:id`);
  console.log(`- PUT /api/appointments/:id/cancel`);
  console.log(`- POST /api/reset-passwords (FIXED - resets both users and students)`);
  console.log(`- POST /api/debug-user`);
  console.log(`- GET /api/users`);
  console.log(`- GET /api/students`);
  console.log(`- GET /api/por-uploads`);
  console.log(`- POST /api/onboarding`);
  console.log(`- POST /api/create-student`);
  console.log(`- POST /api/reset-student-password`);
  console.log(`- POST /api/save-staff-schedule`);
  console.log(`- GET /api/today-staff-schedule`);
  console.log(`- POST /api/save-emergency (COMPLETELY FIXED - uses dynamic approach)`);
  console.log(`- GET /api/emergencies`);
  console.log(`- GET /api/emergency/:id`);
  console.log(`- PUT /api/emergency/:id`);
  console.log(`- DELETE /api/emergency/:id`);
  console.log(`- POST /api/emergency-onboarding (FIXED - uses dynamic approach)`);
  console.log(`- GET /api/emergency-reports`);
  console.log(`- GET /api/emergency-report/:id`);
  console.log(`- PUT /api/emergency-report/:id`);
  console.log(`- DELETE /api/emergency-report/:id`);
  console.log(`- GET /report`);
  console.log(`- POST /report1`);
  console.log(`- POST /report2`);
  console.log(`- POST /report3`);
  console.log(`- POST /api/report1`);
  console.log(`- POST /api/report2`);
  console.log(`- POST /api/report3`);
  console.log(`- GET /api/onboarding-data`);
});
