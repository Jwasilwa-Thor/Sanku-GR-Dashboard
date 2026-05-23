import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Stakeholders from "./pages/Stakeholders";
import PowerMap from "./pages/PowerMap";
import StakeholderDetail from "./pages/StakeholderDetail";
import Overview from "./pages/Overview";
import GRMandate from "./pages/GRMandate";
import KPIs from "./pages/KPIs";
import ServicesStrategy from "./pages/ServicesStrategy";
import ActivityProjects from "./pages/ActivityProjects";
import PolicyAdvocacy from "./pages/PolicyAdvocacy";
import Partnerships from "./pages/Partnerships";
import InternalOps from "./pages/InternalOps";
import Budget from "./pages/Budget";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/about" element={<Overview />} />
          <Route path="/stakeholders" element={<Stakeholders />} />
          <Route path="/stakeholders/:id" element={<StakeholderDetail />} />
          <Route path="/power-map" element={<PowerMap />} />
          <Route path="/gr-mandate" element={<GRMandate />} />
          <Route path="/kpis" element={<KPIs />} />
          <Route path="/services-strategy" element={<ServicesStrategy />} />
          <Route path="/activity-projects" element={<ActivityProjects />} />
          <Route path="/policy-advocacy" element={<PolicyAdvocacy />} />
          <Route path="/partnerships" element={<Partnerships />} />
          <Route path="/internal-ops" element={<InternalOps />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
