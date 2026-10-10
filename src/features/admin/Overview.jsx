import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Megaphone, ShieldCheck, TrendingUp, Users } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDb } from "@/services/mock/store";
import { raisedOf } from "@/services/ledger";
import { formatBDT, sum } from "@/lib/money";

export default function AdminOverview() {
  const projects = useDb((s) => s.projects);
  const users = useDb((s) => s.users);
  const live = useMemo(() => projects.filter((p) => p.status !== "DRAFT"), [projects]);
  const chart = useMemo(() => live.map((p) => ({ name: p.title.split("—")[0].trim().slice(0, 18), raised: raisedOf(p) / 100, target: (p.totalUnits * p.unitPrice) / 100 })), [live]);
  return (
    <>
      <PageHeader title="Platform overview" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Capital raised" value={formatBDT(sum(live, raisedOf))} icon={TrendingUp} />
        <StatCard label="Campaigns" value={projects.length} hint={`${projects.filter((p) => p.status === "OPEN").length} open`} icon={Megaphone} />
        <StatCard label="Investors" value={users.filter((u) => u.role === "INVESTOR").length} icon={Users} />
        <StatCard label="KYC pending" value={users.filter((u) => u.kyc.status === "PENDING").length} icon={ShieldCheck} />
      </div>
      <Card className="mt-4"><CardHeader><CardTitle className="text-base">Funding progress by campaign (BDT)</CardTitle></CardHeader>
        <CardContent className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={chart}><CartesianGrid strokeDasharray="3 3" opacity={0.3} /><XAxis dataKey="name" fontSize={11} /><YAxis fontSize={12} tickFormatter={(v) => `${v / 100000}L`} /><Tooltip formatter={(v) => formatBDT(v * 100)} />
          <Bar dataKey="target" fill="#94a3b8" name="Target" radius={[4, 4, 0, 0]} /><Bar dataKey="raised" fill="#15803d" name="Raised" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></CardContent></Card>
    </>
  );
}
