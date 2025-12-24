// Seed script to create default users
const sequelize = require('./config/database');
const User = require('./models/User');

async function seedUsers() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Sync User model (create table if not exists)
    await User.sync();
    console.log('✅ Users table ready');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ where: { username: 'admin' } });
    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists');
      return;
    }

    // Create default admin user
    const adminUser = await User.create({
      username: 'admin',
      password: 'admin123', // Will be hashed by the model hook
      fullName: 'System Administrator',
      role: 'admin',
      isActive: true,
    });

    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('📝 Login Credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('');
    console.log('⚠️  IMPORTANT: Change the admin password after first login!');

    // Optionally create a staff user
    const staffUser = await User.create({
      username: 'staff',
      password: 'staff123',
      fullName: 'Staff User',
      role: 'staff',
      isActive: true,
    });

    console.log('');
    console.log('✅ Staff user created successfully!');
    console.log('');
    console.log('📝 Login Credentials:');
    console.log('   Username: staff');
    console.log('   Password: staff123');

  } catch (error) {
    console.error('❌ Error seeding users:', error);
  } finally {
    await sequelize.close();
    console.log('');
    console.log('✅ Database connection closed');
  }
}

// Run the seed function
seedUsers();
