import { useMemo } from "react";
import PageHeader from "@/components/common/PageHeader";
import DataTable from "@/components/common/DataTable";
import StatusBadge from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/AuthContext";
import { useAction } from "@/hooks/useAction";
import { useDb } from "@/services/mock/store";
import { api } from "@/services/api";

function Decide({ u }) {
  const { user } = useAuth();
  const [run, pending] = useAction((ok) => api.reviewKyc(user.id, u.id, ok), "Decision recorded");
  if (u.kyc.status !== "PENDING") return <StatusBadge status={u.kyc.status} />;
  return <div className="flex gap-2"><Button size="sm" disabled={pending} onClick={() => run(true)}>Verify</Button><Button size="sm" variant="outline" disabled={pending} onClick={() => run(false)}>Reject</Button></div>;
}

export default function KycDesk() {
  const users = useDb((s) => s.users);
  const rows = useMemo(() => users.filter((u) => u.role === "INVESTOR" && u.kyc.status !== "NONE").sort((a, b) => (a.kyc.status === "PENDING" ? -1 : 1) - (b.kyc.status === "PENDING" ? -1 : 1)), [users]);
  return (
    <>
      <PageHeader title="KYC & compliance desk" description="Review identity details before investors can buy units." />
      <DataTable rows={rows} columns={[
        { key: "n", header: "Investor", render: (u) => <><b>{u.name}</b><span className="block text-xs text-muted-foreground">{u.email}</span></> },
        { key: "nid", header: "NID", render: (u) => <code className="text-xs">{u.kyc.nid}</code> },
        { key: "tin", header: "TIN", render: (u) => u.kyc.tin || "—" },
        { key: "a", header: "Status / action", render: (u) => <Decide u={u} /> },
      ]} />
    </>
  );
}
