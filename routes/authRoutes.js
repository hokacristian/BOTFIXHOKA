const express = require('express');
const router = express.Router();

// Authentication route
router.post('/login', (req, res) => {
  res.send('User logged in');
});

module.exports = router;
