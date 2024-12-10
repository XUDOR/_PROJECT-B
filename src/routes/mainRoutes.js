// mainRoutes >>>>PROJECT B
const express = require('express');
const { Pool } = require('pg');
const axios = require('axios'); // For sending data to Project F
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

// Helper function for pagination
function paginate(query, limit, offset) {
    return `${query} LIMIT ${limit} OFFSET ${offset}`;
}

// ---------------- USERS ROUTES ---------------- //

// Fetch all users with optional pagination
router.get('/api/users', async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    try {
        const query = paginate('SELECT * FROM users ORDER BY created_at DESC', limit, offset);
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching users:', error.message);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// ---------------- JOBS ROUTES ---------------- //

// Fetch all jobs with optional filters and pagination
router.get('/api/jobs', async (req, res) => {
    const { page = 1, limit = 10, location, skills, company } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM jobs WHERE 1=1';
    const values = [];
    let counter = 1;

    if (location) {
        query += ` AND location = $${counter}`;
        values.push(location);
        counter++;
    }
    if (skills) {
        query += ` AND $${counter} = ANY(skills_required)`;
        values.push(skills);
        counter++;
    }
    if (company) {
        query += ` AND company_name ILIKE $${counter}`;
        values.push(`%${company}%`);
        counter++;
    }

    try {
        const paginatedQuery = paginate(`${query} ORDER BY created_at DESC`, limit, offset);
        const result = await pool.query(paginatedQuery, values);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching jobs:', error.message);
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
});

// ---------------- BUNDLE AND SEND ROUTE ---------------- //

// Bundle user and job data and send to Project F
router.post('/api/bundle', async (req, res) => {
    const { userId, jobId } = req.body;

    if (!userId || !jobId) {
        return res.status(400).json({ error: 'User ID and Job ID are required.' });
    }

    try {
        // Fetch user data
        const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        const jobResult = await pool.query('SELECT * FROM jobs WHERE id = $1', [jobId]);

        if (userResult.rowCount === 0 || jobResult.rowCount === 0) {
            return res.status(404).json({ error: 'User or Job not found.' });
        }

        const user = userResult.rows[0];
        const job = jobResult.rows[0];

        // Bundle user and job data
        const bundle = {
            user,
            job,
            bundled_at: new Date()
        };

        // Insert bundle into user_job_bundles table
        await pool.query(
            `INSERT INTO user_job_bundles (user_id, job_id, bundle) VALUES ($1, $2, $3)`,
            [userId, jobId, bundle]
        );

        // Send bundled data to Project F (Communication)
        await axios.post('http://localhost:3006/api/communication', bundle); /// project F
        res.status(201).json({ message: 'Bundle created and sent successfully.', bundle });
    } catch (error) {
        console.error('Error bundling data:', error.message);
        res.status(500).json({ error: 'Failed to bundle and send data.' });
    }
});

module.exports = router;
