/**
 * Prisma returns Decimal objects and full DateTimes. Left alone, a Decimal
 * serialises to a JSON *string* and a `@db.Date` serialises to a midnight
 * timestamp, so every consumer ends up writing its own defensive
 * `typeof x === "string" ? parseFloat(x) : x` dance. These helpers do that
 * conversion once, at the edge, so the wire contract is boring: money is a
 * number, a date-only column is "YYYY-MM-DD".
 */

type DecimalLike = { toString(): string };

export function toNumber(value: DecimalLike | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  return typeof value === "number" ? value : parseFloat(value.toString());
}

/** Renders a `@db.Date` column as a plain calendar date, with no timezone. */
export function toDateOnly(value: Date | string): string {
  return value instanceof Date
    ? value.toISOString().split("T")[0]
    : String(value).split("T")[0];
}

export function serializeMedicine<T extends { price: DecimalLike | number }>(
  medicine: T
) {
  return { ...medicine, price: toNumber(medicine.price) };
}

export function serializeOrder<
  T extends {
    pricePerUnit: DecimalLike | number;
    totalAmount: DecimalLike | number;
    medicine?: { price: DecimalLike | number } | null;
  }
>(order: T) {
  return {
    ...order,
    pricePerUnit: toNumber(order.pricePerUnit),
    totalAmount: toNumber(order.totalAmount),
    ...(order.medicine ? { medicine: serializeMedicine(order.medicine) } : {}),
  };
}

/** The one list shape every collection endpoint returns. */
export function paginated<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) {
  return { data, total, page, totalPages: Math.ceil(total / limit) };
}

/** Parses `?page=` / `?limit=` with sane bounds. */
export function readPageParams(url: string, defaultLimit = 20) {
  const { searchParams } = new URL(url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const limit = Math.min(
    200,
    Math.max(1, parseInt(searchParams.get("limit") ?? String(defaultLimit), 10) || defaultLimit)
  );
  return { page, limit, skip: (page - 1) * limit };
}
