import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { MetaTagsComponent } from "@/components/MetaTags";
import { Lock, Sparkles, Calendar, Trophy, Music } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Backstage() {
  const { user } = useAuth();
  const currentProfileId = user?.id;

  const { data: innerCircleStatus } = trpc.innerCircle.getStatus.useQuery(
    { profileId: currentProfileId || 0 },
    { enabled: !!currentProfileId }
  );

  const isEligible = innerCircleStatus?.isEligible || false;

  if (!isEligible) {
    return (
      <>
        <MetaTagsComponent
          title="Backstage - Inner Circle"
          description="Exclusive Inner Circle area for true Hectic believers"
          url="/backstage"
        />
        <div className="container mx-auto p-6 max-w-4xl">
          <Card>
            <CardContent className="p-12 text-center">
              <Lock className="h-16 w-16 mx-auto mb-6 opacity-50" />
              <h1 className="text-3xl font-bold mb-4">Backstage Access</h1>
              <p className="text-muted-foreground mb-6">
                You're close! Backstage is exclusive to Inner Circle members.
              </p>
              <div className="space-y-4 max-w-md mx-auto">
                <p className="text-sm">To unlock Backstage, you need to:</p>
                <ul className="text-sm text-left space-y-2">
                  <li>• Reach a high XP threshold</li>
                  <li>• Subscribe to Inner Circle tier</li>
                  <li>• Be manually approved by Danny</li>
                </ul>
                <div className="pt-4">
                  <Link href="/vault">
                    <Button>View Your Progress</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <MetaTagsComponent
        title="Backstage - Inner Circle"
        description="Exclusive Inner Circle area for true Hectic believers"
        url="/backstage"
      />
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-4xl font-bold">Backstage</h1>
            <Badge variant="default">Inner Circle</Badge>
          </div>
          <p className="text-muted-foreground">Welcome to the exclusive Inner Circle area</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                Exclusive Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Access exclusive mixes, behind-the-scenes content, and early releases.
              </p>
              <Link href="/vault">
                <Button variant="outline" className="w-full">View Vault</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Special Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Get early access to events, private Q&As, and secret streams.
              </p>
              <Link href="/events">
                <Button variant="outline" className="w-full">View Events</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Inner Circle Missions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Special missions with better rewards, exclusive to Inner Circle members.
              </p>
              <Link href="/vault">
                <Button variant="outline" className="w-full">View Missions</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Member Benefits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2">
                <li>✓ Early access to new content</li>
                <li>✓ Exclusive collectibles</li>
                <li>✓ Priority support</li>
                <li>✓ Special shoutouts</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

