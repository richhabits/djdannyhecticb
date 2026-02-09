import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Radio, Music, Coffee, Zap } from "lucide-react";

const STATUS_ICONS: Record<string, React.ReactNode> = {
  "On Air": <Radio className="w-4 h-4" />,
  "In Studio": <Music className="w-4 h-4" />,
  "Chilling": <Coffee className="w-4 h-4" />,
  "Live": <Zap className="w-4 h-4" />,
};

export function DannyStatus() {
  const { data: status } = trpc.danny.status.useQuery(undefined, {
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (!status) {
    return (
      <Card className="glass border-accent/20">
        <CardContent className="py-3 px-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-sm font-semibold">Danny Hectic B</span>
            <Badge variant="outline" className="ml-auto">
              Available
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  const icon = STATUS_ICONS[status.status] || <Zap className="w-4 h-4" />;

  return (
    <Card className="glass border-accent/20">
      <CardContent className="py-3 px-4">
        <div className="flex items-center gap-2">
          <span className="text-accent">{icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Danny Hectic B</span>
              <Badge variant="default" className="text-xs">
                {status.status}
              </Badge>
            </div>
            {status.message && (
              <p className="text-xs text-muted-foreground truncate mt-1">
                {status.message}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

