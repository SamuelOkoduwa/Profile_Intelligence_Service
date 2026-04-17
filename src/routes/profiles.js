const express = require('express');
const { uuidv7 } = require('uuidv7');
const { pool } = require('../config/database');
const { enrichProfileWithAPIs } = require('../utils/apiClient');
const { processProfileData } = require('../utils/dataProcessor');

const router = express.Router();

const formatProfile = (row) => ({
  ...row,
  gender_probability: row.gender_probability === null ? null : Number(row.gender_probability),
  country_probability: row.country_probability === null ? null : Number(row.country_probability),
  created_at: row.created_at ? new Date(row.created_at).toISOString() : null,
});

// POST /api/profiles - Create a new profile
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;

    // Validation
    if (name === undefined || name === null) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing or empty name'
      });
    }

    if (typeof name !== 'string') {
      return res.status(422).json({
        status: 'error',
        message: 'Invalid type'
      });
    }

    if (name.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'Missing or empty name'
      });
    }

    const trimmedName = name.trim().toLowerCase();

    // Check if profile already exists (idempotency)
    const existingProfile = await pool.query(
      'SELECT * FROM profiles WHERE LOWER(name) = $1',
      [trimmedName]
    );

    if (existingProfile.rows.length > 0) {
      return res.status(200).json({
        status: 'success',
        message: 'Profile already exists',
        data: formatProfile(existingProfile.rows[0])
      });
    }

    // Enrich profile with external APIs
    const enrichmentResult = await enrichProfileWithAPIs(trimmedName);

    if (!enrichmentResult.success) {
      return res.status(502).json({
        status: '502',
        message: `${enrichmentResult.error}`
      });
    }

    // Process and validate the enriched data
    const processResult = processProfileData(
      trimmedName,
      enrichmentResult.genderData,
      enrichmentResult.ageData,
      enrichmentResult.nationalityData
    );

    if (!processResult.success) {
      return res.status(502).json({
        status: '502',
        message: processResult.error
      });
    }

    // Create the profile record
    const profileId = uuidv7();
    const now = new Date().toISOString();
    const profileData = processResult.data;

    const query = `
      INSERT INTO profiles (id, name, gender, gender_probability, sample_size, age, age_group, country_id, country_probability, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;

    const values = [
      profileId,
      profileData.name,
      profileData.gender,
      profileData.gender_probability,
      profileData.sample_size,
      profileData.age,
      profileData.age_group,
      profileData.country_id,
      profileData.country_probability,
      now
    ];

    const result = await pool.query(query, values);

    res.status(201).json({
      status: 'success',
      data: formatProfile(result.rows[0])
    });
  } catch (error) {
    console.error('POST /api/profiles error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// GET /api/profiles/:id - Retrieve a profile by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM profiles WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Profile not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: formatProfile(result.rows[0])
    });
  } catch (error) {
    console.error('GET /api/profiles/:id error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// GET /api/profiles - List all profiles with optional filtering
router.get('/', async (req, res) => {
  try {
    const { gender, country_id, age_group } = req.query;

    let query = 'SELECT id, name, gender, age, age_group, country_id FROM profiles WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (gender) {
      query += ` AND LOWER(gender) = $${paramCount}`;
      params.push(gender.toLowerCase());
      paramCount++;
    }

    if (country_id) {
      query += ` AND UPPER(country_id) = $${paramCount}`;
      params.push(country_id.toUpperCase());
      paramCount++;
    }

    if (age_group) {
      query += ` AND LOWER(age_group) = $${paramCount}`;
      params.push(age_group.toLowerCase());
      paramCount++;
    }

    const result = await pool.query(query, params);

    res.status(200).json({
      status: 'success',
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('GET /api/profiles error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// DELETE /api/profiles/:id - Delete a profile
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM profiles WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Profile not found'
      });
    }

    res.status(204).send();
  } catch (error) {
    console.error('DELETE /api/profiles/:id error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

module.exports = router;
