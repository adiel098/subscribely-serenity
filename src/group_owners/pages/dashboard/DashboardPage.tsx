
import React from "react";
import { DashboardLayout } from "@/group_owners/components/DashboardLayout";
import Dashboard from "@/group_owners/pages/Dashboard";

const DashboardPage: React.FC = () => {
  return (
    <DashboardLayout>
      <Dashboard />
    </DashboardLayout>
  );
};

export default DashboardPage;
