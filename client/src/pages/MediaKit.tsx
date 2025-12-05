/**
 * Media Kit Page
 * High-res photos and press materials for media use
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MetaTagsComponent } from "@/components/MetaTags";
import { Download, Image, FileText, Video } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function MediaKit() {
  const downloadMixMutation = trpc.mixes.download.useMutation();

  const mediaAssets = [
    {
      type: "photo",
      title: "Professional Headshot",
      description: "High-resolution headshot (300 DPI)",
      size: "5.2 MB",
      format: "JPG",
      url: "/media/danny-headshot.jpg",
    },
    {
      type: "photo",
      title: "DJ Booth Action Shot",
      description: "Action shot from live performance",
      size: "8.1 MB",
      format: "JPG",
      url: "/media/danny-dj-booth.jpg",
    },
    {
      type: "photo",
      title: "Studio Portrait",
      description: "Studio portrait with branding",
      size: "6.5 MB",
      format: "JPG",
      url: "/media/danny-studio.jpg",
    },
    {
      type: "document",
      title: "Press Release Template",
      description: "Editable press release template",
      size: "245 KB",
      format: "DOCX",
      url: "/media/press-release-template.docx",
    },
    {
      type: "document",
      title: "Bio & Fact Sheet",
      description: "Complete bio and fact sheet",
      size: "180 KB",
      format: "PDF",
      url: "/media/bio-fact-sheet.pdf",
    },
    {
      type: "video",
      title: "Promo Video",
      description: "Short promo video for events",
      size: "45 MB",
      format: "MP4",
      url: "/media/promo-video.mp4",
    },
  ];

  const handleDownload = async (asset: typeof mediaAssets[0]) => {
    // In a real implementation, this would trigger a download
    window.open(asset.url, "_blank");
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "photo":
        return <Image className="h-5 w-5" />;
      case "document":
        return <FileText className="h-5 w-5" />;
      case "video":
        return <Video className="h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <>
      <MetaTagsComponent
        title="Media Kit - DJ Danny Hectic B"
        description="Download high-resolution photos, press materials, and media assets"
        url="/media-kit"
      />
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Media Kit</h1>
          <p className="text-muted-foreground">
            High-resolution photos, press materials, and media assets for press and promotional use
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mediaAssets.map((asset, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  {getIcon(asset.type)}
                  {asset.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{asset.description}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{asset.size}</span>
                  <span>{asset.format}</span>
                </div>
                <Button
                  onClick={() => handleDownload(asset)}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Usage Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>All media assets are provided for press and promotional use only</li>
              <li>Please credit "DJ Danny Hectic B" when using photos or videos</li>
              <li>Do not alter or edit photos without permission</li>
              <li>For commercial use, please contact us for licensing</li>
              <li>High-resolution versions available upon request</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
