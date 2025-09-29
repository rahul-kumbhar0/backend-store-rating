const express = require('express');
const dotenv = require('dotenv');
const sequelize = require('./config/db');
const { sequelize: sequelizeInstance } = require('./models');
const cors = require('cors');

// Enable CORS for all routes

const app = express();
// Load env vars
dotenv.config();
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Route files
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const storeOwnerRoutes = require('./routes/storeOwner');


// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/store-owner', storeOwnerRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Rating System API' });
});

// Test database connection
const PORT = process.env.PORT || 5000;

sequelize.authenticate()
  .then(() => {
    console.log('Database connected successfully.');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });