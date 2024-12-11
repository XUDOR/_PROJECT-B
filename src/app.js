const express = require('express');
const cors = require('cors'); // Import CORS middleware
require('dotenv').config(); // Load environment variables from .env file
const path = require('path');
const bodyParser = require('body-parser'); // Add body-parser for older Express versions
const mainRoutes = require('./src/routes/mainRoutes'); // Correct path for mainRoutes

const app = express();

// Middleware to enable CORS
app.use(cors());

// Middleware to parse JSON and form data
app.use(express.json()); // Built-in middleware for JSON parsing
app.use(express.urlencoded({ extended: true })); // For parsing URL-encoded data

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
