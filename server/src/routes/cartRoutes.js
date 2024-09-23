const express = require('express');
const { addToCart, calculateTotal } = require('../controllers/cartController');
const router = express.Router();

router.post('/cart/add', addToCart);
router.get('/cart/total', calculateTotal);

module.exports = router;
