"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import {
  TrendingUp,
  MessageSquare,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from "lucide-react";

interface ActivityFeedItem {
  id: string;
  userId: string;
  type: string;
  metadata: any;
  createdAt: string;
}

export default function FeedPage() {
  const [feed, setFeed] = useState<ActivityFeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeed() {
      try {
        const res = await fetch("/api/feed?limit=50");
        if (res.ok) {
          const data = await res.json();
          setFeed(data);
        }
      } catch (error) {
        console.error("Error fetching feed:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchFeed();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "trade":
        return <TrendingUp className="h-4 w-4" />;
      case "comment":
        return <MessageSquare className="h-4 w-4" />;
      case "liquidity":
        return <DollarSign className="h-4 w-4" />;
      case "resolution":
        return <CheckCircle className="h-4 w-4" />;
      case "dispute":
        return <AlertCircle className="h-4 w-4" />;
      case "future-created":
        return <Sparkles className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getActivityText = (item: ActivityFeedItem) => {
    const metadata = item.metadata || {};
    switch (item.type) {
      case "trade":
        return `User ${item.userId.slice(0, 8)} placed a ${metadata.side?.toUpperCase()} trade`;
      case "comment":
        return `User ${item.userId.slice(0, 8)} commented: "${metadata.text}"`;
      case "liquidity":
        return `User ${item.userId.slice(0, 8)} added liquidity`;
      case "resolution":
        return `Market resolved: ${metadata.outcome?.toUpperCase()}`;
      case "dispute":
        return `Dispute raised on market`;
      case "future-created":
        return `New applicant future created`;
      default:
        return "Activity";
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading feed...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">Activity Feed</h1>

      {feed.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No activity yet</div>
      ) : (
        <div className="space-y-4">
          {feed.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1">{getActivityIcon(item.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{item.type}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm">{getActivityText(item)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

