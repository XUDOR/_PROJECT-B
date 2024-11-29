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

// Helper function for pagination
function paginate(query, limit, offset) {
    return `${query} LIMIT ${limit} OFFSET ${offset}`;
}

// ---------------- USERS ROUTES ---------------- //

// Fetch all users with optional pagination
router.get('/api/users', async (req, res) => {
    const { page = 1, limit = 10 } = req.query; // Default pagination
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

// Add POST route to insert user data
router.post('/api/users', async (req, res) => {
    const { name, email, phone, address, location, skills, profile_summary } = req.body;

    // Validation
    if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required.' });
    }

    try {
        const query = `
            INSERT INTO users (name, email, phone, address, location, skills, profile_summary, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *;
        `;
        const values = [name, email, phone, address, location, skills, profile_summary];
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error inserting user:', error.message);
        res.status(500).json({ error: 'Failed to insert user' });
    }
});

// ---------------- JOBS ROUTES ---------------- //

// Fetch all jobs with optional filters and pagination
router.get('/api/jobs', async (req, res) => {
    const { page = 1, limit = 10, location, skills, company } = req.query; // Default pagination
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

// Add POST route to insert job data
router.post('/api/jobs', async (req, res) => {
    const { job_title, company_name, location, skills_required, job_description } = req.body;

    // Validation
    if (!job_title || !company_name) {
        return res.status(400).json({ error: 'Job title and company name are required.' });
    }

    try {
        const query = `
            INSERT INTO jobs (job_title, company_name, location, skills_required, job_description, created_at)
            VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *;
        `;
        const values = [job_title, company_name, location, skills_required, job_description];
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error inserting job:', error.message);
        res.status(500).json({ error: 'Failed to insert job' });
    }
});

module.exports = router;
