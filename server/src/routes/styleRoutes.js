const express = require("express");
const router = express.Router();
const Style = require("../models/Style");

// Get all styles (optionally filter by category)
router.get("/", async (req, res) => {
  try {
    const where = {};
    if (req.query.category_code) {
      where.category_code = req.query.category_code;
    }

    const styles = await Style.findAll({
      where,
      order: [
        ["category_code", "ASC"],
        ["style_number", "ASC"],
      ],
    });
    res.json(styles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get one style
router.get("/:id", async (req, res) => {
  try {
    const style = await Style.findByPk(req.params.id);
    if (!style) {
      return res.status(404).json({ error: "Style not found" });
    }
    res.json(style);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create style
router.post("/", async (req, res) => {
  try {
    const style = await Style.create(req.body);
    res.status(201).json(style);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update style
router.put("/:id", async (req, res) => {
  try {
    const style = await Style.findByPk(req.params.id);
    if (!style) {
      return res.status(404).json({ error: "Style not found" });
    }
    await style.update(req.body);
    res.json(style);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete style
router.delete("/:id", async (req, res) => {
  try {
    const style = await Style.findByPk(req.params.id);
    if (!style) {
      return res.status(404).json({ error: "Style not found" });
    }
    await style.destroy();
    res.json({ message: "Style deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
