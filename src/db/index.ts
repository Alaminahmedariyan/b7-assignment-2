import { Pool } from "pg";
import config from "../config";


export const pool = new Pool({
  connectionString: config.connection_string,
});

export const initDB = async () => {
  try {
    // 1. Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id         SERIAL PRIMARY KEY,
        name       VARCHAR(100) NOT NULL,
        email      VARCHAR(255) UNIQUE NOT NULL,
        password   TEXT NOT NULL,
        role       VARCHAR(20) DEFAULT 'contributor' 
                   CHECK (role IN ('contributor', 'maintainer')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 2. Issues table 
    await pool.query(`
      CREATE TABLE IF NOT EXISTS issues (
        id          SERIAL PRIMARY KEY,
        title       VARCHAR(150) NOT NULL,
        description TEXT NOT NULL,
        type        VARCHAR(20) NOT NULL 
                    CHECK (type IN ('bug', 'feature_request')),
        status      VARCHAR(20) DEFAULT 'open'
                    CHECK (status IN ('open', 'in_progress', 'resolved')),
        reporter_id INTEGER NOT NULL,   -- references users.id, but no FK constraint
        created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    console.log("Database tables ready (users + issues)");
  } catch (error) {
    console.error("Database initialization failed:", error);
    throw error;
  }
};