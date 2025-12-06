import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Gift, Calendar, Users } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function ContestCard() {
  const { data: contests } = trpc.contests.active.useQuery();
  const [selectedContest, setSelectedContest] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const enterContest = trpc.contests.enter.useMutation({
    onSuccess: () => {
      toast.success("Entry submitted successfully!");
      setSelectedContest(null);
      setFormData({ name: "", email: "" });
    },
  });

  if (!contests || contests.length === 0) {
    return null;
  }

  const contest = contests[0]; // Show first active contest

  return (
    <>
      <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-500/20 rounded-lg">
            <Gift className="w-6 h-6 text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2">{contest.name}</h3>
            <p className="text-muted-foreground mb-4">{contest.description}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Ends {format(new Date(contest.endDate), "MMM d, yyyy")}
              </div>
            </div>
            <Button onClick={() => setSelectedContest(contest.id)}>
              Enter Now
            </Button>
          </div>
        </div>
      </Card>

      <Dialog open={selectedContest !== null} onOpenChange={() => setSelectedContest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Contest</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <Button
              className="w-full"
              onClick={() => {
                if (selectedContest) {
                  enterContest.mutate({
                    contestId: selectedContest,
                    name: formData.name,
                    email: formData.email,
                  });
                }
              }}
              disabled={!formData.name || !formData.email}
            >
              Submit Entry
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
