/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MetaTagsComponent } from "@/components/MetaTags";
import {
  Check,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface RefundRequest {
  id: number;
  purchaseId: number;
  reason: string;
  details: string;
  status: "pending" | "approved" | "denied" | "refunded";
  fanName: string;
  email: string;
  amount: string;
  requestedAt: string;
  respondedAt?: string;
  responseNotes?: string;
}

// Mock data - in production, fetch from API
const MOCK_REFUNDS: RefundRequest[] = [
  {
    id: 1,
    purchaseId: 101,
    reason: "damaged",
    details: "Item arrived with visible damage to the packaging",
    status: "pending",
    fanName: "John Smith",
    email: "john@example.com",
    amount: "£49.99",
    requestedAt: "2024-04-28T10:30:00Z",
  },
  {
    id: 2,
    purchaseId: 102,
    reason: "wrong_item",
    details: "Ordered red shirt, received blue shirt instead",
    status: "approved",
    fanName: "Jane Doe",
    email: "jane@example.com",
    amount: "£29.99",
    requestedAt: "2024-04-27T14:20:00Z",
    respondedAt: "2024-04-28T09:00:00Z",
    responseNotes: "Refund approved. Return label sent.",
  },
];

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    color: "bg-yellow-50 border-yellow-200",
    badge: "bg-yellow-100 text-yellow-800",
    label: "Pending Review",
  },
  approved: {
    icon: Check,
    color: "bg-green-50 border-green-200",
    badge: "bg-green-100 text-green-800",
    label: "Approved",
  },
  denied: {
    icon: X,
    color: "bg-red-50 border-red-200",
    badge: "bg-red-100 text-red-800",
    label: "Denied",
  },
  refunded: {
    icon: CheckCircle2,
    color: "bg-blue-50 border-blue-200",
    badge: "bg-blue-100 text-blue-800",
    label: "Refunded",
  },
};

export default function AdminRefunds() {
  const [refunds, setRefunds] = useState<RefundRequest[]>(MOCK_REFUNDS);
  const [selectedStatus, setSelectedStatus] = useState<"pending" | "approved" | "denied" | "refunded">("pending");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);

  const handleApproveRefund = async (refund: RefundRequest) => {
    setIsLoading(true);
    try {
      toast.success("Refund approved");
      setRefunds(
        refunds.map((r) =>
          r.id === refund.id ? { ...r, status: "approved", respondedAt: new Date().toISOString() } : r
        )
      );
      setSelectedRefund(null);
    } catch (error) {
      toast.error("Failed to approve refund");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDenyRefund = async (refund: RefundRequest) => {
    setIsLoading(true);
    try {
      toast.success("Refund denied");
      setRefunds(
        refunds.map((r) =>
          r.id === refund.id ? { ...r, status: "denied", respondedAt: new Date().toISOString() } : r
        )
      );
      setSelectedRefund(null);
    } catch (error) {
      toast.error("Failed to deny refund");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkRefunded = async (refund: RefundRequest) => {
    setIsLoading(true);
    try {
      toast.success("Marked as refunded");
      setRefunds(
        refunds.map((r) => (r.id === refund.id ? { ...r, status: "refunded" } : r))
      );
    } catch (error) {
      toast.error("Failed to mark refund");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRefunds = refunds.filter((r) => r.status === selectedStatus);

  return (
    <>
      <MetaTagsComponent title="Refund Management | Admin" description="Manage customer refund requests" />

      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Refund Management</h1>
            <p className="text-gray-600 mt-2">Review and process customer refund requests</p>
          </div>

          <Tabs defaultValue="pending" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pending">
                Pending ({refunds.filter((r) => r.status === "pending").length})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved ({refunds.filter((r) => r.status === "approved").length})
              </TabsTrigger>
              <TabsTrigger value="denied">
                Denied ({refunds.filter((r) => r.status === "denied").length})
              </TabsTrigger>
              <TabsTrigger value="refunded">
                Refunded ({refunds.filter((r) => r.status === "refunded").length})
              </TabsTrigger>
            </TabsList>

            {(["pending", "approved", "denied", "refunded"] as const).map((status) => (
              <TabsContent key={status} value={status} className="space-y-4">
                {refunds.filter((r) => r.status === status).length === 0 ? (
                  <Card>
                    <CardContent className="pt-12 text-center">
                      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No {status} refund requests</p>
                    </CardContent>
                  </Card>
                ) : (
                  refunds
                    .filter((r) => r.status === status)
                    .map((refund) => (
                      <Card
                        key={refund.id}
                        className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => setSelectedRefund(refund)}
                      >
                        <CardContent className="pt-6">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-sm text-gray-600">Customer</p>
                              <p className="font-semibold">{refund.fanName}</p>
                              <p className="text-sm text-gray-500">{refund.email}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Amount</p>
                              <p className="font-semibold text-lg">{refund.amount}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Reason</p>
                              <p className="font-semibold capitalize">{refund.reason.replace(/_/g, " ")}</p>
                            </div>
                            <div className="text-right">
                              <Badge className={STATUS_CONFIG[status].badge}>
                                {STATUS_CONFIG[status].label}
                              </Badge>
                              <p className="text-xs text-gray-500 mt-2">
                                Requested {new Date(refund.requestedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                )}
              </TabsContent>
            ))}
          </Tabs>

          {selectedRefund && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader>
                  <CardTitle>Refund Request #{selectedRefund.id}</CardTitle>
                  <CardDescription>
                    Purchase ID: {selectedRefund.purchaseId}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Customer Info */}
                  <div>
                    <h3 className="font-semibold mb-3">Customer Information</h3>
                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
                      <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-semibold">{selectedRefund.fanName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-semibold">{selectedRefund.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Info */}
                  <div>
                    <h3 className="font-semibold mb-3">Order Information</h3>
                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
                      <div>
                        <p className="text-sm text-gray-600">Amount</p>
                        <p className="font-semibold text-lg">{selectedRefund.amount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <Badge className={STATUS_CONFIG[selectedRefund.status].badge}>
                          {STATUS_CONFIG[selectedRefund.status].label}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Refund Reason */}
                  <div>
                    <h3 className="font-semibold mb-3">Refund Reason</h3>
                    <p className="text-sm font-semibold capitalize mb-2">
                      {selectedRefund.reason.replace(/_/g, " ")}
                    </p>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded">{selectedRefund.details}</p>
                  </div>

                  {/* Admin Notes */}
                  {selectedRefund.responseNotes && (
                    <div>
                      <h3 className="font-semibold mb-3">Admin Notes</h3>
                      <p className="text-gray-700 bg-blue-50 p-4 rounded border border-blue-200">
                        {selectedRefund.responseNotes}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="border-t pt-6 flex gap-3 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedRefund(null)}
                    >
                      Close
                    </Button>

                    {selectedRefund.status === "pending" && (
                      <>
                        <Button
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => handleDenyRefund(selectedRefund)}
                          disabled={isLoading}
                        >
                          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          Deny
                        </Button>
                        <Button
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleApproveRefund(selectedRefund)}
                          disabled={isLoading}
                        >
                          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          Approve
                        </Button>
                      </>
                    )}

                    {selectedRefund.status === "approved" && (
                      <Button
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleMarkRefunded(selectedRefund)}
                        disabled={isLoading}
                      >
                        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Mark as Refunded
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
