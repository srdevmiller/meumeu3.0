import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure the connection pool with proper error handling and reconnection
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // Reduced from 20 to prevent connection overload
  idleTimeoutMillis: 10000, // Reduced from 30000 to clear idle connections faster
  connectionTimeoutMillis: 2000, // Reduced from 5000 for faster timeout detection
  retryLimit: 3, // Add retry limit for failed connections
  ssl: { // Add explicit SSL configuration
    rejectUnauthorized: true,
  },
});

// Add error handler for the pool
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  // Don't throw the error, just log it and let the pool handle reconnection
});

// Initialize Drizzle with the pool
export const db = drizzle(pool, { schema });

// Ensure we clean up pool on process termination
process.on('SIGTERM', () => {
  console.log('Closing pool connections...');
  pool.end();
});

// Add health check function
export const checkDatabaseConnection = async () => {
  try {
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      return true;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
};