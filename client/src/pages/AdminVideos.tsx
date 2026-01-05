
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash, Play, Plus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

export default function AdminVideos() {
    const { user } = useAuth();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newVideo, setNewVideo] = useState({
        title: "",
        youtubeUrl: "",
        category: "Live Set",
        description: "",
    });

    const { data: videos, refetch } = trpc.videos.list.useQuery();
    const createMutation = trpc.videos.create.useMutation({
        onSuccess: () => {
            toast.success("Video added");
            setIsCreateOpen(false);
            setNewVideo({ title: "", youtubeUrl: "", category: "Live Set", description: "" });
            refetch();
        }
    });
    const deleteMutation = trpc.videos.delete.useMutation({
        onSuccess: () => {
            toast.success("Video deleted");
            refetch();
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(newVideo);
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Manage Videos</h1>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> Add Video</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Video</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label>Title</Label>
                                <Input
                                    value={newVideo.title}
                                    onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label>YouTube URL</Label>
                                <Input
                                    value={newVideo.youtubeUrl}
                                    onChange={(e) => setNewVideo({ ...newVideo, youtubeUrl: e.target.value })}
                                    required
                                    placeholder="https://youtube.com/watch?v=..."
                                />
                            </div>
                            <div>
                                <Label>Category</Label>
                                <Input
                                    value={newVideo.category}
                                    onChange={(e) => setNewVideo({ ...newVideo, category: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label>Description</Label>
                                <Input
                                    value={newVideo.description}
                                    onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                                />
                            </div>
                            <Button type="submit" disabled={createMutation.isPending}>
                                {createMutation.isPending ? "Adding..." : "Add Video"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos?.map((video: any) => (
                    <Card key={video.id}>
                        <div className="aspect-video bg-black relative">
                            {/* Thumbnail would go here if parsed */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Play className="text-white h-12 w-12 opacity-50" />
                            </div>
                        </div>
                        <CardContent className="p-4">
                            <h3 className="font-bold truncate">{video.title}</h3>
                            <p className="text-sm text-muted-foreground">{video.category}</p>
                            <Button
                                variant="destructive"
                                size="sm"
                                className="mt-4 w-full"
                                onClick={() => {
                                    if (confirm("Delete this video?")) deleteMutation.mutate({ id: video.id });
                                }}
                            >
                                <Trash className="mr-2 h-4 w-4" /> Delete
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
