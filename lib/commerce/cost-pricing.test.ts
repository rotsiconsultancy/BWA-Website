import { describe, expect, it } from "vitest";
import {
  checkPrice,
  defaultPricingSettings,
  makingCost,
  mergePricingSettings,
  priceGuide,
  type CostRecipe,
} from "./cost-pricing";

const settings = defaultPricingSettings;

const stoneBracelet: CostRecipe = {
  material_cost: 500,
  material_yield: 1.5,
  charm_cost: 20,
  charm_count: 1,
  extra_cost: 0,
  packaging: "pouch",
  labour_kes: 0,
};

const packBracelet: CostRecipe = {
  material_cost: 50,
  material_yield: 4,
  charm_cost: 2,
  charm_count: 1,
  extra_cost: 0,
  packaging: "none",
  labour_kes: 0,
};

describe("makingCost", () => {
  it("adds stones, string, charm, 5% wastage and pouch", () => {
    const cost = makingCost(stoneBracelet, settings);
    expect(cost.beads).toBeCloseTo(333.33, 2);
    expect(cost.string).toBeCloseTo(6.67, 2);
    expect(cost.wastage).toBeCloseTo(18, 2);
    expect(cost.total).toBeCloseTo(458, 2);
  });

  it("includes paid labour once it is entered", () => {
    expect(
      makingCost({ ...stoneBracelet, labour_kes: 40 }, settings).total,
    ).toBeCloseTo(498, 2);
  });
});

describe("priceGuide", () => {
  it("gives the stone bracelet's safe and good direct prices", () => {
    const guide = priceGuide(stoneBracelet, settings, "direct");
    expect(guide.fullCost).toBeCloseTo(466, 2);
    expect(guide.breakEven).toBe(518);
    expect(guide.goodPrice).toBe(800);
  });

  it("needs a higher price when a partner takes commission", () => {
    const guide = priceGuide(stoneBracelet, settings, "consignment");
    expect(guide.breakEven).toBe(777);
    expect(guide.goodPrice).toBe(1200);
  });

  it("drops the stand charge once it has been paid back", () => {
    expect(priceGuide(stoneBracelet, settings, "direct", 100).stand).toBe(0);
  });

  it("returns no price when costs take the whole sale", () => {
    const guide = priceGuide(
      stoneBracelet,
      { ...settings, consignment_commission_pct: 95 },
      "consignment",
    );
    expect(guide.breakEven).toBeNull();
    expect(guide.goodPrice).toBeNull();
  });
});

describe("checkPrice", () => {
  it("splits a KES 1,000 stone sale into restock, growth, reserves and pay", () => {
    const result = checkPrice(1000, stoneBracelet, settings, "direct");
    expect(result.shared).toBe(100);
    expect(result.profit).toBeCloseTo(434, 2);
    expect(result.status).toBe("good");
    expect(result.split.betterProducts).toBeCloseTo(130.2, 1);
    expect(result.split.reserves).toBeCloseTo(86.8, 1);
    expect(result.split.ownerPay).toBeCloseTo(217, 1);
  });

  it("flags consignment at KES 1,000 as profitable but below target", () => {
    const result = checkPrice(1000, stoneBracelet, settings, "consignment");
    expect(result.reachesYou).toBe(600);
    expect(result.profit).toBeCloseTo(134, 2);
    expect(result.status).toBe("below_target");
  });

  it("flags a price below cost as a loss with nothing to split", () => {
    const result = checkPrice(400, stoneBracelet, settings, "direct");
    expect(result.status).toBe("loss");
    expect(result.split.ownerPay).toBe(0);
  });

  it("rates the KES 75 pack bracelet as a good price", () => {
    expect(checkPrice(75, packBracelet, settings, "direct").status).toBe(
      "good",
    );
  });
});

describe("mergePricingSettings", () => {
  it("keeps valid stored values and falls back for the rest", () => {
    const merged = mergePricingSettings({
      monthly_ads_kes: 5000,
      wastage_pct: "bad",
      stand_bought_on: "2026-10-01",
    });
    expect(merged.monthly_ads_kes).toBe(5000);
    expect(merged.wastage_pct).toBe(5);
    expect(merged.stand_bought_on).toBe("2026-10-01");
  });
});
