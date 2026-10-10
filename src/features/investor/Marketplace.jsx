import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Beef, MapPin, Sprout, Wheat } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import EmptyState from "@/components/common/EmptyState";
import { ProgressBar } from "@/components/common/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDb } from "@/services/mock/store";
import { raisedOf } from "@/services/ledger";
import { formatBDT } from "@/lib/money";

const ICON = { CATTLE: Beef, ORCHARD: Sprout, CROP: Wheat };
const CATS = ["ALL", "CATTLE", "ORCHARD", "CROP"];

export function ProjectCard({ p }) {
  const Icon = ICON[p.category];
  const pct = (raisedOf(p) / (p.totalUnits * p.unitPrice)) * 100;
  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="flex h-28 items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5"><Icon className="h-10 w-10 text-primary" /></div>
      <CardContent className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2"><h3 className="font-semibold leading-snug">{p.title}</h3><StatusBadge status={p.status} /></div>
        <p className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{p.location}</p>
        <dl className="grid grid-cols-3 gap-2 text-sm">
          <div><dt className="text-xs text-muted-foreground">Unit price</dt><dd className="font-medium">{formatBDT(p.unitPrice)}</dd></div>
          <div><dt className="text-xs text-muted-foreground">Proj. ROI</dt><dd className="font-medium text-primary">{p.roi}%</dd></div>
          <div><dt className="text-xs text-muted-foreground">Cycle</dt><dd className="font-medium">{p.cycleMonths} mo</dd></div>
        </dl>
        <div className="mt-auto space-y-1.5">
          <ProgressBar value={pct} />
          <p className="flex justify-between text-xs text-muted-foreground"><span>{Math.round(pct)}% funded</span><span>{p.availableUnits} units left</span></p>
        </div>
        <Button asChild variant={p.status === "OPEN" ? "default" : "outline"}><Link to={p.id}>{p.status === "OPEN" ? "View & invest" : "View details"}</Link></Button>
      </CardContent>
    </Card>
  );
}

export default function Marketplace() {
  const all = useDb((s) => s.projects);
  const [cat, setCat] = useState("ALL");
  const list = useMemo(() => all.filter((p) => p.status !== "DRAFT" && (cat === "ALL" || p.category === cat)), [all, cat]);
  return (
    <>
      <PageHeader title="Project marketplace" description="Fund real farm units and track them live." />
      <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        {CATS.map((c) => <Button key={c} size="sm" variant={cat === c ? "default" : "outline"} onClick={() => setCat(c)}>{c === "ALL" ? "All" : c[0] + c.slice(1).toLowerCase()}</Button>)}
      </div>
      {list.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{list.map((p) => <ProjectCard key={p.id} p={p} />)}</div> : <EmptyState title="No projects in this category" />}
    </>
  );
}
