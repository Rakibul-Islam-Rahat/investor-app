import { useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import { Labeled, TextInput } from "@/components/common/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAction } from "@/hooks/useAction";
import { api } from "@/services/api";
import { usePortfolio } from "./hooks";

export default function Profile() {
  const { user } = usePortfolio();
  const [kyc, setKyc] = useState({ nid: user.kyc.nid ?? "", tin: user.kyc.tin ?? "" });
  const [bank, setBank] = useState(user.bank);
  const [submitKyc, kp] = useAction(() => api.submitKyc(user.id, kyc), "KYC submitted for review");
  const [saveBank, bp] = useAction(() => api.updateProfile(user.id, { bank }), "Bank details saved");
  const [toggle] = useAction(() => api.updateProfile(user.id, { autoReinvest: !user.autoReinvest }), user.autoReinvest ? "Auto-reinvest off" : "Auto-reinvest on");
  const locked = user.kyc.status === "PENDING" || user.kyc.status === "VERIFIED";
  return (
    <>
      <PageHeader title="Profile & KYC" description={`${user.name} • ${user.email}`} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card><CardHeader className="flex-row items-center justify-between space-y-0"><CardTitle className="text-base">Identity verification</CardTitle><StatusBadge status={user.kyc.status} /></CardHeader>
          <CardContent className="space-y-3">
            <Labeled label="National ID (NID) number"><TextInput value={kyc.nid} disabled={locked} onChange={(e) => setKyc({ ...kyc, nid: e.target.value })} /></Labeled>
            <Labeled label="TIN (optional)"><TextInput value={kyc.tin} disabled={locked} onChange={(e) => setKyc({ ...kyc, tin: e.target.value })} /></Labeled>
            {user.kyc.status === "PENDING" && <p className="text-sm text-muted-foreground">Your documents are under review.</p>}
            {!locked && <Button disabled={kp} onClick={submitKyc}>Submit for verification</Button>}
          </CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Payout bank details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Labeled label="Account name"><TextInput value={bank.accName} onChange={(e) => setBank({ ...bank, accName: e.target.value })} /></Labeled>
            <Labeled label="Account number"><TextInput value={bank.accNum} onChange={(e) => setBank({ ...bank, accNum: e.target.value })} /></Labeled>
            <Labeled label="Bank name"><TextInput value={bank.bankName} onChange={(e) => setBank({ ...bank, bankName: e.target.value })} /></Labeled>
            <Button disabled={bp} onClick={saveBank}>Save</Button>
          </CardContent></Card>
        <Card className="lg:col-span-2"><CardContent className="flex items-center justify-between gap-4 p-5">
          <div><p className="font-medium">Auto-reinvest profits</p><p className="text-sm text-muted-foreground">When a project is liquidated, dividends are used to buy units in the first open project.</p></div>
          <Button variant={user.autoReinvest ? "default" : "outline"} role="switch" aria-checked={user.autoReinvest} onClick={toggle}>{user.autoReinvest ? "On" : "Off"}</Button>
        </CardContent></Card>
      </div>
    </>
  );
}
