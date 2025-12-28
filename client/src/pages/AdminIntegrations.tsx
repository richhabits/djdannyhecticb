import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";
import { Plus, Edit, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

export default function AdminIntegrations() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("social");

  const { data: socialIntegrations, refetch: refetchSocial } = trpc.integrations.social.adminList.useQuery();
  const { data: contentQueue, refetch: refetchContent } = trpc.integrations.content.adminList.useQuery({ limit: 100 });
  const { data: webhooks, refetch: refetchWebhooks } = trpc.integrations.webhooks.adminList.useQuery({ activeOnly: false });

  const createSocial = trpc.integrations.social.adminCreate.useMutation({
    onSuccess: () => {
      toast.success("Social integration created");
      refetchSocial();
    },
  });

  const updateContentStatus = trpc.integrations.content.adminUpdateStatus.useMutation({
    onSuccess: () => {
      toast.success("Content status updated");
      refetchContent();
    },
  });

  const createWebhook = trpc.integrations.webhooks.adminCreate.useMutation({
    onSuccess: () => {
      toast.success("Webhook created");
      refetchWebhooks();
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Integrations</h1>
        <Badge variant="outline">Admin Only</Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="social">Social Accounts</TabsTrigger>
          <TabsTrigger value="content">Content Queue</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Social Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              {socialIntegrations && socialIntegrations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Platform</TableHead>
                      <TableHead>Handle</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {socialIntegrations.map((integration) => (
                      <TableRow key={integration.id}>
                        <TableCell>
                          <Badge variant="outline">{integration.platform}</Badge>
                          {integration.isPrimary && (
                            <Badge variant="default" className="ml-2">Primary</Badge>
                          )}
                        </TableCell>
                        <TableCell>{integration.handle || "-"}</TableCell>
                        <TableCell>
                          <a href={integration.url} target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">
                            {integration.url}
                          </a>
                        </TableCell>
                        <TableCell>
                          {integration.isActive ? (
                            <Badge variant="default">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">No social integrations yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Queue</CardTitle>
            </CardHeader>
            <CardContent>
              {contentQueue && contentQueue.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contentQueue.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.targetPlatform}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              item.status === "posted"
                                ? "default"
                                : item.status === "failed"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(item.createdAt), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          {item.status !== "posted" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const nextStatus = item.status === "draft" ? "ready" : item.status === "ready" ? "scheduled" : "posted";
                                updateContentStatus.mutate({
                                  id: item.id,
                                  status: nextStatus as any,
                                });
                              }}
                            >
                              {item.status === "draft" ? "Mark Ready" : item.status === "ready" ? "Schedule" : "Mark Posted"}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">No content in queue</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Webhooks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> Don't paste secrets you don't control. Webhooks are triggered automatically when events occur.
                </p>
              </div>
              {webhooks && webhooks.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>Event Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {webhooks.map((webhook) => (
                      <TableRow key={webhook.id}>
                        <TableCell className="font-medium">{webhook.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{webhook.url}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{webhook.eventType}</Badge>
                        </TableCell>
                        <TableCell>
                          {webhook.isActive ? (
                            <Badge variant="default">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">No webhooks configured</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

