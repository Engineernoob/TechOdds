import { create } from "zustand";
import type { Trade } from "@/lib/db";

interface TradeStore {
  trades: Trade[];
  pendingTrades: Trade[];
  setTrades: (trades: Trade[]) => void;
  addTrade: (trade: Trade) => void;
  addPendingTrade: (trade: Trade) => void;
  clearPendingTrades: () => void;
}

export const useTradeStore = create<TradeStore>((set) => ({
  trades: [],
  pendingTrades: [],
  setTrades: (trades) => set({ trades }),
  addTrade: (trade) => set((state) => ({ trades: [...state.trades, trade] })),
  addPendingTrade: (trade) =>
    set((state) => ({ pendingTrades: [...state.pendingTrades, trade] })),
  clearPendingTrades: () => set({ pendingTrades: [] }),
}));

