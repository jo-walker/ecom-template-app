const sequelize = require("./config/database");
const Category = require("./models/Category");
const Style = require("./models/Style");
const Color = require("./models/Color");
const Size = require("./models/Size");
const Vendor = require("./models/Vendor");

async function seedDatabase() {
  try {
    console.log("🌱 Seeding database...");

    // Seed Categories
    await Category.bulkCreate(
      [
        { code: "CR", name: "Cardigan", description: "Cardigan sweaters" },
        { code: "TP", name: "Top", description: "Tops and blouses" },
        { code: "VS", name: "Vest", description: "Vests" },
        { code: "DR", name: "Dress", description: "Dresses" },
        { code: "SK", name: "Skirt", description: "Skirts" },
        { code: "PN", name: "Pants", description: "Pants and trousers" },
        { code: "JK", name: "Jacket", description: "Jackets and coats" },
        { code: "SW", name: "Sweater", description: "Sweaters and pullovers" },
      ],
      { ignoreDuplicates: true }
    );

    // Seed Styles
    await Style.bulkCreate(
      [
        {
          category_code: "CR",
          style_number: "001",
          description: "Classic button cardigan",
        },
        {
          category_code: "CR",
          style_number: "002",
          description: "Oversized cardigan",
        },
        {
          category_code: "TP",
          style_number: "001",
          description: "Basic crew neck",
        },
        {
          category_code: "TP",
          style_number: "002",
          description: "V-neck blouse",
        },
        {
          category_code: "VS",
          style_number: "001",
          description: "Sleeveless vest",
        },
      ],
      { ignoreDuplicates: true }
    );

    // Seed Colors
    await Color.bulkCreate(
      [
        { code: "01", name: "Black", hex_value: "#000000" },
        { code: "02", name: "White", hex_value: "#FFFFFF" },
        { code: "03", name: "Navy", hex_value: "#000080" },
        { code: "04", name: "Gray", hex_value: "#808080" },
        { code: "05", name: "Beige", hex_value: "#F5F5DC" },
        { code: "06", name: "Brown", hex_value: "#8B4513" },
        { code: "07", name: "Red", hex_value: "#FF0000" },
        { code: "08", name: "Pink", hex_value: "#FFC0CB" },
        { code: "09", name: "Blue", hex_value: "#0000FF" },
        { code: "10", name: "Green", hex_value: "#008000" },
      ],
      { ignoreDuplicates: true }
    );

    // Seed Sizes
    await Size.bulkCreate(
      [
        { code: "0", name: "Free Size", sort_order: 0 },
        { code: "1", name: "XS", sort_order: 1 },
        { code: "2", name: "S", sort_order: 2 },
        { code: "3", name: "M", sort_order: 3 },
        { code: "4", name: "L", sort_order: 4 },
        { code: "5", name: "XL", sort_order: 5 },
        { code: "6", name: "XXL", sort_order: 6 },
      ],
      { ignoreDuplicates: true }
    );

    // Seed Vendors
    await Vendor.bulkCreate(
      [
        {
          name: "Vendor A",
          contact_person: "John Doe",
          email: "john@vendora.com",
          phone: "555-0001",
        },
        {
          name: "Vendor B",
          contact_person: "Jane Smith",
          email: "jane@vendorb.com",
          phone: "555-0002",
        },
        {
          name: "Vendor C",
          contact_person: "Bob Wilson",
          email: "bob@vendorc.com",
          phone: "555-0003",
        },
      ],
      { ignoreDuplicates: true }
    );

    console.log("✅ Database seeded successfully!");
    console.log("📊 Created:");
    console.log("   - 8 Categories (CR, TP, VS, DR, SK, PN, JK, SW)");
    console.log("   - 5 Styles");
    console.log("   - 10 Colors (01-10)");
    console.log("   - 7 Sizes (0-6)");
    console.log("   - 3 Vendors");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
