/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HecticFeed } from "@/components/HecticFeed";
import { MetaTagsComponent } from "@/components/MetaTags";
import { Link } from "wouter";
import { Crown, Lock, Sparkles } from "lucide-react";

export default function VIP() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <MetaTagsComponent
        title="VIP Area | Danny Hectic B Universe"
        description="Exclusive VIP content, behind-the-scenes posts, and premium AI Danny access."
        url="/vip"
      />
      <div className="min-h-screen bg-background text-foreground">
        <div className="container py-8 px-4">
          {!isAuthenticated ? (
            <Card className="glass max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-3xl flex items-center gap-2">
                  <Crown className="w-8 h-8 text-accent" />
                  VIP Member Area
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-4">
                  <Lock className="w-16 h-16 mx-auto text-muted-foreground" />
                  <p className="text-lg">
                    This area is exclusive to VIP members.
                  </p>
                  <p className="text-muted-foreground">
                    Sign in to access exclusive content, behind-the-scenes posts, and premium AI Danny features.
                  </p>
                  <div className="flex gap-4 justify-center pt-4">
                    <Link href="/login">
                      <Button className="gradient-bg">Sign In</Button>
                    </Link>
                    <Link href="/">
                      <Button variant="outline">Go Home</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              <div className="text-center">
                <h1 className="text-4xl font-bold mb-2 gradient-text flex items-center justify-center gap-3">
                  <Crown className="w-8 h-8" />
                  VIP Member Area
                </h1>
                <p className="text-muted-foreground">
                  Welcome to the exclusive VIP zone. You're locked in!
                </p>
              </div>

              {/* VIP Feed */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-accent" />
                  <h2 className="text-2xl font-bold">Exclusive Feed</h2>
                </div>
                <HecticFeed includeVip={true} />
              </div>

              {/* VIP Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Premium AI Danny</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Access AI Danny with enhanced memory and personalized responses.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      AI Danny remembers your preferences and can give you personalized recommendations.
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Special Shout Access</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Your shouts get priority in the queue and special badges.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      VIP members' shouts are highlighted and processed faster.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

