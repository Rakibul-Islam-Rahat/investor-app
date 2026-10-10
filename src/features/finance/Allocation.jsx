import { useMemo, useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import DataTable from "@/components/common/DataTable";
import { Labeled, SelectInput, TextInput } from "@/components/common/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import EmptyState from "@/components/common/EmptyState";
import { useAuth } from "@/features/auth/AuthContext";
import { useAction } from "@/hooks/useAction";
import { useDb, getState } from "@/services/mock/store";
import { api, previewAllocation } from "@/services/api";
import { formatBDT, toMinor } from "@/lib/money";

export default function Allocation() {
  const { user } = useAuth();
  const projects = useDb((s) => s.projects);
  const investments = useDb((s) => s.investments);
  const users = useDb((s) => s.users);
  const eligible = useMemo(() => projects.filter((p) => p.status === "IN_PROGRESS"), [projects]);
  const [f, setF] = useState({ projectId: "", gross: "", costs: "", commissionPct: "2" });
  const projectId = f.projectId || eligible[0]?.id;
  const input = { projectId, gross: toMinor(f.gross || 0), costs: toMinor(f.costs || 0), commissionPct: Number(f.commissionPct || 0) };
  // previewAllocation reads investments from state; depending on `investments` keeps it fresh.
  const pv = useMemo(() => (projectId ? previewAllocation(getState(), input) : null), [projectId, f.gross, f.costs, f.commissionPct, investments]); // eslint-disable-line react-hooks/exhaustive-deps
  const [run, pending] = useAction(() => api.allocate(user.id, input), "Revenue allocated and wallets credited");
  const name = (id) => users.find((u) => u.id === id)?.name;
  const invalid = !f.gross || pv?.net < 0 || !pv?.rows.length;

  if (!eligible.length) return <><PageHeader title="Revenue allocation" /><EmptyState title="No projects are in progress" description="A project must be In Progress before its sale revenue can be allocated." /></>;
  return (
    <>
      <PageHeader title="Bulk revenue allocation" description="Payout = units ÷ total units × (gross revenue − costs − commission). Principal is already inside gross revenue." />
      <Card><CardContent className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <Labeled label="Project"><SelectInput value={projectId} onChange={(e) => setF({ ...f, projectId: e.target.value })} options={eligible.map((p) => ({ value: p.id, label: p.title }))} /></Labeled>
        <Labeled label="Gross sale revenue (BDT)"><TextInput type="number" min={0} value={f.gross} onChange={(e) => setF({ ...f, gross: e.target.value })} /></Labeled>
        <Labeled label="Operating, feed & medical costs (BDT)"><TextInput type="number" min={0} value={f.costs} onChange={(e) => setF({ ...f, costs: e.target.value })} /></Labeled>
        <Labeled label="Platform commission (% of gross)"><TextInput type="number" min={0} max={100} step="0.1" value={f.commissionPct} onChange={(e) => setF({ ...f, commissionPct: e.target.value })} /></Labeled>
      </CardContent></Card>
      {pv && (
        <div className="mt-4 space-y-4">
          <div className="grid gap-3 text-sm sm:grid-cols-4">
            {[["Capital invested", formatBDT(pv.invested)], ["Commission", formatBDT(pv.commission)], ["Net distributable", formatBDT(pv.net)], ["Total units", pv.totalUnits]].map(([k, v]) => (
              <div key={k} className="rounded-lg border bg-background p-3"><p className="text-xs text-muted-foreground">{k}</p><p className="text-lg font-semibold">{v}</p></div>))}
          </div>
          {pv.net < 0 && <p role="alert" className="text-sm text-red-600">Costs and commission exceed gross revenue.</p>}
          <DataTable rows={pv.rows} empty="No active holders" rowKey={(r) => r.inv.id} columns={[
            { key: "i", header: "Investor", render: (r) => name(r.inv.investorId) },
            { key: "u", header: "Units", render: (r) => r.inv.units },
            { key: "p", header: "Share", render: (r) => `${((r.inv.units / pv.totalUnits) * 100).toFixed(1)}%` },
            { key: "inv", header: "Invested", render: (r) => formatBDT(r.inv.amount) },
            { key: "pay", header: "Payout", render: (r) => <b>{formatBDT(r.payout)}</b> },
            { key: "pl", header: "Profit / loss", render: (r) => <span className={r.payout - r.inv.amount < 0 ? "text-red-600" : "text-emerald-600"}>{formatBDT(r.payout - r.inv.amount)}</span> },
          ]} />
          <Button disabled={invalid || pending} onClick={() => window.confirm("Credit all investor wallets and mark this project as liquidated? This cannot be undone.") && run()}>Confirm & credit wallets</Button>
        </div>
      )}
    </>
  );
}
