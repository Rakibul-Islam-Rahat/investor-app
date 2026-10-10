import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowDownToLine, Banknote, Landmark, Wallet } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";
import { Button } from "@/components/ui/button";
import { useDb } from "@/services/mock/store";
import { formatBDT, sum } from "@/lib/money";

export default function FinanceOverview() {
  const txs = useDb((s) => s.transactions);
  const m = useMemo(() => {
    const pending = txs.filter((t) => t.status === "PENDING");
    const done = txs.filter((t) => t.status === "COMPLETED");
    return {
      dep: pending.filter((t) => t.type === "DEPOSIT"), wd: pending.filter((t) => t.type === "WITHDRAW"),
      liability: sum(done, (t) => t.amount), dividends: sum(done.filter((t) => t.type === "DIVIDEND"), (t) => t.amount),
    };
  }, [txs]);
  return (
    <>
      <PageHeader title="Finance overview" actions={<Button asChild><Link to="allocation">Allocate revenue</Link></Button>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Deposits to verify" value={m.dep.length} hint={formatBDT(sum(m.dep, (t) => t.amount))} icon={ArrowDownToLine} />
        <StatCard label="Withdrawals queued" value={m.wd.length} hint={formatBDT(-sum(m.wd, (t) => t.amount))} icon={Banknote} />
        <StatCard label="Investor wallet liability" value={formatBDT(m.liability)} hint="Sum of all completed ledger entries" icon={Wallet} />
        <StatCard label="Dividends distributed" value={formatBDT(m.dividends)} icon={Landmark} />
      </div>
    </>
  );
}
