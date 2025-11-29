import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { MetaTagsComponent } from "@/components/MetaTags";
import { Trophy, Sparkles, Star } from "lucide-react";
import { useState } from "react";

const currentProfileId = 1; // TODO: Get from auth

export default function Vault() {
  const { data: collectibles } = trpc.genz.collectibles.getUserCollectibles.useQuery(
    { profileId: currentProfileId },
    { enabled: !!currentProfileId }
  );

  const { data: achievements } = trpc.genz.achievements.getUserAchievements.useQuery(
    { profileId: currentProfileId },
    { enabled: !!currentProfileId }
  );

  const { data: allCollectibles } = trpc.genz.collectibles.list.useQuery({ activeOnly: true });
  const { data: allAchievements } = trpc.genz.achievements.list.useQuery({ activeOnly: true });

  const ownedCollectibleIds = new Set(collectibles?.map((c) => c.collectibleId) || []);
  const unlockedAchievementIds = new Set(achievements?.map((a) => a.achievementId) || []);

  return (
    <>
      <MetaTagsComponent
        title="Hectic Vault - Collectibles & Achievements"
        description="View your collectibles, achievements, and unlockables in the Hectic Vault"
        url="/vault"
      />
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Hectic Vault</h1>
          <p className="text-muted-foreground">Your collectibles, achievements, and unlockables</p>
        </div>

        <Tabs defaultValue="collectibles" className="space-y-6">
          <TabsList>
            <TabsTrigger value="collectibles" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Collectibles
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Achievements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="collectibles" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allCollectibles?.map((collectible) => {
                const isOwned = ownedCollectibleIds.has(collectible.id);
                return (
                  <Card key={collectible.id} className={isOwned ? "" : "opacity-50"}>
                    <CardContent className="p-6">
                      <div className="aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center">
                        {collectible.imageUrl ? (
                          <img src={collectible.imageUrl} alt={collectible.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <span className="text-4xl">🎁</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{collectible.name}</h3>
                        <Badge variant={collectible.rarity === "legendary" ? "default" : "outline"}>
                          {collectible.rarity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{collectible.description}</p>
                      {isOwned && (
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500">
                          Owned
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            {collectibles && collectibles.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No collectibles yet. Keep engaging to unlock rare items!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allAchievements?.map((achievement) => {
                const isUnlocked = unlockedAchievementIds.has(achievement.id);
                return (
                  <Card key={achievement.id} className={isUnlocked ? "" : "opacity-50"}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        {achievement.iconUrl ? (
                          <img src={achievement.iconUrl} alt={achievement.name} className="w-16 h-16" />
                        ) : (
                          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                            <Trophy className="h-8 w-8" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold">{achievement.name}</h3>
                          <Badge variant={achievement.rarity === "legendary" ? "default" : "outline"}>
                            {achievement.rarity}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">+{achievement.pointsReward} points</span>
                        {isUnlocked && (
                          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500">
                            Unlocked
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            {achievements && achievements.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No achievements yet. Complete missions to unlock achievements!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

