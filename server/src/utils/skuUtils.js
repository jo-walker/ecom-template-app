// src/utils/skuUtils.js

// Maps to convert color and kind (material) to numeric codes
const colorMap = {
  black: 1,
  beige: 2,
  gray: 3,
  blue: 4,
  brown: 5,
  white: 6,
  'bej-brown': 7,
  'blue-nomin': 8,
  green: 9,
  turquoise: 10,
  yellow: 11,
  orange: 12,
  'green-pistachio': 13,
  pink: 14,
  'blue-dark': 15,
  'green-cyan': 16,
  red: 17,
  'brown-blue': 18,
  'gray-dark': 19,
  crepe: 20,
  'blue-led': 21,
  'purple-light': 22,
  'black-gray': 23,
  'blue-gray': 24,
  navy: 25,
  'green-dark': 28
  // Add more colors as needed
};

const kindMap = {
  cashmere: 1,
  wool: 2,
  yak: 3,
  silkcashmere: 4,
  polyester: 5,
  // Add more material types as needed
};

// Function to generate SKU
function generateSKU(cat_id, color, kind) {

  // Remove leading zeros from cat_id
  const formattedCatId = parseInt(cat_id, 10); // Removes leading zeros from category ID

  // Handle missing or undefined color and kind values
  const formattedColor = color ? colorMap[color.toLowerCase()] || 0 : 0;  // Default to 0 if not found or missing
  const formattedKind = kind ? kindMap[kind.toLowerCase()] || 0 : 0;      // Default to 0 if not found or missing

  // Create SKU: [Category ID] [Color Code] [Kind Code]
  const baseSKU = `${formattedCatId}${formattedColor}${formattedKind}`;

  // Calculate checksum (using Luhn Algorithm)
  const checksum = calculateLuhnChecksum(baseSKU);

  // Append checksum to the SKU
  const skuWithChecksum = `${baseSKU}${checksum}`;

  return skuWithChecksum;
}

// Function to calculate Luhn checksum
function calculateLuhnChecksum(sku) {
  let sum = 0;
  let shouldDouble = true;

  // Iterate over the SKU digits from right to left
  for (let i = sku.length - 1; i >= 0; i--) {
    let digit = parseInt(sku[i], 10);  // Ensure the character is treated as a digit

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return (10 - (sum % 10)) % 10;  // Return the checksum digit
}

// Function to validate SKU
function validateSKU(sku) {
  const baseSku = sku.slice(0, sku.length - 1);
  const checksumDigit = parseInt(sku[sku.length - 1]);

  return checksumDigit === calculateLuhnChecksum(baseSku);
}

// Export the functions
module.exports = {
  generateSKU,
  calculateLuhnChecksum,
  validateSKU,
};