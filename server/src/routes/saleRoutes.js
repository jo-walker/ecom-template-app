const express = require("express");
const router = express.Router();
const {
  recordSale,
  getAllSales,
  getSalesByProduct,
  getSalesSummary,
  deleteSale,
} = require("../controllers/saleController");

// POST /api/sales - Record a new sale
router.post("/", recordSale);

// GET /api/sales - Get all sales (with optional filters)
router.get("/", getAllSales);

// GET /api/sales/summary - Get sales summary
router.get("/summary", getSalesSummary);

// GET /api/sales/product/:barcode - Get sales for a specific product
router.get("/product/:barcode", getSalesByProduct);

// DELETE /api/sales/:id - Delete a sale and restore inventory
router.delete("/:id", deleteSale);

module.exports = router;
