const Order = require('../models/Order');
const Cart = require('../models/Cart');

exports.createOrder = async (req, res) => {
  try {
    const { userId } = req.body;
    const cartItems = await Cart.findAll();
    const totalAmount = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

    const order = await Order.create({ userId, totalAmount, status: 'completed' });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
