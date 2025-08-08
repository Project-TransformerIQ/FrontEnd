// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TransformersPage from "./pages/TransformersPage";
import ImageUploadPage from "./pages/ImageUploadPage";
import TransformerInspectionsPage from "./pages/TransformerInspectionsPage";
import ComparePage from "./pages/ComparePage";
import "./App.css";

function App() {
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

export default App;
