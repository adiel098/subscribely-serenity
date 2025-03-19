
import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import NotFound from "@/main/pages/NotFound";
import DashboardPage from "@/group_owners/pages/dashboard/DashboardPage";
import { Login } from "@/auth/pages/Login";
import { SignUp } from "@/auth/pages/SignUp";
import { ForgotPassword } from "@/auth/pages/ForgotPassword";
import { ResetPassword } from "@/auth/pages/ResetPassword";
import TelegramConnect from "@/group_owners/pages/connect/TelegramConnect";
import Onboarding from "@/group_owners/pages/onboarding/Onboarding";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "connect/telegram",
        element: <TelegramConnect />,
      },
      // Add onboarding as a child of AppLayout
      {
        path: "onboarding",
        element: <Onboarding />,
      },
      {
        path: "onboarding/:step",
        element: <Onboarding />,
      },
      // Add more app routes here
    ],
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <Login />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "signup",
        element: <SignUp />,
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "reset-password",
        element: <ResetPassword />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  }
]);
