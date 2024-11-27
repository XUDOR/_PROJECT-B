// app.js >> PROJECT B

const express = require('express');
require('dotenv').config(); // Load environment variables from .env file
const path = require('path');
const mainRoutes = require('./routes/mainRoutes'); // Correct path for mainRoutes


const app = express();

// Use mainRoutes for API routes
app.use(mainRoutes);

// Middleware for serving static files
app.use(express.static(path.join(__dirname, '../public')));

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Project B is running on http://localhost:${PORT}`);
});
