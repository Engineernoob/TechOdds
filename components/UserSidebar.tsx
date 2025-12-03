"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";

export function UserSidebar() {
  // TODO: Connect to actual user data
  const balance = 1000;
  const isAuthenticated = false;

  return (
    <div className="w-64 border-l border-border bg-card p-4">
      {isAuthenticated ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${balance.toFixed(2)}</div>
            </CardContent>
          </Card>
          <div className="mt-4">
            <div className="text-xs text-muted-foreground mb-2">Trending Markets</div>
            <div className="space-y-2">
              <div className="text-sm">No trending markets yet</div>
            </div>
          </div>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Sign In</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

