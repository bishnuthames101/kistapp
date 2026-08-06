/**
 * The cart works with exactly the medicine the API returns - this used to be a
 * second, hand-written shape whose `stock` values ('In Stock') never matched
 * the enum the server actually sends ('IN_STOCK').
 */
export type { Medicine } from '@/services/api';

import type { Medicine } from '@/services/api';

export interface CartItem extends Medicine {
  quantity: number;
}

/** Turns the StockStatus enum into something a patient can read. */
export function stockLabel(stock: Medicine['stock']): string {
  return stock === 'IN_STOCK' ? 'In Stock' : 'Out of Stock';
}
