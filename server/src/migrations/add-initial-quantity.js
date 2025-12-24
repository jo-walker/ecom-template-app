const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");

async function addInitialQuantityColumn() {
  const queryInterface = sequelize.getQueryInterface();

  try {
    console.log("🔄 Adding initial_quantity column to Products table...");

    // Check if column already exists
    const tableDescription = await queryInterface.describeTable("Products");

    if (tableDescription.initial_quantity) {
      console.log("✅ initial_quantity column already exists");
      return;
    }

    // Add the column
    await queryInterface.addColumn("Products", "initial_quantity", {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      after: "retail_price",
    });

    console.log("✅ Successfully added initial_quantity column");

    // Update existing products: set initial_quantity = stock_quantity
    console.log("🔄 Setting initial_quantity for existing products...");
    await sequelize.query(
      "UPDATE Products SET initial_quantity = stock_quantity WHERE initial_quantity = 0"
    );

    console.log("✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  addInitialQuantityColumn()
    .then(() => {
      console.log("✅ Done!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Error:", error);
      process.exit(1);
    });
}

module.exports = addInitialQuantityColumn;
