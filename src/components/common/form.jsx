import { forwardRef } from "react";

export function Labeled({ label, hint, children }) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="font-medium">{label}</span>
      {children}
      {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}
const base = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
export const TextInput = forwardRef((p, ref) => <input ref={ref} {...p} className={`${base} ${p.className ?? ""}`} />);
TextInput.displayName = "TextInput";
export const SelectInput = ({ options, ...p }) => (
  <select {...p} className={base}>
    {options.map((o) => (typeof o === "string" ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>))}
  </select>
);
export const TextArea = (p) => <textarea rows={3} {...p} className={`${base} h-auto`} />;
export const ProgressBar = ({ value }) => (
  <div className="h-2 w-full overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, value)}%` }} />
  </div>
);
