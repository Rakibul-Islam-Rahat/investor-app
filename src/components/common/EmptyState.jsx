import { Inbox } from "lucide-react";
export default function EmptyState({ title, description }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
      <Inbox className="mb-3 h-8 w-8 text-muted-foreground" />
      <p className="font-medium">{title}</p>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}
