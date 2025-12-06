const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Category = require("../models/Category");
const Color = require("../models/Color");
const Size = require("../models/Size");

// Get products ready for export (not yet exported or updated since last export)
router.get("/clover/pending", async (req, res) => {
  try {
    const products = await Product.findAll({
      where: {
        exported_to_clover: false,
      },
      include: [
        { model: Category, attributes: ["code", "name"] },
        { model: Color, attributes: ["code", "name"] },
        { model: Size, attributes: ["code", "name"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all products (for full export)
router.get("/clover/all", async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        { model: Category, attributes: ["code", "name"] },
        { model: Color, attributes: ["code", "name"] },
        { model: Size, attributes: ["code", "name"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark products as exported
router.post("/clover/mark-exported", async (req, res) => {
  try {
    const { barcodes } = req.body;

    if (!barcodes || !Array.isArray(barcodes)) {
      return res.status(400).json({ error: "Barcodes array is required" });
    }

    await Product.update(
      {
        exported_to_clover: true,
        last_exported_at: new Date(),
      },
      {
        where: {
          barcode: barcodes,
        },
      }
    );

    res.json({
      message: "Products marked as exported",
      count: barcodes.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset export status (for testing or re-export)
router.post("/clover/reset-export-status", async (req, res) => {
  try {
    const { barcodes } = req.body;

    const where =
      barcodes && Array.isArray(barcodes) && barcodes.length > 0
        ? { barcode: barcodes }
        : {}; // Reset all if no barcodes specified

    const result = await Product.update(
      {
        exported_to_clover: false,
        last_exported_at: null,
        clover_id: null,
      },
      { where }
    );

    res.json({
      message: "Export status reset",
      count: result[0],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
