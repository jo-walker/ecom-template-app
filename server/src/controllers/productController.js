const Product = require("../models/Product");

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll();

    // Convert price to number
    const formattedProducts = products.map((product) => ({
      ...product.toJSON(),
      price: parseFloat(product.price),
      stock_quantity: parseInt(product.stock_quantity),
    }));

    res.json(formattedProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single product
exports.getProductBySku = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.sku);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({
      ...product.toJSON(),
      price: parseFloat(product.price),
      stock_quantity: parseInt(product.stock_quantity),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create product
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({
      ...product.toJSON(),
      price: parseFloat(product.price),
      stock_quantity: parseInt(product.stock_quantity),
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.sku);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    await product.update(req.body);

    res.json({
      ...product.toJSON(),
      price: parseFloat(product.price),
      stock_quantity: parseInt(product.stock_quantity),
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.sku);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    await product.destroy();
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
