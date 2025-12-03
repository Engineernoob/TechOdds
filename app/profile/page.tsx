"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { Trade, User } from "@/lib/db";
import Link from "next/link";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [futures, setFutures] = useState<any[]>([]);
  const [resumeAnalysis, setResumeAnalysis] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        // TODO: Get actual user ID from auth
        const userId = "00000000-0000-0000-0000-000000000000"; // Placeholder

        const [userRes, tradesRes, futuresRes] = await Promise.all([
          fetch(`/api/user/${userId}`),
          fetch(`/api/user/${userId}/trades`),
          fetch(`/api/futures?userId=${userId}`),
        ]);

        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);
        }

        if (tradesRes.ok) {
          const tradesData = await tradesRes.json();
          setTrades(tradesData);
        }

        if (futuresRes.ok) {
          const futuresData = await futuresRes.json();
          setFutures(futuresData);
        }

        // Mock resume analysis - in production, fetch from stored analysis
        setResumeAnalysis(0.42);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const futureOddsData = futures.map((f, i) => ({
    time: i,
    odds: Math.random() * 0.3 + 0.3, // Mock data
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${user ? parseFloat(user.balance).toFixed(2) : "0.00"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resume Hire Probability</CardTitle>
          </CardHeader>
          <CardContent>
            {resumeAnalysis !== null ? (
              <>
                <div className="text-3xl font-bold mb-2">
                  {(resumeAnalysis * 100).toFixed(1)}%
                </div>
                <Link href="/resume">
                  <Badge variant="outline">View Analysis</Badge>
                </Link>
              </>
            ) : (
              <Link href="/resume">
                <Badge>Analyze Resume</Badge>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Futures</CardTitle>
          <CardDescription>Markets you created</CardDescription>
        </CardHeader>
        <CardContent>
          {futures.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">No futures created yet</p>
              <Link href="/futures/create">
                <Badge>Create Future</Badge>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {futures.slice(0, 5).map((future) => (
                <Link
                  key={future.id}
                  href={`/futures/${future.id}`}
                  className="block p-3 border rounded-lg hover:bg-accent"
                >
                  <div className="font-medium">{future.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(future.targetDate).toLocaleDateString()}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Future Odds Trendline</CardTitle>
        </CardHeader>
        <CardContent>
          {futureOddsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={futureOddsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis domain={[0, 1]} />
                <Tooltip />
                <Line type="monotone" dataKey="odds" stroke="hsl(var(--primary))" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No futures data to display
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trade History</CardTitle>
        </CardHeader>
        <CardContent>
          {trades.length === 0 ? (
            <p className="text-muted-foreground">No trades yet</p>
          ) : (
            <div className="space-y-2">
              {trades.map((trade) => (
                <div
                  key={trade.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">
                      {trade.side.toUpperCase()} - ${parseFloat(trade.amount).toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Price: ${(parseFloat(trade.price) * 100).toFixed(2)}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(trade.createdAt).toLocaleDateString()}
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

