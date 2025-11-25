import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Music, BarChart3, TrendingUp, Users, DollarSign, Calendar, Download, Filter, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("month");
  const { data: summary, isLoading } = trpc.analytics.summary.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  const stats = [
    {
      label: "Total Bookings",
      value: summary?.totalBookings.toString() || "0",
      change: "+12%", // Mock trend for now
      icon: Calendar,
      color: "text-blue-400",
    },
    {
      label: "Website Visitors",
      value: summary?.totalVisitors.toString() || "0",
      change: "+45%",
      icon: Users,
      color: "text-purple-400",
    },
    {
      label: "Mix Plays",
      value: summary?.totalMixPlays.toString() || "0",
      change: "+67%",
      icon: Music,
      color: "text-pink-400",
    },
    {
      label: "Total Revenue (Est)", // Placeholder as we don't track revenue yet
      value: "$0", 
      change: "+0%",
      icon: DollarSign,
      color: "text-green-400",
    },
  ];

  // ... (keep revenueData, trafficSources, bookingMetrics static for now or hide)
  const revenueData = [
     { month: "Jan", bookings: 2400, merchandise: 1200, mixes: 800 },
     // ...
  ];

  // Use real top mixes
  const topPerformers = summary?.topMixes.map(m => ({
    name: m.name,
    downloads: m.plays, // using plays as downloads
    revenue: "$0"
  })) || [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80">
            <Music className="w-6 h-6" />
            <span className="font-bold">DJ Danny Hectic B</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm hover:text-accent">Dashboard</Link>
            <Link href="/analytics" className="text-sm hover:text-accent font-semibold text-accent">Analytics</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-8 md:py-12 bg-gradient-to-b from-purple-900/20 to-background border-b border-border">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">Analytics Dashboard</h1>
              <p className="text-muted-foreground">Track your performance and business metrics</p>
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </Button>
          </div>

          {/* Time Range Filter (Visual Only for now) */}
          <div className="flex gap-2">
            {["week", "month", "quarter", "year"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  timeRange === range
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                    : "bg-card border border-border hover:border-accent"
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="py-8">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <Card key={idx} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <Icon className={`w-8 h-8 ${stat.color}`} />
                    <span className="text-green-400 text-sm font-semibold">{stat.change}</span>
                  </div>
                  <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Top Performers */}
      <section className="py-8 border-t border-border">
        <div className="container">
          <h2 className="text-2xl font-bold mb-6">Top Performing Mixes</h2>
          <Card className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-card/50">
                  <th className="text-left p-4 font-semibold">Mix Name</th>
                  <th className="text-right p-4 font-semibold">Plays/Downloads</th>
                  <th className="text-right p-4 font-semibold">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topPerformers.length > 0 ? topPerformers.map((performer, idx) => (
                  <tr key={idx} className="border-b border-border hover:bg-card/50 transition">
                    <td className="p-4">{performer.name}</td>
                    <td className="text-right p-4">
                      <span className="text-purple-400 font-semibold">{performer.downloads}</span>
                    </td>
                    <td className="text-right p-4">
                      <span className="text-green-400 font-semibold">{performer.revenue}</span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-muted-foreground">No data available yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        </div>
      </section>

    </div>
  );
}
