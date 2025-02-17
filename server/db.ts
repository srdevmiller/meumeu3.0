import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure the pool with proper settings
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
  maxUses: 7500, // Close a connection after it has been used 7500 times
});

// Add event listeners for the pool
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
});

pool.on('connect', (client) => {
  console.log('New client connected to the pool');
});

export const db = drizzle({ client: pool, schema });

// Ensure we clean up pool on process termination
process.on('SIGTERM', () => {
  console.log('Closing pool connections...');
  pool.end();
});