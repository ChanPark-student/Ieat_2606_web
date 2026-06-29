import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import DiagnosisNewPage from "./pages/DiagnosisNewPage";
import DiagnosisResultPage from "./pages/DiagnosisResultPage";
import DiagnosisHistoryPage from "./pages/DiagnosisHistoryPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/home" element={<HomePage />} />

        <Route path="/diagnoses/new" element={<DiagnosisNewPage />} />
        <Route path="/diagnoses/result" element={<DiagnosisResultPage />} />
        <Route path="/diagnoses/history" element={<DiagnosisHistoryPage />} />
      </Routes>
    </BrowserRouter>
  );
}