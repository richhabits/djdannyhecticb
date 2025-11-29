import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface DatabaseErrorBannerProps {
  feature?: string;
}

export function DatabaseErrorBanner({ feature }: DatabaseErrorBannerProps) {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Database Not Configured</AlertTitle>
      <AlertDescription>
        {feature ? (
          <>
            The {feature} feature requires a database connection. Set <code className="text-xs">DATABASE_URL</code> in your <code className="text-xs">.env</code> file to enable this feature.
          </>
        ) : (
          <>
            Database is not configured yet. Set <code className="text-xs">DATABASE_URL</code> in your <code className="text-xs">.env</code> file to enable database features.
          </>
        )}
      </AlertDescription>
    </Alert>
  );
}

