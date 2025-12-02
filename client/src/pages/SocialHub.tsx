import { DashboardLayout } from "@/components/DashboardLayout";
import { SocialConnections } from "@/components/SocialConnections";
import { SocialAnalytics } from "@/components/SocialAnalytics";
import { LiveShareFeed, TopSharedTracks } from "@/components/LiveShareFeed";
import { MetaTagsComponent } from "@/components/MetaTags";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Share2, TrendingUp, BarChart3, Users } from "lucide-react";

export default function SocialHub() {
  return (
    <>
      <MetaTagsComponent
        title="Social Hub | Hectic Radio"
        description="Connect your social accounts, share tracks, and earn rewards"
        url="/social"
      />
      <DashboardLayout title="Social Hub" icon={Share2}>
        <div className="space-y-6">
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-muted-foreground">
              Connect your social media accounts to automatically share what you're listening
              to. Earn HecticCoins for every share and grow your influence!
            </p>
          </div>

          <Tabs defaultValue="connections" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="connections" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Connections</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="feed" className="flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Feed</span>
              </TabsTrigger>
              <TabsTrigger value="trending" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Trending</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="connections" className="mt-6">
              <SocialConnections />
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <SocialAnalytics />
            </TabsContent>

            <TabsContent value="feed" className="mt-6">
              <LiveShareFeed />
            </TabsContent>

            <TabsContent value="trending" className="mt-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <TopSharedTracks />
                <LiveShareFeed />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </>
  );
}
