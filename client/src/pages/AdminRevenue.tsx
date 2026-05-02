/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * Admin Revenue Dashboard
 * - Total revenue & MRR
 * - Revenue breakdown by source
 * - Churn analysis
 * - Tax reporting
 * - Payout management
 * - Forecasting
 */

import React from "react";
import { trpc } from "@/utils/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, Users, AlertCircle } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const AdminRevenue: React.FC = () => {
  const totalRevenueQuery = trpc.revenue.getTotalRevenue.useQuery();
  const monthlyTrendQuery = trpc.revenue.getMonthlyTrend.useQuery();
  const churnAnalysisQuery = trpc.revenue.getChurnAnalysis.useQuery();
  const payoutStatsQuery = trpc.revenue.getPayoutStats.useQuery();
  const ltvQuery = trpc.revenue.getLTV.useQuery();
  const forecastQuery = trpc.revenue.getRevenueForecast.useQuery();

  const totalRevenue = totalRevenueQuery.data;
  const monthlyTrend = monthlyTrendQuery.data || [];
  const churnAnalysis = churnAnalysisQuery.data;
  const payoutStats = payoutStatsQuery.data;
  const ltv = ltvQuery.data;
  const forecast = forecastQuery.data;

  if (!totalRevenue) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">Revenue Dashboard</h1>
        <p className="text-slate-600">Total revenue, MRR, and analytics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Revenue</p>
                <p className="text-3xl font-bold">
                  ${(totalRevenue.totalRevenue || 0).toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Monthly Recurring Revenue</p>
                <p className="text-3xl font-bold">${(totalRevenue.mrr || 0).toFixed(2)}</p>
                <p className="text-xs text-slate-600">ARR: ${(totalRevenue.arr || 0).toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Churn Rate</p>
                <p className="text-3xl font-bold">{churnAnalysis?.thisMonthChurn || 0}</p>
                <p className="text-xs text-slate-600">This Month</p>
              </div>
              {churnAnalysis && churnAnalysis.churnTrend > 0 ? (
                <TrendingDown className="h-8 w-8 text-red-500" />
              ) : (
                <TrendingUp className="h-8 w-8 text-green-500" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Avg LTV</p>
                <p className="text-3xl font-bold">${(ltv?.avgLTV || 0).toFixed(2)}</p>
                <p className="text-xs text-slate-600">{ltv?.totalUsers || 0} Users</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Source */}
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {totalRevenue.bySource && Object.entries(totalRevenue.bySource).map(([source, amount]) => (
                <div key={source} className="flex justify-between">
                  <span className="capitalize text-slate-600">{source}</span>
                  <span className="font-semibold">${(amount as number).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-slate-600">Total Paid</span>
                <span className="font-semibold">
                  ${(payoutStats?.totalPayouts || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Affiliate Payouts</span>
                <span className="font-semibold">
                  ${(payoutStats?.affiliatePayouts || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Pending</span>
                <span className="font-semibold">{payoutStats?.pendingCount || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Processing</span>
                <span className="font-semibold">{payoutStats?.processingCount || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend Chart */}
      {monthlyTrend.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="subscriptions" fill="#3b82f6" name="Subscriptions" />
                <Bar dataKey="donations" fill="#10b981" name="Donations" />
                <Bar dataKey="merchandise" fill="#f59e0b" name="Merchandise" />
                <Bar dataKey="affiliates" fill="#8b5cf6" name="Affiliates" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Forecast */}
      {forecast && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue Forecast</CardTitle>
            <CardDescription>
              Based on last 3 months | Current Monthly Run: ${forecast.currentMonthlyRun.toFixed(2)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {forecast.forecast.map((f, i) => (
                <div key={i} className="flex justify-between rounded-lg bg-slate-50 p-4">
                  <span className="capitalize font-semibold">{f.month.replace("_", " ")}</span>
                  <span className="text-lg font-bold">${f.projected.toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span className="font-semibold">Projected Annual Revenue</span>
                  <span className="text-xl font-bold">${forecast.projectedAnnual.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Churn Analysis */}
      {churnAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle>Churn Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-sm text-slate-600">This Month vs Last Month</p>
                <p className="text-lg font-semibold">
                  {churnAnalysis.thisMonthChurn} vs {churnAnalysis.lastMonthChurn}
                </p>
                {churnAnalysis.churnTrend > 0 && (
                  <Badge className="mt-2 bg-red-100 text-red-800">
                    {churnAnalysis.churnTrend.toFixed(1)}% increase
                  </Badge>
                )}
              </div>
              <div>
                <p className="text-sm text-slate-600">Top Churn Reasons</p>
                <div className="space-y-2 text-sm">
                  {churnAnalysis.topChurnReasons.slice(0, 3).map((reason) => (
                    <div key={reason.reason} className="flex justify-between">
                      <span>{reason.reason}</span>
                      <span className="font-semibold">{reason.count}x</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Action Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {churnAnalysis && churnAnalysis.churnTrend > 5 && (
              <div className="flex items-center justify-between rounded-lg bg-orange-50 p-4">
                <p className="text-sm">High churn detected. Consider reaching out to recent cancellations.</p>
                <Button size="sm" variant="outline">
                  Send Survey
                </Button>
              </div>
            )}
            {payoutStats && payoutStats.pendingCount > 0 && (
              <div className="flex items-center justify-between rounded-lg bg-blue-50 p-4">
                <p className="text-sm">{payoutStats.pendingCount} pending payouts waiting approval</p>
                <Button size="sm" variant="outline">
                  Review Payouts
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminRevenue;
