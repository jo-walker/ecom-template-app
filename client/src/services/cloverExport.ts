import * as XLSX from 'xlsx';
import { Product } from '../types';

interface CloverExportRow {
  'Clover ID': string;
  'Name': string;
  'Alternate Name': string;
  'Price': number;
  'Price Type': string;
  'Price Unit': string;
  'Tax Rates': string;
  'Cost': number;
  'Product Code': string;
  'SKU': string;
  'Modifier Groups': string;
  'Quantity': number;
  'Printer Labels': string;
  'Hidden': string;
  'Non-revenue item': string;
}

export const generateCloverExport = (products: Product[], filename?: string) => {
  // Transform products to Clover format
  const cloverData: CloverExportRow[] = products.map(p => {
    const categoryName = p.Category?.name || p.category_code;
    const sizeName = p.Size?.name || p.size_code;
    const colorName = p.Color?.name || p.color_code;
    
    const price = typeof p.retail_price === 'number' 
      ? p.retail_price 
      : parseFloat(p.retail_price as any);
    
    const cost = typeof p.cost_price === 'number'
      ? p.cost_price
      : p.cost_price ? parseFloat(p.cost_price as any) : 0;

    return {
      'Clover ID': p.clover_id || '', // Leave blank for new items
      'Name': `${categoryName}-${sizeName}-${colorName}`,
      'Alternate Name': categoryName,
      'Price': price,
      'Price Type': 'Fixed',
      'Price Unit': '',
      'Tax Rates': 'DEFAULT',
      'Cost': cost,
      'Product Code': p.barcode,
      'SKU': p.barcode,
      'Modifier Groups': '',
      'Quantity': p.stock_quantity,
      'Printer Labels': `${p.category_code}-${p.barcode}`,
      'Hidden': 'No',
      'Non-revenue item': 'No',
    };
  });

  // Create Excel workbook
  const ws = XLSX.utils.json_to_sheet(cloverData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Inventory');

  // Download file
  const filenameFinal = filename || `clover-import-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, filenameFinal);
};

export const downloadCSV = (products: Product[], filename?: string) => {
  const cloverData = products.map(p => {
    const categoryName = p.Category?.name || p.category_code;
    const sizeName = p.Size?.name || p.size_code;
    const colorName = p.Color?.name || p.color_code;
    
    const price = typeof p.retail_price === 'number' 
      ? p.retail_price 
      : parseFloat(p.retail_price as any);
    
    const cost = typeof p.cost_price === 'number'
      ? p.cost_price
      : p.cost_price ? parseFloat(p.cost_price as any) : 0;

    return {
      'Clover ID': p.clover_id || '',
      'Name': `${categoryName}-${sizeName}-${colorName}`,
      'Alternate Name': categoryName,
      'Price': price,
      'Price Type': 'Fixed',
      'Price Unit': '',
      'Tax Rates': 'DEFAULT',
      'Cost': cost,
      'Product Code': p.barcode,
      'SKU': p.barcode,
      'Modifier Groups': '',
      'Quantity': p.stock_quantity,
      'Printer Labels': `${p.category_code}-${p.barcode}`,
      'Hidden': 'No',
      'Non-revenue item': 'No',
    };
  });

  // Convert to CSV
  const headers = Object.keys(cloverData[0]).join(',');
  const rows = cloverData.map(row => Object.values(row).map(val => 
    typeof val === 'string' && val.includes(',') ? `"${val}"` : val
  ).join(',')).join('\n');
  const csv = `${headers}\n${rows}`;

  // Download
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `clover-import-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
};