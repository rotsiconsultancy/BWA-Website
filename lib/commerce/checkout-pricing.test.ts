import { describe, expect, it } from "vitest";
import {
  quoteCampaignDiscount,
  type DiscountCampaign,
} from "./checkout-pricing";

const now = new Date("2026-09-16T09:00:00.000Z");

const campaign = (
  overrides: Partial<DiscountCampaign> = {},
): DiscountCampaign => ({
  id: "campaign-id",
  code: "WELCOME10",
  discount_type: "percentage",
  percentage_basis_points: 1000,
  fixed_amount_kes: null,
  fixed_amount_usd: null,
  minimum_subtotal_kes: null,
  minimum_subtotal_usd: null,
  max_redemptions: null,
  starts_at: null,
  ends_at: null,
  active: true,
  ...overrides,
});

describe("quoteCampaignDiscount", () => {
  it("rounds percentage discounts to a whole KES using half-up rounding", () => {
    const quote = quoteCampaignDiscount(campaign(), 0, 105, "KES", now);

    expect(quote).toMatchObject({
      valid: true,
      code: "WELCOME10",
      discountAmount: 11,
      discountedSubtotal: 94,
    });
  });

  it("uses cents for USD and never lets a fixed offer exceed merchandise subtotal", () => {
    const quote = quoteCampaignDiscount(
      campaign({
        discount_type: "fixed",
        percentage_basis_points: null,
        fixed_amount_kes: 500,
        fixed_amount_usd: 5,
      }),
      0,
      3.25,
      "USD",
      now,
    );

    expect(quote).toMatchObject({
      valid: true,
      discountAmount: 3.25,
      discountedSubtotal: 0,
    });
  });

  it("rejects campaigns below their currency-specific minimum or after expiry", () => {
    expect(
      quoteCampaignDiscount(
        campaign({ minimum_subtotal_kes: 200 }),
        0,
        199,
        "KES",
        now,
      ).valid,
    ).toBe(false);
    expect(
      quoteCampaignDiscount(
        campaign({ ends_at: "2026-09-16T08:59:59.000Z" }),
        0,
        500,
        "KES",
        now,
      ).valid,
    ).toBe(false);
  });

  it("rejects exhausted campaigns", () => {
    expect(
      quoteCampaignDiscount(
        campaign({ max_redemptions: 1 }),
        1,
        500,
        "KES",
        now,
      ).valid,
    ).toBe(false);
  });
});
