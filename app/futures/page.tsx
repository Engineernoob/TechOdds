"use client";

import { useEffect, useState } from "react";
import { FutureCard } from "@/components/FutureCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { Market } from "@/lib/db";

interface Future {
  id: string;
  title: string;
  description: string;
  anon: boolean;
  targetDate: string;
  marketId: string;
}

export default function FuturesPage() {
  const [futures, setFutures] = useState<Future[]>([]);
  const [markets, setMarkets] = useState<Record<string, Market>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    async function fetchFutures() {
      try {
        const filterParam = filter !== "all" ? `&filter=${filter}` : "";
        const res = await fetch(`/api/futures?${filterParam}`);
        if (res.ok) {
          const data = await res.json();
          setFutures(data);

          // Fetch markets for each future
          const marketPromises = data.map((future: Future) =>
            fetch(`/api/market/${future.marketId}`).then((r) => r.json())
          );
          const marketData = await Promise.all(marketPromises);
          const marketMap: Record<string, Market> = {};
          marketData.forEach((m: { market: Market }) => {
            if (m.market) {
              marketMap[m.market.id] = m.market;
            }
          });
          setMarkets(marketMap);
        }
      } catch (error) {
        console.error("Error fetching futures:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchFutures();
  }, [filter]);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Applicant Futures</h1>
          <p className="text-muted-foreground">
            Predict and bet on applicant outcomes and career milestones
          </p>
        </div>
        <Link href="/futures/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Future
          </Button>
        </Link>
      </div>

      <div className="mb-6 flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        <Button
          variant={filter === "active" ? "default" : "outline"}
          onClick={() => setFilter("active")}
        >
          Active
        </Button>
        <Button
          variant={filter === "anonymous" ? "default" : "outline"}
          onClick={() => setFilter("anonymous")}
        >
          Anonymous
        </Button>
        <Button
          variant={filter === "ending_soon" ? "default" : "outline"}
          onClick={() => setFilter("ending_soon")}
        >
          Ending Soon
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading futures...</p>
        </div>
      ) : futures.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No futures available yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {futures.map((future) => {
            const market = markets[future.marketId];
            if (!market) return null;
            return <FutureCard key={future.id} future={future} market={market} />;
          })}
        </div>
      )}
    </div>
  );
}

