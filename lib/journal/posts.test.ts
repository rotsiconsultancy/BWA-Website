import { describe, expect, it } from "vitest";
import { isReleased, nairobiToday, type JournalPost } from "./posts";

const post = (date: string) => ({ date }) as JournalPost;

describe("scheduled Journal posts", () => {
  it("uses the Nairobi date, not UTC", () => {
    // 22:30 UTC on 7 Nov is 01:30 on 8 Nov in Nairobi (UTC+3).
    expect(nairobiToday(new Date("2026-11-07T22:30:00Z"))).toBe("2026-11-08");
    expect(nairobiToday(new Date("2026-11-07T20:59:00Z"))).toBe("2026-11-07");
  });

  it("releases a post on its date and hides it before", () => {
    expect(isReleased(post("2026-11-08"), "2026-11-07")).toBe(false);
    expect(isReleased(post("2026-11-08"), "2026-11-08")).toBe(true);
    expect(isReleased(post("2026-11-01"), "2026-11-08")).toBe(true);
  });
});
