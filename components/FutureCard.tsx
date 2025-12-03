"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Market } from "@/lib/db";
import { formatDistanceToNow } from "date-fns";
import { User, EyeOff } from "lucide-react";

interface FutureCardProps {
  future: {
    id: string;
    title: string;
    description: string;
    anon: boolean;
    targetDate: string;
    marketId: string;
  };
  market: Market;
}

export function FutureCard({ future, market }: FutureCardProps) {
  const yesPrice = parseFloat(market.yesPrice);
  const noPrice = parseFloat(market.noPrice);

  return (
    <Link href={`/futures/${future.id}`}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg line-clamp-2">{future.title}</CardTitle>
            <div className="flex gap-2">
              {future.anon && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <EyeOff className="h-3 w-3" />
                  Anonymous
                </Badge>
              )}
            </div>
          </div>
          <CardDescription className="line-clamp-2">{future.description}</CardDescription>
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
            Resolves {formatDistanceToNow(new Date(future.targetDate), { addSuffix: true })}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

