# CHWC System - Report Generation Feature

## Overview
The CHWC (Campus Health and Wellness Center) system now includes comprehensive PDF report generation capabilities. This feature allows administrators to generate detailed reports for appointments, emergencies, and proof of registration uploads.

## Features Added

### 1. PDF Report Generation
- **Appointments Report** (`/api/report1`): Monthly breakdown of appointments and emergency cases
- **Emergency Report** (`/api/report2`): Campus-wise emergency statistics
- **Proof of Registration Report** (`/api/report3`): Monthly upload statistics

### 2. User Interface
- **HTML Dashboard** (`/report`): Standalone web interface for report generation
- **React Component** (`/new-report`): Integrated React component for the admin dashboard

## How to Use

### Option 1: Standalone HTML Interface
1. Navigate to `http://localhost:5001/report`
2. Click on any report type to generate and download the PDF
3. Reports will automatically download to your default downloads folder

### Option 2: React Application Interface
1. Log in as an admin user
2. Navigate to the admin dashboard
3. Click "View Reports" button
4. Select the desired report type
5. Click "Generate Report" to download the PDF

### Option 3: Direct API Calls
You can also call the report endpoints directly:

```bash
# Generate appointments report
curl -X POST http://localhost:5001/api/report1 -o appointments_report.pdf

# Generate emergency report
curl -X POST http://localhost:5001/api/report2 -o emergency_report.pdf

# Generate POR report
curl -X POST http://localhost:5001/api/report3 -o por_report.pdf
```

## Report Details

### Appointments Report (`/api/report1`)
- **Content**: Monthly statistics of appointments and emergency cases
- **Data Source**: `appointments` and `emergency_onboarding` tables
- **Output**: PDF with month, bookings count, and emergencies count

### Emergency Report (`/api/report2`)
- **Content**: Campus distribution of emergency cases
- **Data Source**: `emergency_onboarding` table
- **Output**: PDF with Parktown campus, Main campus, and total counts

### Proof of Registration Report (`/api/report3`)
- **Content**: Monthly upload statistics for student documents
- **Data Source**: `por_uploads` table
- **Output**: PDF with upload month and count

## Technical Implementation

### Backend Changes
- Added `pdfkit` dependency for PDF generation
- New endpoints: `/api/report1`, `/api/report2`, `/api/report3`
- HTML dashboard route: `/report`

### Frontend Changes
- New React component: `ReportsPage.js`
- Added route: `/new-report` (admin-only)
- Integrated with existing admin dashboard

### Database Requirements
The reports require the following tables to exist:
- `appointments` - for appointment data
- `emergency_onboarding` - for emergency case data
- `por_uploads` - for proof of registration data

## Installation

1. Install the new dependency:
```bash
npm install pdfkit
```

2. Restart the server:
```bash
node server.js
```

3. Access the reports through:
   - HTML interface: `http://localhost:5001/report`
   - React interface: Login as admin and navigate to "View Reports"

## Error Handling
- Database connection errors are logged and return 500 status
- Missing data tables will result in empty reports
- Network errors are displayed to users with retry options

## Security
- All report endpoints require admin authentication
- Reports are generated server-side for data security
- No sensitive data is exposed in client-side code

## Future Enhancements
- Date range filtering for reports
- Additional report types (staff schedules, patient demographics)
- Email delivery of reports
- Report scheduling and automation
- Export to additional formats (Excel, CSV)
