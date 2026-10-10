import { useMemo, useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import DataTable from "@/components/common/DataTable";
import StatusBadge from "@/components/common/StatusBadge";
import { SelectInput } from "@/components/common/form";
import { useDb } from "@/services/mock/store";
import { formatBDT } from "@/lib/money";
import { fmtDateTime } from "@/lib/format";

export default function Ledger() {
  const txs = useDb((s) => s.transactions);
  const users = useDb((s) => s.users);
  const [type, setType] = useState("ALL");
  const rows = useMemo(() => txs.filter((t) => type === "ALL" || t.type === type).sort((a, b) => new Date(b.date) - new Date(a.date)), [txs, type]);
  return (
    <>
      <PageHeader title="Financial ledger" actions={<div className="w-40"><SelectInput aria-label="Filter by type" value={type} onChange={(e) => setType(e.target.value)} options={["ALL", "DEPOSIT", "INVEST", "DIVIDEND", "WITHDRAW"]} /></div>} />
      <DataTable rows={rows} columns={[
        { key: "d", header: "Date", render: (t) => fmtDateTime(t.date) },
        { key: "u", header: "Account", render: (t) => users.find((u) => u.id === t.userId)?.name },
        { key: "t", header: "Type" },
        { key: "a", header: "Amount", className: "text-right tabular-nums", render: (t) => formatBDT(t.amount) },
        { key: "s", header: "Status", render: (t) => <StatusBadge status={t.status} /> },
      ]} />
    </>
  );
}
