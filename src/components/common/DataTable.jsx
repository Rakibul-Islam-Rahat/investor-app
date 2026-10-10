import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import EmptyState from "./EmptyState";

// columns: [{ key, header, render?(row), className? }]
export default function DataTable({ columns, rows, empty = "Nothing to show yet", rowKey = (r) => r.id }) {
  if (!rows.length) return <EmptyState title={empty} />;
  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>{columns.map((c) => <TableHead key={c.key} className={c.className}>{c.header}</TableHead>)}</TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={rowKey(r)}>
              {columns.map((c) => <TableCell key={c.key} className={c.className}>{c.render ? c.render(r) : r[c.key]}</TableCell>)}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
