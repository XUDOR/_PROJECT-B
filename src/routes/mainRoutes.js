// mainRoutes
const express = require('express');
const { Pool } = require('pg');
require('dotenv').config(); // Load environment variables

const router = express.Router();

// Database connection using environment variables
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

pool.connect((err, client, release) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
    } else {
        console.log('Database connected successfully!');
        release();
    }
});


// Fetch all users
router.get('/api/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching users:', error.message);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});
// Add POST route to insert user data
router.post('/api/users', async (req, res) => {
    try {
        // Destructure incoming data from the request body
        const { name, email, phone, address, location, skills, profile_summary } = req.body;

        // Insert data into the database
        const query = `
            INSERT INTO users (name, email, phone, address, location, skills, profile_summary, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *;
        `;
        const values = [name, email, phone, address, location, skills, profile_summary];

        // Execute the query
        const result = await pool.query(query, values);

        // Send the newly created user record as the response
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error inserting user:', error.message);
        res.status(500).json({ error: 'Failed to insert user' });
    }
});



module.exports = router;
