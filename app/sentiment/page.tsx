"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import type { SentimentMetrics } from "@/lib/sentiment";

export default function SentimentPage() {
  const [metrics, setMetrics] = useState<SentimentMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSentiment() {
      try {
        const res = await fetch("/api/sentiment?days=7");
        if (res.ok) {
          const data = await res.json();
          setMetrics(data);
        }
      } catch (error) {
        console.error("Error fetching sentiment:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSentiment();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading sentiment data...</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No sentiment data available</p>
      </div>
    );
  }

  const categoryData = Object.entries(metrics.categoryMetrics).map(([category, data]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    optimism: data.optimism * 100,
    volume: data.volume,
    markets: data.markets,
  }));

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Job Market Sentiment</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Overall Optimism</CardTitle>
            <CardDescription>Weighted average of YES prices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-2">
              {(metrics.overallOptimism * 100).toFixed(1)}%
            </div>
            <div className="w-full bg-muted h-4 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full"
                style={{ width: `${metrics.overallOptimism * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Market Volatility</CardTitle>
            <CardDescription>Average price change magnitude</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {(metrics.volatility * 100).toFixed(2)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="optimism" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trending Markets</CardTitle>
          <CardDescription>Markets with largest recent price movements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.trendingMarkets.map((market) => (
              <div
                key={market.marketId}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <div className="font-medium">{market.title}</div>
                  <div className="text-sm text-muted-foreground">
                    Volume: ${market.volume.toFixed(2)}
                  </div>
                </div>
                <div
                  className={`text-lg font-bold ${
                    market.priceChange > 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {market.priceChange > 0 ? "+" : ""}
                  {(market.priceChange * 100).toFixed(2)}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

