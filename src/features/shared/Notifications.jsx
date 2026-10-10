import { useEffect, useMemo } from "react";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/AuthContext";
import { useDb } from "@/services/mock/store";
import { api } from "@/services/api";
import { fmtDateTime } from "@/lib/format";

export default function Notifications() {
  const { user } = useAuth();
  const all = useDb((s) => s.notifications);
  const mine = useMemo(() => all.filter((n) => n.userId === user.id).sort((a, b) => new Date(b.date) - new Date(a.date)), [all, user.id]);
  // Mark as read on leaving the page, so the unread highlight is visible while reading
  useEffect(() => () => { api.markRead(user.id); }, [user.id]);
  return (
    <>
      <PageHeader title="Notifications" actions={<Button variant="outline" onClick={() => api.markRead(user.id)}>Mark all read</Button>} />
      {mine.length ? <div className="space-y-2">{mine.map((n) => (
        <Card key={n.id} className={n.read ? "" : "border-primary/50 bg-primary/5"}><CardContent className="flex items-start justify-between gap-4 p-4 text-sm">
          <p>{n.text}</p><time className="shrink-0 text-xs text-muted-foreground">{fmtDateTime(n.date)}</time></CardContent></Card>))}</div>
        : <EmptyState title="You're all caught up" />}
    </>
  );
}
