
import { createFileRoute, redirect } from "@tanstack/react-router";
import { GroupOwnerDashboard } from "./pages/Dashboard";
import { SubscribersPage } from "./pages/Subscribers";
import { SettingsPage } from "./pages/Settings";
import { PaymentsPage } from "./pages/Payments";
import { MessagesPage } from "./pages/Messages";
import { Subscriptions } from "./pages/Subscriptions";
import { CouponsPage } from "./components/coupons/CouponsPage";

export const Route = createFileRoute("/_auth/group-owner/")({
  component: () => <GroupOwnerDashboard />,
});

export const SubscribersRoute = createFileRoute("/_auth/group-owner/subscribers")({
  component: () => <SubscribersPage />,
});

export const SubscriptionsRoute = createFileRoute("/_auth/group-owner/subscriptions")({
  component: () => <Subscriptions />,
});

export const CouponsRoute = createFileRoute("/_auth/group-owner/coupons")({
  component: () => <CouponsPage />,
});

export const SettingsRoute = createFileRoute("/_auth/group-owner/settings")({
  component: () => <SettingsPage />,
});

export const PaymentsRoute = createFileRoute("/_auth/group-owner/payments")({
  component: () => <PaymentsPage />,
});

export const MessagesRoute = createFileRoute("/_auth/group-owner/messages")({
  component: () => <MessagesPage />,
});
