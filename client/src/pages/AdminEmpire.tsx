/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import {
  TrendingUp,
  Users,
  Radio,
  MessageSquare,
  Music,
  DollarSign,
  Database,
  AlertCircle,
  CheckCircle,
  XCircle,
  Settings,
  Power,
  Sparkles,
  Volume2,
  Video,
  FileText,
} from "lucide-react";
import { Link } from "wouter";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function AdminEmpire() {
  const { user, isAuthenticated } = useAuth();
  const { data: overview, isLoading } = trpc.empire.overview.useQuery();
  const { data: settings, refetch: refetchSettings } = trpc.safety.settings.getAll.useQuery();
  const setSetting = trpc.safety.settings.set.useMutation({
    onSuccess: () => {
      toast.success("Setting updated");
      refetchSettings();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to update setting";
      toast.error(message);
    },
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

  const toggleKillSwitch = (key: string, currentValue: boolean) => {
    setSetting.mutate({
      key,
      value: !currentValue,
      description: `Kill switch for ${key}`,
    });
  };

  const getSettingValue = (key: string, defaultValue: boolean = false): boolean => {
    const setting = settings?.find((s) => s.key === key);
    if (!setting) return defaultValue;
    try {
      const parsed = JSON.parse(setting.value || "false");
      return typeof parsed === "boolean" ? parsed : defaultValue;
    } catch {
      return setting.value === "true" || setting.value === "1" || defaultValue;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Empire Control Room</h1>
        <Badge variant="outline">Owner Dashboard</Badge>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <p>Loading empire overview...</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* High-Level KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Daily Active Listeners</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview?.dailyActiveListeners || 0}</div>
                <p className="text-xs text-muted-foreground">Last 24 hours</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Weekly Active Listeners</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview?.weeklyActiveListeners || 0}</div>
                <p className="text-xs text-muted-foreground">Last 7 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Shouts Per Day</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview?.shoutsPerDay || 0}</div>
                <p className="text-xs text-muted-foreground">Track requests: {overview?.trackRequestsPerDay || 0}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue (GBP)</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  £{overview?.revenueSummary?.support?.toFixed(2) || "0.00"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Support: £{overview?.revenueSummary?.support?.toFixed(2) || "0.00"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Status Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Status Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  {overview?.dbHealth === "ok" ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium">Database</p>
                    <p className="text-xs text-muted-foreground">{overview?.dbHealth || "unknown"}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {overview?.queueHealth === "ok" ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium">Queue</p>
                    <p className="text-xs text-muted-foreground">{overview?.queueHealth || "unknown"}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {overview?.cronStatus === "ok" ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium">Cron Jobs</p>
                    <p className="text-xs text-muted-foreground">{overview?.cronStatus || "unknown"}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {overview?.errorRate24h === 0 ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium">Error Rate (24h)</p>
                    <p className="text-xs text-muted-foreground">{overview?.errorRate24h || 0} errors</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions - Kill Switches */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="ai-posting">Pause All AI Posting</Label>
                  <p className="text-sm text-muted-foreground">Temporarily disable AI-generated social posts</p>
                </div>
                <Switch
                  id="ai-posting"
                  checked={!getSettingValue("ai_posting_enabled", true)}
                  onCheckedChange={() => toggleKillSwitch("ai_posting_enabled", getSettingValue("ai_posting_enabled", true))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="ai-hosting">Enable AI Hosting</Label>
                  <p className="text-sm text-muted-foreground">Allow AI Danny to host shows automatically</p>
                </div>
                <Switch
                  id="ai-hosting"
                  checked={getSettingValue("ai_hosting_enabled", false)}
                  onCheckedChange={() => toggleKillSwitch("ai_hosting_enabled", getSettingValue("ai_hosting_enabled", false))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="max-hectic">Max Hectic Mode</Label>
                  <p className="text-sm text-muted-foreground">Enable maximum controversy/engagement mode</p>
                </div>
                <Switch
                  id="max-hectic"
                  checked={getSettingValue("max_hectic_mode", false)}
                  onCheckedChange={() => toggleKillSwitch("max_hectic_mode", getSettingValue("max_hectic_mode", false))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="maintenance">Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">Show holding page to all users</p>
                </div>
                <Switch
                  id="maintenance"
                  checked={getSettingValue("maintenance_mode", false)}
                  onCheckedChange={() => toggleKillSwitch("maintenance_mode", getSettingValue("maintenance_mode", false))}
                />
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    AI Studio Controls
                  </h3>
                  <Link href="/admin/ai-studio">
                    <Button variant="outline" size="sm">Go to AI Studio</Button>
                  </Link>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="ai-studio">AI Studio Enabled</Label>
                    <p className="text-sm text-muted-foreground">Enable all AI generation features</p>
                  </div>
                  <Switch
                    id="ai-studio"
                    checked={getSettingValue("ai_studio_enabled", true)}
                    onCheckedChange={() => toggleKillSwitch("ai_studio_enabled", getSettingValue("ai_studio_enabled", true))}
                  />
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="fan-facing-ai">Fan-Facing AI Tools</Label>
                    <p className="text-sm text-muted-foreground">Allow fans to use AI shout studio and other tools</p>
                  </div>
                  <Switch
                    id="fan-facing-ai"
                    checked={getSettingValue("fan_facing_ai_enabled", false)}
                    onCheckedChange={() => toggleKillSwitch("fan_facing_ai_enabled", getSettingValue("fan_facing_ai_enabled", false))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Studio KPIs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                AI Studio Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Script Jobs</p>
                    <p className="text-xl font-bold">-</p>
                    <Link href="/admin/ai-scripts">
                      <Button variant="link" size="sm" className="p-0 h-auto">View All</Button>
                    </Link>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Volume2 className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Voice Jobs</p>
                    <p className="text-xl font-bold">-</p>
                    <Link href="/admin/ai-voice">
                      <Button variant="link" size="sm" className="p-0 h-auto">View All</Button>
                    </Link>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Video className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Video Jobs</p>
                    <p className="text-xl font-bold">-</p>
                    <Link href="/admin/ai-video">
                      <Button variant="link" size="sm" className="p-0 h-auto">View All</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Bookings</p>
                  <p className="text-2xl font-bold">{overview?.revenueSummary?.bookings || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Support/Tips</p>
                  <p className="text-2xl font-bold">£{overview?.revenueSummary?.support?.toFixed(2) || "0.00"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Products</p>
                  <p className="text-2xl font-bold">{overview?.revenueSummary?.products || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                  <p className="text-2xl font-bold">{overview?.revenueSummary?.subscriptions || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

