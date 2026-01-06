/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { DatabaseErrorBanner } from "@/components/DatabaseErrorBanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { formatDistanceToNow, format } from "date-fns";
import { Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import {
  Megaphone,
  Users,
  Target,
  Mail,
  Phone,
  Globe,
  MapPin,
  Search,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Calendar,
  TrendingUp,
  MessageSquare,
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Linkedin,
  Sparkles,
} from "lucide-react";

export default function AdminMarketingHub() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("leads");
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [showCampaignForm, setShowLeadCampaignForm] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [showScraper, setShowScraper] = useState(false);
  const [viewingLead, setViewingLead] = useState<any>(null);
  const [scraperQuery, setScraperQuery] = useState({ query: "", location: "", type: "club" as const });

  const utils = trpc.useUtils();
  const { data: leads, isLoading: leadsLoading } = trpc.marketing.leads.list.useQuery({});
  const { data: campaigns, isLoading: campaignsLoading } = trpc.marketing.campaigns.list.useQuery({});
  const { data: socialPosts, isLoading: postsLoading } = trpc.marketing.socialPosts.list.useQuery({});
  const { data: scraperResults } = trpc.marketing.scraper.listResults.useQuery({ processed: false });

  const createLead = trpc.marketing.leads.create.useMutation({
    onSuccess: () => {
      toast.success("Marketing lead created");
      utils.marketing.leads.list.invalidate();
      setShowLeadForm(false);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to create lead";
      toast.error(message);
    },
  });

  const updateLead = trpc.marketing.leads.update.useMutation({
    onSuccess: () => {
      toast.success("Lead updated");
      utils.marketing.leads.list.invalidate();
      setViewingLead(null);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to update lead";
      toast.error(message);
    },
  });

  const searchVenues = trpc.marketing.scraper.search.useMutation({
    onSuccess: (result) => {
      toast.success(`Found ${result.saved} venues!`);
      utils.marketing.scraper.listResults.invalidate();
      setShowScraper(false);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to search venues";
      toast.error(message);
    },
  });

  const convertToLead = trpc.marketing.scraper.convertToLead.useMutation({
    onSuccess: () => {
      toast.success("Venue converted to lead");
      utils.marketing.scraper.listResults.invalidate();
      utils.marketing.leads.list.invalidate();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to convert venue";
      toast.error(message);
    },
  });

  const createOutreach = trpc.marketing.outreach.create.useMutation({
    onSuccess: () => {
      toast.success("Outreach activity recorded");
      utils.marketing.outreach.listByLead.invalidate();
      utils.marketing.leads.list.invalidate();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to create outreach";
      toast.error(message);
    },
  });

  const createCampaign = trpc.marketing.campaigns.create.useMutation({
    onSuccess: () => {
      toast.success("Campaign created");
      utils.marketing.campaigns.list.invalidate();
      setShowLeadCampaignForm(false);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to create campaign";
      toast.error(message);
    },
  });

  const createPost = trpc.marketing.socialPosts.create.useMutation({
    onSuccess: () => {
      toast.success("Social media post created");
      utils.marketing.socialPosts.list.invalidate();
      setShowPostForm(false);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to create post";
      toast.error(message);
    },
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: "bg-blue-600",
      contacted: "bg-yellow-600",
      interested: "bg-green-600",
      quoted: "bg-purple-600",
      booked: "bg-emerald-600",
      declined: "bg-red-600",
      archived: "bg-gray-600",
    };
    return colors[status] || "bg-gray-600";
  };

  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, any> = {
      instagram: Instagram,
      twitter: Twitter,
      facebook: Facebook,
      youtube: Youtube,
      linkedin: Linkedin,
    };
    const Icon = icons[platform.toLowerCase()] || MessageSquare;
    return <Icon className="w-4 h-4" />;
  };

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-bold">Admin Access Required</h1>
          <p className="text-muted-foreground">You must be an admin to access this page.</p>
          <Link href="/">
            <Button className="gradient-bg">Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DatabaseErrorBanner />
      <div className="container py-8 px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Megaphone className="w-8 h-8" />
                Marketing Hub
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage leads, campaigns, outreach, and social media posts
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowScraper(true)}
                variant="outline"
                className="gradient-bg"
              >
                <Search className="w-4 h-4 mr-2" />
                Find Venues
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="leads">
              <Users className="w-4 h-4 mr-2" />
              Leads ({leads?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="campaigns">
              <Target className="w-4 h-4 mr-2" />
              Campaigns ({campaigns?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="social">
              <Sparkles className="w-4 h-4 mr-2" />
              Social Posts ({socialPosts?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="scraper">
              <Search className="w-4 h-4 mr-2" />
              Scraper ({scraperResults?.length || 0})
            </TabsTrigger>
          </TabsList>

          {/* Leads Tab */}
          <TabsContent value="leads" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Marketing Leads</h2>
              <Button onClick={() => setShowLeadForm(true)} className="gradient-bg">
                <Plus className="w-4 h-4 mr-2" />
                New Lead
              </Button>
            </div>

            {leadsLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading leads...</p>
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Contacted</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leads && leads.length > 0 ? (
                        leads.map((lead) => (
                          <TableRow key={lead.id}>
                            <TableCell className="font-medium">{lead.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{lead.type}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm">
                                <MapPin className="w-3 h-3" />
                                {lead.location}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                {lead.email && (
                                  <div className="flex items-center gap-1 text-sm">
                                    <Mail className="w-3 h-3" />
                                    {lead.email}
                                  </div>
                                )}
                                {lead.phone && (
                                  <div className="flex items-center gap-1 text-sm">
                                    <Phone className="w-3 h-3" />
                                    {lead.phone}
                                  </div>
                                )}
                                {lead.website && (
                                  <a
                                    href={lead.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                                  >
                                    <Globe className="w-3 h-3" />
                                    Website
                                  </a>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                            </TableCell>
                            <TableCell>
                              {lead.lastContacted
                                ? formatDistanceToNow(new Date(lead.lastContacted), {
                                    addSuffix: true,
                                  })
                                : "Never"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setViewingLead(lead)}
                                >
                                  View
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    updateLead.mutate({
                                      id: lead.id,
                                      status: lead.status === "new" ? "contacted" : lead.status,
                                    });
                                  }}
                                >
                                  <Mail className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No leads found. Create your first lead or search for venues!
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Marketing Campaigns</h2>
              <Button onClick={() => setShowLeadCampaignForm(true)} className="gradient-bg">
                <Plus className="w-4 h-4 mr-2" />
                New Campaign
              </Button>
            </div>

            {campaignsLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading campaigns...</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {campaigns && campaigns.length > 0 ? (
                  campaigns.map((campaign) => (
                    <Card key={campaign.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          {campaign.name}
                          <Badge variant="outline">{campaign.status}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">{campaign.description}</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            Type: {campaign.type}
                          </div>
                          {campaign.startDate && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(campaign.startDate), "MMM d, yyyy")}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    No campaigns found. Create your first campaign!
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Social Posts Tab */}
          <TabsContent value="social" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Social Media Posts</h2>
              <Button onClick={() => setShowPostForm(true)} className="gradient-bg">
                <Plus className="w-4 h-4 mr-2" />
                New Post
              </Button>
            </div>

            {postsLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading posts...</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {socialPosts && socialPosts.length > 0 ? (
                  socialPosts.map((post) => (
                    <Card key={post.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getPlatformIcon(post.platform)}
                            {post.platform}
                          </div>
                          <Badge variant="outline">{post.status}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-4 line-clamp-3">{post.caption}</p>
                        {post.scheduledAt && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(post.scheduledAt), "MMM d, yyyy 'at' h:mm a")}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    No social posts found. Create your first post!
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Scraper Tab */}
          <TabsContent value="scraper" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Venue Scraper Results</h2>
              <Button onClick={() => setShowScraper(true)} className="gradient-bg">
                <Search className="w-4 h-4 mr-2" />
                Search Venues
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scraperResults && scraperResults.length > 0 ? (
                      scraperResults.map((result) => (
                        <TableRow key={result.id}>
                          <TableCell className="font-medium">{result.name}</TableCell>
                          <TableCell>{result.location}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{result.source}</Badge>
                          </TableCell>
                          <TableCell>
                            {result.convertedToLead ? (
                              <Badge className="bg-green-600">Converted</Badge>
                            ) : (
                              <Badge variant="outline">Pending</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {!result.convertedToLead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  convertToLead.mutate({
                                    scraperResultId: result.id,
                                  });
                                }}
                              >
                                Convert to Lead
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No scraper results. Search for venues to get started!
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Lead Form Dialog */}
        <Dialog open={showLeadForm} onOpenChange={setShowLeadForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Marketing Lead</DialogTitle>
              <DialogDescription>Add a new venue, club, or bar to your marketing pipeline</DialogDescription>
            </DialogHeader>
            <LeadForm
              onSubmit={(data) => {
                createLead.mutate(data);
              }}
              onCancel={() => setShowLeadForm(false)}
            />
          </DialogContent>
        </Dialog>

        {/* View Lead Dialog */}
        <Dialog open={viewingLead !== null} onOpenChange={(open) => {
          if (!open) setViewingLead(null);
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{viewingLead?.name}</DialogTitle>
              <DialogDescription>Lead Details & Outreach History</DialogDescription>
            </DialogHeader>
            {viewingLead && (
              <LeadView
                lead={viewingLead}
                onUpdate={(updates) => {
                  updateLead.mutate({ id: viewingLead.id, ...updates });
                }}
                onCreateOutreach={(data) => {
                  createOutreach.mutate({ ...data, leadId: viewingLead.id });
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Campaign Form Dialog */}
        <Dialog open={showCampaignForm} onOpenChange={setShowLeadCampaignForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Marketing Campaign</DialogTitle>
              <DialogDescription>Create a new marketing campaign</DialogDescription>
            </DialogHeader>
            <CampaignForm
              onSubmit={(data) => {
                createCampaign.mutate(data);
              }}
              onCancel={() => setShowLeadCampaignForm(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Social Post Form Dialog */}
        <Dialog open={showPostForm} onOpenChange={setShowPostForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Social Media Post</DialogTitle>
              <DialogDescription>Create a new social media post</DialogDescription>
            </DialogHeader>
            <PostForm
              onSubmit={(data) => {
                createPost.mutate(data);
              }}
              onCancel={() => setShowPostForm(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Venue Scraper Dialog */}
        <Dialog open={showScraper} onOpenChange={setShowScraper}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Search Venues</DialogTitle>
              <DialogDescription>
                Search for clubs, bars, and venues using Google Places API
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="query">Search Query</Label>
                <Input
                  id="query"
                  value={scraperQuery.query}
                  onChange={(e) => setScraperQuery({ ...scraperQuery, query: e.target.value })}
                  placeholder="e.g., nightclub, bar, music venue"
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={scraperQuery.location}
                  onChange={(e) => setScraperQuery({ ...scraperQuery, location: e.target.value })}
                  placeholder="e.g., London, UK or Manchester"
                />
              </div>
              <div>
                <Label htmlFor="type">Venue Type</Label>
                <Select
                  value={scraperQuery.type}
                  onValueChange={(value: any) => setScraperQuery({ ...scraperQuery, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="club">Club</SelectItem>
                    <SelectItem value="bar">Bar</SelectItem>
                    <SelectItem value="venue">Venue</SelectItem>
                    <SelectItem value="festival">Festival</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowScraper(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  searchVenues.mutate({
                    query: scraperQuery.query,
                    location: scraperQuery.location,
                    type: scraperQuery.type,
                    source: "google",
                  });
                }}
                className="gradient-bg"
                disabled={!scraperQuery.query || searchVenues.isPending}
              >
                {searchVenues.isPending ? "Searching..." : "Search Venues"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Lead Form Component
function LeadForm({ onSubmit, onCancel }: { onSubmit: (data: any) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    type: "venue" as const,
    location: "",
    address: "",
    email: "",
    phone: "",
    website: "",
    capacity: "",
    genre: "",
    notes: "",
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.location) {
      toast.error("Name and Location are required");
      return;
    }

    onSubmit({
      ...formData,
      capacity: formData.capacity ? Number(formData.capacity) : undefined,
    });
  };

  return (
    <>
      <div className="space-y-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Venue Name"
            />
          </div>
          <div>
            <Label htmlFor="type">Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value: any) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="club">Club</SelectItem>
                <SelectItem value="bar">Bar</SelectItem>
                <SelectItem value="venue">Venue</SelectItem>
                <SelectItem value="festival">Festival</SelectItem>
                <SelectItem value="event">Event</SelectItem>
                <SelectItem value="radio">Radio</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="City, Country"
          />
        </div>
        <div>
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Full address"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="contact@venue.com"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+44 20 1234 5678"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="url"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            placeholder="https://venue.com"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="capacity">Capacity</Label>
            <Input
              id="capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              placeholder="500"
            />
          </div>
          <div>
            <Label htmlFor="genre">Genre</Label>
            <Input
              id="genre"
              value={formData.genre}
              onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
              placeholder="UK Garage, House, etc"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Additional notes about this venue..."
            rows={3}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} className="gradient-bg">
          Create Lead
        </Button>
      </DialogFooter>
    </>
  );
}

// Lead View Component
function LeadView({
  lead,
  onUpdate,
  onCreateOutreach,
}: {
  lead: any;
  onUpdate: (updates: any) => void;
  onCreateOutreach: (data: any) => void;
}) {
  const [outreachType, setOutreachType] = useState<"email" | "phone" | "social" | "in_person" | "other">("email");
  const [outreachMessage, setOutreachMessage] = useState("");
  const { data: outreachHistory } = trpc.marketing.outreach.listByLead.useQuery({ leadId: lead.id });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm text-muted-foreground">Status</Label>
          <Select
            value={lead.status}
            onValueChange={(value) => onUpdate({ status: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="interested">Interested</SelectItem>
              <SelectItem value="quoted">Quoted</SelectItem>
              <SelectItem value="booked">Booked</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm text-muted-foreground">Type</Label>
          <div className="font-medium">{lead.type}</div>
        </div>
      </div>

      <div>
        <Label className="text-sm text-muted-foreground">Contact Information</Label>
        <div className="space-y-2 mt-2">
          {lead.email && (
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {lead.email}
            </div>
          )}
          {lead.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              {lead.phone}
            </div>
          )}
          {lead.website && (
            <a
              href={lead.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:underline"
            >
              <Globe className="w-4 h-4" />
              {lead.website}
            </a>
          )}
        </div>
      </div>

      {lead.notes && (
        <div>
          <Label className="text-sm text-muted-foreground">Notes</Label>
          <p className="mt-2">{lead.notes}</p>
        </div>
      )}

      <div className="border-t pt-4">
        <Label className="text-lg font-semibold mb-3 block">Record Outreach</Label>
        <div className="space-y-3">
          <Select value={outreachType} onValueChange={(value: any) => setOutreachType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="social">Social Media</SelectItem>
              <SelectItem value="in_person">In Person</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Textarea
            value={outreachMessage}
            onChange={(e) => setOutreachMessage(e.target.value)}
            placeholder="Outreach message or notes..."
            rows={3}
          />
          <Button
            onClick={() => {
              onCreateOutreach({
                type: outreachType,
                message: outreachMessage,
              });
              setOutreachMessage("");
            }}
            className="gradient-bg"
          >
            Record Outreach
          </Button>
        </div>
      </div>

      {outreachHistory && outreachHistory.length > 0 && (
        <div className="border-t pt-4">
          <Label className="text-lg font-semibold mb-3 block">Outreach History</Label>
          <div className="space-y-2">
            {outreachHistory.map((activity) => (
              <Card key={activity.id}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{activity.type}</div>
                      {activity.message && (
                        <p className="text-sm text-muted-foreground mt-1">{activity.message}</p>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.performedAt), { addSuffix: true })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


// Campaign Form Component
function CampaignForm({ onSubmit, onCancel }: { onSubmit: (data: any) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "outreach" as const,
    targetAudience: "",
    startDate: "",
    endDate: "",
    budget: "",
    status: "draft" as const,
  });

  const handleSubmit = () => {
    if (!formData.name) {
      toast.error("Campaign name is required");
      return;
    }

    onSubmit({
      ...formData,
      startDate: formData.startDate ? new Date(formData.startDate) : undefined,
      endDate: formData.endDate ? new Date(formData.endDate) : undefined,
    });
  };

  return (
    <>
      <div className="space-y-4 py-4">
        <div>
          <Label htmlFor="name">Campaign Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Summer 2024 Outreach"
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Campaign description..."
            rows={3}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="type">Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value: any) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="outreach">Outreach</SelectItem>
                <SelectItem value="social">Social Media</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="advertising">Advertising</SelectItem>
                <SelectItem value="partnership">Partnership</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: any) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="budget">Budget</Label>
          <Input
            id="budget"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            placeholder="£0.00"
          />
        </div>
        <div>
          <Label htmlFor="targetAudience">Target Audience</Label>
          <Textarea
            id="targetAudience"
            value={formData.targetAudience}
            onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
            placeholder="Describe your target audience..."
            rows={2}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} className="gradient-bg">
          Create Campaign
        </Button>
      </DialogFooter>
    </>
  );
}

// Post Form Component
function PostForm({ onSubmit, onCancel }: { onSubmit: (data: any) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    platform: "instagram" as const,
    type: "post" as const,
    caption: "",
    mediaUrls: "",
    hashtags: "",
    mentions: "",
    location: "",
    status: "draft" as const,
    scheduledAt: "",
  });

  const handleSubmit = () => {
    if (!formData.caption) {
      toast.error("Caption is required");
      return;
    }

    onSubmit({
      ...formData,
      mediaUrls: formData.mediaUrls ? JSON.stringify(formData.mediaUrls.split(",").map((url) => url.trim())) : undefined,
      hashtags: formData.hashtags ? JSON.stringify(formData.hashtags.split(",").map((tag) => tag.trim())) : undefined,
      mentions: formData.mentions ? JSON.stringify(formData.mentions.split(",").map((mention) => mention.trim())) : undefined,
      scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt) : undefined,
    });
  };

  return (
    <>
      <div className="space-y-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="platform">Platform *</Label>
            <Select
              value={formData.platform}
              onValueChange={(value: any) => setFormData({ ...formData, platform: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="twitter">Twitter</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="threads">Threads</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="type">Post Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value: any) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="post">Post</SelectItem>
                <SelectItem value="story">Story</SelectItem>
                <SelectItem value="reel">Reel</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="carousel">Carousel</SelectItem>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="caption">Caption *</Label>
          <Textarea
            id="caption"
            value={formData.caption}
            onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
            placeholder="Write your post caption..."
            rows={5}
          />
        </div>
        <div>
          <Label htmlFor="mediaUrls">Media URLs (comma-separated)</Label>
          <Input
            id="mediaUrls"
            value={formData.mediaUrls}
            onChange={(e) => setFormData({ ...formData, mediaUrls: e.target.value })}
            placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="hashtags">Hashtags (comma-separated)</Label>
            <Input
              id="hashtags"
              value={formData.hashtags}
              onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
              placeholder="#dj #ukgarage #house"
            />
          </div>
          <div>
            <Label htmlFor="mentions">Mentions (comma-separated)</Label>
            <Input
              id="mentions"
              value={formData.mentions}
              onChange={(e) => setFormData({ ...formData, mentions: e.target.value })}
              placeholder="@user1, @user2"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="London, UK"
            />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: any) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="posted">Posted</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="scheduledAt">Schedule For (optional)</Label>
          <Input
            id="scheduledAt"
            type="datetime-local"
            value={formData.scheduledAt}
            onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} className="gradient-bg">
          Create Post
        </Button>
      </DialogFooter>
    </>
  );
}
