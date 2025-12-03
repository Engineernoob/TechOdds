"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { MarketPriceHistory } from "@/lib/db";
import { format } from "date-fns";

interface PriceChartProps {
  data: MarketPriceHistory[];
}

export function PriceChart({ data }: PriceChartProps) {
  const chartData = data.map((item) => ({
    time: format(new Date(item.timestamp), "MMM dd HH:mm"),
    yes: parseFloat(item.yesPrice) * 100,
    no: parseFloat(item.noPrice) * 100,
  }));

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No price history available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="time" className="text-xs" />
        <YAxis domain={[0, 100]} className="text-xs" />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "0.5rem",
          }}
        />
        <Line
          type="monotone"
          dataKey="yes"
          stroke="hsl(142.1 76.2% 36.3%)"
          strokeWidth={2}
          dot={false}
          name="YES"
        />
        <Line
          type="monotone"
          dataKey="no"
          stroke="hsl(0 62.8% 30.6%)"
          strokeWidth={2}
          dot={false}
          name="NO"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

