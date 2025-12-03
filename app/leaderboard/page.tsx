"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal } from "lucide-react";
import { getRankColor } from "@/lib/ranking";
import type { RankTier } from "@/lib/ranking";

interface LeaderboardEntry {
  userId: string;
  season: string;
  xp: number;
  rank: RankTier;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch("/api/leaderboard?limit=100");
        if (res.ok) {
          const data = await res.json();
          setLeaderboard(data);
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, []);

  const getRankIcon = (position: number) => {
    if (position === 1) return <Trophy className="h-6 w-6 text-yellow-400" />;
    if (position === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (position === 3) return <Medal className="h-6 w-6 text-orange-400" />;
    return null;
  };

  if (loading) {
    return <div className="text-center py-12">Loading leaderboard...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">Leaderboard</h1>

      <Card>
        <CardHeader>
          <CardTitle>Top Traders</CardTitle>
        </CardHeader>
        <CardContent>
          {leaderboard.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No entries yet</div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.userId}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 text-center font-bold">
                      {getRankIcon(index + 1) || `#${index + 1}`}
                    </div>
                    <div>
                      <div className="font-medium">User {entry.userId.slice(0, 8)}</div>
                      <div className="text-sm text-muted-foreground">Season {entry.season}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-bold">{entry.xp.toFixed(0)} XP</div>
                      <Badge
                        style={{
                          backgroundColor: getRankColor(entry.rank),
                          color: "white",
                        }}
                      >
                        {entry.rank}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

