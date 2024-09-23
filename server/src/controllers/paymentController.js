const { Client, Environment } = require('square');

const client = new Client({
  environment: Environment.Sandbox,
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
});

exports.processPayment = async (req, res) => {
  const { amount, sourceId } = req.body;
  try {
    const paymentsApi = client.paymentsApi;
    const response = await paymentsApi.createPayment({
      sourceId,
      idempotencyKey: new Date().getTime().toString(),
      amountMoney: {
        amount: amount * 100, // Square requires amounts in the smallest currency unit
        currency: 'USD',
      },
    });

    res.status(200).json({ success: true, transactionId: response.payment.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
