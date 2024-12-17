const express = require('express');
const { Pool } = require('pg');
const axios = require('axios');
const { PROJECT_F_NOTIFICATIONS_URL } = require('../../config/const');
require('dotenv').config();

const router = express.Router();

// ------------------- API STATUS ROUTE ------------------- //
router.get('/api/status', (req, res) => {
    res.json({
        status: 'active',
        version: '1.0',
        message: 'Project B is running'
    });
});

// ---------------- HEALTHCHECK ---------------- //

router.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'Project B is up and running' });
});


// ---------------- DATABASE CONNECTION ---------------- //
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
        notifyDatabaseConnected();
        release();
    }
});

// Notify Project F that Project B's database is connected
async function notifyDatabaseConnected() {
    try {
        await axios.post(PROJECT_F_NOTIFICATIONS_URL, {
            message: 'Project B database connected successfully'
        });
        console.log('Notified Project F: Project B database connected successfully');
    } catch (error) {
        console.error('Failed to notify Project F about database connection:', error.message);
    }
}

// Function to notify Project F
async function notifyProjectF(message) {
    try {
        await axios.post(PROJECT_F_NOTIFICATIONS_URL, { message });
        console.log(`Notified Project F: ${message}`);
    } catch (error) {
        console.error('Failed to notify Project F:', error.message);
    }
}

// ---------------- USERS ROUTES ---------------- //
// Fetch all users
router.get('/api/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching users:', error.message);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Add a new user
router.post('/api/users', async (req, res) => {
    const { name, email, phone, address, location, skills, profile_summary } = req.body;

    if (!name || !email) {
        return res.status(400).json({ error: 'Name and Email are required.' });
    }

    try {
        const query = `
            INSERT INTO users (name, email, phone, address, location, skills, profile_summary, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
            RETURNING *;
        `;
        const values = [
            name,
            email,
            phone || 'n/a',
            address || 'n/a',
            location || 'n/a',
            skills || ['n/a'],
            profile_summary || 'n/a'
        ];

        const result = await pool.query(query, values);
        await notifyProjectF(`New user added: ${name} (${email})`);
        // Store in json_store
        await pool.query(`INSERT INTO json_store (user_json) VALUES ($1)`, [result.rows[0]]);
        // Add JSON bundle notification
        await notifyProjectF(`JSON Bundle: User data stored for ${name}`);
        await axios.post('http://localhost:3006/api/messages', {
            message: `User JSON bundle stored in database for: ${name}`
        });
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error inserting user:', error.message);
        res.status(500).json({ error: 'Failed to insert user.' });
    }
});

// ---------------- JOBS ROUTES ---------------- //
// Fetch all jobs
router.get('/api/jobs', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM jobs ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching jobs:', error.message);
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
});

// Add a new job
router.post('/api/jobs', async (req, res) => {
    const { job_title, company_name, location, skills_required, job_description } = req.body;

    if (!job_title || !company_name) {
        return res.status(400).json({ error: 'Job title and Company name are required.' });
    }

    try {
        const query = `
            INSERT INTO jobs (job_title, company_name, location, skills_required, job_description, created_at)
            VALUES ($1, $2, $3, $4, $5, NOW())
            RETURNING *;
        `;
        const values = [
            job_title,
            company_name,
            location || 'n/a',
            skills_required || ['n/a'],
            job_description || 'n/a'
        ];

        const result = await pool.query(query, values);
        await notifyProjectF(`New job posted: ${job_title} at ${company_name}`);
        // Store in json_store
        await pool.query(`INSERT INTO json_store (job_json) VALUES ($1)`, [result.rows[0]]);
        // Add JSON bundle notification
        await notifyProjectF(`JSON Bundle: Job data stored for ${job_title}`);
        await axios.post('http://localhost:3006/api/messages', {
            message: `Job JSON bundle stored in database for: ${job_title}`
        });

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error inserting job:', error.message);
        res.status(500).json({ error: 'Failed to insert job.' });
    }
});

// ---------------- JSON BUNDLES ROUTES ---------------- //
// Fetch all JSON bundles
router.get('/api/json-bundles', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM json_store ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching JSON bundles:', error.message);
        res.status(500).json({ error: 'Failed to fetch JSON bundles.' });
    }
});

// Add a new JSON bundle
router.post('/api/json-bundles', async (req, res) => {
    const bundleData = req.body;
    
    try {
        // Determine data type based on content
        const isUser = bundleData.email && bundleData.name;
        const isJob = bundleData.job_title && bundleData.company_name;
        
        let result;
        if (isUser) {
            // Store user JSON and notify
            result = await pool.query(
                `INSERT INTO json_store (user_json, job_json) VALUES ($1, NULL) RETURNING *`,
                [bundleData]
            );
            await notifyProjectF(`User JSON bundle stored: ${bundleData.name} (${bundleData.email})`);
            await axios.post('http://localhost:3006/api/messages', {
                message: `User JSON bundle committed to database for: ${bundleData.name}`
            });
        } 
        else if (isJob) {
            // Store job JSON and notify
            result = await pool.query(
                `INSERT INTO json_store (user_json, job_json) VALUES (NULL, $1) RETURNING *`,
                [bundleData]
            );
            await notifyProjectF(`Job JSON bundle stored: ${bundleData.job_title} at ${bundleData.company_name}`);
            await axios.post('http://localhost:3006/api/messages', {
                message: `Job JSON bundle committed to database for: ${bundleData.job_title}`
            });
        } 
        else {
            throw new Error('Invalid JSON bundle type');
        }

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error processing JSON bundle:', error.message);
        res.status(500).json({ error: 'Failed to process JSON bundle' });
    }
});




// ---------------- RESET DATABASE ROUTE ---------------- //
router.delete('/api/reset-database', async (req, res) => {
    const { password } = req.body;
    const RESET_PASSWORD = 'Pa$$w0rd'; // For demo purposes; use env vars in prod.

    if (password !== RESET_PASSWORD) {
        return res.status(403).json({ error: 'Unauthorized: Incorrect password.' });
    }

    try {
        await pool.query('SET session_replication_role = replica');
        await pool.query('TRUNCATE TABLE json_store, users, jobs RESTART IDENTITY CASCADE');
        await pool.query('SET session_replication_role = DEFAULT');

        await axios.post(PROJECT_F_NOTIFICATIONS_URL, {
            message: 'Database has been reset.'
        });

        res.status(200).json({ message: 'Database reset successfully.' });
    } catch (error) {
        console.error('Error resetting database:', error.message);
        res.status(500).json({ error: 'Failed to reset database.' });
    }
});

module.exports = router;
