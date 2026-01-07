/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import {
  Activity,
  Server,
  Database,
  Globe,
  DollarSign,
  Cpu,
  Clock,
  Music,
  Radio,
  MessageSquare,
  Sparkles,
  Megaphone,
  Settings,
  TrendingUp,
  Play
} from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";

export default function AdminControlTower() {
  const { user, isAuthenticated } = useAuth();

  // Fetch higher-level business stats
  const { data: stats, isLoading: isLoadingStats } = trpc.controlTower.stats.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  // Fetch low-level system stats (New)
  const { data: systemStats, isLoading: isLoadingSystem } = trpc.system.stats.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
    refetchInterval: 30000, // Refresh every 30s
  });

  // Cost Estimator State
  const [serverCost, setServerCost] = useState(25); // Monthly VPS cost
  const [storageCost, setStorageCost] = useState(0);

  // Calculate storage cost based on disk usage
  useEffect(() => {
    if (systemStats?.disk?.used) {
      // Rough estimate: $0.10 per GB for backups/extra storage if needed
      // This is just a visual estimator tool for the user
      const usedGB = parseFloat(systemStats.disk.used.replace('G', ''));
      if (!isNaN(usedGB)) {
        setStorageCost(usedGB * 0.05); // Assume 5 cents per GB
      }
    }
  }, [systemStats]);

  const totalMonthlyCost = serverCost + storageCost;

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Restricted Access</h2>
          <p className="text-muted-foreground">This capability requires Commander clearance.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight flex items-center gap-3">
            <Activity className="h-8 w-8 text-green-500" />
            Mission Control
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Operational Overview & System Health
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm py-1 px-3 border-green-500/50 text-green-500 bg-green-500/10">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            SYSTEM ONLINE
          </Badge>
          <div className="text-right text-xs text-muted-foreground hidden md:block">
            <p>{format(new Date(), "PPpp")}</p>
            <p>HecticOps v2.1.0</p>
          </div>
        </div>
      </div>

      {/* SYSTEM HEALTH ROW */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
          <Server className="h-5 w-5" /> Infrastructure Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Disk Usage */}
          <Card className="bg-card/50 backdrop-blur border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between">
                Disk Usage
                <Database className="h-4 w-4 text-blue-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats?.disk?.percent || "0%"}</div>
              <Progress value={parseInt(systemStats?.disk?.percent || "0")} className="h-2 mt-2 bg-blue-950" indicatorClassName="bg-blue-500" />
              <p className="text-xs text-muted-foreground mt-2">
                {systemStats?.disk?.used || "0GB"} used of {systemStats?.disk?.total || "0GB"}
              </p>
            </CardContent>
          </Card>

          {/* Uptime */}
          <Card className="bg-card/50 backdrop-blur border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between">
                System Uptime
                <Clock className="h-4 w-4 text-green-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Parse uptime robustly */}
              <div className="text-lg font-bold truncate" title={systemStats?.uptime}>
                {systemStats?.uptime?.split(',')[0] || "Unknown"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Server active & responsive
              </p>
            </CardContent>
          </Card>

          {/* Cost Estimator */}
          <Card className="bg-card/50 backdrop-blur border-l-4 border-l-yellow-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between">
                Est. Monthly Cost
                <DollarSign className="h-4 w-4 text-yellow-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalMonthlyCost.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Server: ${serverCost} | Storage: ~${storageCost.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          {/* Traffic / Load */}
          <Card className="bg-card/50 backdrop-blur border-l-4 border-l-purple-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between">
                Network Traffic
                <Globe className="h-4 w-4 text-purple-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Healthy</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.activeWallets || 0} active connections
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* OPERATIONS CENTER */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
          <Cpu className="h-5 w-5" /> Operations Center
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* MEDIA OPS */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Media Operations</CardTitle>
              <CardDescription>Manage your content library and broadcasts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/admin/mixes">
                  <Button variant="outline" className="w-full h-24 flex flex-col gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all">
                    <Music className="h-6 w-6" />
                    <span>Mixes</span>
                  </Button>
                </Link>
                <Link href="/admin/podcasts">
                  <Button variant="outline" className="w-full h-24 flex flex-col gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all">
                    <MessageSquare className="h-6 w-6" />
                    <span>Podcasts</span>
                  </Button>
                </Link>
                <Link href="/admin/shows">
                  <Button variant="outline" className="w-full h-24 flex flex-col gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all">
                    <Radio className="h-6 w-6" />
                    <span>Shows</span>
                  </Button>
                </Link>
                <Link href="/admin/events">
                  <Button variant="outline" className="w-full h-24 flex flex-col gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all">
                    <Globe className="h-6 w-6" />
                    <span>Events</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* AI COMMAND */}
          <Card className="bg-gradient-to-br from-purple-900/10 to-blue-900/10 border-blue-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-400" />
                AI Command
              </CardTitle>
              <CardDescription>Generative tools & automation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center bg-background/50 p-2 rounded">
                <span className="text-sm font-medium">Jobs Run</span>
                <Badge>{stats?.totalAIJobs || 0}</Badge>
              </div>
              <Link href="/admin/ai-studio">
                <Button className="w-full gradient-bg">Launch AI Studio</Button>
              </Link>
              <Link href="/admin/ai-scripts">
                <Button variant="ghost" size="sm" className="w-full">Manage Scripts</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* QUICK ACTIONS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/admin/show-live">
          <Button size="lg" className="w-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/20">
            <Play className="mr-2 h-5 w-5 fill-current" />
            GO LIVE
          </Button>
        </Link>
        <Link href="/admin/marketing">
          <Button size="lg" variant="secondary" className="w-full">
            <Megaphone className="mr-2 h-5 w-5" />
            Marketing Hub
          </Button>
        </Link>
        <Link href="/admin/economy">
          <Button size="lg" variant="secondary" className="w-full">
            <DollarSign className="mr-2 h-5 w-5" />
            Economy & Shop
          </Button>
        </Link>
        <Link href="/admin/empire">
          <Button size="lg" variant="outline" className="w-full">
            <Settings className="mr-2 h-5 w-5" />
            Global Settings
          </Button>
        </Link>
      </div>

    </div>
  );
}
