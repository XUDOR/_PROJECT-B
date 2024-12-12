const express = require('express');
const cors = require('cors'); // Import CORS middleware
require('dotenv').config(); // Load environment variables from .env file
const path = require('path');
const mainRoutes = require('./routes/mainRoutes'); // Correct path for mainRoutes

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

// Notify Project F that Project B is running
const notifyProjectF = async () => {
    try {
        await axios.post('http://localhost:3006/api/notifications', {
            message: 'Project B is up and running'
        });
        console.log('Notified Project F: Project B is running');
    } catch (error) {
        console.error('Failed to notify Project F:', error.message);
    }
};

// Start the server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Project B is running on http://localhost:${PORT}`);
});
