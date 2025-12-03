"use client";

import { useEffect, useState } from "react";
import { MarketCard } from "@/components/MarketCard";
import type { Market } from "@/lib/db";

export default function HomePage() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMarkets() {
      try {
        const res = await fetch("/api/markets");
        if (res.ok) {
          const data = await res.json();
          setMarkets(data);
        }
      } catch (error) {
        console.error("Error fetching markets:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMarkets();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading markets...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">TechOdds</h1>
        <p className="text-muted-foreground">
          Predict tech job outcomes, hiring trends, and market signals
        </p>
      </div>

      {markets.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No markets available yet. Create one in the admin panel!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {markets.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))}
        </div>
      )}
    </div>
  );
}
