"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PriceChart } from "@/components/PriceChart";
import { TradeModal } from "@/components/TradeModal";
import type { Market, MarketPriceHistory } from "@/lib/db";
import { formatDistanceToNow } from "date-fns";

interface MarketDetailProps {
  market: Market;
  priceHistory: MarketPriceHistory[];
  onTrade: (side: "yes" | "no", amount: number) => Promise<void>;
}

export function MarketDetail({ market, priceHistory, onTrade }: MarketDetailProps) {
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [tradeSide, setTradeSide] = useState<"yes" | "no">("yes");

  const yesPrice = parseFloat(market.yesPrice);
  const noPrice = parseFloat(market.noPrice);

  const handleTradeClick = (side: "yes" | "no") => {
    setTradeSide(side);
    setTradeModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-4xl font-bold">{market.title}</h1>
          <Badge>{market.category}</Badge>
        </div>
        <p className="text-muted-foreground text-lg">{market.description}</p>
        <div className="mt-4 text-sm text-muted-foreground">
          Resolves {formatDistanceToNow(new Date(market.resolutionDate), { addSuffix: true })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-400">YES</CardTitle>
            <CardDescription>Current Price</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-400 mb-4">
              ${(yesPrice * 100).toFixed(2)}
            </div>
            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() => handleTradeClick("yes")}
            >
              Buy YES
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-red-400">NO</CardTitle>
            <CardDescription>Current Price</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-red-400 mb-4">
              ${(noPrice * 100).toFixed(2)}
            </div>
            <Button
              className="w-full bg-red-600 hover:bg-red-700"
              onClick={() => handleTradeClick("no")}
            >
              Buy NO
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Price History</CardTitle>
        </CardHeader>
        <CardContent>
          <PriceChart data={priceHistory} />
        </CardContent>
      </Card>

      <TradeModal
        market={market}
        side={tradeSide}
        open={tradeModalOpen}
        onOpenChange={setTradeModalOpen}
        onTrade={onTrade}
      />
    </div>
  );
}

