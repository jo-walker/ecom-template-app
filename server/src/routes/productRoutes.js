const { Op } = require('sequelize');
const express = require('express');
const Product = require('../models/Product');
const ProductCategory = require('../models/ProductCategory');
const router = express.Router();

// Get all products
router.get('/products', async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new product with categories
router.post('/products', async (req, res) => {
  const { categories, ...productData } = req.body;

  try {
    const product = await Product.create(productData);

    // Associate categories with the product
    if (categories && categories.length > 0) {
      for (let categoryName of categories) {
        await associateCategoryWithProduct(product, categoryName);
      }
    }

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Update a product
router.put('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (product) {
      await product.update(req.body);
      res.json(product);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a product
router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (product) {
      await product.destroy();
      res.json({ message: 'Product deleted' });
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route to fetch product by UPC or EAN (barcode)
router.get('/products/:barcode', async (req, res) => { //:barcode is the parameter meaning it can be anything after /products/
  const { barcode } = req.params; // Fixed the parameter name  
  try {
    const product = await Product.findOne({
      where: {
        [Op.or]: [
          { SKU: barcode },
          { UPC: barcode },
          { EAN: barcode }
        ]
      }
    });
    if (product) {
      const linkedPictures = product.linked_pictures ? JSON.parse(product.linked_pictures) : [];
      res.json({
        product,
        price: product.selling_price,
        linked_pictures: linkedPictures
      });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (err) {
    console.error('Error fetching product:', err.message);
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;