import { Card } from "@/components/ui/card";
import { PortalNav } from "@/components/PortalNav";
import { PortalGuard } from "@/components/PortalGuard";
import { ListMusic } from "lucide-react";

function PlaylistsContent() {
  return (
    <div className="min-h-screen bg-background text-foreground p-6 max-w-6xl mx-auto">
      <PortalNav />

      <h1 className="text-3xl font-bold mb-8">Playlists</h1>

      <Card className="p-12 glass text-center">
        <ListMusic className="w-12 h-12 mx-auto mb-4 text-accent" />
        <h2 className="text-xl font-bold mb-2">Coming Soon</h2>
        <p className="text-muted-foreground">
          The playlist builder is on its way — soon you'll be able to group your tracks into playlists right here.
        </p>
      </Card>
    </div>
  );
}

export default function PortalPlaylists() {
  return (
    <PortalGuard>
      <PlaylistsContent />
    </PortalGuard>
  );
}
