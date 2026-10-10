import { useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import DataTable from "@/components/common/DataTable";
import StatusBadge from "@/components/common/StatusBadge";
import { Labeled, SelectInput, TextArea, TextInput } from "@/components/common/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/features/auth/AuthContext";
import { useAction } from "@/hooks/useAction";
import { useDb } from "@/services/mock/store";
import { api } from "@/services/api";
import { formatBDT, toMinor } from "@/lib/money";

// Lifecycle: Draft → Upcoming → Open → Fully Funded → In Progress → Liquidated.
// Funded is set automatically when the last unit sells, and Liquidated by revenue allocation.
const NEXT = { DRAFT: "UPCOMING", UPCOMING: "OPEN", FUNDED: "IN_PROGRESS" };
const blank = { title: "", category: "CATTLE", location: "", unitPrice: "", totalUnits: "", cycleMonths: "6", roi: "", risk: "MEDIUM", description: "" };

function Advance({ p }) {
  const { user } = useAuth();
  const [run, pending] = useAction(() => api.setProjectStatus(user.id, p.id, NEXT[p.status]), "Status updated");
  return NEXT[p.status] ? <Button size="sm" variant="outline" disabled={pending} onClick={run}>Move to {NEXT[p.status].replace("_", " ").toLowerCase()}</Button> : null;
}

export default function Campaigns() {
  const { user } = useAuth();
  const projects = useDb((s) => s.projects);
  const [f, setF] = useState(blank);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const bad = !f.title || !f.location || !(f.unitPrice > 0) || !(Number(f.totalUnits) >= 1) || !(f.roi > 0);
  const [create, pending] = useAction(async () => {
    const day = 864e5, months = Number(f.cycleMonths);
    await api.createProject(user.id, { ...f, unitPrice: toMinor(f.unitPrice), totalUnits: Math.floor(Number(f.totalUnits)), cycleMonths: months, roi: Number(f.roi),
      startDate: new Date(Date.now() + 14 * day).toISOString(), harvestDate: new Date(Date.now() + (14 + months * 30) * day).toISOString() });
    setF(blank);
  }, "Campaign created as draft");
  return (
    <>
      <PageHeader title="Campaign builder" description="Create campaigns and move them through their lifecycle." />
      <Card className="mb-6"><CardHeader><CardTitle className="text-base">New campaign</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Labeled label="Title"><TextInput value={f.title} onChange={set("title")} /></Labeled>
          <Labeled label="Category"><SelectInput value={f.category} onChange={set("category")} options={["CATTLE", "ORCHARD", "CROP"]} /></Labeled>
          <Labeled label="Location"><TextInput value={f.location} onChange={set("location")} /></Labeled>
          <Labeled label="Risk profile"><SelectInput value={f.risk} onChange={set("risk")} options={["LOW", "MEDIUM", "HIGH"]} /></Labeled>
          <Labeled label="Unit price (BDT)"><TextInput type="number" min={1} value={f.unitPrice} onChange={set("unitPrice")} /></Labeled>
          <Labeled label="Total units"><TextInput type="number" min={1} value={f.totalUnits} onChange={set("totalUnits")} /></Labeled>
          <Labeled label="Cycle (months)"><TextInput type="number" min={1} value={f.cycleMonths} onChange={set("cycleMonths")} /></Labeled>
          <Labeled label="Projected ROI (%)"><TextInput type="number" min={1} value={f.roi} onChange={set("roi")} /></Labeled>
          <div className="sm:col-span-2 lg:col-span-4"><Labeled label="Description"><TextArea value={f.description} onChange={set("description")} /></Labeled></div>
          <div><Button disabled={bad || pending} onClick={create}>Create draft</Button></div>
        </CardContent></Card>
      <DataTable rows={projects} columns={[
        { key: "t", header: "Campaign", render: (p) => <b>{p.title}</b> },
        { key: "c", header: "Target", render: (p) => formatBDT(p.totalUnits * p.unitPrice) },
        { key: "u", header: "Units sold", render: (p) => `${p.totalUnits - p.availableUnits} / ${p.totalUnits}` },
        { key: "s", header: "Status", render: (p) => <StatusBadge status={p.status} /> },
        { key: "a", header: "", render: (p) => <Advance p={p} /> },
      ]} />
    </>
  );
}
