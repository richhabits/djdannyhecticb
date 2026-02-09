import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import {
  MessageSquare,
  Music,
  Coins,
  Radio,
  Sparkles,
  AlertTriangle,
  TrendingUp,
  Users,
  Gift,
  Play,
  Settings,
  Megaphone,
} from "lucide-react";
import { format } from "date-fns";

export default function AdminControlTower() {
  const { user, isAuthenticated } = useAuth();
  const { data: stats, isLoading } = trpc.controlTower.stats.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p>Access denied. Admin only.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">HecticOps Control Tower</h1>
          <p className="text-muted-foreground mt-2">Your command center for everything Hectic</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">Super Admin</Badge>
      </div>

      {/* Top-level KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shouts (7d)</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.shoutsLast7Days || 0}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Track Votes</CardTitle>
            <Music className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.trackVotesTotal || 0}</div>
            <p className="text-xs text-muted-foreground">Total votes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Wallets</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeWallets || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalCoinsInCirculation?.toLocaleString() || 0} coins
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Episodes</CardTitle>
            <Radio className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.publishedEpisodes || 0}</div>
            <p className="text-xs text-muted-foreground">Published</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Jobs</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalAIJobs || 0}</div>
            <p className="text-xs text-muted-foreground">Total run</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incident</CardTitle>
            {stats?.activeIncident ? (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            ) : (
              <Badge variant="outline" className="text-xs">None</Badge>
            )}
          </CardHeader>
          <CardContent>
            {stats?.activeIncident ? (
              <div className="text-sm text-red-500">{stats.activeIncident.message}</div>
            ) : (
              <div className="text-sm text-muted-foreground">All systems operational</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Economy Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Economy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Active Wallets</p>
              <p className="text-2xl font-bold">{stats?.activeWallets || 0}</p>
            </div>
            <div className="flex gap-2">
              <Link href="/admin/economy">
                <Button variant="outline" size="sm">Economy</Button>
              </Link>
              <Link href="/admin/rewards">
                <Button variant="outline" size="sm">Rewards</Button>
              </Link>
              <Link href="/admin/redemptions">
                <Button variant="outline" size="sm">Redemptions</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Shows & Live Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5" />
              Shows & Live
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Published Episodes</p>
              <p className="text-2xl font-bold">{stats?.publishedEpisodes || 0}</p>
            </div>
            <div className="flex gap-2">
              <Link href="/admin/show-live">
                <Button variant="outline" size="sm">Live Control</Button>
              </Link>
              <Link href="/admin/shows">
                <Button variant="outline" size="sm">Shows</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Streams Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5" />
              Streams
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Stream Management</p>
              <p className="text-sm">Configure Shoutcast/Icecast</p>
            </div>
            <Link href="/admin/streams">
              <Button variant="outline" size="sm" className="w-full">Manage Streams</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Hectic Hub Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Hectic Hub
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Shouts (7d)</p>
              <p className="text-2xl font-bold">{stats?.shoutsLast7Days || 0}</p>
            </div>
            <Link href="/admin/shouts">
              <Button variant="outline" size="sm" className="w-full">Manage Shouts</Button>
            </Link>
          </CardContent>
        </Card>

        {/* AI Studio Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Studio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Total AI Jobs</p>
              <p className="text-2xl font-bold">{stats?.totalAIJobs || 0}</p>
            </div>
            <Link href="/admin/ai-studio">
              <Button variant="outline" size="sm" className="w-full">AI Studio</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Marketing Hub Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Marketing Hub
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Marketing Tools</p>
              <p className="text-sm">Leads, campaigns, social posts</p>
            </div>
            <Link href="/admin/marketing">
              <Button variant="outline" size="sm" className="w-full">Marketing Hub</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Safety & Empire Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Safety & Empire
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">System Status</p>
              {stats?.activeIncident ? (
                <Badge variant="destructive">Incident Active</Badge>
              ) : (
                <Badge variant="outline">Operational</Badge>
              )}
            </div>
            <Link href="/admin/empire">
              <Button variant="outline" size="sm" className="w-full">Empire Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/show-live">
              <Button variant="outline" className="w-full">
                <Play className="h-4 w-4 mr-2" />
                Start Live Show
              </Button>
            </Link>
            <Link href="/admin/integrations">
              <Button variant="outline" className="w-full">
                <TrendingUp className="h-4 w-4 mr-2" />
                Manage Integrations
              </Button>
            </Link>
            <Link href="/admin/ai-scripts">
              <Button variant="outline" className="w-full">
                <Sparkles className="h-4 w-4 mr-2" />
                Create AI Script
              </Button>
            </Link>
            <Link href="/admin/marketing">
              <Button variant="outline" className="w-full">
                <Megaphone className="h-4 w-4 mr-2" />
                Marketing Hub
              </Button>
            </Link>
            <Link href="/admin/empire">
              <Button variant="outline" className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Empire Settings
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

