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
  initial_quantity: number;  // Initial quantity when product was added
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

// Report Types
export interface ReportDateRange {
  start: Date;
  end: Date;
  previousStart: Date;
  previousEnd: Date;
}

export interface InventoryReport {
  startDate: string;
  endDate: string;
  currentValue: number;
  previousValue: number;
  valueChange: number;
  valueChangePercent: number;
  totalProducts: number;
  totalItems: number;
  categoryBreakdown: CategoryPerformance[];
}

export interface CategoryPerformance {
  categoryCode: string;
  categoryName: string;
  productCount: number;
  totalValue: number;
  totalItems: number;
  percentage: number;
}

// Sales Types
export interface Sale {
  id: number;
  barcode: string;
  quantity_sold: number;
  unit_price: number;
  total_amount: number;
  sale_date: string | Date;
  payment_method?: string;
  notes?: string;
  transaction_id?: string;
  createdAt?: string;
  updatedAt?: string;

  // Populated from joins
  Product?: Product;
}

export interface RecordSaleRequest {
  barcode: string;
  quantity_sold: number;
  payment_method?: string;
  notes?: string;
  transaction_id?: string;
}

export interface RecordSaleResponse {
  message: string;
  sale: Sale;
  updated_stock: number;
}

export interface SalesSummary {
  total_sales: number;
  total_quantity_sold: number;
  total_revenue: string;
  date_range: {
    start: string;
    end: string;
  };
}