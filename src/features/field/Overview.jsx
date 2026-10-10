import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Camera, ClipboardList, Sprout } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";
import DataTable from "@/components/common/DataTable";
import StatusBadge from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { useDb } from "@/services/mock/store";
import { fmtDate } from "@/lib/format";

export default function FieldOverview() {
  const projects = useDb((s) => s.projects);
  const logs = useDb((s) => s.fieldLogs);
  const live = useMemo(() => projects.filter((p) => ["FUNDED", "IN_PROGRESS"].includes(p.status)), [projects]);
  const recent = useMemo(() => [...logs].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8), [logs]);
  const title = (id) => projects.find((p) => p.id === id)?.title;
  return (
    <>
      <PageHeader title="Field operations" description="Log measurements and proof from the farm." actions={<Button asChild><Link to="log">New update</Link></Button>} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Active projects" value={live.length} icon={Sprout} />
        <StatCard label="Logs this month" value={logs.filter((l) => Date.now() - new Date(l.date) < 30 * 864e5).length} icon={ClipboardList} />
        <StatCard label="Media uploaded" value={logs.reduce((a, l) => a + l.media.length, 0)} icon={Camera} />
      </div>
      <h2 className="mb-3 mt-6 text-lg font-semibold">Projects needing updates</h2>
      <DataTable rows={live} columns={[{ key: "t", header: "Project", render: (p) => p.title }, { key: "l", header: "Location", render: (p) => p.location }, { key: "s", header: "Status", render: (p) => <StatusBadge status={p.status} /> }]} />
      <h2 className="mb-3 mt-6 text-lg font-semibold">Recent logs</h2>
      <DataTable rows={recent} columns={[{ key: "d", header: "Date", render: (l) => fmtDate(l.date) }, { key: "p", header: "Project", render: (l) => title(l.projectId) }, { key: "t", header: "Type" }, { key: "n", header: "Details", render: (l) => `${l.tag ? `#${l.tag} ` : ""}${l.value ?? ""} ${l.unit ?? ""} ${l.note}` }]} />
    </>
  );
}
