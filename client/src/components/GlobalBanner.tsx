import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, Info, X, XCircle } from "lucide-react";

export function GlobalBanner() {
  const { data: activeBanner } = trpc.observability.incidentBanners.getActive.useQuery();
  const [dismissed, setDismissed] = useState<string | null>(null);

  useEffect(() => {
    if (activeBanner?.id) {
      const dismissedId = localStorage.getItem(`banner_dismissed_${activeBanner.id}`);
      if (dismissedId) {
        setDismissed(dismissedId);
      }
    }
  }, [activeBanner]);

  if (!activeBanner || dismissed === `banner_dismissed_${activeBanner.id}`) {
    return null;
  }

  const handleDismiss = () => {
    if (activeBanner.id) {
      localStorage.setItem(`banner_dismissed_${activeBanner.id}`, activeBanner.id.toString());
      setDismissed(activeBanner.id.toString());
    }
  };

  const getIcon = () => {
    switch (activeBanner.severity) {
      case "critical":
      case "high":
        return <XCircle className="h-4 w-4" />;
      case "medium":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getVariant = () => {
    switch (activeBanner.severity) {
      case "critical":
      case "high":
        return "destructive";
      case "medium":
        return "default";
      default:
        return "default";
    }
  };

  return (
    <Alert variant={getVariant()} className="mb-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2 flex-1">
          {getIcon()}
          <div className="flex-1">
            <AlertTitle>{activeBanner.message}</AlertTitle>
            {activeBanner.severity && (
              <AlertDescription className="mt-1">
                Severity: {activeBanner.severity}
              </AlertDescription>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="ml-2"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Alert>
  );
}

