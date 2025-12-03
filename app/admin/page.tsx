"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MarketCard } from "@/components/MarketCard";
import type { Market } from "@/lib/db";

export default function AdminPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "macro",
    resolutionDate: "",
  });
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/market/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Failed to create market");
      }

      const newMarket = await res.json();
      setMarkets([...markets, newMarket]);
      setFormData({
        title: "",
        description: "",
        category: "macro",
        resolutionDate: "",
      });
    } catch (error) {
      console.error("Error creating market:", error);
      alert("Failed to create market");
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (marketId: string, outcome: "yes" | "no") => {
    if (!confirm(`Resolve market as ${outcome.toUpperCase()}?`)) {
      return;
    }

    try {
      const res = await fetch("/api/market/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marketId, outcome }),
      });

      if (!res.ok) {
        throw new Error("Failed to resolve market");
      }

      // Refresh markets
      const marketsRes = await fetch("/api/markets");
      if (marketsRes.ok) {
        const marketsData = await marketsRes.json();
        setMarkets(marketsData);
      }
    } catch (error) {
      console.error("Error resolving market:", error);
      alert("Failed to resolve market");
    }
  };

  useEffect(() => {
    async function fetchMarkets() {
      const res = await fetch("/api/markets");
      if (res.ok) {
        const data = await res.json();
        setMarkets(data);
      }
    }
    fetchMarkets();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">Admin Panel</h1>

      <Card>
        <CardHeader>
          <CardTitle>Create New Market</CardTitle>
          <CardDescription>Create a new prediction market</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Market title"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Market description"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                required
              >
                <option value="macro">Macro</option>
                <option value="company">Company</option>
                <option value="applicant">Applicant</option>
                <option value="industry">Industry</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Resolution Date</label>
              <Input
                type="datetime-local"
                value={formData.resolutionDate}
                onChange={(e) => setFormData({ ...formData, resolutionDate: e.target.value })}
                required
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Market"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-bold mb-4">All Markets</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {markets.map((market) => (
            <div key={market.id}>
              <MarketCard market={market} />
              {market.status === "open" && (
                <div className="mt-2 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleResolve(market.id, "yes")}
                  >
                    Resolve YES
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleResolve(market.id, "no")}
                  >
                    Resolve NO
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

