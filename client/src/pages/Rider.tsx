import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Music, Lightbulb, Users, Coffee, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Rider() {
  const { data: items, isLoading } = trpc.rider.list.useQuery();

  const getIcon = (category: string) => {
    switch (category) {
      case "audio":
        return <Music className="w-5 h-5" />;
      case "lighting":
        return <Lightbulb className="w-5 h-5" />;
      case "stage":
        return <Users className="w-5 h-5" />;
      case "hospitality":
        return <Coffee className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="container py-12">
        <h1 className="text-4xl font-bold mb-8">Technical Rider</h1>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-6 w-1/3 mb-2" />
              <Skeleton className="h-4 w-full" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const groupedItems = items?.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Technical Rider</h1>
        <p className="text-muted-foreground">
          Technical requirements and specifications for bookings.
        </p>
      </div>

      <div className="space-y-8">
        {groupedItems &&
          Object.entries(groupedItems).map(([category, categoryItems]) => (
            <div key={category}>
              <h2 className="text-2xl font-semibold mb-4 capitalize flex items-center gap-2">
                {getIcon(category)}
                {category}
              </h2>
              <div className="space-y-3">
                {categoryItems.map((item) => (
                  <Card
                    key={item.id}
                    className={`p-4 ${
                      item.isRequired ? "border-l-4 border-l-orange-500" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{item.title}</h3>
                          {item.isRequired && (
                            <span className="text-xs bg-orange-500/20 text-orange-500 px-2 py-0.5 rounded">
                              Required
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
      </div>

      {(!items || items.length === 0) && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No rider information available yet.</p>
        </div>
      )}
    </div>
  );
}
