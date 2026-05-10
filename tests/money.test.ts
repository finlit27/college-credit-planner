import { describe, it, expect } from "vitest";
import { formatUSD, parseCurrency } from "@/lib/money";
import { generateShareId, SHARE_ID_LENGTH } from "@/lib/nanoid";

describe("formatUSD", () => {
  it("formats whole dollars without cents", () => {
    expect(formatUSD(14436)).toBe("$14,436");
    expect(formatUSD(6450)).toBe("$6,450");
    expect(formatUSD(0)).toBe("$0");
  });

  it("rounds to whole dollars", () => {
    expect(formatUSD(1234.56)).toBe("$1,235");
  });
});

describe("parseCurrency", () => {
  it("strips $ and commas", () => {
    expect(parseCurrency("$12,345")).toBe(12345);
    expect(parseCurrency("$6,450")).toBe(6450);
  });

  it("returns 0 for junk", () => {
    expect(parseCurrency("")).toBe(0);
    expect(parseCurrency("abc")).toBe(0);
  });

  it("handles plain numeric strings", () => {
    expect(parseCurrency("14436")).toBe(14436);
  });
});

describe("generateShareId", () => {
  it("returns a 10-character ID", () => {
    expect(SHARE_ID_LENGTH).toBe(10);
    expect(generateShareId()).toHaveLength(10);
  });

  it("returns a different ID each call", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateShareId()));
    expect(ids.size).toBe(100);
  });
});
