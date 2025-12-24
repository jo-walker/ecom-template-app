const Sale = require("../models/Sale");
const Product = require("../models/Product");
const sequelize = require("../config/database");

// Record a new sale
const recordSale = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { barcode, quantity_sold, payment_method, notes, transaction_id } = req.body;

    // Validate required fields
    if (!barcode || !quantity_sold) {
      await transaction.rollback();
      return res.status(400).json({
        error: "Barcode and quantity_sold are required"
      });
    }

    // Find the product
    const product = await Product.findByPk(barcode, { transaction });

    if (!product) {
      await transaction.rollback();
      return res.status(404).json({
        error: `Product with barcode ${barcode} not found`
      });
    }

    // Check if enough stock is available
    if (product.stock_quantity < quantity_sold) {
      await transaction.rollback();
      return res.status(400).json({
        error: `Insufficient stock. Available: ${product.stock_quantity}, Requested: ${quantity_sold}`
      });
    }

    // Calculate sale amount
    const unit_price = product.retail_price;
    const total_amount = unit_price * quantity_sold;

    // Create the sale record
    const sale = await Sale.create(
      {
        barcode,
        quantity_sold,
        unit_price,
        total_amount,
        payment_method,
        notes,
        transaction_id,
        sale_date: new Date(),
      },
      { transaction }
    );

    // Update product stock quantity
    product.stock_quantity -= quantity_sold;
    await product.save({ transaction });

    // Commit the transaction
    await transaction.commit();

    res.status(201).json({
      message: "Sale recorded successfully",
      sale,
      updated_stock: product.stock_quantity,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error recording sale:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get all sales
const getAllSales = async (req, res) => {
  try {
    const { startDate, endDate, barcode } = req.query;

    const where = {};

    // Filter by date range
    if (startDate || endDate) {
      where.sale_date = {};
      if (startDate) where.sale_date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.sale_date.$lte = end;
      }
    }

    // Filter by barcode
    if (barcode) {
      where.barcode = barcode;
    }

    const sales = await Sale.findAll({
      where,
      include: [
        {
          model: Product,
          attributes: ["barcode", "category_code", "style_number"],
          include: ["Category", "Color", "Size"],
        },
      ],
      order: [["sale_date", "DESC"]],
    });

    res.json(sales);
  } catch (error) {
    console.error("Error fetching sales:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get sales by product barcode
const getSalesByProduct = async (req, res) => {
  try {
    const { barcode } = req.params;

    const sales = await Sale.findAll({
      where: { barcode },
      include: [
        {
          model: Product,
          include: ["Category", "Color", "Size"],
        },
      ],
      order: [["sale_date", "DESC"]],
    });

    // Calculate totals
    const totalQuantitySold = sales.reduce((sum, sale) => sum + sale.quantity_sold, 0);
    const totalRevenue = sales.reduce((sum, sale) => sum + parseFloat(sale.total_amount), 0);

    res.json({
      barcode,
      sales,
      summary: {
        total_transactions: sales.length,
        total_quantity_sold: totalQuantitySold,
        total_revenue: totalRevenue.toFixed(2),
      },
    });
  } catch (error) {
    console.error("Error fetching sales by product:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get sales summary
const getSalesSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where = {};

    // Filter by date range
    if (startDate || endDate) {
      where.sale_date = {};
      if (startDate) where.sale_date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.sale_date.$lte = end;
      }
    }

    const sales = await Sale.findAll({ where });

    const totalSales = sales.length;
    const totalQuantitySold = sales.reduce((sum, sale) => sum + sale.quantity_sold, 0);
    const totalRevenue = sales.reduce((sum, sale) => sum + parseFloat(sale.total_amount), 0);

    res.json({
      total_sales: totalSales,
      total_quantity_sold: totalQuantitySold,
      total_revenue: totalRevenue.toFixed(2),
      date_range: {
        start: startDate || "all time",
        end: endDate || "now",
      },
    });
  } catch (error) {
    console.error("Error fetching sales summary:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a sale (and restore inventory)
const deleteSale = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const sale = await Sale.findByPk(id, { transaction });

    if (!sale) {
      await transaction.rollback();
      return res.status(404).json({ error: "Sale not found" });
    }

    // Find the product and restore stock
    const product = await Product.findByPk(sale.barcode, { transaction });

    if (product) {
      product.stock_quantity += sale.quantity_sold;
      await product.save({ transaction });
    }

    // Delete the sale
    await sale.destroy({ transaction });

    await transaction.commit();

    res.json({
      message: "Sale deleted and inventory restored",
      restored_quantity: sale.quantity_sold,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error deleting sale:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  recordSale,
  getAllSales,
  getSalesByProduct,
  getSalesSummary,
  deleteSale,
};
