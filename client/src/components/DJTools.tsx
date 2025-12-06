import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Download, FileText, Music, Mic, Speaker, Cable,
  Monitor, Headphones, ZapIcon, Settings, Plus, 
  Trash2, GripVertical, Clock, Play, Search,
  ChevronDown, ChevronUp, Image, Printer, Copy
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ============================================
// TECHNICAL RIDER PAGE
// ============================================

interface RiderSection {
  title: string;
  items: {
    name: string;
    quantity: number;
    notes?: string;
    required: boolean;
  }[];
}

const defaultRider: RiderSection[] = [
  {
    title: "DJ Equipment",
    items: [
      { name: "Pioneer CDJ-3000", quantity: 2, required: true },
      { name: "Pioneer DJM-900NXS2", quantity: 1, required: true },
      { name: "DJ Booth/Stand", quantity: 1, required: true },
      { name: "XLR Cables", quantity: 4, required: true, notes: "Male to female, 15ft minimum" },
    ],
  },
  {
    title: "Monitoring",
    items: [
      { name: "DJ Monitor Speakers", quantity: 2, required: true, notes: "Min 12\" woofer" },
      { name: "Monitor Stands", quantity: 2, required: true },
      { name: "Headphone extension cable", quantity: 1, required: false, notes: "6ft minimum" },
    ],
  },
  {
    title: "Sound System",
    items: [
      { name: "PA System", quantity: 1, required: true, notes: "Appropriate for venue size" },
      { name: "Subwoofers", quantity: 2, required: true },
      { name: "Audio Engineer on duty", quantity: 1, required: true },
    ],
  },
  {
    title: "Lighting",
    items: [
      { name: "DJ Booth lighting", quantity: 1, required: false },
      { name: "Booth backlight", quantity: 1, required: false },
    ],
  },
  {
    title: "Hospitality",
    items: [
      { name: "Water (bottles)", quantity: 6, required: true },
      { name: "Hot towels", quantity: 2, required: false },
      { name: "Snacks", quantity: 1, required: false, notes: "Fresh fruit, nuts preferred" },
    ],
  },
];

