// routes/authRoutes.js
const express = require('express');
const router = express.Router();

// Your authentication functionality here
router.post('/login', (req, res) => {
    res.send('User logged in');
});

module.exports = router;
