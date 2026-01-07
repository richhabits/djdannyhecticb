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

import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Gift, Coins, CheckCircle } from "lucide-react";
import { MetaTagsComponent } from "@/components/MetaTags";
import { useState } from "react";

export default function Rewards() {
  const { user, isAuthenticated } = useAuth();
  const { data: rewards } = trpc.economy.rewards.listActive.useQuery();
  const { data: wallet } = trpc.economy.wallet.getMyWallet.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: myRedemptions } = trpc.economy.redemptions.myRedemptions.useQuery(
    { limit: 50 },
    { enabled: isAuthenticated }
  );

  const createRedemption = trpc.economy.redemptions.create.useMutation({
    onSuccess: () => {
      toast.success("Reward redeemed! Check your redemptions for status.");
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to redeem reward";
      toast.error(message);
    },
  });

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      digital: "bg-orange-100 text-orange-800",
      physical: "bg-orange-100 text-orange-800",
      access: "bg-green-100 text-green-800",
      aiAsset: "bg-amber-100 text-amber-800",
      other: "bg-gray-100 text-gray-800",
    };
    return colors[type] || colors.other;
  };

  const canAfford = (cost: number) => {
    if (!wallet) return false;
    return wallet.balanceCoins >= cost;
  };

  const isRedeemed = (rewardId: number) => {
    if (!myRedemptions) return false;
    return myRedemptions.some((r) => r.rewardId === rewardId && r.status !== "rejected");
  };

  return (
    <>
      <MetaTagsComponent
        title="Rewards - Redeem Your HecticCoins"
        description="Redeem your HecticCoins for exclusive rewards"
        url="/rewards"
      />
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Rewards</h1>
          <p className="text-muted-foreground">Redeem your HecticCoins for exclusive rewards</p>
          {isAuthenticated && wallet && (
            <p className="mt-2 text-sm">
              Your balance: <span className="font-semibold">{wallet.balanceCoins} HecticCoins</span>
            </p>
          )}
        </div>

        {rewards && rewards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map((reward) => {
              const affordable = canAfford(reward.costCoins);
              const redeemed = isRedeemed(reward.id);

              return (
                <Card key={reward.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-lg">{reward.name}</CardTitle>
                      <Badge className={getTypeBadge(reward.type)}>{reward.type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{reward.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Coins className="h-4 w-4" />
                        <span className="font-semibold">{reward.costCoins}</span>
                      </div>
                      {isAuthenticated ? (
                        redeemed ? (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Redeemed
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            disabled={!affordable || createRedemption.isPending}
                            onClick={() => createRedemption.mutate({ rewardId: reward.id })}
                          >
                            <Gift className="h-4 w-4 mr-1" />
                            Redeem
                          </Button>
                        )
                      ) : (
                        <Button size="sm" variant="outline" disabled>
                          Log in to redeem
                        </Button>
                      )}
                    </div>
                    {isAuthenticated && !affordable && !redeemed && (
                      <p className="text-xs text-red-500 mt-2">Insufficient coins</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No rewards available at the moment
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

