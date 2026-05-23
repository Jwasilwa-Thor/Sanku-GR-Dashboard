import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy load pages for better performance and smaller initial bundle size
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Stakeholders = lazy(() => import("./pages/Stakeholders"));
const PowerMap = lazy(() => import("./pages/PowerMap"));
const StakeholderDetail = lazy(() => import("./pages/StakeholderDetail"));
const Overview = lazy(() => import("./pages/Overview"));
const GRMandate = lazy(() => import("./pages/GRMandate"));
const KPIs = lazy(() => import("./pages/KPIs"));
const ServicesStrategy = lazy(() => import("./pages/ServicesStrategy"));
const ActivityProjects = lazy(() => import("./pages/ActivityProjects"));
const PolicyAdvocacy = lazy(() => import("./pages/PolicyAdvocacy"));
const Partnerships = lazy(() => import("./pages/Partnerships"));
const InternalOps = lazy(() => import("./pages/InternalOps"));
const Budget = lazy(() => import("./pages/Budget"));
const Settings = lazy(() => import("./pages/Settings"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const StandaloneTableDemo = lazy(() => import("./pages/StandaloneTableDemo"));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen animate-pulse text-muted-foreground">
    Loading Command Centre...
  </div>
);

const App: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        
        {/* Standalone Table Demo - No Layout */}
        <Route path="/demo/standalone-table" element={<StandaloneTableDemo />} />

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
    </Suspense>
  );
};

export default App;
