import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { PortalNav } from "@/components/PortalNav";
import { PortalGuard } from "@/components/PortalGuard";
import { format } from "date-fns";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 MB";
  const mb = bytes / (1024 * 1024);
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

const STATUS_COLORS: Record<string, string> = {
  enquiry: "bg-yellow-600",
  confirmed: "bg-blue-600",
  completed: "bg-green-600",
  cancelled: "bg-red-600",
  pending: "bg-yellow-600",
  approved: "bg-green-600",
  rejected: "bg-red-600",
};

function DashboardContent() {
  const { data: bookings } = trpc.portal.bookings.listMine.useQuery();
  const { data: uploads } = trpc.portal.uploads.listMine.useQuery({});
  const { data: usage } = trpc.portal.uploads.usage.useQuery();

  const usagePercent = usage ? Math.min(100, (usage.bytesUsed / usage.quotaBytes) * 100) : 0;

  return (
    <div className="min-h-screen bg-background text-foreground p-6 max-w-6xl mx-auto">
      <PortalNav />

      <h1 className="text-3xl font-bold mb-8">Your Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 glass">
          <p className="text-sm text-muted-foreground">Bookings</p>
          <p className="text-3xl font-bold">{bookings?.length ?? 0}</p>
        </Card>
        <Card className="p-6 glass">
          <p className="text-sm text-muted-foreground">Uploads</p>
          <p className="text-3xl font-bold">{uploads?.length ?? 0}</p>
        </Card>
        <Card className="p-6 glass">
          <p className="text-sm text-muted-foreground mb-2">Storage Used</p>
          {usage && (
            <>
              <Progress value={usagePercent} className="mb-2" />
              <p className="text-xs text-muted-foreground">
                {formatBytes(usage.bytesUsed)} / {formatBytes(usage.quotaBytes)}
              </p>
            </>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 glass">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Recent Bookings</h2>
            <Link href="/portal/bookings" className="text-sm text-accent hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {bookings?.slice(0, 5).map((b) => (
              <div key={b.id} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                <div>
                  <p className="font-semibold">{b.eventType}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(b.eventDate), "PP")}</p>
                </div>
                <Badge className={STATUS_COLORS[b.status]}>{b.status}</Badge>
              </div>
            ))}
            {!bookings?.length && <p className="text-sm text-muted-foreground">No bookings yet.</p>}
          </div>
        </Card>

        <Card className="p-6 glass">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Recent Uploads</h2>
            <Link href="/portal/media" className="text-sm text-accent hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {uploads?.slice(0, 5).map((u) => (
              <div key={u.id} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                <div>
                  <p className="font-semibold">{u.title || u.fileName}</p>
                  <p className="text-xs text-muted-foreground capitalize">{u.type}</p>
                </div>
                <Badge className={STATUS_COLORS[u.status]}>{u.status}</Badge>
              </div>
            ))}
            {!uploads?.length && <p className="text-sm text-muted-foreground">No uploads yet.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function PortalDashboard() {
  return (
    <PortalGuard>
      <DashboardContent />
    </PortalGuard>
  );
}
