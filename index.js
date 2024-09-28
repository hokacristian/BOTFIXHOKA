// index.js
const express = require('express');
const cors = require('cors');
const { port } = require('./config/config');
const authRoutes = require('./routes/authRoutes');
const { initializeClient } = require('./utils/client'); // Import initializeClient

const app = express();

// Define allowed origins for CORS
const allowedOrigins = [
  'http://localhost:5173', // Your frontend's local development URL
  'https://6849-182-253-124-127.ngrok-free.app', // Example Ngrok URL
  'https://4151-103-233-100-232.ngrok-free.app', // Example Ngrok URL
  'http://localhost:5173'
];

// Configure CORS
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
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
initializeClient(); // Ensure the client is initialized

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
