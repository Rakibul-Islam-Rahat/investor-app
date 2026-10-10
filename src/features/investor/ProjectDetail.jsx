import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import { ProgressBar, TextInput } from "@/components/common/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAction } from "@/hooks/useAction";
import { api } from "@/services/api";
import { raisedOf } from "@/services/ledger";
import { formatBDT } from "@/lib/money";
import { fmtDate } from "@/lib/format";
import { usePortfolio } from "./hooks";

export default function ProjectDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user, projects, available } = usePortfolio();
  const p = useMemo(() => projects.find((x) => x.id === id), [projects, id]);
  const [units, setUnits] = useState(1);
  const [invest, pending] = useAction(async () => { await api.invest(user.id, p.id, units); nav("/dashboard/portfolio"); }, "Investment confirmed");

  if (!p) return <p>Project not found. <Link className="underline" to="/dashboard/marketplace">Back to marketplace</Link></p>;
  const total = units * p.unitPrice;
  const verified = user.kyc.status === "VERIFIED";
  const problem = !verified ? "KYC verification required" : !Number.isInteger(units) || units < 1 ? "Enter at least 1 unit" : units > p.availableUnits ? `Only ${p.availableUnits} units left` : total > available ? "Insufficient wallet balance" : null;

  return (
    <>
      <PageHeader title={p.title} description={`${p.location} • ${p.category.toLowerCase()}`} actions={<StatusBadge status={p.status} />} />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card><CardHeader><CardTitle className="text-base">Prospectus</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p>{p.description}</p>
              <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[["Unit price", formatBDT(p.unitPrice)], ["Projected ROI", `${p.roi}%`], ["Cycle", `${p.cycleMonths} months`], ["Risk", <StatusBadge key="r" status={p.risk} />],
                  ["Start", fmtDate(p.startDate)], ["Harvest / sale window", fmtDate(p.harvestDate)], ["Total units", p.totalUnits], ["Target capital", formatBDT(p.totalUnits * p.unitPrice)]]
                  .map(([k, v]) => <div key={k}><dt className="text-xs text-muted-foreground">{k}</dt><dd className="font-medium">{v}</dd></div>)}
              </dl>
            </CardContent></Card>
          <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><ShieldCheck className="h-4 w-4" />Care & vaccination protocols</CardTitle></CardHeader>
            <CardContent><ul className="list-disc space-y-1 pl-5 text-sm">{p.protocols.map((x) => <li key={x}>{x}</li>)}</ul></CardContent></Card>
          <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950/20"><CardContent className="flex gap-3 p-4 text-sm"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p>Projected ROI is an estimate, not a guarantee. Livestock and crop projects carry mortality, disease, weather and market-price risk, and you can lose part or all of your capital.</p></CardContent></Card>
        </div>
        <Card className="h-fit lg:sticky lg:top-20">
          <CardHeader><CardTitle className="text-base">Invest</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <ProgressBar value={(raisedOf(p) / (p.totalUnits * p.unitPrice)) * 100} />
            <p className="text-xs text-muted-foreground">{formatBDT(raisedOf(p))} raised • {p.availableUnits} of {p.totalUnits} units left</p>
            {p.status !== "OPEN" ? <p className="text-sm text-muted-foreground">This project is not open for new investments.</p> : (
              <>
                <label className="block space-y-1.5 text-sm"><span className="font-medium">Units</span>
                  <TextInput type="number" min={1} max={p.availableUnits} value={units} onChange={(e) => setUnits(Number(e.target.value))} /></label>
                <div className="space-y-1 rounded-md bg-muted p-3 text-sm">
                  <p className="flex justify-between"><span>Total</span><b>{formatBDT(total)}</b></p>
                  <p className="flex justify-between"><span>Expected return</span><b>{formatBDT(Math.round(total * (1 + p.roi / 100)))}</b></p>
                  <p className="flex justify-between text-muted-foreground"><span>Wallet</span><span>{formatBDT(available)}</span></p>
                </div>
                {problem && <p role="alert" className="text-sm text-red-600">{problem}{!verified && <> — <Link className="underline" to="../profile">verify now</Link></>}{problem === "Insufficient wallet balance" && <> — <Link className="underline" to="../wallet">add funds</Link></>}</p>}
                <Button className="w-full" disabled={!!problem || pending} onClick={invest}>{pending ? "Processing…" : `Invest ${formatBDT(total)}`}</Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
