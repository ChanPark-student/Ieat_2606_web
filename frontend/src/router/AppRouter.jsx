import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import Dashboard from "../pages/Dashboard";
import NewDiagnosis from "../pages/NewDiagnosis";
import DocumentAnalysis from "../pages/DocumentAnalysis";
import RecallCases from "../pages/RecallCases";
import CertificationGuide from "../pages/CertificationGuide";
import History from "../pages/History";
import Settings from "../pages/Settings";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/new" element={<NewDiagnosis />} />
          <Route path="/document" element={<DocumentAnalysis />} />
          <Route path="/recall" element={<RecallCases />} />
          <Route path="/guide" element={<CertificationGuide />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;