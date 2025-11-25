const express = require("express");
const router = express.Router();
const Color = require("../models/Color");

// Get all colors
router.get("/", async (req, res) => {
  try {
    const colors = await Color.findAll({
      order: [["code", "ASC"]],
    });
    res.json(colors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get one color
router.get("/:code", async (req, res) => {
  try {
    const color = await Color.findByPk(req.params.code);
    if (!color) {
      return res.status(404).json({ error: "Color not found" });
    }
    res.json(color);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create color
router.post("/", async (req, res) => {
  try {
    const color = await Color.create(req.body);
    res.status(201).json(color);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update color
router.put("/:code", async (req, res) => {
  try {
    const color = await Color.findByPk(req.params.code);
    if (!color) {
      return res.status(404).json({ error: "Color not found" });
    }
    await color.update(req.body);
    res.json(color);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete color
router.delete("/:code", async (req, res) => {
  try {
    const color = await Color.findByPk(req.params.code);
    if (!color) {
      return res.status(404).json({ error: "Color not found" });
    }
    await color.destroy();
    res.json({ message: "Color deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
