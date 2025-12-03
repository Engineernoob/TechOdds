"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Market } from "@/lib/db";
import { formatDistanceToNow } from "date-fns";

interface MarketCardProps {
  market: Market;
}

const categoryColors: Record<string, string> = {
  macro: "bg-blue-500/20 text-blue-400",
  company: "bg-green-500/20 text-green-400",
  applicant: "bg-purple-500/20 text-purple-400",
  industry: "bg-orange-500/20 text-orange-400",
};

export function MarketCard({ market }: MarketCardProps) {
  const yesPrice = parseFloat(market.yesPrice);
  const noPrice = parseFloat(market.noPrice);
  const categoryColor = categoryColors[market.category] || "bg-gray-500/20 text-gray-400";

  return (
    <Link href={`/markets/${market.id}`}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg line-clamp-2">{market.title}</CardTitle>
            <Badge className={categoryColor}>{market.category}</Badge>
          </div>
          <CardDescription className="line-clamp-2">{market.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <div className="text-sm text-muted-foreground mb-1">YES</div>
              <div className="text-2xl font-bold text-green-400">
                ${(yesPrice * 100).toFixed(2)}
              </div>
            </div>
            <div className="flex-1 text-right">
              <div className="text-sm text-muted-foreground mb-1">NO</div>
              <div className="text-2xl font-bold text-red-400">${(noPrice * 100).toFixed(2)}</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Resolves {formatDistanceToNow(new Date(market.resolutionDate), { addSuffix: true })}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

