const express = require('express');
const Category = require('../models/Category');
const Product = require('../models/Product');
const router = express.Router();

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get one category
router.get('/categories/:id', async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (category) {
      res.json(category);
    } else {
      res.status(404).json({ error: 'Category not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new category
router.post('/categories', async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a category
router.put('/categories/:id', async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (category) {
      await category.update(req.body);
      res.json(category);
    } else {
      res.status(404).json({ error: 'Category not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete all categories and reset the sequence
router.delete('/categories', async (req, res) => {
    try {
      await Category.destroy({ where: {}, truncate: true }); // Delete all categories
      await sequelize.query('ALTER SEQUENCE category_id_seq RESTART WITH 1'); // Reset the sequence
  
      res.json({ message: 'All categories deleted and sequence reset' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});

module.exports = router;

