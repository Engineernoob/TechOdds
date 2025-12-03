"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Market } from "@/lib/db";

interface TradeModalProps {
  market: Market;
  side: "yes" | "no";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTrade: (side: "yes" | "no", amount: number) => Promise<void>;
}

export function TradeModal({ market, side, open, onOpenChange, onTrade }: TradeModalProps) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const yesPrice = parseFloat(market.yesPrice);
  const noPrice = parseFloat(market.noPrice);
  const price = side === "yes" ? yesPrice : noPrice;

  const handleTrade = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      await onTrade(side, numAmount);
      setAmount("");
      onOpenChange(false);
    } catch (error) {
      console.error("Trade error:", error);
      alert("Trade failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Buy {side.toUpperCase()}</DialogTitle>
          <DialogDescription>
            Current price: ${(price * 100).toFixed(2)} per share
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Amount</label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>
          {amount && !isNaN(parseFloat(amount)) && (
            <div className="text-sm text-muted-foreground">
              Estimated shares: ~{((parseFloat(amount) / price) * 100).toFixed(2)} shares
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleTrade}
            disabled={loading || !amount || isNaN(parseFloat(amount))}
            className={side === "yes" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
          >
            {loading ? "Processing..." : `Buy ${side.toUpperCase()}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

