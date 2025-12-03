"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MarketCard } from "@/components/MarketCard";
import type { Market } from "@/lib/db";

interface Collection {
  id: string;
  title: string;
  description: string;
}

export default function CollectionPage() {
  const params = useParams();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCollection() {
      try {
        const [collectionRes, marketsRes] = await Promise.all([
          fetch(`/api/collections/${params.id}`),
          fetch(`/api/collections/${params.id}/markets`),
        ]);

        if (collectionRes.ok) {
          const collectionData = await collectionRes.json();
          setCollection(collectionData);
        }

        if (marketsRes.ok) {
          const marketsData = await marketsRes.json();
          setMarkets(marketsData);
        }
      } catch (error) {
        console.error("Error fetching collection:", error);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchCollection();
    }
  }, [params.id]);

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!collection) {
    return <div className="text-center py-12">Collection not found</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{collection.title}</CardTitle>
          <CardDescription>{collection.description || "No description"}</CardDescription>
        </CardHeader>
      </Card>

      <div>
        <h2 className="text-2xl font-bold mb-4">Markets ({markets.length})</h2>
        {markets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No markets in this collection</div>
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

