import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Coins, TrendingUp, Users, Gift } from "lucide-react";
import { Link } from "wouter";

export default function AdminEconomy() {
  const { user, isAuthenticated } = useAuth();

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

  // Note: These would be calculated from actual data in a real implementation
  const totalCoinsInCirculation = 0; // Would sum all wallet balances
  const topEarners: Array<{ userId: number; balance: number }> = []; // Would query top wallets
  const coinsBySource = {
    mission: 0,
    shout: 0,
    referral: 0,
    adminAdjust: 0,
  };
  const redemptionStats = {
    pending: 0,
    fulfilled: 0,
    rejected: 0,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Economy Control</h1>
        <Badge variant="outline">Admin Dashboard</Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Coins</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCoinsInCirculation.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">In circulation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Earners</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topEarners.length}</div>
            <p className="text-xs text-muted-foreground">Active wallets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Redemptions</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{redemptionStats.pending}</div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fulfilled</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{redemptionStats.fulfilled}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Link href="/admin/rewards">
              <Button variant="outline">Manage Rewards</Button>
            </Link>
            <Link href="/admin/redemptions">
              <Button variant="outline">View Redemptions</Button>
            </Link>
            <Link href="/admin/referrals">
              <Button variant="outline">Referral Codes</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Coins by Source */}
      <Card>
        <CardHeader>
          <CardTitle>Coins Earned by Source</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(coinsBySource).map(([source, amount]) => (
              <div key={source} className="flex items-center justify-between">
                <span className="capitalize">{source}</span>
                <Badge>{amount.toLocaleString()}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

