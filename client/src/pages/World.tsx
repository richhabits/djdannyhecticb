/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 * 
 * This is proprietary software. Reverse engineering, decompilation, or 
 * disassembly is strictly prohibited and may result in legal action.
 */


/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { MetaTagsComponent } from "@/components/MetaTags";
import { Users, MapPin } from "lucide-react";

export default function World() {
  const { data: avatars } = trpc.genz.world.listOnline.useQuery();

  return (
    <>
      <MetaTagsComponent
        title="Hectic World - 3D Metaverse"
        description="Enter the Hectic World - a 3D metaverse where fans connect, explore, and vibe together"
        url="/world"
      />
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Hectic World</h1>
          <p className="text-muted-foreground">Enter the 3D metaverse where Hectic fans connect and explore</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Online Now ({avatars?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {avatars && avatars.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {avatars.map((avatar) => (
                  <div key={avatar.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-lg">👤</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">User #{avatar.profileId}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        ({avatar.positionX}, {avatar.positionY})
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500">
                      Online
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No one online right now. Be the first to enter!</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="h-64 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg mb-6 flex items-center justify-center">
                <span className="text-6xl">🌍</span>
              </div>
              <h2 className="text-2xl font-bold mb-4">3D World Coming Soon</h2>
              <p className="text-muted-foreground mb-6">
                We're building an immersive 3D world where you can create your avatar, explore spaces, and connect with other Hectic fans in real-time.
              </p>
              <p className="text-sm text-muted-foreground">
                Features coming: Custom avatars, interactive spaces, live events, collectibles, and more!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

