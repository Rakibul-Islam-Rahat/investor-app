import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute from "@/features/auth/ProtectedRoute";
import GuestRoute from "@/features/auth/GuestRoute";
import { useAuth } from "@/features/auth/AuthContext";
import { ROLES, ROLE_HOME } from "@/config/roles";
import ErrorPage from "@/pages/ErrorPage";
import NotFoundPage from "@/pages/NotFoundPage";
import LoginPage from "@/pages/LoginPage";
import AppShell from "./layouts/AppShell";

const page = (loader) => ({ lazy: async () => ({ Component: (await loader()).default }) });
const guard = (role, path, children) => ({ path, element: <ProtectedRoute allowedRoles={[role]} />, children });

function RootRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? ROLE_HOME[user.role] : "/login"} replace />;
}

export const router = createBrowserRouter([
  { path: "/", element: <RootRedirect /> },
  { path: "/login", element: <GuestRoute><LoginPage /></GuestRoute> },
  {
    element: <ProtectedRoute><AppShell /></ProtectedRoute>,
    errorElement: <ErrorPage />,
    children: [
      { path: "notifications", ...page(() => import("@/features/shared/Notifications")) },
      guard(ROLES.INVESTOR, "dashboard", [
        { index: true, ...page(() => import("@/features/investor/Overview")) },
        { path: "marketplace", ...page(() => import("@/features/investor/Marketplace")) },
        { path: "marketplace/:id", ...page(() => import("@/features/investor/ProjectDetail")) },
        { path: "portfolio", ...page(() => import("@/features/investor/Portfolio")) },
        { path: "tracker", ...page(() => import("@/features/investor/Tracker")) },
        { path: "wallet", ...page(() => import("@/features/investor/Wallet")) },
        { path: "legal", ...page(() => import("@/features/investor/Legal")) },
        { path: "profile", ...page(() => import("@/features/investor/Profile")) },
      ]),
      guard(ROLES.FIELD_MGR, "field", [
        { index: true, ...page(() => import("@/features/field/Overview")) },
        { path: "log", ...page(() => import("@/features/field/LogUpdate")) },
      ]),
      guard(ROLES.FINANCE, "finance", [
        { index: true, ...page(() => import("@/features/finance/Overview")) },
        { path: "deposits", ...page(() => import("@/features/finance/Deposits")) },
        { path: "payouts", ...page(() => import("@/features/finance/Payouts")) },
        { path: "allocation", ...page(() => import("@/features/finance/Allocation")) },
        { path: "ledger", ...page(() => import("@/features/finance/Ledger")) },
      ]),
      guard(ROLES.ADMIN, "admin", [
        { index: true, ...page(() => import("@/features/admin/Overview")) },
        { path: "campaigns", ...page(() => import("@/features/admin/Campaigns")) },
        { path: "kyc", ...page(() => import("@/features/admin/KycDesk")) },
        { path: "users", ...page(() => import("@/features/admin/Users")) },
        { path: "audit", ...page(() => import("@/features/admin/AuditLog")) },
      ]),
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);
