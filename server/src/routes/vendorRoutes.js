const express = require("express");
const router = express.Router();
const Vendor = require("../models/Vendor");

// Get all vendors
router.get("/", async (req, res) => {
  try {
    const vendors = await Vendor.findAll({
      order: [["name", "ASC"]],
    });
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get one vendor
router.get("/:id", async (req, res) => {
  try {
    const vendor = await Vendor.findByPk(req.params.id);
    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create vendor
router.post("/", async (req, res) => {
  try {
    const vendor = await Vendor.create(req.body);
    res.status(201).json(vendor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update vendor
router.put("/:id", async (req, res) => {
  try {
    const vendor = await Vendor.findByPk(req.params.id);
    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }
    await vendor.update(req.body);
    res.json(vendor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete vendor
router.delete("/:id", async (req, res) => {
  try {
    const vendor = await Vendor.findByPk(req.params.id);
    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }
    await vendor.destroy();
    res.json({ message: "Vendor deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
