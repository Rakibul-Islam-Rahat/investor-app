import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Area, AreaChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Briefcase, Coins, TrendingUp, Wallet } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";
import EmptyState from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBDT } from "@/lib/money";
import { fmtMonth } from "@/lib/format";
import { usePortfolio } from "./hooks";

const COLORS = { CATTLE: "#15803d", ORCHARD: "#d97706", CROP: "#0284c7" };

export default function Overview() {
  const p = usePortfolio();
  const allocation = useMemo(() => {
    const m = {};
    p.mine.filter((i) => i.status === "ACTIVE").forEach((i) => { m[i.project.category] = (m[i.project.category] ?? 0) + i.amount / 100; });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [p.mine]);
  const timeline = useMemo(() => {
    const months = {};
    [...p.myTx].filter((t) => t.status === "COMPLETED" && (t.type === "INVEST" || t.type === "DIVIDEND"))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .forEach((t) => {
        const k = fmtMonth(t.date);
        months[k] ??= { month: k, invested: 0, dividends: 0 };
        if (t.type === "INVEST") months[k].invested += -t.amount / 100; else months[k].dividends += t.amount / 100;
      });
    let ci = 0, cd = 0;
    return Object.values(months).map((m) => ({ month: m.month, invested: (ci += m.invested), dividends: (cd += m.dividends) }));
  }, [p.myTx]);

  return (
    <>
      <PageHeader title={`Welcome back, ${p.user.name.split(" ")[0]}`} description="Your portfolio at a glance."
        actions={<><Button asChild variant="outline"><Link to="wallet">Add funds</Link></Button><Button asChild><Link to="marketplace">Browse projects</Link></Button></>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Capital invested" value={formatBDT(p.invested)} hint={`${p.units} active units`} icon={Briefcase} />
        <StatCard label="Expected gross return" value={formatBDT(Math.round(p.expected))} hint="Projected, not guaranteed" icon={TrendingUp} />
        <StatCard label="Realized dividends" value={formatBDT(p.dividends)} icon={Coins} />
        <StatCard label="Wallet balance" value={formatBDT(p.available)} hint={p.available !== p.balance ? "Net of pending withdrawals" : undefined} icon={Wallet} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader><CardTitle className="text-base">Investment & dividend timeline (BDT, cumulative)</CardTitle></CardHeader>
          <CardContent className="h-72">
            {timeline.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeline}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} /><XAxis dataKey="month" fontSize={12} /><YAxis fontSize={12} tickFormatter={(v) => `${v / 100000}L`} />
                  <Tooltip formatter={(v) => formatBDT(v * 100)} /><Legend />
                  <Area type="monotone" dataKey="invested" stroke="#15803d" fill="#15803d33" name="Invested" />
                  <Area type="monotone" dataKey="dividends" stroke="#d97706" fill="#d9770633" name="Dividends" />
                </AreaChart>
              </ResponsiveContainer>
            ) : <EmptyState title="No activity yet" />}
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Asset allocation</CardTitle></CardHeader>
          <CardContent className="h-72">
            {allocation.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={allocation} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                    {allocation.map((a) => <Cell key={a.name} fill={COLORS[a.name]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => formatBDT(v * 100)} /><Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <EmptyState title="No active investments" />}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
