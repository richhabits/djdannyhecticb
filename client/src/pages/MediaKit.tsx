import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Download, Image as ImageIcon, FileText, Camera } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function MediaKit() {
  const { data: items, isLoading } = trpc.mediaKit.list.useQuery();
  const downloadMutation = trpc.mediaKit.download.useMutation();

  const handleDownload = async (id: number, fileUrl: string) => {
    downloadMutation.mutate({ id });
    // In production, this would generate a presigned S3 URL
    window.open(fileUrl, "_blank");
    toast.success("Download started");
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "photo":
        return <Camera className="w-5 h-5" />;
      case "logo":
        return <ImageIcon className="w-5 h-5" />;
      case "pressRelease":
        return <FileText className="w-5 h-5" />;
      default:
        return <ImageIcon className="w-5 h-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="container py-12">
        <h1 className="text-4xl font-bold mb-8">Media Kit</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-square w-full" />
              <div className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Media Kit</h1>
        <p className="text-muted-foreground">
          High-resolution photos, logos, and press materials for media use.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items?.map((item) => (
          <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-square relative bg-muted">
              {item.thumbnailUrl ? (
                <img
                  src={item.thumbnailUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {getIcon(item.type)}
                </div>
              )}
              {item.isHighRes && (
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                  HD
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold mb-1">{item.name}</h3>
              {item.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {item.description}
                </p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground capitalize">
                  {item.type} {item.category && `• ${item.category}`}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(item.id, item.fileUrl)}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {(!items || items.length === 0) && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No media kit items available yet.</p>
        </div>
      )}
    </div>
  );
}
