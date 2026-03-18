export interface Medicine {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: 'In Stock' | 'Out of Stock';
}

export interface CartItem extends Medicine {
  quantity: number;
}
