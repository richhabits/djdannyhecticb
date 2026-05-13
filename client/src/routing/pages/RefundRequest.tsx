/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MetaTagsComponent } from "@/components/MetaTags";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

const REFUND_REASONS = [
  { value: "damaged", label: "Item arrived damaged" },
  { value: "wrong_item", label: "Wrong item received" },
  { value: "not_as_described", label: "Not as described" },
  { value: "changed_mind", label: "Changed my mind" },
  { value: "other", label: "Other reason" },
];

export default function RefundRequest() {
  const [step, setStep] = useState<"lookup" | "form" | "success">("lookup");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [purchaseData, setPurchaseData] = useState<any>(null);

  const handleLookupPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      // In a real implementation, you would call an API to look up the purchase
      // For now, we'll just move to the form
      toast.success("Purchase found! Please provide refund details.");
      setStep("form");
    } catch (error) {
      toast.error("Purchase not found. Please check your email.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitRefundRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason || !details) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      // Call API to create refund request
      // const response = await fetch("/api/trpc/refund.request", {
      //   method: "POST",
      //   body: JSON.stringify({ email, reason, details })
      // });
      // For now, just show success
      setStep("success");
      toast.success("Refund request submitted successfully!");
    } catch (error) {
      toast.error("Failed to submit refund request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <MetaTagsComponent
        title="Refund Request | DJ Danny Hectic B"
        description="Request a refund for your purchase"
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Refund Request</h1>
            <p className="text-gray-600">
              We're here to help. If you have any issues with your purchase, please let us know.
            </p>
          </div>

          {step === "lookup" && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Find Your Purchase</CardTitle>
                <CardDescription>
                  Enter the email address associated with your purchase to proceed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLookupPurchase} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      We'll search for purchases made with this email address
                    </AlertDescription>
                  </Alert>

                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Continue
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {step === "form" && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Refund Request Details</CardTitle>
                <CardDescription>
                  Please provide information about why you'd like a refund
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitRefundRequest} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason for Refund</Label>
                    <Select value={reason} onValueChange={setReason}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                      <SelectContent>
                        {REFUND_REASONS.map((r) => (
                          <SelectItem key={r.value} value={r.value}>
                            {r.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="details">Additional Details</Label>
                    <Textarea
                      id="details"
                      placeholder="Please provide more information about your refund request..."
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      className="min-h-32"
                      required
                    />
                  </div>

                  <Alert className="bg-amber-50 border-amber-200">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">
                      We'll review your request and respond within 5 business days
                    </AlertDescription>
                  </Alert>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep("lookup")}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button type="submit" disabled={isLoading} className="flex-1">
                      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Submit Request
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {step === "success" && (
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
              <CardContent className="pt-12">
                <div className="text-center space-y-6">
                  <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto" />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted</h2>
                    <p className="text-gray-600">
                      Thank you for submitting your refund request. We'll review it and respond
                      within 5 business days.
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-6 text-left space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Reference Email</p>
                      <p className="font-semibold text-gray-900">{email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Reason</p>
                      <p className="font-semibold text-gray-900">
                        {REFUND_REASONS.find((r) => r.value === reason)?.label}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600">
                    We'll send you an email update on the status of your refund request. If you have
                    any questions, please contact us at support@djdannyhecticb.com
                  </p>

                  <Button
                    onClick={() => (window.location.href = "/")}
                    className="w-full"
                  >
                    Return to Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
