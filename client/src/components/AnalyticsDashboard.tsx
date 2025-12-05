import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Users, TrendingUp, TrendingDown, Activity, 
  Clock, Calendar, Star, AlertTriangle 
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

interface AnalyticsDashboardProps {
  data: any; // Full analytics data from API
}

export function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  if (!data) {
    return <div>Loading analytics...</div>;
  }

  const { overview, timeSeries, content, engagement, retention } = data;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Daily Active Users"
          value={overview.dau}
          subtitle={`Avg: ${overview.avgDAU}`}
          icon={<Users className="h-4 w-4" />}
          trend={overview.dau > overview.avgDAU ? 'up' : 'down'}
        />
        <MetricCard
          title="Monthly Active Users"
          value={overview.mau}
          subtitle={`DAU/MAU: ${(overview.dauMauRatio * 100).toFixed(0)}%`}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <MetricCard
          title="Churn Rate"
          value={`${overview.churnRate}%`}
          subtitle="Last 30 days"
          icon={<AlertTriangle className="h-4 w-4" />}
          trend={overview.churnRate > 10 ? 'down' : 'up'}
        />
        <MetricCard
          title="Engagement Score"
          value={Math.round(overview.dauMauRatio * 100)}
          subtitle="Highly engaged"
          icon={<Activity className="h-4 w-4" />}
          trend="up"
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* User Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>Daily new users over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeSeries.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name="New Users"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* DAU Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Active Users</CardTitle>
              <CardDescription>User activity over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeSeries.dau}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                    name="Active Users"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Content</CardTitle>
              <CardDescription>Most popular mixes in the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {content.top.map((item: any, index: number) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.title}</p>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>{item.plays.toLocaleString()} plays</span>
                        <span>{item.likes.toLocaleString()} likes</span>
                        <span>{item.completionRate.toFixed(0)}% completion</span>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {item.engagement.toLocaleString()} pts
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          {/* Engagement by Hour */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Engagement by Hour
              </CardTitle>
              <CardDescription>When are users most active?</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={engagement.byHour}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="plays" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Engagement by Day */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Engagement by Day
              </CardTitle>
              <CardDescription>Weekly activity patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={engagement.byDay.map((d: any) => ({
                  ...d,
                  dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.day - 1]
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dayName" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="plays" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retention" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cohort Retention</CardTitle>
              <CardDescription>User retention by signup month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {retention.cohorts.map((cohort: any) => (
                  <div key={cohort.cohort} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{cohort.cohort}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          {cohort.size} users
                        </span>
                        <Badge 
                          variant={cohort.retentionRate > 50 ? 'default' : 'secondary'}
                        >
                          {cohort.retentionRate.toFixed(1)}% retained
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-primary h-full rounded-full transition-all"
                        style={{ width: `${cohort.retentionRate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend 
}: { 
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down';
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            {trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
            {trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Real-time stats widget
export function RealTimeStats({ data }: { data: any }) {
  return (
    <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-4 w-4 animate-pulse" />
          Live Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <StatRow label="Active Now" value={data.activeSessions} />
        <StatRow label="Plays (1h)" value={data.playsLastHour} />
        <StatRow label="Shouts (1h)" value={data.shoutsLastHour} />
        <StatRow label="Requests (1h)" value={data.requestsLastHour} />
      </CardContent>
    </Card>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-semibold">{value.toLocaleString()}</span>
    </div>
  );
}
