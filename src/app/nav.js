import { LayoutDashboard, Store, Briefcase, Activity, Wallet, FileText, Bell, UserCircle, ClipboardList, Inbox, Banknote, Calculator, BookOpen, Megaphone, ShieldCheck, Users, ScrollText } from "lucide-react";

export const NAV = {
  INVESTOR: [
    { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
    { to: "/dashboard/marketplace", label: "Marketplace", icon: Store },
    { to: "/dashboard/portfolio", label: "My Portfolio", icon: Briefcase },
    { to: "/dashboard/tracker", label: "Field Tracker", icon: Activity },
    { to: "/dashboard/wallet", label: "Wallet & Ledger", icon: Wallet },
    { to: "/dashboard/legal", label: "Legal Vault", icon: FileText },
    { to: "/dashboard/profile", label: "Profile & KYC", icon: UserCircle },
  ],
  FIELD_MGR: [
    { to: "/field", label: "Overview", icon: LayoutDashboard, end: true },
    { to: "/field/log", label: "Log Update", icon: ClipboardList },
  ],
  FINANCE: [
    { to: "/finance", label: "Overview", icon: LayoutDashboard, end: true },
    { to: "/finance/deposits", label: "Payment Approvals", icon: Inbox },
    { to: "/finance/payouts", label: "Withdrawal Queue", icon: Banknote },
    { to: "/finance/allocation", label: "Revenue Allocation", icon: Calculator },
    { to: "/finance/ledger", label: "Ledger", icon: BookOpen },
  ],
  ADMIN: [
    { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
    { to: "/admin/campaigns", label: "Campaigns", icon: Megaphone },
    { to: "/admin/kyc", label: "KYC Desk", icon: ShieldCheck },
    { to: "/admin/users", label: "Users & Roles", icon: Users },
    { to: "/admin/audit", label: "Audit Log", icon: ScrollText },
  ],
};
export const NOTIFICATIONS = { to: "/notifications", label: "Notifications", icon: Bell };
