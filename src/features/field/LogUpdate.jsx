import { useMemo, useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import { Labeled, SelectInput, TextArea, TextInput } from "@/components/common/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/features/auth/AuthContext";
import { useAction } from "@/hooks/useAction";
import { useDb } from "@/services/mock/store";
import { api } from "@/services/api";

const TYPES = [
  { value: "WEIGHT", label: "Cattle weight", unit: "kg" }, { value: "FEED", label: "Feed consumption", unit: "kg/head/day" },
  { value: "HEALTH", label: "Health / treatment", unit: "" }, { value: "STAGE", label: "Orchard / crop stage", unit: "" }, { value: "HARVEST", label: "Harvest volume", unit: "kg" },
];
const blank = { type: "WEIGHT", tag: "", value: "", note: "", files: [], notifyInvestors: true };

// Lightweight form for low-bandwidth use on a phone.
export default function LogUpdate() {
  const { user } = useAuth();
  const projects = useDb((s) => s.projects);
  const live = useMemo(() => projects.filter((p) => ["FUNDED", "IN_PROGRESS", "OPEN"].includes(p.status)), [projects]);
  const [projectId, setProjectId] = useState("");
  const [f, setF] = useState(blank);
  const pid = projectId || live[0]?.id;
  const t = TYPES.find((x) => x.value === f.type);
  const [save, pending] = useAction(async () => {
    await api.addFieldLog(user.id, { projectId: pid, ...f, unit: t.unit, media: f.files.map((n) => ({ caption: n })) });
    setF(blank);
  }, "Update posted to investors");
  return (
    <>
      <PageHeader title="Log field update" />
      <Card className="max-w-xl"><CardContent className="space-y-4 p-5">
        <Labeled label="Project"><SelectInput value={pid} onChange={(e) => setProjectId(e.target.value)} options={live.map((p) => ({ value: p.id, label: p.title }))} /></Labeled>
        <Labeled label="Update type"><SelectInput value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })} options={TYPES} /></Labeled>
        {f.type === "WEIGHT" && <Labeled label="Cattle tag" hint="e.g. C-402"><TextInput value={f.tag} onChange={(e) => setF({ ...f, tag: e.target.value.toUpperCase() })} /></Labeled>}
        {t.unit && <Labeled label={`Value (${t.unit})`}><TextInput type="number" inputMode="decimal" value={f.value} onChange={(e) => setF({ ...f, value: e.target.value })} /></Labeled>}
        <Labeled label="Notes"><TextArea value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} /></Labeled>
        <Labeled label="Photos / videos" hint="Files are named in the log; upload storage is wired up with the backend">
          <input type="file" multiple accept="image/*,video/*" onChange={(e) => setF({ ...f, files: [...e.target.files].map((x) => x.name) })} className="block w-full text-sm" /></Labeled>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.notifyInvestors} onChange={(e) => setF({ ...f, notifyInvestors: e.target.checked })} />Notify all investors in this project</label>
        <Button disabled={pending || !pid || (t.unit && f.value === "") || (!t.unit && !f.note)} onClick={save}>Post update</Button>
      </CardContent></Card>
    </>
  );
}
