const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./db');
const authRoutes = require('./routes/auth');
const userRoute = require('./routes/user');
const artisanRoute = require('./routes/artisan');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to DB
connectDB();

// Routes
app.use('/auth', authRoutes);
app.use('/user', userRoute);
app.use('/artisan', artisanRoute);


// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'FixNear API is running ✅' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
