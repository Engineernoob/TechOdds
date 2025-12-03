import { create } from "zustand";
import type { Market } from "@/lib/db";

interface MarketStore {
  markets: Market[];
  selectedMarket: Market | null;
  categoryFilter: string | null;
  setMarkets: (markets: Market[]) => void;
  setSelectedMarket: (market: Market | null) => void;
  setCategoryFilter: (category: string | null) => void;
}

export const useMarketStore = create<MarketStore>((set) => ({
  markets: [],
  selectedMarket: null,
  categoryFilter: null,
  setMarkets: (markets) => set({ markets }),
  setSelectedMarket: (market) => set({ selectedMarket: market }),
  setCategoryFilter: (category) => set({ categoryFilter: category }),
}));

