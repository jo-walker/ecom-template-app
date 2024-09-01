const sequelize = require('./config/database');
const Product = require('./models/Product');
const productRoutes = require('./routes/productRoutes');

sequelize.sync({ force: false }) // Set to true to drop and recreate tables
  .then(() => {
    console.log('Database & tables created!');
  })
  .catch((err) => console.log(err));

app.use('/api', productRoutes);