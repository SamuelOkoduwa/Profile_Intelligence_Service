const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const initDatabase = async () => {
  try {
    // Create profiles table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        gender VARCHAR(50),
        gender_probability DOUBLE PRECISION,
        sample_size INTEGER,
        age INTEGER,
        age_group VARCHAR(50),
        country_id VARCHAR(10),
        country_probability DOUBLE PRECISION,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Keep compatibility for previously created tables.
    await pool.query(`
      ALTER TABLE profiles
      ALTER COLUMN gender_probability TYPE DOUBLE PRECISION USING gender_probability::DOUBLE PRECISION,
      ALTER COLUMN country_probability TYPE DOUBLE PRECISION USING country_probability::DOUBLE PRECISION,
      ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC';
    `);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

module.exports = {
  pool,
  initDatabase
};
