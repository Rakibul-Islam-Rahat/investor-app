import { Link } from "react-router-dom";
import { Download } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import DataTable from "@/components/common/DataTable";
import StatusBadge from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { downloadContract } from "@/lib/pdf";
import { formatBDT } from "@/lib/money";
import { fmtDate } from "@/lib/format";
import { usePortfolio } from "./hooks";

export default function Portfolio() {
  const { mine, user } = usePortfolio();
  const rows = [...mine].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return (
    <>
      <PageHeader title="My portfolio" description="Every unit you own, with live status." />
      <DataTable rows={rows} empty="You haven't invested yet" columns={[
        { key: "p", header: "Project", render: (i) => <Link className="font-medium hover:underline" to={`/dashboard/tracker?project=${i.projectId}`}>{i.project.title}</Link> },
        { key: "units", header: "Units" },
        { key: "amount", header: "Invested", render: (i) => formatBDT(i.amount) },
        { key: "ret", header: "Expected / actual", render: (i) => i.status === "COMPLETED" ? <b className="text-primary">{formatBDT(i.payout)}</b> : formatBDT(Math.round(i.amount * (1 + i.project.roi / 100))) },
        { key: "date", header: "Date", render: (i) => fmtDate(i.createdAt) },
        { key: "st", header: "Status", render: (i) => <StatusBadge status={i.status} /> },
        { key: "c", header: "", render: (i) => <Button size="sm" variant="outline" onClick={() => downloadContract({ inv: i, project: i.project, user })}><Download className="mr-1 h-3.5 w-3.5" />Deed</Button> },
      ]} />
    </>
  );
}
