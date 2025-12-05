import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Trophy, Award, Star, Medal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function Achievements() {
  const { data: achievements, isLoading } = trpc.achievements.showcase.useQuery({
    featuredOnly: false,
  });

  const getIcon = (category: string) => {
    switch (category) {
      case "award":
        return <Award className="w-6 h-6" />;
      case "milestone":
        return <Trophy className="w-6 h-6" />;
      case "collaboration":
        return <Star className="w-6 h-6" />;
      case "recognition":
        return <Medal className="w-6 h-6" />;
      default:
        return <Trophy className="w-6 h-6" />;
    }
  };

  if (isLoading) {
    return (
      <div className="container py-12">
        <h1 className="text-4xl font-bold mb-8">Achievements & Recognition</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-12 w-12 mb-4" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const featured = achievements?.filter((a) => a.isFeatured) || [];
  const others = achievements?.filter((a) => !a.isFeatured) || [];

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Achievements & Recognition</h1>
        <p className="text-muted-foreground">
          Awards, milestones, and professional achievements.
        </p>
      </div>

      {featured.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Featured</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((achievement) => (
              <Card
                key={achievement.id}
                className="p-6 hover:shadow-lg transition-shadow border-2 border-purple-500/20"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    {getIcon(achievement.category)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{achievement.title}</h3>
                    {achievement.description && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {achievement.description}
                      </p>
                    )}
                    {achievement.year && (
                      <span className="text-xs text-muted-foreground">
                        {achievement.year}
                      </span>
                    )}
                  </div>
                </div>
                {achievement.imageUrl && (
                  <img
                    src={achievement.imageUrl}
                    alt={achievement.title}
                    className="mt-4 w-full h-32 object-cover rounded"
                  />
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {others.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-6">All Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {others.map((achievement) => (
              <Card key={achievement.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    {getIcon(achievement.category)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">{achievement.title}</h3>
                    {achievement.description && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {achievement.description}
                      </p>
                    )}
                    {achievement.year && (
                      <span className="text-xs text-muted-foreground">
                        {achievement.year}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {(!achievements || achievements.length === 0) && (
        <div className="text-center py-12 text-muted-foreground">
          <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No achievements to display yet.</p>
        </div>
      )}
    </div>
  );
}
