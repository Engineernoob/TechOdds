import { describe, it, expect } from "vitest";
import {
  calculatePrices,
  calculatePriceAfterTrade,
  executeTrade,
  initializeMarket,
} from "../amm";

describe("AMM Logic", () => {
  describe("calculatePrices", () => {
    it("should calculate equal prices for equal liquidity", () => {
      const { yesPrice, noPrice } = calculatePrices(500, 500);
      expect(yesPrice).toBe(0.5);
      expect(noPrice).toBe(0.5);
    });

    it("should calculate correct prices for unequal liquidity", () => {
      const { yesPrice, noPrice } = calculatePrices(300, 700);
      expect(yesPrice).toBeCloseTo(0.7, 2);
      expect(noPrice).toBeCloseTo(0.3, 2);
      expect(yesPrice + noPrice).toBeCloseTo(1.0, 2);
    });
  });

  describe("calculatePriceAfterTrade", () => {
    it("should increase YES price when buying YES", () => {
      const result = calculatePriceAfterTrade("yes", 100, 500, 500);
      expect(result.newYesPrice).toBeGreaterThan(0.5);
      expect(result.newNoPrice).toBeLessThan(0.5);
      expect(result.newYesPrice + result.newNoPrice).toBeCloseTo(1.0, 2);
    });

    it("should increase NO price when buying NO", () => {
      const result = calculatePriceAfterTrade("no", 100, 500, 500);
      expect(result.newNoPrice).toBeGreaterThan(0.5);
      expect(result.newYesPrice).toBeLessThan(0.5);
      expect(result.newYesPrice + result.newNoPrice).toBeCloseTo(1.0, 2);
    });

    it("should maintain constant product", () => {
      const initialK = 500 * 500;
      const result = calculatePriceAfterTrade("yes", 100, 500, 500);
      const newK = result.newLiquidityYes * result.newLiquidityNo;
      expect(newK).toBeCloseTo(initialK, 0);
    });
  });

  describe("executeTrade", () => {
    it("should execute a YES trade correctly", () => {
      const marketState = {
        liquidityYes: 500,
        liquidityNo: 500,
        yesPrice: 0.5,
        noPrice: 0.5,
      };

      const result = executeTrade("yes", 100, marketState);
      expect(result.newYesPrice).toBeGreaterThan(0.5);
      expect(result.sharesReceived).toBeGreaterThan(0);
      expect(result.cost).toBe(100);
    });

    it("should throw error for negative amount", () => {
      const marketState = {
        liquidityYes: 500,
        liquidityNo: 500,
        yesPrice: 0.5,
        noPrice: 0.5,
      };

      expect(() => executeTrade("yes", -100, marketState)).toThrow();
    });
  });

  describe("initializeMarket", () => {
    it("should initialize with equal liquidity and prices", () => {
      const market = initializeMarket();
      expect(market.liquidityYes).toBe(500);
      expect(market.liquidityNo).toBe(500);
      expect(market.yesPrice).toBe(0.5);
      expect(market.noPrice).toBe(0.5);
    });
  });
});

