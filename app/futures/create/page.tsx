"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function CreateFuturePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    anon: false,
    targetDate: "",
    metrics: JSON.stringify({ offer_count: { ">=": 1 } }, null, 2),
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Get actual user ID from auth
      const userId = "00000000-0000-0000-0000-000000000000";

      const res = await fetch("/api/futures/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          title: formData.title,
          description: formData.description,
          anon: formData.anon,
          targetDate: formData.targetDate,
          metrics: JSON.parse(formData.metrics),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create future");
      }

      const data = await res.json();
      router.push(`/futures/${data.future.id}`);
    } catch (error) {
      console.error("Error creating future:", error);
      alert("Failed to create future");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Create Applicant Future</h1>

      <Card>
        <CardHeader>
          <CardTitle>Mint Your Future Market</CardTitle>
          <CardDescription>
            Create a prediction market about your career outcomes or someone else&apos;s
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Will I get an offer by Q2 2026?"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the future outcome..."
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Target Date</label>
              <Input
                type="datetime-local"
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="anon"
                checked={formData.anon}
                onChange={(e) => setFormData({ ...formData, anon: e.target.checked })}
                className="h-4 w-4"
              />
              <label htmlFor="anon" className="text-sm">
                Make this future anonymous
              </label>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Metrics (JSON)</label>
              <textarea
                value={formData.metrics}
                onChange={(e) => setFormData({ ...formData, metrics: e.target.value })}
                className="w-full h-32 rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Example: {`{"offer_count": {">=": 1}}`}
              </p>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Creating..." : "Create Future Market"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

