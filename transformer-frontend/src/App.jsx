// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider, useUser } from "./contexts/UserContext";
import TransformersPage from "./pages/TransformersPage";
import ImageUploadPage from "./pages/ImageUploadPage";
import TransformerInspectionsPage from "./pages/TransformerInspectionsPage";
import ComparePage from "./pages/ComparePage";
import LoginPage from "./pages/LoginPage";
import "./App.css";

function AppContent() {
  const { currentUser, login } = useUser();

  // Show login page if no user is logged in
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
