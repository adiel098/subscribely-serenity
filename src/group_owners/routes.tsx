
import React from "react";
import { Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Subscribers from "./pages/Subscribers";
import { CouponsPage } from "./components/coupons/CouponsPage";
import Subscriptions from "./pages/Subscriptions";
import NewProject from "./pages/projects/NewProject";
import ProjectSettings from "./pages/projects/ProjectSettings";

export const GroupOwnerRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/subscribers" element={<Subscribers />} />
      <Route path="/subscriptions" element={<Subscriptions />} />
      <Route path="/coupons" element={<CouponsPage />} />
      <Route path="/projects/new" element={<NewProject />} />
      <Route path="/projects/:projectId/settings" element={<ProjectSettings />} />
      {/* Add other routes as they are implemented */}
    </Routes>
  );
};

export default GroupOwnerRoutes;
