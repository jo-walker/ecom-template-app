import * as XLSX from 'xlsx';
import { Product } from '../types';

interface CloverProduct {
  Name: string;
  SKU: string;
  Price: number;
  Cost: number;
  Category: string;
  'Available for sale': string;
  'Track stock': string;
  Quantity: number;
}

export const generateCloverExport = (products: Product[]) => {
  // Transform products to Clover format
  const cloverData: CloverProduct[] = products.map(p => ({
    Name: `${p.Category?.name || p.category_code} - ${p.Color?.name || p.color_code} - ${p.Size?.name || p.size_code}`,
    SKU: p.barcode,
    Price: p.retail_price,
    Cost: p.cost_price || 0,
    Category: p.Category?.name || p.category_code,
    'Available for sale': 'Y',
    'Track stock': 'Y',
    Quantity: p.stock_quantity,
  }));

  // Create Excel workbook
  const ws = XLSX.utils.json_to_sheet(cloverData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Products');

  // Download file
  XLSX.writeFile(wb, `clover-import-${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const downloadCSV = (products: Product[]) => {
  const cloverData = products.map(p => ({
    Name: `${p.Category?.name || p.category_code} - ${p.Color?.name || p.color_code} - ${p.Size?.name || p.size_code}`,
    SKU: p.barcode,
    Price: p.retail_price,
    Cost: p.cost_price || 0,
    Category: p.Category?.name || p.category_code,
    'Available for sale': 'Y',
    'Track stock': 'Y',
    Quantity: p.stock_quantity,
  }));

  // Convert to CSV
  const headers = Object.keys(cloverData[0]).join(',');
  const rows = cloverData.map(row => Object.values(row).join(',')).join('\n');
  const csv = `${headers}\n${rows}`;

  // Download
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `clover-import-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
};