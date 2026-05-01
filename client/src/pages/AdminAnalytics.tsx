import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { formatDistanceToNow, format } from "date-fns";
import { Link } from "wouter";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  TrendingUp,
  Users,
  MessageSquare,
  Gift,
  MapPin,
  Download,
  Calendar,
  Eye,
  Smile,
} from "lucide-react";

export default function AdminAnalytics() {
  const { user, isAuthenticated } = useAuth();
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [daysBack, setDaysBack] = useState("30");
  const [selectedDateRange, setSelectedDateRange] = useState("30");

  const utils = trpc.useUtils();

  // Get live sessions (placeholder - these would be from live router)
  const sessions = undefined;
  const sessionsLoading = false;

  // Get dashboard summary
  const { data: summary } = trpc.analytics.getDashboardSummary.useQuery(
    { daysBack: parseInt(selectedDateRange) }
  );

  // Get stream metrics for selected session
  const { data: streamMetrics } = trpc.analytics.getStreamMetrics.useQuery(
    { liveSessionId: selectedSession || 0 },
    { enabled: !!selectedSession }
  );

  // Get top donors
  const { data: topDonors } = trpc.analytics.getTopDonors.useQuery(
    { liveSessionId: selectedSession || 0, limit: 10 },
    { enabled: !!selectedSession }
  );

  // Get active chatters
  const { data: activeChatters } = trpc.analytics.getActiveChatters.useQuery(
    { liveSessionId: selectedSession || 0, limit: 10 },
    { enabled: !!selectedSession }
  );

  // Get reaction trends
  const { data: reactionTrends } = trpc.analytics.getReactionTrends.useQuery(
    { liveSessionId: selectedSession || 0 },
    { enabled: !!selectedSession }
  );

  // Get geography data
  const { data: geoData } = trpc.analytics.getGeographyData.useQuery(
    { liveSessionId: selectedSession || 0 },
    { enabled: !!selectedSession }
  );

  // Get message trends
  const { data: messageTrends } = trpc.analytics.getMessageTrends.useQuery(
    { liveSessionId: selectedSession || 0 },
    { enabled: !!selectedSession }
  );

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-bold">Admin Access Required</h1>
          <p className="text-muted-foreground">You must be an admin to access this page.</p>
          <Link href="/">
            <Button className="gradient-bg">Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleExportCSV = () => {
    if (!streamMetrics) return;

    const data = [
      ["Stream Analytics Report", ""],
      ["Generated", format(new Date(), "yyyy-MM-dd HH:mm:ss")],
      [""],
      ["Stream Metrics", ""],
      ["Title", streamMetrics.session.title],
      ["Duration (minutes)", streamMetrics.stream.duration],
      ["Peak Viewers", streamMetrics.stream.peakViewers],
      [""],
      ["Chat", ""],
      ["Total Messages", streamMetrics.chat.totalMessages],
      ["Unique Users", streamMetrics.chat.uniqueUsers],
      ["Messages/Min", streamMetrics.chat.messagesPerMinute],
      [""],
      ["Donations", ""],
      ["Total Donations", streamMetrics.donations.total],
      ["Donation Count", streamMetrics.donations.count],
      ["Average Donation", streamMetrics.donations.average],
      [""],
      ["Reactions", ""],
      ["Total Reactions", streamMetrics.reactions.total],
    ];

    const csv = data.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success("Analytics exported to CSV");
  };

  const reactionChartData = reactionTrends?.map((rt: any) => ({
    name: rt.reactionType,
    value: parseInt(rt.count) || 0,
  })) || [];

  const COLORS = ["#ef4444", "#ec4899", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6"];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <h1 className="text-4xl font-bold">Analytics Dashboard</h1>
            </div>
            <p className="text-muted-foreground">
              Stream metrics, chat activity, donations, and audience insights
            </p>
          </div>

          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Sessions (Last {selectedDateRange} days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{summary.activeSessions}</p>
                  <p className="text-xs text-muted-foreground mt-2">Live streaming sessions</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Total Messages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{summary.totalMessages.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Avg {summary.avgMessagesPerSession}/session
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Gift className="w-4 h-4" />
                    Total Donations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">${summary.totalDonations.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Avg ${summary.avgDonationsPerSession}/session
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Unique Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{summary.uniqueUsers.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-2">Chatters and viewers</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Date Range Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Time Range</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Session Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Live Session</CardTitle>
              <CardDescription>Choose a specific session for detailed analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedSession?.toString() || ""} onValueChange={(val) => setSelectedSession(parseInt(val))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a session for details..." />
                </SelectTrigger>
                <SelectContent>
                  {sessions?.map((session: any) => (
                    <SelectItem key={session.id} value={session.id.toString()}>
                      {session.title} - {formatDistanceToNow(new Date(session.startedAt), { addSuffix: true })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedSession && streamMetrics && (
            <>
              {/* Export Button */}
              <div className="flex justify-end">
                <Button onClick={handleExportCSV} className="gap-2">
                  <Download className="w-4 h-4" />
                  Export to CSV
                </Button>
              </div>

              {/* Stream Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Duration
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{streamMetrics.stream.duration}m</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Peak Viewers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{streamMetrics.stream.peakViewers}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Messages
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{streamMetrics.chat.totalMessages}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {streamMetrics.chat.messagesPerMinute}/min
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Donations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">${streamMetrics.donations.total.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {streamMetrics.donations.count} donations
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Row 1 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Reactions Pie Chart */}
                {reactionChartData.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Smile className="w-5 h-5" />
                        Reaction Trends
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={reactionChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {reactionChartData.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {/* Chat Activity */}
                {messageTrends && messageTrends.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Message Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart
                          data={messageTrends.map((mt: any) => ({
                            time: format(new Date(mt.hour), "HH:mm"),
                            messages: mt.messageCount,
                          }))}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" />
                          <YAxis />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="messages"
                            stroke="#22c55e"
                            dot={false}
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Charts Row 2 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Top Donors */}
                {topDonors && topDonors.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Top Donors</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={topDonors.slice(0, 5)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="user.displayName"
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="totalDonated" fill="#ec4899" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {/* Geography */}
                {geoData && geoData.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Top Locations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {geoData.slice(0, 10).map((g: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded">
                            <span className="text-sm">{g.city}</span>
                            <span className="font-medium">{g.count}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Top Chatters */}
              {activeChatters && activeChatters.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Most Active Chatters</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {activeChatters.map((chatter: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded">
                          <span className="text-sm">
                            {chatter.user?.displayName || chatter.user?.email}
                          </span>
                          <span className="font-medium">{chatter.messageCount} messages</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
