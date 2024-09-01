// src/utils/skuUtils.js

// Function to calculate Luhn checksum
function calculateLuhnChecksum(sku) {
    let sum = 0;
    let shouldDouble = true;
  
    for (let i = sku.length - 1; i >= 0; i--) {
      let digit = parseInt(sku[i]);
  
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
  
      sum += digit;
      shouldDouble = !shouldDouble;
    }
  
    return (10 - (sum % 10)) % 10;
  }
  
  // Function to validate SKU
  function validateSKU(sku) {
    const baseSku = sku.slice(0, sku.length - 1);
    const checksumDigit = parseInt(sku[sku.length - 1]);
  
    return checksumDigit === calculateLuhnChecksum(baseSku);
  }
  
  // Export the functions so they can be used in other files
  module.exports = {
    calculateLuhnChecksum,
    validateSKU,
  };  