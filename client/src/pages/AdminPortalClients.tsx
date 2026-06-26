import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { Link } from "wouter";
import { Users } from "lucide-react";

export default function AdminPortalClients() {
  const { user, isAuthenticated } = useAuth();
  const { data: clients, isLoading } = trpc.portal.clients.listAll.useQuery();

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-bold">Admin Access Required</h1>
          <Link href="/">
            <Button className="bg-gradient-to-r from-orange-600 to-amber-600">Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="w-8 h-8" />
            Portal Clients
          </h1>
          <p className="text-muted-foreground mt-2">All registered booking clients, artists, and brands</p>
        </div>

        {isLoading ? (
          <p className="text-center text-muted-foreground py-12">Loading clients...</p>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Bookings</TableHead>
                    <TableHead>Uploads</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients && clients.length > 0 ? (
                    clients.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.profile?.displayName || c.name || "-"}</TableCell>
                        <TableCell>{c.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">{c.role}</Badge>
                        </TableCell>
                        <TableCell>{c.profile?.company || "-"}</TableCell>
                        <TableCell>{c.bookingCount}</TableCell>
                        <TableCell>{c.uploadCount}</TableCell>
                        <TableCell>{format(new Date(c.createdAt), "PP")}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No clients yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
