export const generateBarcode = (
  categoryCode: string,
  styleNumber: string,
  sizeCode: string,
  colorCode: string
): string => {
  // Format: CategoryCode + StyleNumber + SizeCode + ColorCode
  // Example: CR + 001 + 1 + 01 = CR00110

  return `${categoryCode}${styleNumber}${sizeCode}${colorCode}`;
};

export const parseBarcode = (barcode: string) => {
  // Assuming format: CC999999 (2 char category, 3 style, 1 size, 2 color)
  if (barcode.length < 8) {
    return null;
  }
  
  return {
    categoryCode: barcode.substring(0, 2),
    styleNumber: barcode.substring(2, 5),
    sizeCode: barcode.substring(5, 6),
    colorCode: barcode.substring(6, 8),
  };
};