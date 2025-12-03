"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import type { Market } from "@/lib/db";

interface ResolverMarket {
  id: string;
  marketId: string;
  status: string;
  market: Market;
}

export default function ResolverPage() {
  const [markets, setMarkets] = useState<ResolverMarket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResolverMarkets() {
      try {
        // TODO: Get actual user ID from auth
        const userId = "00000000-0000-0000-0000-000000000000";

        // TODO: Fetch markets assigned to this resolver
        // For now, show empty state
        setMarkets([]);
      } catch (error) {
        console.error("Error fetching resolver markets:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchResolverMarkets();
  }, []);

  const handleResolve = async (marketId: string, outcome: "yes" | "no") => {
    // TODO: Implement resolution logic
    console.log("Resolve market", marketId, outcome);
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">Resolver Dashboard</h1>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Markets</CardTitle>
          <CardDescription>Markets you are responsible for resolving</CardDescription>
        </CardHeader>
        <CardContent>
          {markets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No markets assigned to you yet
            </div>
          ) : (
            <div className="space-y-4">
              {markets.map((resolverMarket) => (
                <div
                  key={resolverMarket.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <Link href={`/markets/${resolverMarket.marketId}`}>
                      <div className="font-medium hover:text-primary">
                        {resolverMarket.market.title}
                      </div>
                    </Link>
                    <div className="text-sm text-muted-foreground">
                      Status: <Badge>{resolverMarket.status}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleResolve(resolverMarket.marketId, "yes")}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Resolve YES
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleResolve(resolverMarket.marketId, "no")}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Resolve NO
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

