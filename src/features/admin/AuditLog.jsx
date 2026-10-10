import PageHeader from "@/components/common/PageHeader";
import DataTable from "@/components/common/DataTable";
import { useDb } from "@/services/mock/store";
import { fmtDateTime } from "@/lib/format";

export default function AuditLog() {
  const audit = useDb((s) => s.audit);
  return (
    <>
      <PageHeader title="Audit log" description="Append-only record of every financial and administrative change." />
      <DataTable rows={audit} columns={[
        { key: "d", header: "When", render: (a) => fmtDateTime(a.date) }, { key: "a", header: "Actor", render: (a) => a.actorName },
        { key: "x", header: "Action", render: (a) => <code className="text-xs">{a.action}</code> }, { key: "e", header: "Entity" }, { key: "t", header: "Detail", render: (a) => a.detail },
      ]} />
    </>
  );
}
