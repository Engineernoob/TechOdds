"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus } from "lucide-react";

interface LiquidityPoolCardProps {
  pool: {
    yesLiquidity: number;
    noLiquidity: number;
    totalFees: number;
  };
  marketId: string;
  onAddLiquidity: () => void;
  onRemoveLiquidity: () => void;
}

export function LiquidityPoolCard({
  pool,
  marketId,
  onAddLiquidity,
  onRemoveLiquidity,
}: LiquidityPoolCardProps) {
  const totalLiquidity = pool.yesLiquidity + pool.noLiquidity;
  const yesPercentage = totalLiquidity > 0 ? (pool.yesLiquidity / totalLiquidity) * 100 : 50;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Liquidity Pool</CardTitle>
        <CardDescription>Provide liquidity and earn trading fees</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground mb-1">YES Liquidity</div>
            <div className="text-2xl font-bold">${pool.yesLiquidity.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">NO Liquidity</div>
            <div className="text-2xl font-bold">${pool.noLiquidity.toFixed(2)}</div>
          </div>
        </div>

        <div>
          <div className="text-sm text-muted-foreground mb-2">Total Fees Earned</div>
          <div className="text-xl font-semibold text-green-400">${pool.totalFees.toFixed(2)}</div>
        </div>

        <div>
          <div className="text-sm text-muted-foreground mb-2">Pool Balance</div>
          <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
            <div
              className="bg-green-400 h-full transition-all"
              style={{ width: `${yesPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>YES: {yesPercentage.toFixed(1)}%</span>
            <span>NO: {(100 - yesPercentage).toFixed(1)}%</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={onAddLiquidity} className="flex-1" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Liquidity
          </Button>
          <Button onClick={onRemoveLiquidity} className="flex-1" variant="outline">
            <Minus className="h-4 w-4 mr-2" />
            Remove
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

