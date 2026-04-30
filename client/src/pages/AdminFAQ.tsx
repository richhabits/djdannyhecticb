import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from "../components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Edit2, Trash2, Plus, GripVertical } from "lucide-react";
import { toast } from "sonner";

interface FAQFormData {
  question: string;
  answer: string;
  category: "booking" | "merch" | "technical" | "shipping" | "general";
  displayOrder: number;
  active: boolean;
}

export function AdminFAQ() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FAQFormData>({
    question: "",
    answer: "",
    category: "general",
    displayOrder: 0,
    active: true,
  });

  const queryClient = useQueryClient();

  const { data: faqs } = useQuery({
    queryKey: ["faq:all"],
    queryFn: () => trpc.faq.all.query(),
  });

  const allFaqs = Object.values(faqs || {}).flat() as any[];

  const createMutation = useMutation({
    mutationFn: () => trpc.faq.create.mutate(formData),
    onSuccess: () => {
      toast.success("FAQ created");
      queryClient.invalidateQueries({ queryKey: ["faq:all"] });
      queryClient.invalidateQueries({ queryKey: ["faq:list"] });
      resetForm();
      setShowCreateDialog(false);
    },
    onError: () => toast.error("Failed to create FAQ"),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      trpc.faq.update.mutate({
        id: editingId!,
        ...formData,
      }),
    onSuccess: () => {
      toast.success("FAQ updated");
      queryClient.invalidateQueries({ queryKey: ["faq:all"] });
      queryClient.invalidateQueries({ queryKey: ["faq:list"] });
      resetForm();
      setEditingId(null);
    },
    onError: () => toast.error("Failed to update FAQ"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => trpc.faq.delete.mutate({ id }),
    onSuccess: () => {
      toast.success("FAQ deleted");
      queryClient.invalidateQueries({ queryKey: ["faq:all"] });
      queryClient.invalidateQueries({ queryKey: ["faq:list"] });
      setDeleteId(null);
    },
    onError: () => toast.error("Failed to delete FAQ"),
  });

  const resetForm = () => {
    setFormData({
      question: "",
      answer: "",
      category: "general",
      displayOrder: 0,
      active: true,
    });
  };

  const handleEditClick = (faq: any) => {
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      displayOrder: faq.displayOrder,
      active: faq.active,
    });
    setEditingId(faq.id);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">FAQ Management</h1>
        <Button
          onClick={() => {
            resetForm();
            setEditingId(null);
            setShowCreateDialog(true);
          }}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New FAQ
        </Button>
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">All FAQs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300">Question</TableHead>
                  <TableHead className="text-slate-300">Category</TableHead>
                  <TableHead className="text-slate-300 text-center">Order</TableHead>
                  <TableHead className="text-slate-300 text-center">Active</TableHead>
                  <TableHead className="text-slate-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allFaqs.map(faq => (
                  <TableRow key={faq.id} className="border-slate-700 hover:bg-slate-700/50">
                    <TableCell className="text-white font-medium line-clamp-1 max-w-xs">
                      {faq.question}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-slate-500 text-slate-300">
                        {faq.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-slate-300">
                      {faq.displayOrder}
                    </TableCell>
                    <TableCell className="text-center">
                      <Checkbox checked={faq.active} disabled className="cursor-not-allowed" />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditClick(faq)}
                          className="text-blue-400 hover:bg-blue-500/10"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteId(faq.id)}
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
              {editingId ? "Edit FAQ" : "Create New FAQ"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Question
              </label>
              <Input
                value={formData.question}
                onChange={e => setFormData({ ...formData, question: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="FAQ question"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Answer (Markdown)
              </label>
              <Textarea
                value={formData.answer}
                onChange={e => setFormData({ ...formData, answer: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white font-mono text-sm"
                placeholder="Answer in markdown format..."
                rows={8}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Category
                </label>
                <Select value={formData.category} onValueChange={value => {
                  setFormData({ ...formData, category: value as any });
                }}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="booking">Booking</SelectItem>
                    <SelectItem value="merch">Merch</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="shipping">Shipping</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Display Order
                </label>
                <Input
                  type="number"
                  value={formData.displayOrder}
                  onChange={e =>
                    setFormData({ ...formData, displayOrder: parseInt(e.target.value) })
                  }
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                checked={formData.active}
                onCheckedChange={checked =>
                  setFormData({ ...formData, active: checked as boolean })
                }
                id="active"
              />
              <label htmlFor="active" className="text-sm text-slate-200">
                Active
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
                    updateMutation.mutate();
                  } else {
                    createMutation.mutate();
                  }
                }}
                className="bg-purple-600 hover:bg-purple-700"
                disabled={
                  !formData.question ||
                  !formData.answer ||
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
          <AlertDialogTitle className="text-white">Delete FAQ?</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-300">
            This action cannot be undone. The FAQ will be permanently deleted.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel className="border-slate-600">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  deleteMutation.mutate(deleteId);
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
