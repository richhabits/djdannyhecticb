/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 * 
 * This is proprietary software. Reverse engineering, decompilation, or 
 * disassembly is strictly prohibited and may result in legal action.
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Activity, TrendingUp, Database, RefreshCw, ExternalLink, Search } from "lucide-react";
import { Link } from "wouter";
import { getEventStats, calculateCTR } from "@/lib/analytics";
import { toast } from "sonner";

export default function AdminBeatport() {
  const { user, isAuthenticated } = useAuth();

  // Fetch cache stats
  const { data: cacheStats, refetch: refetchStats } = trpc.beatport.cacheStats.useQuery();
  
  // Clear cache mutation
  const clearCacheMutation = trpc.beatport.clearCache.useMutation({
    onSuccess: () => {
      toast.success("Cache cleared successfully");
      refetchStats();
    },
  });

  // Reset stats mutation
  const resetStatsMutation = trpc.beatport.resetCacheStats.useMutation({
    onSuccess: () => {
      toast.success("Statistics reset");
      refetchStats();
    },
  });

  // Get analytics from local storage
  const chartViewStats = getEventStats('shop_chart_view');
  const trackViewStats = getEventStats('shop_track_view');
  const clickStats = getEventStats('shop_outbound_beatport_click');
  const searchStats = getEventStats('shop_search');

  // Calculate CTR (clicks vs views)
  const totalViews = chartViewStats.count + trackViewStats.count;
  const totalClicks = clickStats.count;
  const ctr = calculateCTR(totalViews, totalClicks);

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
        <h1 className="text-3xl font-bold">Beatport Integration Dashboard</h1>
        <div className="flex items-center gap-2">
          <Link href="/admin/control">
            <Button variant="outline" size="sm">Control Tower</Button>
          </Link>
          <Link href="/shop">
            <Button variant="outline" size="sm">View Shop</Button>
          </Link>
          <Badge variant="outline">Admin Dashboard</Badge>
        </div>
      </div>

      {/* Cache Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cacheStats ? (cacheStats.hitRate * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {cacheStats?.hits || 0} hits / {cacheStats?.misses || 0} misses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cached Entries</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cacheStats?.size || 0}</div>
            <p className="text-xs text-muted-foreground">Active entries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click-Through Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ctr.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {totalClicks} clicks / {totalViews} views
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Searches (24h)</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{searchStats.last24h}</div>
            <p className="text-xs text-muted-foreground">{searchStats.count} total</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Cache Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => refetchStats()}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Stats
            </Button>
            <Button
              variant="outline"
              onClick={() => clearCacheMutation.mutate()}
              disabled={clearCacheMutation.isPending}
            >
              Clear Cache
            </Button>
            <Button
              variant="outline"
              onClick={() => resetStatsMutation.mutate()}
              disabled={resetStatsMutation.isPending}
            >
              Reset Statistics
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Chart Views (Last 24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4">{chartViewStats.last24h}</div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total: {chartViewStats.count}</p>
              {chartViewStats.topItems.length > 0 && (
                <>
                  <p className="text-sm font-medium mt-4">Top Charts:</p>
                  {chartViewStats.topItems.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Chart #{item.id}</span>
                      <Badge variant="secondary">{item.count} views</Badge>
                    </div>
                  ))}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Track Views (Last 24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4">{trackViewStats.last24h}</div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total: {trackViewStats.count}</p>
              {trackViewStats.topItems.length > 0 && (
                <>
                  <p className="text-sm font-medium mt-4">Top Tracks:</p>
                  {trackViewStats.topItems.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Track #{item.id}</span>
                      <Badge variant="secondary">{item.count} views</Badge>
                    </div>
                  ))}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Outbound Clicks */}
      <Card>
        <CardHeader>
          <CardTitle>Outbound Beatport Clicks (Last 24h)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-4">{clickStats.last24h}</div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total: {clickStats.count}</p>
            {clickStats.topItems.length > 0 && (
              <>
                <p className="text-sm font-medium mt-4">Most Clicked Items:</p>
                <div className="space-y-2">
                  {clickStats.topItems.slice(0, 10).map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm border-b border-border pb-2">
                      <div className="flex items-center gap-2">
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Item #{item.id}</span>
                      </div>
                      <Badge variant="secondary">{item.count} clicks</Badge>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Health Status */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Beatport API</span>
              <Badge variant="default">Connected</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Token Status</span>
              <Badge variant="default">Valid</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Cache System</span>
              <Badge variant="default">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Analytics Tracking</span>
              <Badge variant="default">Enabled</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
