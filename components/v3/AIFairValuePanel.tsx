"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { FairValueEstimate } from "@/lib/ai/calibration";

interface AIFairValuePanelProps {
  estimate: FairValueEstimate;
  currentYesPrice: number;
}

export function AIFairValuePanel({ estimate, currentYesPrice }: AIFairValuePanelProps) {
  const deviationPercent = estimate.deviation * 100;
  const isOverpriced = estimate.fairYesPrice < currentYesPrice;
  const isUnderpriced = estimate.fairYesPrice > currentYesPrice;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          AI Fair Value Estimate
          <Badge variant="outline" className="text-xs">Beta</Badge>
        </CardTitle>
        <CardDescription>Machine learning-based price calibration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Fair Value</div>
            <div className="text-2xl font-bold">
              ${(estimate.fairYesPrice * 100).toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Current Price</div>
            <div className="text-2xl font-bold">${(currentYesPrice * 100).toFixed(2)}</div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Deviation</span>
            <Badge
              variant={isOverpriced ? "destructive" : isUnderpriced ? "default" : "outline"}
            >
              {deviationPercent > 0 ? "+" : ""}
              {deviationPercent.toFixed(2)}%
            </Badge>
          </div>
          <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                isOverpriced ? "bg-red-400" : isUnderpriced ? "bg-green-400" : "bg-muted-foreground"
              }`}
              style={{
                width: `${Math.min(100, Math.abs(deviationPercent) * 10)}%`,
                marginLeft: isOverpriced ? "auto" : "0",
              }}
            />
          </div>
        </div>

        <div>
          <div className="text-sm text-muted-foreground mb-2">Confidence</div>
          <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full transition-all"
              style={{ width: `${estimate.confidence * 100}%` }}
            />
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {(estimate.confidence * 100).toFixed(0)}% confidence
          </div>
        </div>

        <div>
          <div className="text-sm font-medium mb-2">Suggested Position</div>
          <div className="flex items-center gap-2">
            {estimate.suggestedPosition === "yes" && (
              <>
                <TrendingUp className="h-4 w-4 text-green-400" />
                <Badge className="bg-green-600">Buy YES</Badge>
              </>
            )}
            {estimate.suggestedPosition === "no" && (
              <>
                <TrendingDown className="h-4 w-4 text-red-400" />
                <Badge className="bg-red-600">Buy NO</Badge>
              </>
            )}
            {estimate.suggestedPosition === "neutral" && (
              <>
                <Minus className="h-4 w-4 text-muted-foreground" />
                <Badge variant="outline">Neutral</Badge>
              </>
            )}
          </div>
        </div>

        {estimate.reasoning.length > 0 && (
          <div>
            <div className="text-sm font-medium mb-2">Reasoning</div>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              {estimate.reasoning.map((reason, i) => (
                <li key={i}>{reason}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

