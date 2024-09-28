// index.js
const express = require('express');
const cors = require('cors');
const { port } = require('./config/config');
const authRoutes = require('./routes/authRoutes');
const { initializeClient } = require('./utils/client');

const app = express();

// Define allowed origins for CORS
const allowedOrigins = [
  'http://localhost:5173',
  'https://6849-182-253-124-127.ngrok-free.app',
  'https://4151-103-233-100-232.ngrok-free.app',
];

// Configure CORS
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
}));

// Middleware setup
app.use(express.json());

// Set up routes
app.use('/auth', authRoutes);

// Initialize WhatsApp client
initializeClient();

// Export the app for Vercel
module.exports = app;
