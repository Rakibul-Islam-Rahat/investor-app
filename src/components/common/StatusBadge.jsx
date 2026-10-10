const TONES = {
  green: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  amber: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  red: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  blue: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
  gray: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};
const MAP = {
  OPEN: "green", ACTIVE: "green", COMPLETED: "green", VERIFIED: "green", LOW: "green", LIQUIDATED: "gray", DRAFT: "gray", NONE: "gray",
  UPCOMING: "blue", FUNDED: "blue", IN_PROGRESS: "blue", MEDIUM: "amber", PENDING: "amber", HIGH: "red", REJECTED: "red",
};
export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TONES[MAP[status] ?? "gray"]}`}>
      {String(status).replace("_", " ")}
    </span>
  );
}
