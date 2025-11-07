const Cart = require('../models/Cart');
const Product = require('../models/Product');

exports.addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const totalPrice = product.price * quantity;
    const cartItem = await Cart.create({ productId, quantity, totalPrice });
    res.status(201).json(cartItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.calculateTotal = async (req, res) => {
  try {
    const cartItems = await Cart.findAll();
    const total = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    res.json({ total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
