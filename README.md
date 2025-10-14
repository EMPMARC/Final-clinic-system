# CHWC Campus Health and Wellness Center Management System

This is a comprehensive management system for the Campus Health and Wellness Center, built with React frontend and Express.js backend.

## Project Structure

```
chwc-system-main/
├── backend/                 # Express.js API server
│   ├── server.js           # Main server file
│   ├── package.json        # Backend dependencies
│   └── uploads/            # File uploads directory
├── frontend/               # React application
│   ├── src/               # React source code
│   ├── public/            # Public assets
│   └── package.json       # Frontend dependencies
└── package.json           # Root package.json for managing both apps
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MySQL database
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/TshiamoMokgethwa/chwc-system.git
cd chwc-system
```

2. Install all dependencies:
```bash
npm run install-all
```

### Running the Application

#### Development Mode (Both Frontend and Backend)
```bash
npm run dev
```

#### Running Individual Services

**Backend only:**
```bash
npm run start:backend
```

**Frontend only:**
```bash
npm run start:frontend
```

### Production Build

```bash
npm run build
```

## Configuration

### Backend Configuration

The backend server runs on port 5001 by default. Update the database connection details in `backend/server.js`:

```javascript
const db = mysql.createPool({
  host: 'your-database-host',
  user: 'your-username',
  password: 'your-password',
  database: 'your-database-name',
  // ... other options
});
```

### Frontend Configuration

The React app runs on port 3000 by default. API calls are configured to point to the backend server.

## Features

- Student onboarding and registration
- Appointment booking and management
- Emergency incident reporting
- Proof of registration (POR) upload and approval
- Staff scheduling
- Comprehensive reporting system
- File upload and management

## API Endpoints

The backend provides RESTful APIs for:
- User authentication (staff and students)
- Student onboarding
- Appointment management
- Emergency reporting
- File uploads
- Report generation

## Development

### Adding New Features

1. Backend: Add new routes in `backend/server.js`
2. Frontend: Add new components in `frontend/src/components/`
3. Update API calls in frontend components

### Database

The system uses MySQL with the following main tables:
- `users` - Staff accounts
- `students` - Student accounts
- `onboarding_students` - Student registration data
- `appointments` - Appointment bookings
- `emergencies` - Emergency incident reports
- `por_uploads` - Proof of registration files

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.
