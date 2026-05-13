/**
 * Community Guidelines & Safety Page
 */

import React, { useState } from "react";
import { trpc } from "../lib/trpc";
import { useAtom } from "jotai";
import { userAtom } from "../stores/user";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, Flag, Shield } from "lucide-react";
import { z } from "zod";

export function CommunityGuidelines() {
  const [user] = useAtom(userAtom);
  const [activeTab, setActiveTab] = useState<"guidelines" | "report" | "appeal">("guidelines");
  const [reportData, setReportData] = useState({
    reportedUserId: "",
    reportedCommentId: "",
    reason: "spam" as const,
    description: "",
  });
  const [appealData, setAppealData] = useState({
    banId: "",
    reason: "",
  });

  // Queries
  const { data: guidelines, isLoading: guidelinesLoading } = trpc.community.getCommunityGuidelines.useQuery();
  const { data: communityStats } = trpc.community.getCommunityStats.useQuery();

  // Mutations
  const reportMutation = trpc.community.createReport.useMutation({
    onSuccess: () => {
      toast.success("Report submitted. Our team will review it shortly.");
      setReportData({
        reportedUserId: "",
        reportedCommentId: "",
        reason: "spam",
        description: "",
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const appealMutation = trpc.community.appealBan.useMutation({
    onSuccess: () => {
      toast.success("Appeal submitted. Our team will review your request.");
      setAppealData({ banId: "", reason: "" });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmitReport = () => {
    if (!reportData.reason) {
      toast.error("Please select a reason");
      return;
    }

    if (!reportData.reportedUserId && !reportData.reportedCommentId) {
      toast.error("Please specify what you're reporting");
      return;
    }

    reportMutation.mutate({
      reportedUserId: reportData.reportedUserId ? parseInt(reportData.reportedUserId) : undefined,
      reportedCommentId: reportData.reportedCommentId ? parseInt(reportData.reportedCommentId) : undefined,
      reason: reportData.reason,
      description: reportData.description,
    });
  };

  const handleSubmitAppeal = () => {
    if (!appealData.banId || !appealData.reason) {
      toast.error("Please fill in all fields");
      return;
    }

    appealMutation.mutate({
      banId: parseInt(appealData.banId),
      reason: appealData.reason,
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Shield size={32} />
            <h1 className="text-4xl font-bold">Community Guidelines</h1>
          </div>
          <p className="text-lg text-blue-100">
            Building a safe, respectful community for everyone
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex gap-2 border-b border-slate-700 mb-8">
          <button
            onClick={() => setActiveTab("guidelines")}
            className={`px-4 py-2 font-semibold border-b-2 transition ${
              activeTab === "guidelines"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            Guidelines
          </button>
          <button
            onClick={() => setActiveTab("report")}
            className={`px-4 py-2 font-semibold border-b-2 transition ${
              activeTab === "report"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Flag size={16} className="inline mr-2" />
            Report
          </button>
          <button
            onClick={() => setActiveTab("appeal")}
            className={`px-4 py-2 font-semibold border-b-2 transition ${
              activeTab === "appeal"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <AlertCircle size={16} className="inline mr-2" />
            Appeal
          </button>
        </div>

        {/* Guidelines Tab */}
        {activeTab === "guidelines" && (
          <div className="space-y-8">
            {/* Stats */}
            {communityStats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-6 bg-slate-800 border-slate-700">
                  <p className="text-slate-400 text-sm">Total Messages</p>
                  <p className="text-3xl font-bold text-blue-400">{communityStats.totalMessages.toLocaleString()}</p>
                </Card>
                <Card className="p-6 bg-slate-800 border-slate-700">
                  <p className="text-slate-400 text-sm">Total Comments</p>
                  <p className="text-3xl font-bold text-green-400">{communityStats.totalComments.toLocaleString()}</p>
                </Card>
                <Card className="p-6 bg-slate-800 border-slate-700">
                  <p className="text-slate-400 text-sm">Donations Received</p>
                  <p className="text-3xl font-bold text-purple-400">${communityStats.totalDonationsAmount.toFixed(2)}</p>
                </Card>
                <Card className="p-6 bg-slate-800 border-slate-700">
                  <p className="text-slate-400 text-sm">Avg. Donation</p>
                  <p className="text-3xl font-bold text-yellow-400">${communityStats.averageDonation.toFixed(2)}</p>
                </Card>
              </div>
            )}

            {/* Guidelines */}
            {guidelines && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">{guidelines.title}</h2>
                <div className="space-y-4">
                  {guidelines.sections.map((section, index) => (
                    <Card key={index} className="p-6 bg-slate-800 border-slate-700">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          <CheckCircle2 className="text-green-400" size={24} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{section.title}</h3>
                          <p className="text-slate-300 mt-2">{section.description}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {[
                  {
                    q: "What happens if I violate the guidelines?",
                    a: "Violations can result in warnings, temporary mutes, or permanent bans depending on severity. We follow a progressive discipline approach.",
                  },
                  {
                    q: "Can I appeal a ban?",
                    a: "Yes! You can submit an appeal through the Appeal tab. Our team will review your case within 48 hours.",
                  },
                  {
                    q: "How do I report someone?",
                    a: "Use the Report tab to submit a detailed report. Our moderation team will investigate and take appropriate action.",
                  },
                  {
                    q: "Is there a reputation system?",
                    a: "Yes! Active, respectful members earn reputation points and badges. This helps identify trustworthy community members.",
                  },
                ].map((item, index) => (
                  <Card key={index} className="p-6 bg-slate-800 border-slate-700">
                    <h3 className="font-semibold text-white mb-2">{item.q}</h3>
                    <p className="text-slate-300">{item.a}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Report Tab */}
        {activeTab === "report" && user?.id ? (
          <div className="max-w-2xl space-y-6">
            <Card className="p-8 bg-slate-800 border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-6">Report a Problem</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    What are you reporting?
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 border border-slate-600 rounded-lg cursor-pointer hover:bg-slate-700">
                      <input
                        type="radio"
                        checked={!!reportData.reportedUserId && !reportData.reportedCommentId}
                        onChange={() => setReportData({ ...reportData, reportedUserId: "", reportedCommentId: "" })}
                      />
                      <span className="text-white">A User</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-slate-600 rounded-lg cursor-pointer hover:bg-slate-700">
                      <input
                        type="radio"
                        checked={!!reportData.reportedCommentId}
                        onChange={() => setReportData({ ...reportData, reportedCommentId: "", reportedUserId: "" })}
                      />
                      <span className="text-white">A Comment</span>
                    </label>
                  </div>
                </div>

                {reportData.reportedUserId !== "" ? (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">User ID</label>
                    <Input
                      type="number"
                      value={reportData.reportedUserId}
                      onChange={(e) => setReportData({ ...reportData, reportedUserId: e.target.value })}
                      placeholder="Enter the user ID"
                      className="bg-slate-900 border-slate-600 text-white"
                    />
                  </div>
                ) : reportData.reportedCommentId !== "" ? (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Comment ID</label>
                    <Input
                      type="number"
                      value={reportData.reportedCommentId}
                      onChange={(e) => setReportData({ ...reportData, reportedCommentId: e.target.value })}
                      placeholder="Enter the comment ID"
                      className="bg-slate-900 border-slate-600 text-white"
                    />
                  </div>
                ) : null}

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Reason</label>
                  <select
                    value={reportData.reason}
                    onChange={(e) =>
                      setReportData({
                        ...reportData,
                        reason: e.target.value as any,
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg p-2"
                  >
                    <option value="spam">Spam</option>
                    <option value="harassment">Harassment</option>
                    <option value="hate_speech">Hate Speech</option>
                    <option value="inappropriate_content">Inappropriate Content</option>
                    <option value="misinformation">Misinformation</option>
                    <option value="impersonation">Impersonation</option>
                    <option value="scam">Scam</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Description (Optional)
                  </label>
                  <Textarea
                    value={reportData.description}
                    onChange={(e) => setReportData({ ...reportData, description: e.target.value })}
                    placeholder="Provide details about the report..."
                    className="bg-slate-900 border-slate-600 text-white"
                    rows={4}
                    maxLength={1000}
                  />
                  <p className="text-xs text-slate-400 mt-1">{reportData.description.length}/1000</p>
                </div>

                <Button
                  onClick={handleSubmitReport}
                  disabled={reportMutation.isPending}
                  className="w-full"
                >
                  Submit Report
                </Button>
              </div>
            </Card>
          </div>
        ) : activeTab === "report" ? (
          <Card className="p-8 bg-slate-800 border-slate-700 text-center text-slate-400">
            <p>Please sign in to submit a report</p>
          </Card>
        ) : null}

        {/* Appeal Tab */}
        {activeTab === "appeal" && user?.id ? (
          <div className="max-w-2xl space-y-6">
            <Card className="p-8 bg-slate-800 border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-6">Appeal a Ban</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Ban ID</label>
                  <Input
                    type="number"
                    value={appealData.banId}
                    onChange={(e) => setAppealData({ ...appealData, banId: e.target.value })}
                    placeholder="Enter the ban ID from your notification"
                    className="bg-slate-900 border-slate-600 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Appeal Reason
                  </label>
                  <Textarea
                    value={appealData.reason}
                    onChange={(e) => setAppealData({ ...appealData, reason: e.target.value })}
                    placeholder="Explain why you believe this ban should be lifted..."
                    className="bg-slate-900 border-slate-600 text-white"
                    rows={5}
                    maxLength={1000}
                  />
                  <p className="text-xs text-slate-400 mt-1">{appealData.reason.length}/1000</p>
                </div>

                <div className="bg-blue-900 border border-blue-700 rounded-lg p-4 text-blue-100">
                  <p className="text-sm">
                    Appeals are reviewed by our moderation team within 48 hours. Please be honest and constructive in your appeal.
                  </p>
                </div>

                <Button
                  onClick={handleSubmitAppeal}
                  disabled={appealMutation.isPending}
                  className="w-full"
                >
                  Submit Appeal
                </Button>
              </div>
            </Card>
          </div>
        ) : activeTab === "appeal" ? (
          <Card className="p-8 bg-slate-800 border-slate-700 text-center text-slate-400">
            <p>Please sign in to submit an appeal</p>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
