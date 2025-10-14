import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import OnboardingPage from "./pages/OnboardingPage";
import RegistrationCapturePage from "./pages/RegistrationCapturePage";
import BookingPage from "./pages/BookingPage";
import FollowUpBookingPage from "./pages/FollowUpBookingPage";
import HealthAndWellnessPage from "./pages/HealthAndWellnessPage";
import ConfirmBookingPage from "./pages/ConfirmBookingPage";
import ConfirmFollowUpBooking from "./pages/ConfirmFollowUpBooking";
import SubmittedPage from "./pages/SubmittedPage";
import MySubmissionsPage from "./pages/MySubmissionsPage";

// Dashboards
import PatientDashboard from "./pages/PatientDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NurseDashboard from "./pages/NurseDashboard";

// Nurse pages
import ClinicalRecordsPage from "./pages/ClinicalRecordsPage";
import SavedRecordsPage from "./pages/SavedRecordsPage";

// Staff use case pages (admin only)
import StaffSchedulePage from "./pages/staff/StaffSchedulePage";
import EmergencyOnboardingPage from "./pages/staff/EmergencyOnboardingPage";
import ModifyBookingPage from "./pages/staff/ModifyBookingPage";
import ApproveProofPage from "./pages/staff/ApproveProofPage";
import TodaysSchedule from "./pages/staff/TodaysSchedule";
import ReportsPage from "./pages/ReportsPage";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/" element={<LoginPage />} />

      {/* Patient routes */}
      <Route
        path="/patient-dashboard"
        element={
          <ProtectedRoute requiredRole="patient">
            <PatientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute requiredRole="patient">
            <OnboardingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/upload-proof"
        element={
          <ProtectedRoute requiredRole="patient">
            <RegistrationCapturePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/booking"
        element={
          <ProtectedRoute requiredRole="patient">
            <BookingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/confirm-booking"
        element={
          <ProtectedRoute requiredRole="patient">
            <ConfirmBookingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/health-wellness-booking"
        element={
          <ProtectedRoute requiredRole="patient">
            <HealthAndWellnessPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/follow-up-booking"
        element={
          <ProtectedRoute requiredRole="patient">
            <FollowUpBookingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/confirm-follow-up"
        element={
          <ProtectedRoute requiredRole="patient">
            <ConfirmFollowUpBooking />
          </ProtectedRoute>
        }
      />
      <Route
        path="/submitted"
        element={
          <ProtectedRoute requiredRole="patient">
            <SubmittedPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-submissions"
        element={
          <ProtectedRoute requiredRole="patient">
            <MySubmissionsPage />
          </ProtectedRoute>
        }
      />

      {/* Nurse routes */}
      <Route
        path="/nurse-dashboard"
        element={
          <ProtectedRoute requiredRole="nurse">
            <NurseDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clinical-records"
        element={
          <ProtectedRoute requiredRole="nurse">
            <ClinicalRecordsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/saved-records"
        element={
          <ProtectedRoute requiredRole="nurse">
            <SavedRecordsPage />
          </ProtectedRoute>
        }
      />

      {/* Admin routes */}
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff-schedule"
        element={
          <ProtectedRoute requiredRole="admin">
            <StaffSchedulePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/emergency-onboarding"
        element={
          <ProtectedRoute requiredRole="admin">
            <EmergencyOnboardingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/modify-booking"
        element={
          <ProtectedRoute requiredRole="admin">
            <ModifyBookingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/approve-proof"
        element={
          <ProtectedRoute requiredRole="admin">
            <ApproveProofPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/today-schedule"
        element={
          <ProtectedRoute requiredRole="admin">
            <TodaysSchedule />
          </ProtectedRoute>
        }
      />
      <Route
        path="/new-report"
        element={
          <ProtectedRoute requiredRole="admin">
            <ReportsPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;