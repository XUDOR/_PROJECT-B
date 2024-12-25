const express = require('express');
const cors = require('cors');          // Import CORS middleware
const axios = require('axios');        // Import axios for HTTP requests
require('dotenv').config();            // Load environment variables from .env file
const path = require('path');
const mainRoutes = require('./routes/mainRoutes'); // Correct path for mainRoutes
const { Pool } = require('pg');        // Import PostgreSQL Pool for database connection

const app = express();

// Middleware to enable CORS
app.use(cors());

// Middleware to parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use mainRoutes for API routes
app.use(mainRoutes);

// Middleware for serving static files
app.use(express.static(path.join(__dirname, '../public')));

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Database connection configuration
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Notify Project F that Project B is running
const notifyProjectF = async (message) => {
    try {
        await axios.post('http://localhost:3006/api/notifications', { message });
        console.log(`Notified Project F: ${message}`);
    } catch (error) {
        console.error(`Failed to notify Project F: ${error.message}`);
    }
};

// Connect to the database and notify Project F
pool.connect((err, client, release) => {
    if (err) {
        console.error('Database connection error:', err.stack);
        notifyProjectF('Project B failed to connect to the database');
    } else {
        console.log('Database connected successfully!');
        notifyProjectF('Project B database connected successfully');
        release();
    }
});

// Start the server and notify Project F
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Project B is running on http://localhost:${PORT}`);
    notifyProjectF('Project B is up and running');
});
