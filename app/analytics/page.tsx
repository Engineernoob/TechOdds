"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => setLoading(false), 500);
  }, []);

  // Mock data - replace with actual API calls
  const volatilityData = [
    { category: "Macro", volatility: 0.12 },
    { category: "Company", volatility: 0.18 },
    { category: "Applicant", volatility: 0.15 },
    { category: "Industry", volatility: 0.10 },
  ];

  const sectorOddsData = [
    { date: "Jan", SWE: 0.65, ML: 0.58, Mobile: 0.72 },
    { date: "Feb", SWE: 0.68, ML: 0.62, Mobile: 0.70 },
    { date: "Mar", SWE: 0.70, ML: 0.65, Mobile: 0.68 },
    { date: "Apr", SWE: 0.72, ML: 0.68, Mobile: 0.65 },
  ];

  const accuracyData = [
    { category: "Macro", accuracy: 0.72 },
    { category: "Company", accuracy: 0.68 },
    { category: "Applicant", accuracy: 0.75 },
    { category: "Industry", accuracy: 0.70 },
  ];

  const imbalanceData = [
    { market: "Market A", yes: 0.65, no: 0.35 },
    { market: "Market B", yes: 0.45, no: 0.55 },
    { market: "Market C", yes: 0.70, no: 0.30 },
  ];

  if (loading) {
    return <div className="text-center py-12">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">Advanced Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Market Volatility Heatmap</CardTitle>
            <CardDescription>Volatility by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={volatilityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="volatility" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sector Odds Movement</CardTitle>
            <CardDescription>YES price trends by sector</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sectorOddsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 1]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="SWE" stroke="#8884d8" />
                <Line type="monotone" dataKey="ML" stroke="#82ca9d" />
                <Line type="monotone" dataKey="Mobile" stroke="#ffc658" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prediction Accuracy by Category</CardTitle>
            <CardDescription>Historical accuracy rates</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={accuracyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis domain={[0, 1]} />
                <Tooltip />
                <Bar dataKey="accuracy" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>YES/NO Imbalance</CardTitle>
            <CardDescription>Price distribution across markets</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={imbalanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="market" />
                <YAxis domain={[0, 1]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="yes" stackId="a" fill="#22c55e" />
                <Bar dataKey="no" stackId="a" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

