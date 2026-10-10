import { useMemo } from "react";
import { Download, Fingerprint } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import DataTable from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { downloadContract, downloadTaxStatement } from "@/lib/pdf";
import { fmtDateTime } from "@/lib/format";
import { sum } from "@/lib/money";
import { usePortfolio } from "./hooks";

export default function Legal() {
  const { mine, user, myTx } = usePortfolio();
  const years = useMemo(() => [...new Set(myTx.map((t) => new Date(t.date).getFullYear()))].sort((a, b) => b - a), [myTx]);
  const statement = (year) => {
    const inYear = myTx.filter((t) => t.status === "COMPLETED" && new Date(t.date).getFullYear() === year);
    return downloadTaxStatement({ user, year, dividends: inYear.filter((t) => t.type === "DIVIDEND"), invested: -sum(inYear.filter((t) => t.type === "INVEST"), (t) => t.amount) });
  };
  return (
    <>
      <PageHeader title="Legal vault" description="Signed investment deeds and annual statements." />
      <h2 className="mb-3 text-lg font-semibold">Investment deeds</h2>
      <DataTable rows={mine} empty="No contracts yet" columns={[
        { key: "p", header: "Project", render: (i) => i.project.title },
        { key: "s", header: "Signed", render: (i) => fmtDateTime(i.createdAt) },
        { key: "h", header: "SHA-256 seal", render: (i) => <code className="flex items-center gap-1 text-xs"><Fingerprint className="h-3.5 w-3.5" />{i.contractHash.slice(0, 16)}…</code> },
        { key: "d", header: "", render: (i) => <Button size="sm" variant="outline" onClick={() => downloadContract({ inv: i, project: i.project, user })}><Download className="mr-1 h-3.5 w-3.5" />PDF</Button> },
      ]} />
      <h2 className="mb-3 mt-8 text-lg font-semibold">Annual tax & dividend statements</h2>
      <DataTable rows={years.map((y) => ({ id: y, year: y }))} empty="No statements available" columns={[
        { key: "year", header: "Year" },
        { key: "d", header: "", render: (r) => <Button size="sm" variant="outline" onClick={() => statement(r.year)}><Download className="mr-1 h-3.5 w-3.5" />Statement</Button> },
      ]} />
    </>
  );
}
