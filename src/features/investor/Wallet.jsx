import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";
import DataTable from "@/components/common/DataTable";
import StatusBadge from "@/components/common/StatusBadge";
import { Labeled, SelectInput, TextInput } from "@/components/common/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAction } from "@/hooks/useAction";
import { api } from "@/services/api";
import { formatBDT, toMinor, sum } from "@/lib/money";
import { fmtDateTime } from "@/lib/format";
import { downloadReceipt } from "@/lib/pdf";
import { usePortfolio } from "./hooks";

const CHANNELS = [{ value: "BKASH", label: "bKash" }, { value: "NAGAD", label: "Nagad" }, { value: "BANK", label: "Bank wire" }];
const TYPES = ["ALL", "DEPOSIT", "INVEST", "DIVIDEND", "WITHDRAW"];

export default function Wallet() {
  const { user, myTx, balance, available } = usePortfolio();
  const [dep, setDep] = useState({ amount: "", channel: "BKASH", trxId: "" });
  const [wd, setWd] = useState({ amount: "", channel: "BANK", account: `${user.bank.bankName} • ${user.bank.accNum}` });
  const [type, setType] = useState("ALL");
  const [deposit, depPending] = useAction(async () => { await api.requestDeposit(user.id, { ...dep, amount: toMinor(dep.amount) }); setDep({ ...dep, amount: "", trxId: "" }); }, "Deposit submitted for verification");
  const [withdraw, wdPending] = useAction(async () => { await api.requestWithdraw(user.id, { ...wd, amount: toMinor(wd.amount) }); setWd({ ...wd, amount: "" }); }, "Withdrawal requested");
  const rows = useMemo(() => myTx.filter((t) => type === "ALL" || t.type === type).sort((a, b) => new Date(b.date) - new Date(a.date)), [myTx, type]);
  const pendingIn = sum(myTx.filter((t) => t.status === "PENDING" && t.amount > 0), (t) => t.amount);

  return (
    <>
      <PageHeader title="Wallet & ledger" description="Deposits are credited after finance verifies the transfer." />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Ledger balance" value={formatBDT(balance)} />
        <StatCard label="Available to withdraw / invest" value={formatBDT(available)} />
        <StatCard label="Deposits awaiting verification" value={formatBDT(pendingIn)} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card><CardHeader><CardTitle className="text-base">Deposit funds</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Labeled label="Amount (BDT)"><TextInput type="number" min={1} value={dep.amount} onChange={(e) => setDep({ ...dep, amount: e.target.value })} /></Labeled>
            <Labeled label="Paid via"><SelectInput value={dep.channel} onChange={(e) => setDep({ ...dep, channel: e.target.value })} options={CHANNELS} /></Labeled>
            <Labeled label="Transaction ID" hint="From your bKash/Nagad/bank receipt"><TextInput value={dep.trxId} onChange={(e) => setDep({ ...dep, trxId: e.target.value })} /></Labeled>
            <Button disabled={depPending || !dep.amount} onClick={deposit}>Submit deposit</Button>
          </CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Request withdrawal</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Labeled label="Amount (BDT)"><TextInput type="number" min={1} value={wd.amount} onChange={(e) => setWd({ ...wd, amount: e.target.value })} /></Labeled>
            <Labeled label="Payout channel"><SelectInput value={wd.channel} onChange={(e) => setWd({ ...wd, channel: e.target.value })} options={CHANNELS} /></Labeled>
            <Labeled label="Destination account / number"><TextInput value={wd.account} onChange={(e) => setWd({ ...wd, account: e.target.value })} /></Labeled>
            <Button disabled={wdPending || !wd.amount} onClick={withdraw}>Request withdrawal</Button>
          </CardContent></Card>
      </div>
      <div className="mt-6 mb-3 flex items-center justify-between"><h2 className="text-lg font-semibold">Transaction history</h2>
        <div className="w-40"><SelectInput aria-label="Filter by type" value={type} onChange={(e) => setType(e.target.value)} options={TYPES} /></div></div>
      <DataTable rows={rows} empty="No transactions" columns={[
        { key: "d", header: "Date", render: (t) => fmtDateTime(t.date) },
        { key: "t", header: "Type" },
        { key: "c", header: "Channel / ref", render: (t) => t.channel ?? t.ref ?? "—" },
        { key: "a", header: "Amount", className: "text-right tabular-nums", render: (t) => <span className={t.amount < 0 ? "text-red-600" : "text-emerald-600"}>{t.amount > 0 && "+"}{formatBDT(t.amount)}</span> },
        { key: "s", header: "Status", render: (t) => <StatusBadge status={t.status} /> },
        { key: "r", header: "", render: (t) => <Button size="icon" variant="ghost" aria-label="Download receipt" onClick={() => downloadReceipt({ tx: t, user })}><Download className="h-4 w-4" /></Button> },
      ]} />
    </>
  );
}
