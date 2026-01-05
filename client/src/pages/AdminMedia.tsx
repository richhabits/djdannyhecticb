
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash, Upload, Image as ImageIcon, Copy } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AdminMedia() {
    const [isUploading, setIsUploading] = useState(false);
    const { data: mediaItems, refetch } = trpc.media.list.useQuery();

    const deleteMutation = trpc.media.delete.useMutation({
        onSuccess: () => {
            toast.success("File deleted");
            refetch();
        }
    });

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", files[0]);

        try {
            // Direct upload to backend API (needs to be implemented in Backend)
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");

            const data = await res.json();
            toast.success("Upload successful");
            refetch();
        } catch (err) {
            toast.error("Upload failed");
            console.error(err);
        } finally {
            setIsUploading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("URL copied to clipboard");
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Media Library</h1>
                <div>
                    <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                    />
                    <Label htmlFor="file-upload" className="cursor-pointer">
                        <Button asChild disabled={isUploading}>
                            <span>
                                <Upload className="mr-2 h-4 w-4" />
                                {isUploading ? "Uploading..." : "Upload File"}
                            </span>
                        </Button>
                    </Label>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {mediaItems?.map((item: any) => (
                    <Card key={item.id} className="group relative overflow-hidden">
                        <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                            {item.mimeType.startsWith("image/") ? (
                                <img src={item.url} alt={item.originalName} className="object-cover w-full h-full" />
                            ) : (
                                <ImageIcon className="h-12 w-12 text-muted-foreground" />
                            )}
                        </div>

                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                            <Button size="sm" variant="secondary" onClick={() => copyToClipboard(item.url)}>
                                <Copy className="h-3 w-3 mr-1" /> Copy URL
                            </Button>
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                    if (confirm("Delete this file?")) deleteMutation.mutate({ id: item.id });
                                }}
                            >
                                <Trash className="h-3 w-3 mr-1" /> Delete
                            </Button>
                        </div>

                        <CardContent className="p-2 text-xs truncate text-center">
                            {item.originalName}
                        </CardContent>
                    </Card>
                ))}
                {mediaItems?.length === 0 && (
                    <div className="col-span-full py-12 text-center text-muted-foreground">
                        No media files uploaded yet.
                    </div>
                )}
            </div>
        </div>
    );
}

import { Label } from "@/components/ui/label";
