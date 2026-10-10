import { useMemo } from "react";
import { Check, X } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import DataTable from "@/components/common/DataTable";
import StatusBadge from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/AuthContext";
import { useAction } from "@/hooks/useAction";
import { useDb } from "@/services/mock/store";
import { api } from "@/services/api";
import { formatBDT } from "@/lib/money";
import { fmtDateTime } from "@/lib/format";

function Review({ tx }) {
  const { user } = useAuth();
  const [run, pending] = useAction((ok) => api.reviewTx(user.id, tx.id, ok), "Decision recorded");
  if (tx.status !== "PENDING") return <StatusBadge status={tx.status} />;
  return (
    <div className="flex gap-2">
      <Button size="sm" disabled={pending} onClick={() => run(true)}><Check className="mr-1 h-3.5 w-3.5" />Approve</Button>
      <Button size="sm" variant="outline" disabled={pending} onClick={() => run(false)}><X className="mr-1 h-3.5 w-3.5" />Reject</Button>
    </div>
  );
}

// Shared by Payment Approvals (deposits) and Withdrawal Queue.
export function ReviewQueue({ type, title, description }) {
  const txs = useDb((s) => s.transactions);
  const users = useDb((s) => s.users);
  const rows = useMemo(() => txs.filter((t) => t.type === type).sort((a, b) => (a.status === "PENDING" ? -1 : 1) - (b.status === "PENDING" ? -1 : 1) || new Date(b.date) - new Date(a.date)), [txs, type]);
  const name = (id) => users.find((u) => u.id === id)?.name;
  return (
    <>
      <PageHeader title={title} description={description} />
      <DataTable rows={rows} empty="Queue is empty" columns={[
        { key: "d", header: "Submitted", render: (t) => fmtDateTime(t.date) },
        { key: "u", header: "Investor", render: (t) => name(t.userId) },
        { key: "a", header: "Amount", render: (t) => formatBDT(Math.abs(t.amount)) },
        { key: "c", header: "Channel", render: (t) => t.channel },
        { key: "r", header: type === "DEPOSIT" ? "Transaction ID" : "Destination", render: (t) => <code className="text-xs">{t.trxId}</code> },
        { key: "s", header: "Action", render: (t) => <Review tx={t} /> },
      ]} />
    </>
  );
}
