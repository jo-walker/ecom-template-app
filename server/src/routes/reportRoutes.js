const express = require("express");
const router = express.Router();
const { getSalesReport } = require("../controllers/reportController");

// Report routes
// GET /api/reports/sales?start_date=X&end_date=Y
router.get("/sales", getSalesReport);

// Placeholder routes for future implementation
// GET /api/reports/inventory-overview?startDate=X&endDate=Y
// GET /api/reports/category-breakdown?startDate=X&endDate=Y
// GET /api/reports/stock-trends?startDate=X&endDate=Y
// POST /api/reports/export/excel

module.exports = router;
