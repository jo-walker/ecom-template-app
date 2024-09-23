const express = require('express');
const cors = require('cors'); // Import cors
const bodyParser = require('body-parser'); // Import body-parser
const sequelize = require('./config/database'); // Database config
const productRoutes = require('./routes/productRoutes'); // Product routes
const categoryRoutes = require('./routes/categoryRoutes'); // Category routes
const paymentRoutes = require('./routes/paymentRoutes'); // Payment routes
const orderRoutes = require('./routes/orderRoutes'); // Order routes
const cartRoutes = require('./routes/cartRoutes'); // Cart routes
const authRoutes = require('./routes/authRoutes'); // Auth routes
const Order = require('./models/Order'); // Import models
const Cart = require('./models/Cart');
const Product = require('./models/Product'); // Import models
const Category = require('./models/Category');
const User = require('./models/User');
const ProductCategory = require('./models/ProductCategory');

// Create the Express app
const app = express();

// Middleware to parse JSON
app.use(express.json());
app.use(cors()); // Use cors
app.use(bodyParser.json()); // Use body-parser

// Set up relationships between models
Product.belongsToMany(Category, { through: ProductCategory, foreignKey: 'product_sku' });
Category.belongsToMany(Product, { through: ProductCategory, foreignKey: 'category_id' });

// Sync the database
sequelize.sync({ force: false })  // Set force to true only during development to reset DB
  .then(() => {
    console.log('Database & tables created!');
  })
  .catch(err => console.log(err));

// API routes
app.use('/api', productRoutes);  // Use the product routes
app.use('/api', categoryRoutes); // This is for category routes
app.use('/api', paymentRoutes);  // This is for payment routes
app.use('/api', orderRoutes);    // This is for order routes
app.use('/api', cartRoutes);     // This is for cart routes
app.use('/api', authRoutes);     // This is for auth routes

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});