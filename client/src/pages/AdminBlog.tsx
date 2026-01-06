
/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Simple textarea for now
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Trash, Edit, Plus, FileText } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Switch } from "@/components/ui/switch";

export default function AdminBlog() {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<any>(null);
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        content: "",
        excerpt: "",
        category: "News",
        isPublished: false,
    });

    const { data: articles, refetch } = trpc.articles.adminList.useQuery();

    const createMutation = trpc.articles.create.useMutation({
        onSuccess: () => {
            toast.success("Article created");
            setIsCreateOpen(false);
            resetForm();
            refetch();
        }
    });

    const updateMutation = trpc.articles.update.useMutation({
        onSuccess: () => {
            toast.success("Article updated");
            setEditingPost(null);
            resetForm();
            refetch();
        }
    });

    const deleteMutation = trpc.articles.delete.useMutation({
        onSuccess: () => {
            toast.success("Article deleted");
            refetch();
        }
    });

    const resetForm = () => {
        setFormData({
            title: "",
            slug: "",
            content: "",
            excerpt: "",
            category: "News",
            isPublished: false,
        });
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(formData);
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPost) return;
        updateMutation.mutate({ ...formData, id: editingPost.id });
    };

    const openEdit = (post: any) => {
        setEditingPost(post);
        setFormData({
            title: post.title,
            slug: post.slug,
            content: post.content,
            excerpt: post.excerpt || "",
            category: post.category || "News",
            isPublished: post.isPublished,
        });
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Manage Blog</h1>
                <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> Write Article</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>New Article</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Title</Label>
                                    <Input
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-') })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label>Slug</Label>
                                    <Input
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <Label>Excerpt</Label>
                                <Textarea
                                    value={formData.excerpt}
                                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                    rows={2}
                                />
                            </div>

                            <div>
                                <Label>Content (Markdown/HTML)</Label>
                                <Textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="min-h-[300px] font-mono"
                                    required
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <Label>Category</Label>
                                    <Input
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    />
                                </div>
                                <div className="flex items-center space-x-2 pt-6">
                                    <Switch
                                        checked={formData.isPublished}
                                        onCheckedChange={(c) => setFormData({ ...formData, isPublished: c })}
                                    />
                                    <Label>Published</Label>
                                </div>
                            </div>

                            <Button type="submit" disabled={createMutation.isPending}>
                                {createMutation.isPending ? "Saving..." : "Publish Article"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit Modal */}
                <Dialog open={!!editingPost} onOpenChange={(open) => { if (!open) setEditingPost(null); }}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Edit Article</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            {/* Same form as create - duplicated for speed but could be componentized */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Title</Label>
                                    <Input
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label>Slug</Label>
                                    <Input
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>Excerpt</Label>
                                <Textarea
                                    value={formData.excerpt}
                                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                    rows={2}
                                />
                            </div>
                            <div>
                                <Label>Content</Label>
                                <Textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="min-h-[300px] font-mono"
                                    required
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <Label>Category</Label>
                                    <Input
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    />
                                </div>
                                <div className="flex items-center space-x-2 pt-6">
                                    <Switch
                                        checked={formData.isPublished}
                                        onCheckedChange={(c) => setFormData({ ...formData, isPublished: c })}
                                    />
                                    <Label>Published</Label>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setEditingPost(null)}>Cancel</Button>
                                <Button type="submit" disabled={updateMutation.isPending}>
                                    {updateMutation.isPending ? "Saving..." : "Save Changes"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-4">
                {articles?.map((post: any) => (
                    <Card key={post.id}>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-start gap-4">
                                <div className="bg-muted p-2 rounded">
                                    <FileText className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{post.title}</h3>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <span className={post.isPublished ? "text-green-500" : "text-yellow-500"}>
                                            {post.isPublished ? "Published" : "Draft"}
                                        </span>
                                        <span>•</span>
                                        <span>{format(new Date(post.createdAt), 'MMM d, yyyy')}</span>
                                        <span>•</span>
                                        <span>{post.category}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => openEdit(post)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                        if (confirm("Delete article?")) deleteMutation.mutate({ id: post.id });
                                    }}
                                >
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {articles?.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No articles found.</p>
                )}
            </div>
        </div>
    );
}
