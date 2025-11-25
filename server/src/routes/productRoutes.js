const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Category = require("../models/Category");
const Color = require("../models/Color");
const Size = require("../models/Size");

// Get all products (with details)
router.get("/", async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        { model: Category, attributes: ["code", "name"] },
        { model: Color, attributes: ["code", "name", "hex_value"] },
        { model: Size, attributes: ["code", "name"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get one product
router.get("/:barcode", async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.barcode, {
      include: [{ model: Category }, { model: Color }, { model: Size }],
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create product
router.post("/", async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update product
router.put("/:barcode", async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.barcode);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    await product.update(req.body);
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete product
router.delete("/:barcode", async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.barcode);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    await product.destroy();
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
