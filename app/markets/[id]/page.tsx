"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MarketDetail } from "@/components/MarketDetail";
import { LiquidityPoolCard } from "@/components/v3/LiquidityPoolCard";
import { AIFairValuePanel } from "@/components/v3/AIFairValuePanel";
import { CommentThread } from "@/components/v3/CommentThread";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Market, MarketPriceHistory } from "@/lib/db";
import type { FairValueEstimate } from "@/lib/ai/calibration";

export default function MarketPage() {
  const params = useParams();
  const router = useRouter();
  const [market, setMarket] = useState<Market | null>(null);
  const [priceHistory, setPriceHistory] = useState<MarketPriceHistory[]>([]);
  const [aiInsight, setAiInsight] = useState<any>(null);
  const [fairValue, setFairValue] = useState<FairValueEstimate | null>(null);
  const [liquidityPool, setLiquidityPool] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAIInsight, setShowAIInsight] = useState(false);

  useEffect(() => {
    async function fetchMarket() {
      try {
        const res = await fetch(`/api/market/${params.id}`);
        if (!res.ok) {
          throw new Error("Market not found");
        }
        const data = await res.json();
        setMarket(data.market);
        setPriceHistory(data.priceHistory || []);

        // Fetch AI insight
        try {
          const [aiRes, fairValueRes] = await Promise.all([
            fetch("/api/ai/suggest-trade", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ marketId: params.id }),
            }),
            fetch("/api/ai/calibrate-market", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ marketId: params.id }),
            }),
          ]);

          if (aiRes.ok) {
            const aiData = await aiRes.json();
            setAiInsight(aiData);
          }

          if (fairValueRes.ok) {
            const fairValueData = await fairValueRes.json();
            setFairValue(fairValueData);
          }
        } catch (error) {
          console.error("Error fetching AI data:", error);
        }

        // Fetch liquidity pool
        try {
          const poolRes = await fetch(`/api/liquidity/pool?marketId=${params.id}`);
          if (poolRes.ok) {
            const poolData = await poolRes.json();
            setLiquidityPool(poolData);
          }
        } catch (error) {
          console.error("Error fetching liquidity pool:", error);
        }
      } catch (error) {
        console.error("Error fetching market:", error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchMarket();
    }
  }, [params.id, router]);

  const handleTrade = async (side: "yes" | "no", amount: number) => {
    if (!market) return;

    // TODO: Get actual user ID from auth
    const userId = "00000000-0000-0000-0000-000000000000"; // Placeholder

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

    // Refresh market data
    const marketRes = await fetch(`/api/market/${params.id}`);
    if (marketRes.ok) {
      const data = await marketRes.json();
      setMarket(data.market);
      setPriceHistory(data.priceHistory || []);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!market) {
    return <div className="text-center py-12">Market not found</div>;
  }

  const handleAddLiquidity = () => {
    // TODO: Open liquidity modal
    console.log("Add liquidity");
  };

  const handleRemoveLiquidity = () => {
    // TODO: Open remove liquidity modal
    console.log("Remove liquidity");
  };

  return (
    <div className="space-y-6">
      <MarketDetail market={market} priceHistory={priceHistory} onTrade={handleTrade} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {fairValue && (
          <AIFairValuePanel
            estimate={fairValue}
            currentYesPrice={parseFloat(market.yesPrice)}
          />
        )}

        {liquidityPool && (
          <LiquidityPoolCard
            pool={{
              yesLiquidity: parseFloat(liquidityPool.yesLiquidity),
              noLiquidity: parseFloat(liquidityPool.noLiquidity),
              totalFees: parseFloat(liquidityPool.totalFees),
            }}
            marketId={market.id}
            onAddLiquidity={handleAddLiquidity}
            onRemoveLiquidity={handleRemoveLiquidity}
          />
        )}
      </div>

      {aiInsight && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>AI Trade Recommendation</CardTitle>
              <Badge variant="outline">Beta</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm">{aiInsight.strategy}</p>
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-xs text-muted-foreground">Confidence</div>
                  <div className="text-lg font-bold">
                    {(aiInsight.confidence * 100).toFixed(0)}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Recommended</div>
                  <Badge
                    variant={
                      aiInsight.recommendedSide === "yes"
                        ? "default"
                        : aiInsight.recommendedSide === "no"
                        ? "destructive"
                        : "outline"
                    }
                  >
                    {aiInsight.recommendedSide.toUpperCase()}
                  </Badge>
                </div>
              </div>
              {aiInsight.reasoning && (
                <div>
                  <div className="text-xs text-muted-foreground mb-2">Reasoning</div>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {aiInsight.reasoning.map((r: string, i: number) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <CommentThread marketId={market.id} userId="00000000-0000-0000-0000-000000000000" />
    </div>
  );
}

