const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const sequelize = require("./config/database");

// Import all models
const Category = require("./models/Category");
const Style = require("./models/Style");
const Color = require("./models/Color");
const Size = require("./models/Size");
const Product = require("./models/Product");
const Vendor = require("./models/Vendor");

// Import routes
const categoryRoutes = require("./routes/categoryRoutes");
const styleRoutes = require("./routes/styleRoutes");
const colorRoutes = require("./routes/colorRoutes");
const sizeRoutes = require("./routes/sizeRoutes");
const productRoutes = require("./routes/productRoutes");
const vendorRoutes = require("./routes/vendorRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// Define relationships
Category.hasMany(Style, { foreignKey: "category_code", sourceKey: "code" });
Style.belongsTo(Category, { foreignKey: "category_code", targetKey: "code" });

Product.belongsTo(Category, { foreignKey: "category_code", targetKey: "code" });
Product.belongsTo(Color, { foreignKey: "color_code", targetKey: "code" });
Product.belongsTo(Size, { foreignKey: "size_code", targetKey: "code" });

// Sync database - creates all tables
sequelize
  .sync({ force: false })
  .then(() => {
    console.log("✅ Database connected and tables created!");
    console.log(
      "📊 Tables: Categories, Styles, Colors, Sizes, Products, Vendors"
    );
  })
  .catch((err) => {
    console.error("❌ Database sync error:", err);
  });

// Root API endpoint - lists all available endpoints
app.get("/api", (req, res) => {
  res.json({
    message: "Inventory Management API",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      categories: "/api/categories",
      styles: "/api/styles",
      colors: "/api/colors",
      sizes: "/api/sizes",
      products: "/api/products",
      vendors: "/api/vendors",
    },
    documentation: "Available endpoints listed above",
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Inventory Management API is running",
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use("/api/categories", categoryRoutes);
app.use("/api/styles", styleRoutes);
app.use("/api/colors", colorRoutes);
app.use("/api/sizes", sizeRoutes);
app.use("/api/products", productRoutes);
app.use("/api/vendors", vendorRoutes);

// 404 handler - must be AFTER all other routes
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Cannot ${req.method} ${req.path}`,
    availableEndpoints: [
      "GET /api",
      "GET /api/health",
      "GET /api/categories",
      "GET /api/styles",
      "GET /api/colors",
      "GET /api/sizes",
      "GET /api/products",
      "GET /api/vendors",
    ],
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints: http://localhost:${PORT}/api/`);
});
