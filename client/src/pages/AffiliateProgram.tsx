/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * Affiliate Program Page
 * - Apply to program
 * - Link generation & management
 * - Dashboard with earnings & conversions
 * - Payout requests
 */

import React, { useState } from "react";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Copy, ExternalLink, DollarSign, Click, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface AffiliateProfile {
  id: number;
  status: string;
  totalEarnings: string;
  totalPaid: string;
}

const AffiliateProgram: React.FC = () => {
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationData, setApplicationData] = useState({
    email: "",
    displayName: "",
    bio: "",
    websiteUrl: "",
  });

  const profileQuery = trpc.affiliates.getProfile.useQuery();
  const statsQuery = trpc.affiliates.getStats.useQuery();
  const linksQuery = trpc.affiliates.getLinks.useQuery();
  const payoutHistoryQuery = trpc.affiliates.getPayoutHistory.useQuery();

  const applyMutation = trpc.affiliates.applyToProgram.useMutation();
  const generateLinkMutation = trpc.affiliates.generateLink.useMutation();
  const requestPayoutMutation = trpc.affiliates.requestPayout.useMutation();

  const profile = profileQuery.data as AffiliateProfile | undefined;
  const stats = statsQuery.data;
  const links = linksQuery.data || [];
  const payouts = payoutHistoryQuery.data || [];

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await applyMutation.mutateAsync(applicationData);
      toast.success("Application submitted! We'll review it shortly.");
      setShowApplicationForm(false);
      setApplicationData({ email: "", displayName: "", bio: "", websiteUrl: "" });
      profileQuery.refetch();
    } catch (error) {
      toast.error((error as any).message || "Failed to submit application");
    }
  };

  const handleGenerateLink = async () => {
    try {
      await generateLinkMutation.mutateAsync({});
      toast.success("Affiliate link generated!");
      linksQuery.refetch();
    } catch (error) {
      toast.error((error as any).message || "Failed to generate link");
    }
  };

  const handleRequestPayout = async (amount: string) => {
    if (parseFloat(amount) < 50) {
      toast.error("Minimum payout is $50");
      return;
    }
    try {
      await requestPayoutMutation.mutateAsync({ amount });
      toast.success("Payout request submitted!");
      payoutHistoryQuery.refetch();
    } catch (error) {
      toast.error((error as any).message || "Failed to request payout");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  // Not yet applied
  if (!profile) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Become an Affiliate</CardTitle>
            <CardDescription>
              Earn commissions by referring your audience to DJ Danny Hectic B
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Commission Structure */}
            <div>
              <h3 className="mb-4 text-lg font-semibold">Commission Structure</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="bg-slate-50">
                  <CardContent className="pt-6">
                    <p className="font-semibold">Subscriptions: 15%</p>
                    <p className="text-sm text-slate-600">Recurring commission</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-50">
                  <CardContent className="pt-6">
                    <p className="font-semibold">Merchandise: 10%</p>
                    <p className="text-sm text-slate-600">One-time commission</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-50">
                  <CardContent className="pt-6">
                    <p className="font-semibold">Donations: 20%</p>
                    <p className="text-sm text-slate-600">Support tips</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-50">
                  <CardContent className="pt-6">
                    <p className="font-semibold">Digital Products: 15%</p>
                    <p className="text-sm text-slate-600">Courses, packs, presets</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Benefits */}
            <div>
              <h3 className="mb-4 text-lg font-semibold">Benefits</h3>
              <ul className="space-y-2 text-slate-600">
                <li>✓ Passive income from your audience</li>
                <li>✓ Real-time dashboard with conversions & earnings</li>
                <li>✓ Monthly payouts via Stripe Connect</li>
                <li>✓ Marketing materials provided</li>
                <li>✓ Dedicated affiliate support</li>
                <li>✓ Performance-based tier increases</li>
              </ul>
            </div>

            {/* Application Form */}
            {showApplicationForm && (
              <form onSubmit={handleApply} className="space-y-4">
                <Input
                  placeholder="Email"
                  type="email"
                  required
                  value={applicationData.email}
                  onChange={(e) =>
                    setApplicationData({ ...applicationData, email: e.target.value })
                  }
                />
                <Input
                  placeholder="Display Name"
                  required
                  value={applicationData.displayName}
                  onChange={(e) =>
                    setApplicationData({ ...applicationData, displayName: e.target.value })
                  }
                />
                <Input
                  placeholder="Website URL (optional)"
                  type="url"
                  value={applicationData.websiteUrl}
                  onChange={(e) =>
                    setApplicationData({ ...applicationData, websiteUrl: e.target.value })
                  }
                />
                <Textarea
                  placeholder="Tell us about your audience and how you'll promote..."
                  value={applicationData.bio}
                  onChange={(e) =>
                    setApplicationData({ ...applicationData, bio: e.target.value })
                  }
                />
                <div className="flex gap-2">
                  <Button type="submit" disabled={applyMutation.isPending}>
                    {applyMutation.isPending ? "Submitting..." : "Submit Application"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowApplicationForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            {!showApplicationForm && (
              <Button
                className="w-full"
                size="lg"
                onClick={() => setShowApplicationForm(true)}
              >
                Apply Now
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Application pending
  if (profile.status === "pending") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>Application Under Review</CardTitle>
            <CardDescription>
              Thanks for applying! We're reviewing your application and will get back to you soon.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">Pending Approval</Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Approved affiliate
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="mb-2 text-4xl font-bold">Affiliate Dashboard</h1>
        <p className="text-slate-600">Track your earnings, links, and conversions</p>
      </div>

      {/* Stats Grid */}
      <div className="mb-12 grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Earnings</p>
                <p className="text-2xl font-bold">
                  ${parseFloat(profile.totalEarnings || "0").toFixed(2)}
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
                <p className="text-sm text-slate-600">Total Clicks</p>
                <p className="text-2xl font-bold">{stats?.clicks || 0}</p>
              </div>
              <Click className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Conversions</p>
                <p className="text-2xl font-bold">{stats?.conversions || 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-slate-600">Conversion Rate</p>
              <p className="text-2xl font-bold">
                {stats?.clicks ? (((stats.conversions || 0) / stats.clicks) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Affiliate Links */}
      <div className="mb-12">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your Affiliate Links</CardTitle>
              <Button onClick={handleGenerateLink} disabled={generateLinkMutation.isPending}>
                Generate New Link
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {links.length === 0 ? (
              <p className="text-slate-600">No links yet. Generate your first affiliate link to get started!</p>
            ) : (
              <div className="space-y-4">
                {links.map((link) => (
                  <div key={link.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-semibold">{link.label || `Link ${link.code}`}</p>
                      <p className="font-mono text-sm text-slate-600">{link.url}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(link.url)}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Conversion Breakdown */}
      {stats?.conversionBreakdown && (
        <div className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {Object.entries(stats.conversionBreakdown).map(([type, count]) => (
                  <div key={type} className="rounded-lg bg-slate-50 p-4">
                    <p className="text-sm text-slate-600 capitalize">{type}</p>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payout Request */}
      <div className="mb-12">
        <Card>
          <CardHeader>
            <CardTitle>Request Payout</CardTitle>
            <CardDescription>
              Minimum: $50 | Available: ${(parseFloat(profile.totalEarnings || "0") - parseFloat(profile.totalPaid || "0")).toFixed(2)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Amount (min $50)"
                type="number"
                min="50"
                max={parseFloat(profile.totalEarnings || "0") - parseFloat(profile.totalPaid || "0")}
                id="payout-amount"
              />
              <Button
                onClick={() => {
                  const amount = (document.getElementById("payout-amount") as HTMLInputElement).value;
                  handleRequestPayout(amount);
                }}
                disabled={requestPayoutMutation.isPending}
              >
                Request Payout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payout History */}
      {payouts.length > 0 && (
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Payout History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {payouts.map((payout) => (
                  <div key={payout.id} className="flex justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-semibold">${parseFloat(payout.amount.toString()).toFixed(2)}</p>
                      <p className="text-sm text-slate-600">
                        {new Date(payout.requestedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      variant={
                        payout.status === "completed"
                          ? "default"
                          : payout.status === "processing"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {payout.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AffiliateProgram;
