//app.js

const express = require('express');
require('dotenv').config(); // Load environment variables from .env file
const path = require('path');

const app = express();

// Middleware for serving static files
app.use(express.static(path.join(__dirname, '../public')));

// Example route
app.get('/api/data', (req, res) => {
    res.json({ message: 'Welcome to Project B API!' });
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Project B is running on http://localhost:${PORT}`);
});
