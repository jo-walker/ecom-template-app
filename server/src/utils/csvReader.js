const fs = require('fs');
const csv = require('csv-parser');
const Product = require('../models/Product'); // Import your Product model
const { generateSKU } = require('./skuUtils');

// Update your file path accordingly
const path = 'C:/Projects/ecom/externals/Copy Of Tb_product_dbWithBarcodeField.csv';

if (fs.existsSync(path)) {
  console.log('File exists, starting to read...');
  readAndInsertCSV(path);
} else {
  console.error('File does not exist:', path);
}

// Define function to read CSV and process data
function readAndInsertCSV(filePath) {
  console.log(`Reading CSV file from: ${filePath}`);

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', async (row) => {
      try {
        console.log('Processing row:', row);  // Log each row to verify it is being processed
        
        // Check if required fields are present, if not skip this row
        if (!row.cat_id || !row.kind || !row.color) {
          console.error('Missing required fields in row:', row);
          return;
        }

        // Generate SKU using your SKU generation logic
        const sku = generateSKU(row.cat_id, row.color, row.kind);

        // Remove dollar signs from sellsPrice if present
        const sellsPrice = row.sellsPrice ? row.sellsPrice.replace('$', '') : null;

        // Prepare description, vendor, selling_price, and stock JSON objects
        const description = JSON.stringify({
          color: row.color,
          kind: row.kind, // Use 'kind' to represent the material type
          catName: row.catName,
          StyleName: row.StyleName || null, // Handle possible missing StyleName
          Description: row.Description || null, // Handle possible missing Description
          weight: row.weight || null,
          sex: row.sex || null,
          barCode: row.barCode || null, // New field for barcode
          barCodePrint: row.barCodePrint || null, // New field for barcode printing
          print_bar: row.print_bar || null // New field for print_bar
        });

        const vendor = JSON.stringify({ company_id: row.company_id });
        const selling_price = JSON.stringify({
          price_MGL: row.price_MGL || null,
          unitprice_Cnd: row.unitprice_Cnd || null,
          sellsPrice: sellsPrice || null,
          TransportCostUnit: row.TransportCostUnit || null // New field for transport cost
        });

        const stock = JSON.stringify({
          Qty: row.Qty || null,
          Qty_sold: row.Qty_sold || null // New field for Qty_sold
        });

        // Insert product data into PostgreSQL using your Product model
        const product = await Product.create({
          SKU: sku, // Use the generated SKU
          UPC: null, 
          EAN: null,
          description,
          vendor,
          selling_price,
          stock,
          size: JSON.stringify({ size: row.size || null }), // Add size information as JSON
          status: 'active', // Default to 'active' for all insertions
          workField: row.workField || null, // New field for workField
          extra: row.extra || null // New field for extra
        });

        console.log(`Inserted product with SKU: ${product.SKU}`);
      } catch (err) {
        console.error(`Error processing row: ${err.message}`);
      }
    })
    .on('end', () => {
      console.log('CSV file processed successfully');
    })
    .on('error', (err) => {
      console.error(`Error reading CSV file: ${err.message}`);
    });
}

module.exports = { readAndInsertCSV };
