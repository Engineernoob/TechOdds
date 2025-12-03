"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MarketDetail } from "@/components/MarketDetail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Market, MarketPriceHistory } from "@/lib/db";
import { EyeOff, User } from "lucide-react";

interface Future {
  id: string;
  title: string;
  description: string;
  anon: boolean;
  targetDate: string;
  marketId: string;
  userId: string;
}

export default function FutureDetailPage() {
  const params = useParams();
  const [future, setFuture] = useState<Future | null>(null);
  const [market, setMarket] = useState<Market | null>(null);
  const [priceHistory, setPriceHistory] = useState<MarketPriceHistory[]>([]);
  const [relatedFutures, setRelatedFutures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFuture() {
      try {
        const res = await fetch(`/api/futures/${params.id}`);
        if (!res.ok) {
          throw new Error("Future not found");
        }
        const data = await res.json();
        setFuture(data.future);
        setMarket(data.market);
        setPriceHistory(data.priceHistory || []);
        setRelatedFutures(data.relatedFutures || []);
      } catch (error) {
        console.error("Error fetching future:", error);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchFuture();
    }
  }, [params.id]);

  const handleTrade = async (side: "yes" | "no", amount: number) => {
    if (!market) return;

    // TODO: Get actual user ID from auth
    const userId = "00000000-0000-0000-0000-000000000000";

    const res = await fetch("/api/market/buy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        marketId: market.id,
        side,
        amount,
        userId,
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Trade failed");
    }

    // Refresh data
    const futureRes = await fetch(`/api/futures/${params.id}`);
    if (futureRes.ok) {
      const data = await futureRes.json();
      setMarket(data.market);
      setPriceHistory(data.priceHistory || []);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!future || !market) {
    return <div className="text-center py-12">Future not found</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-4xl font-bold">{future.title}</h1>
          {future.anon ? (
            <Badge variant="outline" className="flex items-center gap-1">
              <EyeOff className="h-3 w-3" />
              Anonymous
            </Badge>
          ) : (
            <Badge variant="outline" className="flex items-center gap-1">
              <User className="h-3 w-3" />
              Public
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground text-lg">{future.description}</p>
      </div>

      <MarketDetail market={market} priceHistory={priceHistory} onTrade={handleTrade} />

      {relatedFutures.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Related Futures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {relatedFutures.map((rf) => (
                <div key={rf.id} className="p-3 border rounded-lg">
                  <div className="font-medium">{rf.title}</div>
                  <div className="text-sm text-muted-foreground">{rf.description}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

