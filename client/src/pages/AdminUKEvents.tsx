/**
 * Admin UK Events Management Page
 * Manage event submissions, promoters, and sync operations
 */
import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { MetaTagsComponent } from '@/components/MetaTags';
import DashboardLayout from '@/components/DashboardLayout';
import {
    Calendar,
    Users,
    CheckCircle,
    XCircle,
    Clock,
    RefreshCw,
    Eye,
    AlertTriangle,
    Shield,
    Star,
    Send
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

// Define types for the data we're working with
type UserEventSubmission = {
    id: number;
    title: string;
    description: string;
    category: string;
    venueName: string;
    city: string;
    eventDate: string | Date;
    submitterName: string;
    submitterEmail: string;
    isPromoter: boolean;
    ticketUrl?: string | null;
    status: string;
};

type PromoterProfile = {
    id: number;
    name: string;
    companyName?: string | null;
    email: string;
    phone?: string | null;
    website?: string | null;
    instagramHandle?: string | null;
    isVerified: boolean;
    totalEventsSubmitted: number;
    approvedEventsCount: number;
};

export default function AdminUKEvents() {
    const [selectedTab, setSelectedTab] = useState('submissions');

    // Fetch data
    const { data: pendingSubmissions, refetch: refetchSubmissions } = trpc.ukEvents.adminSubmissions.useQuery({ status: 'pending' });
    const { data: allSubmissions } = trpc.ukEvents.adminSubmissions.useQuery({ limit: 100 });
    const { data: promoters, refetch: refetchPromoters } = trpc.ukEvents.adminPromoters.useQuery({});
    const { data: unverifiedPromoters } = trpc.ukEvents.adminPromoters.useQuery({ verified: false });

    // Mutations
    const reviewMutation = trpc.ukEvents.adminReviewSubmission.useMutation({
        onSuccess: () => {
            toast.success('Submission reviewed successfully');
            refetchSubmissions();
        },
        onError: (error: Error) => {
            toast.error(`Failed: ${error.message}`);
        },
    });

    const verifyPromoterMutation = trpc.ukEvents.adminVerifyPromoter.useMutation({
        onSuccess: () => {
            toast.success('Promoter status updated');
            refetchPromoters();
        },
        onError: (error: Error) => {
            toast.error(`Failed: ${error.message}`);
        },
    });

    const syncMutation = trpc.ukEvents.adminSync.useMutation({
        onSuccess: (result: { eventsAdded: number; eventsUpdated: number }) => {
            toast.success(`Sync complete: ${result.eventsAdded} added, ${result.eventsUpdated} updated`);
        },
        onError: (error: Error) => {
            toast.error(`Sync failed: ${error.message}`);
        },
    });

    const handleApprove = (id: number) => {
        reviewMutation.mutate({ id, status: 'approved' });
    };

    const handleReject = (id: number, reason: string) => {
        reviewMutation.mutate({ id, status: 'rejected', rejectionReason: reason });
    };

    const handleVerifyPromoter = (id: number, verified: boolean) => {
        verifyPromoterMutation.mutate({ id, verified });
    };

    return (
        <>
            <MetaTagsComponent
                title="Admin: UK Events | DJ Danny Hectic B"
                description="Manage UK events, submissions, and promoters"
                url="/admin/uk-events"
            />

            <DashboardLayout>
                <div className="p-6 space-y-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-black uppercase">UK EVENTS ADMIN</h1>
                            <p className="text-muted-foreground">Manage event submissions, promoters, and sync</p>
                        </div>

                        <Button
                            onClick={() => syncMutation.mutate()}
                            disabled={syncMutation.isPending}
                            className="bg-accent hover:bg-accent/80"
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
                            {syncMutation.isPending ? 'Syncing...' : 'Sync Events'}
                        </Button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-yellow-500/20 rounded-lg">
                                        <Clock className="w-6 h-6 text-yellow-500" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black">{pendingSubmissions?.length || 0}</p>
                                        <p className="text-sm text-muted-foreground">Pending Review</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-green-500/20 rounded-lg">
                                        <CheckCircle className="w-6 h-6 text-green-500" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black">
                                            {allSubmissions?.filter((s: UserEventSubmission) => s.status === 'approved').length || 0}
                                        </p>
                                        <p className="text-sm text-muted-foreground">Approved</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-500/20 rounded-lg">
                                        <Users className="w-6 h-6 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black">{promoters?.length || 0}</p>
                                        <p className="text-sm text-muted-foreground">Promoters</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-orange-500/20 rounded-lg">
                                        <AlertTriangle className="w-6 h-6 text-orange-500" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black">{unverifiedPromoters?.length || 0}</p>
                                        <p className="text-sm text-muted-foreground">Unverified</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tabs */}
                    <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                        <TabsList>
                            <TabsTrigger value="submissions" className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Submissions
                                {pendingSubmissions && pendingSubmissions.length > 0 && (
                                    <Badge variant="destructive" className="ml-1">{pendingSubmissions.length}</Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="promoters" className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Promoters
                                {unverifiedPromoters && unverifiedPromoters.length > 0 && (
                                    <Badge variant="outline" className="ml-1">{unverifiedPromoters.length}</Badge>
                                )}
                            </TabsTrigger>
                        </TabsList>

                        {/* Submissions Tab */}
                        <TabsContent value="submissions" className="space-y-4">
                            {pendingSubmissions && pendingSubmissions.length > 0 ? (
                                <div className="space-y-4">
                                    {pendingSubmissions.map((submission: UserEventSubmission) => (
                                        <Card key={submission.id}>
                                            <CardContent className="pt-6">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1 space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="text-xl font-bold">{submission.title}</h3>
                                                            <Badge variant="outline">{submission.category}</Badge>
                                                            {submission.isPromoter && (
                                                                <Badge variant="secondary">
                                                                    <Shield className="w-3 h-3 mr-1" />
                                                                    Promoter
                                                                </Badge>
                                                            )}
                                                        </div>

                                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                                            {submission.description}
                                                        </p>

                                                        <div className="flex flex-wrap gap-4 text-sm">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="w-4 h-4" />
                                                                {format(new Date(submission.eventDate), 'PPP')}
                                                            </span>
                                                            <span>{submission.venueName}, {submission.city}</span>
                                                            <span className="text-muted-foreground">
                                                                by {submission.submitterName} ({submission.submitterEmail})
                                                            </span>
                                                        </div>

                                                        {submission.ticketUrl && (
                                                            <a
                                                                href={submission.ticketUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-sm text-accent hover:underline"
                                                            >
                                                                View Tickets →
                                                            </a>
                                                        )}
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleReject(submission.id, 'Does not meet our criteria')}
                                                            disabled={reviewMutation.isPending}
                                                        >
                                                            <XCircle className="w-4 h-4 mr-1" />
                                                            Reject
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleApprove(submission.id)}
                                                            disabled={reviewMutation.isPending}
                                                            className="bg-green-600 hover:bg-green-700"
                                                        >
                                                            <CheckCircle className="w-4 h-4 mr-1" />
                                                            Approve
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <Card>
                                    <CardContent className="py-12 text-center">
                                        <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500 opacity-50" />
                                        <p className="text-muted-foreground">No pending submissions</p>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        {/* Promoters Tab */}
                        <TabsContent value="promoters" className="space-y-4">
                            {promoters && promoters.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {promoters.map((promoter: PromoterProfile) => (
                                        <Card key={promoter.id}>
                                            <CardContent className="pt-6">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-bold">{promoter.name}</h3>
                                                            {promoter.isVerified ? (
                                                                <Badge className="bg-green-600">
                                                                    <Shield className="w-3 h-3 mr-1" />
                                                                    Verified
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="outline">Unverified</Badge>
                                                            )}
                                                        </div>

                                                        {promoter.companyName && (
                                                            <p className="text-sm font-medium">{promoter.companyName}</p>
                                                        )}

                                                        <p className="text-sm text-muted-foreground">{promoter.email}</p>

                                                        {promoter.website && (
                                                            <a
                                                                href={promoter.website}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-sm text-accent hover:underline"
                                                            >
                                                                {promoter.website}
                                                            </a>
                                                        )}

                                                        <div className="flex gap-4 text-xs text-muted-foreground pt-2">
                                                            <span>{promoter.totalEventsSubmitted} submitted</span>
                                                            <span>{promoter.approvedEventsCount} approved</span>
                                                        </div>
                                                    </div>

                                                    <Button
                                                        size="sm"
                                                        variant={promoter.isVerified ? "outline" : "default"}
                                                        onClick={() => handleVerifyPromoter(promoter.id, !promoter.isVerified)}
                                                        disabled={verifyPromoterMutation.isPending}
                                                    >
                                                        {promoter.isVerified ? (
                                                            <>
                                                                <XCircle className="w-4 h-4 mr-1" />
                                                                Revoke
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Shield className="w-4 h-4 mr-1" />
                                                                Verify
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <Card>
                                    <CardContent className="py-12 text-center">
                                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p className="text-muted-foreground">No promoters registered yet</p>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </DashboardLayout>
        </>
    );
}
