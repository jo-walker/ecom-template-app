// Inventory Management Types
export interface Category {
  code: string;          // 'CR', 'TP', 'VS'
  name: string;          // 'Cardigan', 'Top', 'Vest'
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Style {
  id: number;
  category_code: string;
  style_number: string;  // '001', '002', '003'
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Color {
  code: string;          // '01', '02', '03'
  name: string;          // 'Black', 'White', 'Navy'
  hex_value?: string;    // '#000000'
  createdAt?: string;
  updatedAt?: string;
}

export interface Size {
  code: string;          // '0', '1', '2'
  name: string;          // 'Free Size', 'XS', 'S'
  sort_order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  barcode: string;       // 'CR001101' (auto-generated)
  category_code: string;
  style_number: string;
  size_code: string;
  color_code: string;
  vendor_name?: string;
  vendor_sku?: string;
  cost_price?: number;
  retail_price: number;
  stock_quantity: number;
  notes?: string;
  images?: string[];
  exported_to_clover?: boolean;
  last_exported_at?: string | Date;
  clover_id?: string;
  createdAt?: string;
  updatedAt?: string;
  
  // Populated from joins
  Category?: Category;
  Color?: Color;
  Size?: Size;
}

export interface Vendor {
  id: number;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}