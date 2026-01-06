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
import { Link } from "wouter";
import { Coins, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { MetaTagsComponent } from "@/components/MetaTags";

export default function Wallet() {
  const { user, isAuthenticated } = useAuth();
  const { data: wallet } = trpc.economy.wallet.getMyWallet.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: transactions } = trpc.economy.wallet.getTransactions.useQuery(
    { limit: 20 },
    { enabled: isAuthenticated }
  );

  if (!isAuthenticated) {
    return (
      <>
        <MetaTagsComponent
          title="HecticCoins Wallet - DJ Danny Hectic B"
          description="Manage your HecticCoins wallet and view transaction history"
          url="/wallet"
        />
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="p-6 text-center">
              <p>Please log in to view your wallet.</p>
              <Link href="/login">
                <Button className="mt-4">Log In</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <MetaTagsComponent
        title="HecticCoins Wallet - DJ Danny Hectic B"
        description="Manage your HecticCoins wallet and view transaction history"
        url="/wallet"
      />
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">HecticCoins Wallet</h1>
          <p className="text-muted-foreground">Your digital currency for the Hectic ecosystem</p>
        </div>

        {/* Balance Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-4">{wallet?.balanceCoins || 0} HecticCoins</div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Lifetime Earned</p>
                <p className="text-lg font-semibold text-green-600">{wallet?.lifetimeCoinsEarned || 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Lifetime Spent</p>
                <p className="text-lg font-semibold text-orange-600">{wallet?.lifetimeCoinsSpent || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 mb-6">
          <Link href="/rewards">
            <Button>
              Redeem Rewards
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/listeners">
            <Button variant="outline">How to Earn More</Button>
          </Link>
        </div>

        {/* Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions && transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {tx.type === "earn" ? (
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-orange-500" />
                      )}
                      <div>
                        <p className="font-medium">{tx.description || tx.source}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(tx.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={tx.type === "earn" ? "default" : "secondary"}>
                        {tx.type === "earn" ? "+" : ""}{tx.amount}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No transactions yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

