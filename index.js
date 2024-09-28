// index.js
const express = require('express');
const cors = require('cors');
const { port } = require('./config/config');
const authRoutes = require('./routes/authRoutes');
const { initializeClient } = require('./utils/client');

const app = express();

// Define allowed origins for CORS
const allowedOrigins = [
//ngrok
];

// Configure CORS
app.use(cors({
  origin: (origin, callback) => {
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

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
