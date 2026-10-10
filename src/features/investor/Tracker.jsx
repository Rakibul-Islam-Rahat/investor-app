import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Camera } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import DataTable from "@/components/common/DataTable";
import { SelectInput, TextInput } from "@/components/common/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDb } from "@/services/mock/store";
import { fmtDate } from "@/lib/format";
import { usePortfolio } from "./hooks";

export default function Tracker() {
  const { mine } = usePortfolio();
  const logs = useDb((s) => s.fieldLogs);
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState("");
  const options = useMemo(() => [...new Map(mine.map((i) => [i.projectId, i.project])).values()], [mine]);
  const project = options.find((p) => p.id === params.get("project")) ?? options[0];
  const plogs = useMemo(() => logs.filter((l) => l.projectId === project?.id).sort((a, b) => new Date(a.date) - new Date(b.date)), [logs, project]);
  const tags = useMemo(() => [...new Set(plogs.filter((l) => l.tag).map((l) => l.tag))], [plogs]);
  const tag = tags.find((t) => t.toLowerCase().includes(q.trim().toLowerCase().replace("#", ""))) ?? tags[0];
  const weights = plogs.filter((l) => l.type === "WEIGHT" && l.tag === tag).map((l) => ({ date: fmtDate(l.date), kg: l.value }));
  const media = [...plogs].reverse().filter((l) => l.media.length);

  if (!project) return <><PageHeader title="Field tracker" /><EmptyState title="Invest in a project to follow it here" /></>;
  const isCattle = project.category === "CATTLE";
  return (
    <>
      <PageHeader title="Live field tracker" description="Updates uploaded by on-site managers."
        actions={<div className="w-64"><SelectInput aria-label="Project" value={project.id} onChange={(e) => setParams({ project: e.target.value })} options={options.map((p) => ({ value: p.id, label: p.title }))} /></div>} />
      <div className="grid gap-4 lg:grid-cols-2">
        {isCattle && (
          <Card className="lg:col-span-2">
            <CardHeader className="flex-row items-center justify-between space-y-0"><CardTitle className="text-base">Weight progression {tag && `— Tag #${tag}`}</CardTitle>
              <div className="w-44"><TextInput placeholder="Search tag e.g. C-402" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search cattle tag" /></div></CardHeader>
            <CardContent className="h-64">
              {weights.length ? <ResponsiveContainer width="100%" height="100%"><LineChart data={weights}><CartesianGrid strokeDasharray="3 3" opacity={0.3} /><XAxis dataKey="date" fontSize={12} /><YAxis domain={["auto", "auto"]} fontSize={12} unit=" kg" /><Tooltip /><Line type="monotone" dataKey="kg" stroke="#15803d" strokeWidth={2} dot /></LineChart></ResponsiveContainer> : <EmptyState title="No weight records for this tag" />}
            </CardContent>
          </Card>
        )}
        <Card className={isCattle ? "" : "lg:col-span-2"}>
          <CardHeader><CardTitle className="text-base">{isCattle ? "Feed & health logs" : "Growth & harvest timeline"}</CardTitle></CardHeader>
          <CardContent>
            <DataTable rows={[...plogs].reverse().filter((l) => l.type !== "WEIGHT")} empty="No updates yet" columns={[
              { key: "d", header: "Date", render: (l) => fmtDate(l.date) },
              { key: "t", header: "Type", render: (l) => l.type[0] + l.type.slice(1).toLowerCase() },
              { key: "n", header: "Details", render: (l) => <>{l.value != null && <b>{l.value} {l.unit} </b>}{l.note}</> },
            ]} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Proof media</CardTitle></CardHeader>
          <CardContent>
            {media.length ? <div className="grid grid-cols-2 gap-3">{media.flatMap((l) => l.media.map((m, i) => (
              <figure key={`${l.id}${i}`} className="overflow-hidden rounded-lg border">
                <div className="flex h-24 items-center justify-center bg-muted"><Camera className="h-6 w-6 text-muted-foreground" /></div>
                <figcaption className="p-2 text-xs"><b className="block">{m.caption}</b><span className="text-muted-foreground">{fmtDate(l.date)}</span></figcaption>
              </figure>)))}</div> : <EmptyState title="No photos or videos yet" />}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
