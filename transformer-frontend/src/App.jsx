// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider, useUser } from "./contexts/UserContext";
import TransformersPage from "./pages/TransformersPage";
import ImageUploadPage from "./pages/ImageUploadPage";
import TransformerInspectionsPage from "./pages/TransformerInspectionsPage";
import ComparePage from "./pages/ComparePage";
import LoginPage from "./pages/LoginPage";
import MaintenanceRecordPage from "./pages/MaintenanceRecordPage"; // ⬅️ NEW
import "./App.css";

function AppContent() {
  const { currentUser, login } = useUser();

  if (!currentUser) {
    return <LoginPage onLogin={login} />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<TransformersPage />} />
        <Route path="/upload" element={<ImageUploadPage />} />
        <Route path="/transformers/:id/inspections" element={<TransformerInspectionsPage />} />
        <Route path="/transformers/:id/inspections/:inspectionId/compare" element={<ComparePage />} />
        {/* ⬇️ NEW route for FR4.x maintenance records */}
        <Route
          path="/transformers/:id/inspections/:inspectionId/maintenance-records"
          element={<MaintenanceRecordPage />}
        />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

export default App;
