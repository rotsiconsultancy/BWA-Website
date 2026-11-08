import { describe, expect, it } from "vitest";
import {
  newReviewToken,
  newThanksCode,
  parseReviewSubmission,
  REVIEW_TOKEN,
} from "./review-reward";
import { isDiscountCodeShapeValid } from "./checkout-pricing";

const A = "11111111-1111-1111-1111-111111111111";
const B = "22222222-2222-2222-2222-222222222222";

describe("review reward", () => {
  it("makes URL-safe tokens and codes the checkout accepts", () => {
    const token = newReviewToken();
    expect(REVIEW_TOKEN.test(token)).toBe(true);
    const code = newThanksCode();
    expect(code).toMatch(/^THANKS-[2-9A-HJKMNP-Z]{6}$/);
    expect(isDiscountCodeShapeValid(code)).toBe(true);
  });

  it("needs stars for every bracelet on the order", () => {
    expect(parseReviewSubmission({ ratings: { [A]: 5 } }, [A, B])).toBeNull();
    expect(parseReviewSubmission({ ratings: { [A]: 0 } }, [A])).toBeNull();
    expect(parseReviewSubmission({ ratings: { [A]: 6 } }, [A])).toBeNull();
    const ok = parseReviewSubmission({ ratings: { [A]: 4, [B]: 2 } }, [A, B]);
    expect(ok?.reviews.map((r) => r.rating)).toEqual([4, 2]);
  });

  it("ignores products not on the order and unknown chips", () => {
    const parsed = parseReviewSubmission(
      {
        ratings: { [A]: 5, [B]: 1 },
        tags: ["gift_hit", "hacked", "gift_hit"],
        improvements: ["faster_delivery", "nope"],
        comment: "x".repeat(900),
        consent: "yes",
      },
      [A],
    );
    expect(parsed?.reviews).toHaveLength(1);
    expect(parsed?.reviews[0].tags).toEqual(["gift_hit"]);
    expect(parsed?.reviews[0].body).toHaveLength(500);
    expect(parsed?.feedback.improvements).toEqual(["faster_delivery"]);
    expect(parsed?.consent).toBe(false);
  });
});
