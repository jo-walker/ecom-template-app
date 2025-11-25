const express = require("express");
const router = express.Router();
const Size = require("../models/Size");

// Get all sizes
router.get("/", async (req, res) => {
  try {
    const sizes = await Size.findAll({
      order: [["sort_order", "ASC"]],
    });
    res.json(sizes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get one size
router.get("/:code", async (req, res) => {
  try {
    const size = await Size.findByPk(req.params.code);
    if (!size) {
      return res.status(404).json({ error: "Size not found" });
    }
    res.json(size);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create size
router.post("/", async (req, res) => {
  try {
    const size = await Size.create(req.body);
    res.status(201).json(size);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update size
router.put("/:code", async (req, res) => {
  try {
    const size = await Size.findByPk(req.params.code);
    if (!size) {
      return res.status(404).json({ error: "Size not found" });
    }
    await size.update(req.body);
    res.json(size);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete size
router.delete("/:code", async (req, res) => {
  try {
    const size = await Size.findByPk(req.params.code);
    if (!size) {
      return res.status(404).json({ error: "Size not found" });
    }
    await size.destroy();
    res.json({ message: "Size deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
