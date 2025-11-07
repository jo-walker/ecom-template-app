const express = require('express');
const { Client, Environment } = require('square');
require('dotenv').config(); // Load .env file
const router = express.Router();

// Square API credentials
const client = new Client({
  environment: Environment.Sandbox, // Use 'Production' for live payments
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
});

// Payment route (Square Payments)
router.post('/checkout', async (req, res) => {
  const { amount, sourceId } = req.body;

  try {
    const paymentsApi = client.paymentsApi;
    const response = await paymentsApi.createPayment({
      sourceId,
      idempotencyKey: new Date().getTime().toString(),
      amountMoney: {
        amount: amount * 100, // Square uses smallest currency unit
        currency: 'CAD',
      },
    });

    // Log the full response to understand the structure
    console.log('Square payment response:', response);

    // Check if the payment response contains the payment object
    if (response.payment && response.payment.id) {
      res.status(200).json({ success: true, transactionId: response.payment.id });
    } else {
      console.error('Payment response missing expected fields:', response);
      res.status(500).json({ error: 'Payment response missing expected fields' });
    }
  } catch (error) {
    console.error('Error processing payment:', error.response ? error.response.body : error.message);
    res.status(500).json({ error: error.response ? error.response.body : error.message });
  }
});

module.exports = router;