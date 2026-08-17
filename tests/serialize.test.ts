import { describe, it, expect } from "vitest";
import {
  paginated,
  readPageParams,
  serializeMedicine,
  serializeOrder,
  toDateOnly,
  toNumber,
} from "@/lib/serialize";

/**
 * The response contract. Every list route returned `{data,total,page,totalPages}`
 * while every consumer treated the body as a bare array, which broke three of
 * four dashboard tabs and every admin page at once. These tests exist so that
 * regression is caught by CI rather than by a patient.
 */

/** Stands in for a Prisma Decimal, which stringifies rather than being a number. */
const decimal = (value: string) => ({ toString: () => value });

describe("toNumber", () => {
  it("converts a Decimal-like to a real number", () => {
    expect(toNumber(decimal("120.50"))).toBe(120.5);
  });

  it("passes numbers through", () => {
    expect(toNumber(42)).toBe(42);
  });

  it("treats null and undefined as 0 rather than NaN", () => {
    // NaN would render as "Rs. NaN" on a price tag.
    expect(toNumber(null)).toBe(0);
    expect(toNumber(undefined)).toBe(0);
  });
});

describe("toDateOnly", () => {
  it("renders a Date as YYYY-MM-DD", () => {
    expect(toDateOnly(new Date(Date.UTC(2026, 7, 10)))).toBe("2026-08-10");
  });

  it("truncates an ISO string", () => {
    expect(toDateOnly("2026-08-10T00:00:00.000Z")).toBe("2026-08-10");
  });

  it("leaves an already-plain date alone", () => {
    expect(toDateOnly("2026-08-10")).toBe("2026-08-10");
  });
});

describe("serializeMedicine / serializeOrder", () => {
  it("turns money into numbers so the client never parseFloats", () => {
    const medicine = serializeMedicine({ price: decimal("99.99"), name: "X" });
    expect(medicine.price).toBe(99.99);
    expect(medicine.name).toBe("X");
  });

  it("converts both order totals and the nested medicine", () => {
    const order = serializeOrder({
      pricePerUnit: decimal("10.00"),
      totalAmount: decimal("30.00"),
      medicine: { price: decimal("10.00") },
    });

    expect(order.pricePerUnit).toBe(10);
    expect(order.totalAmount).toBe(30);
    expect(order.medicine.price).toBe(10);
  });

  it("omits medicine entirely when it was not included", () => {
    const order = serializeOrder({
      pricePerUnit: decimal("10.00"),
      totalAmount: decimal("10.00"),
    });
    expect("medicine" in order).toBe(false);
  });
});

describe("paginated", () => {
  it("returns the one shape every collection endpoint uses", () => {
    expect(paginated([1, 2, 3], 10, 1, 3)).toEqual({
      data: [1, 2, 3],
      total: 10,
      page: 1,
      totalPages: 4,
    });
  });

  it("reports zero pages for an empty collection", () => {
    expect(paginated([], 0, 1, 20).totalPages).toBe(0);
  });
});

describe("readPageParams", () => {
  const parse = (qs: string) => readPageParams(`https://x.test/api/things${qs}`);

  it("defaults to page 1 with a 20-item limit", () => {
    expect(parse("")).toEqual({ page: 1, limit: 20, skip: 0 });
  });

  it("computes skip from page and limit", () => {
    expect(parse("?page=3&limit=10")).toEqual({ page: 3, limit: 10, skip: 20 });
  });

  it("clamps a hostile limit so one request cannot dump the table", () => {
    expect(parse("?limit=100000").limit).toBe(200);
    // Negative values clamp up to the floor rather than producing a negative
    // `take`, which Prisma would reject.
    expect(parse("?limit=-5").limit).toBe(1);
  });

  it("treats limit=0 as 'unspecified' and uses the default", () => {
    // 0 is falsy, so it takes the `|| defaultLimit` branch alongside NaN.
    // Harmless, but worth pinning down so it is not mistaken for a clamp bug.
    expect(parse("?limit=0").limit).toBe(20);
  });

  it("clamps page to at least 1, so skip is never negative", () => {
    expect(parse("?page=0").page).toBe(1);
    expect(parse("?page=-3").skip).toBe(0);
  });

  it("falls back to defaults on non-numeric input", () => {
    expect(parse("?page=abc&limit=xyz")).toEqual({ page: 1, limit: 20, skip: 0 });
  });
});
