"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { User } from "lucide-react";

interface Influencer {
  id: string;
  handle: string;
  description: string;
  avatarUrl?: string;
}

export default function InfluencersPage() {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInfluencers() {
      try {
        // TODO: Create API route for influencers
        // For now, mock data
        setInfluencers([]);
      } catch (error) {
        console.error("Error fetching influencers:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchInfluencers();
  }, []);

  if (loading) {
    return <div className="text-center py-12">Loading influencers...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">Influencers</h1>

      {influencers.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No influencers yet. Become one by creating markets!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {influencers.map((influencer) => (
            <Link key={influencer.id} href={`/influencers/${influencer.handle}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    {influencer.avatarUrl ? (
                      <img
                        src={influencer.avatarUrl}
                        alt={influencer.handle}
                        className="w-16 h-16 rounded-full"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="h-8 w-8 text-primary" />
                      </div>
                    )}
                    <div>
                      <CardTitle>@{influencer.handle}</CardTitle>
                      <CardDescription>{influencer.description || "Influencer"}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

