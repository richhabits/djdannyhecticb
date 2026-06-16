import { useState } from "react";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from "../components/ui/alert-dialog";
import { Checkbox } from "../components/ui/checkbox";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { Edit2, Trash2, Eye, Plus } from "lucide-react";
import { toast } from "sonner";

interface BlogFormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string;
  featuredImageUrl: string;
  tags: string[];
  published: boolean;
}

export function AdminBlog() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [formData, setFormData] = useState<BlogFormData>({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    author: "DJ Danny Hectic B",
    featuredImageUrl: "",
    tags: [],
    published: false,
  });
  const [tagInput, setTagInput] = useState("");

  const utils = trpc.useUtils();

  const { data: postsData } = trpc.blog.list.useQuery({ limit: 100, offset: 0 });

  const createMutation = trpc.blog.create.useMutation({
    onSuccess: () => {
      toast.success("Blog post created");
      utils.blog.list.invalidate();
      resetForm();
      setShowCreateDialog(false);
    },
    onError: () => toast.error("Failed to create blog post"),
  });

  const updateMutation = trpc.blog.update.useMutation({
    onSuccess: () => {
      toast.success("Blog post updated");
      utils.blog.list.invalidate();
      resetForm();
      setEditingId(null);
    },
    onError: () => toast.error("Failed to update blog post"),
  });

  const deleteMutation = trpc.blog.delete.useMutation({
    onSuccess: () => {
      toast.success("Blog post deleted");
      utils.blog.list.invalidate();
      setDeleteId(null);
    },
    onError: () => toast.error("Failed to delete blog post"),
  });

  const publishMutation = trpc.blog.publish.useMutation({
    onSuccess: () => {
      toast.success("Blog post published");
      utils.blog.list.invalidate();
    },
    onError: () => toast.error("Failed to publish blog post"),
  });

  const unpublishMutation = trpc.blog.unpublish.useMutation({
    onSuccess: () => {
      toast.success("Blog post unpublished");
      utils.blog.list.invalidate();
    },
    onError: () => toast.error("Failed to unpublish blog post"),
  });

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      author: "DJ Danny Hectic B",
      featuredImageUrl: "",
      tags: [],
      published: false,
    });
    setTagInput("");
  };

  const handleEditClick = (post: any) => {
    setFormData({
      ...post,
      tags: post.tags || [],
    });
    setEditingId(post.id);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag),
    });
  };

  const handleAutoSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setFormData({ ...formData, slug });
  };

  const posts = postsData?.posts || [];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Blog Management</h1>
        <Button
          onClick={() => {
            resetForm();
            setEditingId(null);
            setShowCreateDialog(true);
          }}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">All Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300">Title</TableHead>
                  <TableHead className="text-slate-300">Slug</TableHead>
                  <TableHead className="text-slate-300">Author</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300">Published</TableHead>
                  <TableHead className="text-slate-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map(post => (
                  <TableRow key={post.id} className="border-slate-700 hover:bg-slate-700/50">
                    <TableCell className="text-white font-medium line-clamp-1">
                      {post.title}
                    </TableCell>
                    <TableCell className="text-slate-300 text-sm">{post.slug}</TableCell>
                    <TableCell className="text-slate-300 text-sm">{post.author}</TableCell>
                    <TableCell>
                      <Badge
                        variant={post.published ? "default" : "outline"}
                        className={
                          post.published
                            ? "bg-green-600"
                            : "border-slate-500 text-slate-300"
                        }
                      >
                        {post.published ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-300 text-sm">
                      {post.publishedAt
                        ? formatDistanceToNow(new Date(post.publishedAt), {
                            addSuffix: true,
                          })
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditClick(post)}
                          className="text-blue-400 hover:bg-blue-500/10"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (post.published) {
                              unpublishMutation.mutate({ id: post.id });
                            } else {
                              publishMutation.mutate({ id: post.id });
                            }
                          }}
                          className="text-amber-400 hover:bg-amber-500/10"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteId(post.id)}
                          className="text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showCreateDialog || editingId !== null} onOpenChange={open => {
        if (!open) {
          setShowCreateDialog(false);
          setEditingId(null);
          resetForm();
        }
      }}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingId ? "Edit Blog Post" : "Create New Blog Post"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Title
              </label>
              <Input
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Post title"
              />
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Slug
                </label>
                <Input
                  value={formData.slug}
                  onChange={e => setFormData({ ...formData, slug: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="post-slug"
                />
              </div>
              <Button
                onClick={handleAutoSlug}
                variant="outline"
                className="border-slate-600 mt-6"
              >
                Auto-Generate
              </Button>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Excerpt
              </label>
              <Textarea
                value={formData.excerpt}
                onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Short excerpt"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Content (Markdown)
              </label>
              <Textarea
                value={formData.content}
                onChange={e => setFormData({ ...formData, content: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white font-mono text-sm"
                placeholder="Write your blog post in markdown..."
                rows={10}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Author
                </label>
                <Input
                  value={formData.author}
                  onChange={e => setFormData({ ...formData, author: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Author name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Featured Image URL
                </label>
                <Input
                  value={formData.featuredImageUrl}
                  onChange={e => setFormData({ ...formData, featuredImageUrl: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyPress={e => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Add tag"
                />
                <Button onClick={handleAddTag} variant="outline" className="border-slate-600">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer">
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 hover:font-bold"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                checked={formData.published}
                onCheckedChange={checked =>
                  setFormData({ ...formData, published: checked as boolean })
                }
                id="published"
              />
              <label htmlFor="published" className="text-sm text-slate-200">
                Publish immediately
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingId(null);
                  setShowCreateDialog(false);
                  resetForm();
                }}
                className="border-slate-600"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (editingId) {
                    updateMutation.mutate({ id: editingId, ...formData });
                  } else {
                    createMutation.mutate(formData);
                  }
                }}
                className="bg-purple-600 hover:bg-purple-700"
                disabled={
                  !formData.title ||
                  !formData.slug ||
                  !formData.content ||
                  createMutation.isPending ||
                  updateMutation.isPending
                }
              >
                {editingId ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={open => {
        if (!open) setDeleteId(null);
      }}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogTitle className="text-white">Delete Blog Post?</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-300">
            This action cannot be undone. The blog post will be permanently deleted.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel className="border-slate-600">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  deleteMutation.mutate({ id: deleteId });
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
