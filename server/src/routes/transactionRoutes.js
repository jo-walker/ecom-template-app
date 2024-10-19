const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction'); 
const { v4: uuidv4 } = require('uuid');

router.post('/transactions', async (req, res) => {
  try {
    if (!req.body.subtotal || !req.body.tax) {
      return res.status(400).json({ error: 'Subtotal and tax are required' });
    }

    // Create a new transaction
    const newTransaction = await Transaction.create({
      transaction_id: uuidv4(),  // Generate a unique transaction ID
      items: req.body.items,
      subtotal: req.body.subtotal,
      tax: req.body.tax,
      total: req.body.total,
      payment_method: req.body.payment_method,
      cash_received: req.body.cash_received,
      change: req.body.change,
      transaction_date: new Date(),
    });

    // Return both message and the transaction ID
    res.status(201).json({
      message: 'Transaction recorded successfully',
      transactionId: newTransaction.transaction_id,  // Return transactionId
    });
  } catch (error) {
    console.error('Error recording transaction:', error);
    res.status(500).json({ error: 'Failed to record transaction' });
  }
});

// Get all transactions for reporting and auditing purposes
// router.get('/transactions', async (req, res) => {
//     try {
//       const transactions = await Transaction.find(); // Get all transactions
//       res.status(200).json(transactions);
//     } catch (error) {
//       res.status(500).json({ error: 'Failed to fetch transactions' });
//     }
//   });
  
module.exports = router;