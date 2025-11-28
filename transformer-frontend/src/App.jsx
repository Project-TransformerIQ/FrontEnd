
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider, useUser } from "./contexts/UserContext";

import TransformersPage from "./pages/TransformersPage";
import ImageUploadPage from "./pages/ImageUploadPage";
import TransformerInspectionsPage from "./pages/TransformerInspectionsPage";
import ComparePage from "./pages/ComparePage";
import LoginPage from "./pages/LoginPage";
import MaintenanceRecordPage from "./pages/MaintenanceRecordPage";
import MaintenanceRecordsListPage from "./pages/MaintenanceRecordsListPage";
import AdminUsersPage from "./pages/AdminUsersPage";

import "./App.css";

function ProtectedRoute({ children }) {
  const { currentUser } = useUser();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppRoutes() {
  const { currentUser } = useUser();
  const isAdmin = currentUser?.admin === true;

  return (
    <Routes>
      {/* LOGIN (only when logged out) */}
      <Route
        path="/login"
        element={
          currentUser ? (
            <Navigate to={isAdmin ? "/admin/users" : "/"} replace />
          ) : (
            <LoginPage />
          )
        }
      />

      {/* ADMIN ONLY */}
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute>
            {isAdmin ? <AdminUsersPage /> : <Navigate to="/" replace />}
          </ProtectedRoute>
        }
      />

      {/* NORMAL APP ROUTES (any logged-in user) */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <TransformersPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <ImageUploadPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/transformers/:id/inspections"
        element={
          <ProtectedRoute>
            <TransformerInspectionsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/transformers/:id/inspections/:inspectionId/compare"
        element={
          <ProtectedRoute>
            <ComparePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/transformers/:id/inspections/:inspectionId/maintenance-records"
        element={
          <ProtectedRoute>
            <MaintenanceRecordPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/transformers/:id/maintenance-records"
        element={
          <ProtectedRoute>
            <MaintenanceRecordsListPage />
          </ProtectedRoute>
        }
      />

      {/* (Optional) unknown routes → login */}
      {/* If you really don't want *any* fallback, you can remove this */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <UserProvider>
      <Router>
        <AppRoutes />
      </Router>
    </UserProvider>
  );
}
