/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 * 
 * This is proprietary software. Reverse engineering, decompilation, or 
 * disassembly is strictly prohibited and may result in legal action.
 */


/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Music, BarChart3, TrendingUp, Users, DollarSign, Calendar, Download, Filter } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("month");

  const stats = [
    {
      label: "Total Revenue",
      value: "$12,450",
      change: "+23%",
      icon: DollarSign,
      color: "text-green-400",
    },
    {
      label: "Bookings",
      value: "42",
      change: "+12%",
      icon: Calendar,
      color: "text-orange-400",
    },
    {
      label: "Website Visitors",
      value: "8,234",
      change: "+45%",
      icon: Users,
      color: "text-orange-400",
    },
    {
      label: "Mixes Downloaded",
      value: "1,823",
      change: "+67%",
      icon: Music,
      color: "text-amber-400",
    },
  ];

  const revenueData = [
    { month: "Jan", bookings: 2400, merchandise: 1200, mixes: 800 },
    { month: "Feb", bookings: 2800, merchandise: 1400, mixes: 950 },
    { month: "Mar", bookings: 3200, merchandise: 1600, mixes: 1100 },
    { month: "Apr", bookings: 3800, merchandise: 1900, mixes: 1300 },
    { month: "May", bookings: 4200, merchandise: 2100, mixes: 1500 },
    { month: "Jun", bookings: 4800, merchandise: 2400, mixes: 1750 },
  ];

  const topPerformers = [
    { name: "Garage Classics Mix", downloads: 342, revenue: "$1,710" },
    { name: "Soulful House Journey", downloads: 298, revenue: "$1,490" },
    { name: "Amapiano Vibes", downloads: 267, revenue: "$1,335" },
    { name: "Grime Essentials", downloads: 245, revenue: "$1,225" },
    { name: "Funky House Hits", downloads: 198, revenue: "$990" },
  ];

  const trafficSources = [
    { source: "Instagram", visitors: 3200, percentage: 39 },
    { source: "Direct", visitors: 2100, percentage: 25 },
    { source: "Spotify", visitors: 1500, percentage: 18 },
    { source: "YouTube", visitors: 900, percentage: 11 },
    { source: "Other", visitors: 534, percentage: 7 },
  ];

  const bookingMetrics = [
    { metric: "Total Inquiries", value: "156", change: "+18%" },
    { metric: "Conversion Rate", value: "26.9%", change: "+3.2%" },
    { metric: "Avg. Booking Value", value: "$450", change: "+12%" },
    { metric: "Repeat Clients", value: "34%", change: "+8%" },
  ];

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
      <section className="py-8 md:py-12 bg-gradient-to-b from-orange-900/20 to-background border-b border-border">
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

          {/* Time Range Filter */}
          <div className="flex gap-2">
            {["week", "month", "quarter", "year"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  timeRange === range
                    ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white"
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

      {/* Revenue Chart */}
      <section className="py-8 border-t border-border">
        <div className="container">
          <h2 className="text-2xl font-bold mb-6">Revenue Breakdown</h2>
          <Card className="p-6">
            <div className="space-y-6">
              {revenueData.map((data, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{data.month}</span>
                    <span className="text-muted-foreground text-sm">
                      ${data.bookings + data.merchandise + data.mixes}
                    </span>
                  </div>
                  <div className="flex gap-2 h-8">
                    <div
                      className="bg-orange-500 rounded"
                      style={{ width: `${(data.bookings / 5000) * 100}%` }}
                      title={`Bookings: $${data.bookings}`}
                    />
                    <div
                      className="bg-orange-500 rounded"
                      style={{ width: `${(data.merchandise / 5000) * 100}%` }}
                      title={`Merchandise: $${data.merchandise}`}
                    />
                    <div
                      className="bg-amber-500 rounded"
                      style={{ width: `${(data.mixes / 5000) * 100}%` }}
                      title={`Mixes: $${data.mixes}`}
                    />
                  </div>
                </div>
              ))}
              <div className="flex gap-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded" />
                  <span className="text-sm">Bookings</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded" />
                  <span className="text-sm">Merchandise</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-amber-500 rounded" />
                  <span className="text-sm">Mixes</span>
                </div>
              </div>
            </div>
          </Card>
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
                  <th className="text-right p-4 font-semibold">Downloads</th>
                  <th className="text-right p-4 font-semibold">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topPerformers.map((performer, idx) => (
                  <tr key={idx} className="border-b border-border hover:bg-card/50 transition">
                    <td className="p-4">{performer.name}</td>
                    <td className="text-right p-4">
                      <span className="text-orange-400 font-semibold">{performer.downloads}</span>
                    </td>
                    <td className="text-right p-4">
                      <span className="text-green-400 font-semibold">{performer.revenue}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </section>

      {/* Traffic Sources */}
      <section className="py-8 border-t border-border">
        <div className="container">
          <h2 className="text-2xl font-bold mb-6">Traffic Sources</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {trafficSources.map((source, idx) => (
              <Card key={idx} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">{source.source}</h3>
                  <span className="text-orange-400 font-bold">{source.percentage}%</span>
                </div>
                <div className="w-full bg-card border border-border rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-orange-600 to-amber-600 h-full"
                    style={{ width: `${source.percentage}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-3">{source.visitors} visitors</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Metrics */}
      <section className="py-8 border-t border-border">
        <div className="container">
          <h2 className="text-2xl font-bold mb-6">Booking Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {bookingMetrics.map((metric, idx) => (
              <Card key={idx} className="p-6">
                <p className="text-muted-foreground text-sm mb-2">{metric.metric}</p>
                <div className="flex items-end justify-between">
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <span className="text-green-400 text-sm font-semibold">{metric.change}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Export Section */}
      <section className="py-8 border-t border-border bg-card/50">
        <div className="container max-w-2xl">
          <Card className="p-8 text-center space-y-4">
            <BarChart3 className="w-12 h-12 text-orange-400 mx-auto" />
            <h3 className="text-xl font-bold">Generate Custom Reports</h3>
            <p className="text-muted-foreground">
              Export detailed analytics reports in PDF or CSV format for your records.
            </p>
            <div className="flex gap-4 justify-center">
              <Button className="bg-gradient-to-r from-orange-600 to-amber-600">
                <Download className="w-4 h-4 mr-2" />
                Export as PDF
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export as CSV
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