export function TechnicalRider() {
  const [rider, setRider] = useState(defaultRider);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(rider.map(s => s.title))
  );

  const toggleSection = (title: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  };

  const downloadRider = () => {
    const content = rider.map(section => {
      const items = section.items.map(item => {
        let line = `  ${item.required ? "[REQUIRED]" : "[Optional]"} ${item.quantity}x ${item.name}`;
        if (item.notes) line += ` - ${item.notes}`;
        return line;
      }).join("\n");
      return `${section.title.toUpperCase()}\n${"=".repeat(section.title.length)}\n${items}`;
    }).join("\n\n");

    const blob = new Blob([`DJ DANNY HECTIC B - TECHNICAL RIDER\n${"=".repeat(40)}\n\n${content}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dj-danny-hectic-b-rider.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Technical rider downloaded!");
  };

  const printRider = () => {
    window.print();
  };

  const copyToClipboard = () => {
    const content = rider.map(section => {
      const items = section.items.map(item => {
        return `• ${item.quantity}x ${item.name}${item.required ? " (Required)" : ""}`;
      }).join("\n");
      return `${section.title}\n${items}`;
    }).join("\n\n");
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Technical Rider</h2>
          <p className="text-muted-foreground">Equipment and requirements for your event</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={copyToClipboard}>
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </Button>
          <Button variant="outline" onClick={printRider}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button onClick={downloadRider}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {rider.map((section) => (
          <Card key={section.title} className="overflow-hidden glass">
            <button
              onClick={() => toggleSection(section.title)}
              className="w-full flex items-center justify-between p-4 hover:bg-accent/5 transition-colors"
            >
              <h3 className="font-semibold flex items-center gap-2">
                {section.title === "DJ Equipment" && <Music className="w-5 h-5 text-accent" />}
                {section.title === "Monitoring" && <Headphones className="w-5 h-5 text-accent" />}
                {section.title === "Sound System" && <Speaker className="w-5 h-5 text-accent" />}
                {section.title === "Lighting" && <ZapIcon className="w-5 h-5 text-accent" />}
                {section.title === "Hospitality" && <Settings className="w-5 h-5 text-accent" />}
                {section.title}
              </h3>
              {expandedSections.has(section.title) ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
            
            {expandedSections.has(section.title) && (
              <div className="border-t border-border">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium">Item</th>
                      <th className="text-center p-3 text-sm font-medium w-20">Qty</th>
                      <th className="text-left p-3 text-sm font-medium">Notes</th>
                      <th className="text-center p-3 text-sm font-medium w-24">Required</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.items.map((item, idx) => (
                      <tr key={idx} className="border-t border-border">
                        <td className="p-3">{item.name}</td>
                        <td className="p-3 text-center">{item.quantity}</td>
                        <td className="p-3 text-sm text-muted-foreground">{item.notes || "-"}</td>
                        <td className="p-3 text-center">
                          {item.required ? (
                            <span className="px-2 py-1 bg-red-500/10 text-red-500 text-xs rounded">
                              Required
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
                              Optional
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============================================
// SETLIST BUILDER
// ============================================

interface SetlistTrack {
  id: string;
  title: string;
  artist: string;
  bpm?: number;
  key?: string;
  duration?: number; // seconds
  notes?: string;
}

export function SetlistBuilder() {
  const [tracks, setTracks] = useState<SetlistTrack[]>([
    { id: "1", title: "Sweet Love", artist: "Anita Baker", bpm: 98, key: "Am", duration: 264 },
    { id: "2", title: "Flowers", artist: "Sweet Female Attitude", bpm: 130, key: "Gm", duration: 224 },
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [setlistName, setSetlistName] = useState("Saturday Night Set");

  const addTrack = () => {
    const newTrack: SetlistTrack = {
      id: Date.now().toString(),
      title: "",
      artist: "",
    };
    setTracks([...tracks, newTrack]);
  };

  const removeTrack = (id: string) => {
    setTracks(tracks.filter(t => t.id !== id));
  };

  const updateTrack = (id: string, field: keyof SetlistTrack, value: any) => {
    setTracks(tracks.map(t => 
      t.id === id ? { ...t, [field]: value } : t
    ));
  };

  const moveTrack = (id: string, direction: "up" | "down") => {
    const idx = tracks.findIndex(t => t.id === id);
    if (direction === "up" && idx > 0) {
      const newTracks = [...tracks];
      [newTracks[idx - 1], newTracks[idx]] = [newTracks[idx], newTracks[idx - 1]];
      setTracks(newTracks);
    } else if (direction === "down" && idx < tracks.length - 1) {
      const newTracks = [...tracks];
      [newTracks[idx], newTracks[idx + 1]] = [newTracks[idx + 1], newTracks[idx]];
      setTracks(newTracks);
    }
  };

  const totalDuration = tracks.reduce((sum, t) => sum + (t.duration || 0), 0);
  const formatDuration = (s: number) => {
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  const exportSetlist = () => {
    const content = tracks.map((t, i) => 
      `${i + 1}. ${t.artist} - ${t.title}${t.bpm ? ` [${t.bpm} BPM]` : ""}${t.key ? ` [${t.key}]` : ""}`
    ).join("\n");
    
    const blob = new Blob([`${setlistName}\n${"=".repeat(setlistName.length)}\n\n${content}\n\nTotal: ${formatDuration(totalDuration)}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${setlistName.replace(/\s+/g, "_")}.txt`;
    a.click();
    toast.success("Setlist exported!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Input
            value={setlistName}
            onChange={(e) => setSetlistName(e.target.value)}
            className="text-xl font-bold bg-transparent border-none p-0 h-auto focus-visible:ring-0"
            placeholder="Setlist name..."
          />
          <p className="text-muted-foreground text-sm mt-1">
            {tracks.length} tracks · {formatDuration(totalDuration)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={addTrack}>
            <Plus className="w-4 h-4 mr-2" />
            Add Track
          </Button>
          <Button onClick={exportSetlist}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden glass">
        <div className="divide-y divide-border">
          {tracks.map((track, idx) => (
            <div key={track.id} className="flex items-center gap-4 p-4">
              <div className="flex flex-col gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={() => moveTrack(track.id, "up")}
                  disabled={idx === 0}
                >
                  <ChevronUp className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={() => moveTrack(track.id, "down")}
                  disabled={idx === tracks.length - 1}
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </div>
              
              <span className="w-8 text-center text-muted-foreground">{idx + 1}</span>
              
              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                <Input
                  value={track.title}
                  onChange={(e) => updateTrack(track.id, "title", e.target.value)}
                  placeholder="Track title"
                />
                <Input
                  value={track.artist}
                  onChange={(e) => updateTrack(track.id, "artist", e.target.value)}
                  placeholder="Artist"
                />
                <div className="flex gap-2">
                  <Input
                    value={track.bpm || ""}
                    onChange={(e) => updateTrack(track.id, "bpm", parseInt(e.target.value) || undefined)}
                    placeholder="BPM"
                    type="number"
                    className="w-20"
                  />
                  <Input
                    value={track.key || ""}
                    onChange={(e) => updateTrack(track.id, "key", e.target.value)}
                    placeholder="Key"
                    className="w-20"
                  />
                </div>
                <Input
                  value={track.notes || ""}
                  onChange={(e) => updateTrack(track.id, "notes", e.target.value)}
                  placeholder="Notes"
                />
              </div>
              
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => removeTrack(track.id)}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ============================================
// AUDIO WAVEFORM VISUALIZATION
// ============================================

export function AudioWaveform({ 
  audioUrl,
  className 
}: { 
  audioUrl?: string;
  className?: string;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(30); // percentage

  // Generate mock waveform bars
  const bars = Array.from({ length: 100 }, () => Math.random() * 80 + 20);

  return (
    <Card className={cn("p-4 glass", className)}>
      <div className="flex items-center gap-4 mb-4">
        <Button 
          size="icon" 
          onClick={() => setIsPlaying(!isPlaying)}
          className="gradient-bg"
        >
          <Play className={cn("w-4 h-4", isPlaying && "hidden")} />
          <span className={cn("w-3 h-3 bg-white", !isPlaying && "hidden")} />
        </Button>
        <div className="flex-1">
          <p className="font-medium">Track Waveform</p>
          <p className="text-sm text-muted-foreground">Click to play/pause</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>0:45 / 3:24</span>
        </div>
      </div>

      {/* Waveform visualization */}
      <div 
        className="relative h-24 flex items-center gap-0.5 cursor-pointer"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          setProgress((x / rect.width) * 100);
        }}
      >
        {bars.map((height, i) => (
          <div
            key={i}
            className={cn(
              "flex-1 rounded-full transition-colors",
              (i / bars.length) * 100 < progress ? "bg-accent" : "bg-muted"
            )}
            style={{ height: `${height}%` }}
          />
        ))}
        
        {/* Playhead */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
          style={{ left: `${progress}%` }}
        />
      </div>

      {/* Time markers */}
      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        <span>0:00</span>
        <span>1:00</span>
        <span>2:00</span>
        <span>3:00</span>
        <span>3:24</span>
      </div>
    </Card>
  );
}

// ============================================
// MEDIA KIT / EPK COMPONENT
// ============================================

interface MediaKitAsset {
  id: string;
  name: string;
  type: "photo" | "logo" | "bio" | "pressRelease";
  url: string;
  format: string;
  size: string;
  dimensions?: string;
}

const mockAssets: MediaKitAsset[] = [
  {
    id: "1",
    name: "High-Res Press Photo",
    type: "photo",
    url: "/images/press-photo-1.jpg",
    format: "JPG",
    size: "4.2 MB",
    dimensions: "3000 x 4000",
  },
  {
    id: "2",
    name: "Square Profile Photo",
    type: "photo",
    url: "/images/profile-square.jpg",
    format: "JPG",
    size: "1.8 MB",
    dimensions: "2000 x 2000",
  },
  {
    id: "3",
    name: "Logo (Full Color)",
    type: "logo",
    url: "/images/logo-color.png",
    format: "PNG",
    size: "256 KB",
    dimensions: "2000 x 500",
  },
  {
    id: "4",
    name: "Logo (White)",
    type: "logo",
    url: "/images/logo-white.png",
    format: "PNG",
    size: "128 KB",
    dimensions: "2000 x 500",
  },
  {
    id: "5",
    name: "Short Bio (200 words)",
    type: "bio",
    url: "/text/bio-short.txt",
    format: "TXT",
    size: "2 KB",
  },
  {
    id: "6",
    name: "Full Bio (500 words)",
    type: "bio",
    url: "/text/bio-full.txt",
    format: "TXT",
    size: "4 KB",
  },
];

export function MediaKit() {
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());

  const toggleAsset = (id: string) => {
    setSelectedAssets(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const downloadSelected = () => {
    if (selectedAssets.size === 0) {
      toast.error("Please select assets to download");
      return;
    }
    // In production, this would zip and download selected files
    toast.success(`Downloading ${selectedAssets.size} assets...`);
  };

  const downloadAll = () => {
    toast.success("Downloading complete media kit...");
  };

  const assetsByType = {
    photo: mockAssets.filter(a => a.type === "photo"),
    logo: mockAssets.filter(a => a.type === "logo"),
    bio: mockAssets.filter(a => a.type === "bio"),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Media Kit</h2>
          <p className="text-muted-foreground">High-resolution assets for press and promoters</p>
        </div>
        <div className="flex gap-2">
          {selectedAssets.size > 0 && (
            <Button variant="outline" onClick={downloadSelected}>
              <Download className="w-4 h-4 mr-2" />
              Download Selected ({selectedAssets.size})
            </Button>
          )}
          <Button onClick={downloadAll} className="gradient-bg">
            <Download className="w-4 h-4 mr-2" />
            Download All
          </Button>
        </div>
      </div>

      {/* Photos */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Image className="w-5 h-5 text-accent" />
          Press Photos
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {assetsByType.photo.map((asset) => (
            <Card 
              key={asset.id}
              className={cn(
                "p-3 cursor-pointer transition-all glass",
                selectedAssets.has(asset.id) && "ring-2 ring-accent"
              )}
              onClick={() => toggleAsset(asset.id)}
            >
              <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center">
                <Image className="w-12 h-12 text-muted-foreground" />
              </div>
              <p className="font-medium text-sm truncate">{asset.name}</p>
              <p className="text-xs text-muted-foreground">
                {asset.format} · {asset.size} · {asset.dimensions}
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* Logos */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-accent" />
          Logos
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {assetsByType.logo.map((asset) => (
            <Card 
              key={asset.id}
              className={cn(
                "p-3 cursor-pointer transition-all glass",
                selectedAssets.has(asset.id) && "ring-2 ring-accent"
              )}
              onClick={() => toggleAsset(asset.id)}
            >
              <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="font-medium text-sm truncate">{asset.name}</p>
              <p className="text-xs text-muted-foreground">{asset.format} · {asset.size}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Bios */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-accent" />
          Biographies
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assetsByType.bio.map((asset) => (
            <Card 
              key={asset.id}
              className={cn(
                "p-4 cursor-pointer transition-all glass",
                selectedAssets.has(asset.id) && "ring-2 ring-accent"
              )}
              onClick={() => toggleAsset(asset.id)}
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-muted rounded-lg">
                  <FileText className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{asset.name}</p>
                  <p className="text-sm text-muted-foreground">{asset.format} · {asset.size}</p>
                </div>
                <Button variant="ghost" size="icon">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default { TechnicalRider, SetlistBuilder, AudioWaveform, MediaKit };
