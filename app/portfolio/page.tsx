"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { PortfolioPosition, PortfolioMetrics } from "@/lib/portfolio";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function PortfolioPage() {
  const [positions, setPositions] = useState<PortfolioPosition[]>([]);
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPortfolio() {
      try {
        // TODO: Get actual user ID from auth
        const userId = "00000000-0000-0000-0000-000000000000";

        const res = await fetch(`/api/portfolio?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setPositions(data.positions || []);
          setMetrics(data.metrics);
          setHealth(data.health);
        }
      } catch (error) {
        console.error("Error fetching portfolio:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPortfolio();
  }, []);

  if (loading) {
    return <div className="text-center py-12">Loading portfolio...</div>;
  }

  const categoryData = metrics
    ? Object.entries(metrics.categoryExposure).map(([name, value]) => ({
        name,
        value: Number(value),
      }))
    : [];

  const pnlData = positions.map((p, i) => ({
    name: p.marketTitle.substring(0, 20),
    pnl: p.unrealizedPnL,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">Portfolio</h1>

      {health && (
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Health</CardTitle>
            <CardDescription>AI-explained portfolio analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-5xl font-bold">{health.score.toFixed(0)}</div>
              <div className="flex-1">
                <div className="w-full bg-muted h-4 rounded-full overflow-hidden mb-2">
                  <div
                    className="bg-primary h-full transition-all"
                    style={{ width: `${health.score}%` }}
                  />
                </div>
                <div className="space-y-1">
                  {health.factors.map((factor: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>{factor.name}</span>
                      <span className="text-muted-foreground">{factor.note}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${metrics?.totalValue.toFixed(2) || "0.00"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Unrealized P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-3xl font-bold ${
                (metrics?.unrealizedPnL || 0) >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              ${metrics?.unrealizedPnL.toFixed(2) || "0.00"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Diversification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {(metrics?.diversificationScore || 0 * 100).toFixed(0)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {categoryData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Category Exposure</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => {
                    const name = entry.name || "";
                    const percent = entry.percent || 0;
                    return `${name} ${(percent * 100).toFixed(0)}%`;
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {pnlData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Position P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pnlData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="pnl" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Current Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          {positions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No positions</div>
          ) : (
            <div className="space-y-2">
              {positions.map((position) => (
                <div
                  key={`${position.marketId}-${position.side}`}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">{position.marketTitle}</div>
                    <div className="text-sm text-muted-foreground">
                      {position.side.toUpperCase()} - ${position.amount.toFixed(2)} @ $
                      {(position.entryPrice * 100).toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`font-bold ${
                        position.unrealizedPnL >= 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      ${position.unrealizedPnL.toFixed(2)}
                    </div>
                    <Badge variant="outline">{position.category}</Badge>
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

