
import { Routes } from "react-router-dom";
import { PublicRoutes } from "./PublicRoutes";
import { AdminRoutes } from "./AdminRoutes";
import { GroupOwnerRoutes } from "./GroupOwnerRoutes";

export const AppRoutes = () => {
  return (
    <Routes>
      <PublicRoutes />
      <AdminRoutes />
      <GroupOwnerRoutes />
    </Routes>
  );
};
