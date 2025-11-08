export interface Product {
  sku: string;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  image_url?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: number;
  user_id: number;
  total_amount: number;
  status: string;
  created_at: string;
}