import * as XLSX from 'xlsx';
import { Product } from '../types';

interface CloverItemRow {
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

interface ModifierGroupRow {
  'Modifier Group Name': string;
  'Pop-up Automatically': string;
  'Modifier': string;
  'Price': number | string;
  'Required Quantity': string;
  'Max Quantity': string;
}

interface TaxRateRow {
  'Name': string;
  'Tax Rate': string;
  'Default': string;
}

export const generateCloverExport = (products: Product[], filename?: string) => {
  // Sheet 1: Items
  const itemsData: CloverItemRow[] = products.map(p => {
    const categoryName = p.Category?.name || p.category_code;
    const sizeName = p.Size?.name || p.size_code;
    const colorName = p.Color?.name || p.color_code;
    
    const price = typeof p.retail_price === 'number' 
      ? p.retail_price 
      : parseFloat(p.retail_price as any);
    
    const cost = typeof p.cost_price === 'number'
      ? p.cost_price
      : p.cost_price ? parseFloat(p.cost_price as any) : 0;

    // Product name format: "Category-Size-Color"
    const productName = `${categoryName}-${sizeName}-${colorName}`;

    return {
      'Clover ID': p.clover_id || '',
      'Name': productName,
      'Alternate Name': categoryName,
      'Price': price,
      'Price Type': 'Fixed',
      'Price Unit': '',
      'Tax Rates': 'DEFAULT',
      'Cost': cost,
      'Product Code': p.barcode,
      'SKU': p.barcode,
      'Modifier Groups': 'Colour, Size',
      'Quantity': p.stock_quantity,
      'Printer Labels': `${p.category_code}-${p.barcode}`,
      'Hidden': 'No',
      'Non-revenue item': 'No',
    };
  });

  // Sheet 2: Modifier Groups
  const modifierGroupsData: ModifierGroupRow[] = buildModifierGroups(products);

  // Sheet 3: Categories (transposed format)
  const categoriesData = buildCategoriesSheet(products);

  // Sheet 4: Tax Rates
  const taxRatesData: TaxRateRow[] = [
    { 'Name': 'HST', 'Tax Rate': '13.00%', 'Default': 'Yes' },
    { 'Name': 'NO_TAX', 'Tax Rate': '0.00%', 'Default': 'No' },
  ];

  // Create workbook with 4 sheets
  const wb = XLSX.utils.book_new();

  // Add Items sheet
  const wsItems = XLSX.utils.json_to_sheet(itemsData);
  XLSX.utils.book_append_sheet(wb, wsItems, 'Items');

  // Add Modifier Groups sheet
  const wsModifiers = XLSX.utils.json_to_sheet(modifierGroupsData);
  XLSX.utils.book_append_sheet(wb, wsModifiers, 'Modifier Groups');

  // Add Categories sheet (custom format)
  const wsCategories = XLSX.utils.aoa_to_sheet(categoriesData);
  XLSX.utils.book_append_sheet(wb, wsCategories, 'Categories');

  // Add Tax Rates sheet
  const wsTaxRates = XLSX.utils.json_to_sheet(taxRatesData);
  XLSX.utils.book_append_sheet(wb, wsTaxRates, 'Tax Rates');

  // Download file
  const filenameFinal = filename || `clover-import-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, filenameFinal);
};

function buildModifierGroups(products: Product[]): ModifierGroupRow[] {
  const rows: ModifierGroupRow[] = [];

  // Extract unique colors
  const colorSet = new Set<string>();
  const colorMap = new Map<string, string>(); // code -> name
  
  products.forEach(p => {
    if (p.Color?.name && p.Color?.code) {
      colorSet.add(p.Color.code);
      colorMap.set(p.Color.code, p.Color.name);
    }
  });

  const colors = Array.from(colorSet).sort();

  // Add Colour modifier group
  if (colors.length > 0) {
    colors.forEach((colorCode, index) => {
      rows.push({
        'Modifier Group Name': index === 0 ? 'Colour' : '',
        'Pop-up Automatically': index === 0 ? 'Yes' : '',
        'Modifier': colorMap.get(colorCode) || colorCode,
        'Price': '0.00',
        'Required Quantity': '',
        'Max Quantity': '',
      });
    });
  }

  // Extract unique sizes
  const sizeSet = new Set<string>();
  const sizeMap = new Map<string, { name: string; order: number }>();
  
  products.forEach(p => {
    if (p.Size?.name && p.Size?.code) {
      sizeSet.add(p.Size.code);
      sizeMap.set(p.Size.code, { 
        name: p.Size.name, 
        order: p.Size.sort_order ?? 0  // ✅ Fixed: default to 0
      });
    }
  });

  const sizes = Array.from(sizeSet).sort((a, b) => {
    const orderA = sizeMap.get(a)?.order || 0;
    const orderB = sizeMap.get(b)?.order || 0;
    return orderA - orderB;
  });

  // Add Size modifier group
  if (sizes.length > 0) {
    sizes.forEach((sizeCode, index) => {
      rows.push({
        'Modifier Group Name': index === 0 ? 'Size' : '',
        'Pop-up Automatically': index === 0 ? 'Yes' : '',
        'Modifier': sizeMap.get(sizeCode)?.name || sizeCode,
        'Price': '0.00',
        'Required Quantity': '',
        'Max Quantity': '',
      });
    });
  }

  return rows;
}

function buildCategoriesSheet(products: Product[]): any[][] {
  // Group products by category
  const categoryMap = new Map<string, Product[]>();
  
  products.forEach(p => {
    const categoryName = p.Category?.name || p.category_code;
    if (!categoryMap.has(categoryName)) {
      categoryMap.set(categoryName, []);
    }
    categoryMap.get(categoryName)!.push(p);
  });

  // Get all categories sorted
  const categories = Array.from(categoryMap.keys()).sort();

  // Find max products in any category
  let maxProducts = 0;
  categories.forEach(cat => {
    const count = categoryMap.get(cat)!.length;
    if (count > maxProducts) maxProducts = count;
  });

  // Build 2D array in transposed format
  const data: any[][] = [];

  // First row: "Category Name" label followed by category names
  const headerRow = ['Category Name', ...categories];
  data.push(headerRow);

  // Subsequent rows: "Items in Category" label followed by product names
  for (let i = 0; i < maxProducts; i++) {
    const row: any[] = [i === 0 ? 'Items in Category' : ''];
    
    categories.forEach(categoryName => {
      const categoryProducts = categoryMap.get(categoryName)!;
      if (i < categoryProducts.length) {
        const p = categoryProducts[i];
        const catName = p.Category?.name || p.category_code;
        const sizeName = p.Size?.name || p.size_code;
        const colorName = p.Color?.name || p.color_code;
        
        // Product name must match the "Name" column in Items sheet
        row.push(`${catName}-${sizeName}-${colorName}`);
      } else {
        row.push('');
      }
    });
    
    data.push(row);
  }

  return data;
}

export const downloadCSV = (products: Product[], filename?: string) => {
  // For CSV, we'll only export the Items sheet since CSV doesn't support multiple sheets
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
      'Modifier Groups': 'Colour, Size',
      'Quantity': p.stock_quantity,
      'Printer Labels': `${p.category_code}-${p.barcode}`,
      'Hidden': 'No',
      'Non-revenue item': 'No',
    };
  });

  // Convert to CSV
  if (cloverData.length === 0) {
    alert('No products to export');
    return;
  }

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
  a.download = filename || `clover-import-items-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
};