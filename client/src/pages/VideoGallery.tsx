import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Youtube, ExternalLink } from "lucide-react";
import { MetaTagsComponent } from "@/components/MetaTags";
import ReactPlayer from "react-player";
import { cn } from "@/lib/utils";

const videoCategories = ["All", "Live Sets", "Mixes", "Interviews", "Behind the Scenes", "Festivals", "Clubs"];

const videos = [
  {
    id: 1,
    title: "Hectic Radio Live Set - Garage Nation 2024",
    category: "Live Sets",
    thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=2670",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description: "Epic live set from Garage Nation festival",
    duration: "1:23:45",
    views: "12.5K",
    date: "2024-01-15",
  },
  {
    id: 2,
    title: "Studio Mix Vol. 12",
    category: "Mixes",
    thumbnail: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2670",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description: "Latest studio mix featuring the best garage and house tracks",
    duration: "45:30",
    views: "8.2K",
    date: "2024-01-10",
  },
  {
    id: 3,
    title: "Behind the Scenes: Festival Prep",
    category: "Behind the Scenes",
    thumbnail: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2670",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description: "See what goes into preparing for a major festival performance",
    duration: "12:15",
    views: "5.1K",
    date: "2024-01-05",
  },
  {
    id: 4,
    title: "Interview with DJ Magazine",
    category: "Interviews",
    thumbnail: "https://images.unsplash.com/photo-1603048588665-791ca8aea616?q=80&w=2670",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description: "Exclusive interview discussing the journey and future plans",
    duration: "28:45",
    views: "15.3K",
    date: "2023-12-20",
  },
  {
    id: 5,
    title: "Club Night Mix - Ministry of Sound",
    category: "Clubs",
    thumbnail: "https://images.unsplash.com/photo-1539375665275-f9de415ef9ac?q=80&w=2676",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description: "High-energy set from Ministry of Sound residency",
    duration: "1:15:20",
    views: "22.8K",
    date: "2023-12-15",
  },
  {
    id: 6,
    title: "Festival Performance - Summer Vibes 2023",
    category: "Festivals",
    thumbnail: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=2670",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description: "Sunset set from Summer Vibes festival",
    duration: "1:30:00",
    views: "18.7K",
    date: "2023-11-30",
  },
];

export default function VideoGallery() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedVideo, setSelectedVideo] = useState<typeof videos[0] | null>(null);

  const filteredVideos = activeCategory === "All"
    ? videos
    : videos.filter(v => v.category === activeCategory);

  return (
    <>
      <MetaTagsComponent
        title="Video Gallery | DJ Danny Hectic B"
        description="Watch live sets, mixes, interviews, and behind-the-scenes content from DJ Danny Hectic B."
        url="/videos"
      />
      <div className="min-h-screen bg-background text-foreground pt-14">
        {/* Hero Section */}
        <section className="border-b border-foreground px-4 py-12 md:py-20">
          <div className="container max-w-6xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-black uppercase mb-6 tracking-tighter">
              Video Gallery
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Watch live sets, exclusive mixes, interviews, and behind-the-scenes content.
            </p>
          </div>
        </section>

        {/* Category Filter */}
        <section className="sticky top-14 z-40 bg-background border-b border-foreground px-4 py-4">
          <div className="container max-w-6xl mx-auto">
            <div className="flex flex-wrap gap-2">
              {videoCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "px-4 py-2 uppercase font-bold text-sm tracking-wider transition-colors",
                    activeCategory === cat
                      ? "bg-foreground text-background"
                      : "bg-transparent border border-foreground hover:bg-foreground hover:text-background"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Video Grid */}
        <section className="py-12 md:py-20 px-4">
          <div className="container max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map((video) => (
                <Card
                  key={video.id}
                  className="group cursor-pointer overflow-hidden hover:scale-[1.02] transition-transform"
                  onClick={() => setSelectedVideo(video)}
                >
                  <div className="relative aspect-video bg-black">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Play className="w-16 h-16 text-white opacity-80 group-hover:opacity-100" />
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 text-xs font-bold text-white">
                      {video.duration}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-lg line-clamp-2">{video.title}</h3>
                      <Youtube className="w-5 h-5 text-red-500 flex-shrink-0" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {video.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{video.views} views</span>
                      <span>{new Date(video.date).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Video Modal */}
        {selectedVideo && (
          <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedVideo(null)}
          >
            <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
              <div className="bg-background rounded-lg overflow-hidden">
                <div className="aspect-video bg-black">
                  <ReactPlayer
                    url={selectedVideo.youtubeUrl}
                    width="100%"
                    height="100%"
                    controls
                    playing
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">{selectedVideo.title}</h2>
                      <p className="text-muted-foreground">{selectedVideo.description}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(selectedVideo.youtubeUrl, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Watch on YouTube
                    </Button>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{selectedVideo.views} views</span>
                    <span>•</span>
                    <span>{new Date(selectedVideo.date).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{selectedVideo.duration}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

