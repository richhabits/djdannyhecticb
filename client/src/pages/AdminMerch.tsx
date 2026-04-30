import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, RefreshCw, Link as LinkIcon, Unlink, ShoppingBox } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

export default function AdminMerch() {
  const { user } = useAuth();
  const [syncing, setSyncing] = useState(false);

  // Check admin access
  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Admin Access Required</h1>
          <p>You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const syncMutation = trpc.merch.sync.useMutation({
    onSuccess: (data) => {
      setSyncing(false);
      toast.success(`${data.count} products synced from Printfull`);
    },
    onError: (error) => {
      setSyncing(false);
      toast.error(error.message || "Failed to sync catalog");
    },
  });

  const { data: catalog, isLoading: catalogLoading } = trpc.merch.catalog.useQuery({
    limit: 100,
    offset: 0,
  });

  const { data: orders, isLoading: ordersLoading } = trpc.merch.listOrders.useQuery({
    limit: 50,
    offset: 0,
  });

  const handleSync = async () => {
    setSyncing(true);
    syncMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-black pt-20 pb-12">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2 tape-strip inline-block bg-accent text-black px-4 py-2">
            MERCH MANAGEMENT
          </h1>
          <p className="text-gray-400 mt-4">Manage Printfull integration and merchandise orders</p>
        </div>

        {/* Sync Section */}
        <Card className="bg-black/80 border-white mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBox className="w-5 h-5" />
              Printfull Catalog Sync
            </CardTitle>
            <CardDescription>Synchronize available merchandise from Printfull</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleSync}
              disabled={syncing}
              className="gap-2"
              size="lg"
            >
              {syncing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Sync Catalog
                </>
              )}
            </Button>
            {catalog && (
              <p className="text-sm text-gray-400 mt-4">
                {catalog.length} products available in catalog
              </p>
            )}
          </CardContent>
        </Card>

        {/* Available Products */}
        <Card className="bg-black/80 border-white mb-6">
          <CardHeader>
            <CardTitle>Available Products</CardTitle>
            <CardDescription>Merchandise available from Printfull</CardDescription>
          </CardHeader>
          <CardContent>
            {catalogLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-white" />
              </div>
            ) : catalog && catalog.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead>Product ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Variants</TableHead>
                      <TableHead>Image</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {catalog.map((product) => {
                      const variants = product.variants ? JSON.parse(product.variants as any) : [];
                      return (
                        <TableRow key={product.id} className="border-gray-700">
                          <TableCell className="font-mono text-sm">{product.productId}</TableCell>
                          <TableCell>{product.name}</TableCell>
                          <TableCell className="text-sm">{product.category}</TableCell>
                          <TableCell>£{product.price}</TableCell>
                          <TableCell className="text-sm">{variants.length} variants</TableCell>
                          <TableCell>
                            {product.imageUrl && (
                              <a
                                href={product.imageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-accent hover:underline"
                              >
                                View
                              </a>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="py-8 text-center text-gray-400">
                <p>No products synced. Click "Sync Catalog" to import from Printfull.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Merch Orders */}
        <Card className="bg-black/80 border-white">
          <CardHeader>
            <CardTitle>Active Merch Orders</CardTitle>
            <CardDescription>Orders submitted to Printfull for fulfillment</CardDescription>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-white" />
              </div>
            ) : orders && orders.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead>Order ID</TableHead>
                      <TableHead>Purchase ID</TableHead>
                      <TableHead>Printfull ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tracking</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id} className="border-gray-700">
                        <TableCell className="font-mono text-sm">{order.id}</TableCell>
                        <TableCell className="font-mono text-sm">{order.purchaseId}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {order.printfullOrderId || "—"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold ${
                              order.status === "delivered"
                                ? "bg-green-900/50 text-green-200"
                                : order.status === "shipped"
                                ? "bg-blue-900/50 text-blue-200"
                                : order.status === "failed"
                                ? "bg-red-900/50 text-red-200"
                                : "bg-yellow-900/50 text-yellow-200"
                            }`}
                          >
                            {order.status.toUpperCase()}
                          </span>
                        </TableCell>
                        <TableCell>
                          {order.trackingUrl ? (
                            <a
                              href={order.trackingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-accent hover:underline text-sm"
                            >
                              {order.trackingNumber}
                            </a>
                          ) : (
                            <span className="text-gray-500 text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="py-8 text-center text-gray-400">
                <p>No active merch orders yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
