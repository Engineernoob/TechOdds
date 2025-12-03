"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MarketCard } from "@/components/MarketCard";
import { User } from "lucide-react";
import type { Market } from "@/lib/db";

interface Influencer {
  id: string;
  handle: string;
  description: string;
  avatarUrl?: string;
}

export default function InfluencerPage() {
  const params = useParams();
  const [influencer, setInfluencer] = useState<Influencer | null>(null);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInfluencer() {
      try {
        const res = await fetch(`/api/influencers/${params.handle}`);
        if (res.ok) {
          const data = await res.json();
          setInfluencer(data.influencer);
          setMarkets(data.markets || []);
        }
      } catch (error) {
        console.error("Error fetching influencer:", error);
      } finally {
        setLoading(false);
      }
    }

    if (params.handle) {
      fetchInfluencer();
    }
  }, [params.handle]);

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!influencer) {
    return <div className="text-center py-12">Influencer not found</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            {influencer.avatarUrl ? (
              <img
                src={influencer.avatarUrl}
                alt={influencer.handle}
                className="w-20 h-20 rounded-full"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="h-10 w-10 text-primary" />
              </div>
            )}
            <div>
              <CardTitle>@{influencer.handle}</CardTitle>
              <CardDescription>{influencer.description || "Influencer"}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div>
        <h2 className="text-2xl font-bold mb-4">Markets</h2>
        {markets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No markets yet</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {markets.map((market) => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

